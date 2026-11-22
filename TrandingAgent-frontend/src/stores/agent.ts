import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  AgentTask,
  Category,
  ClarifyQuestion,
  LaneRound,
  ModerationFinding,
  NegotiationLane,
  Order,
  Verdict,
} from '@/types'
import { seedTasks } from '@/data/agent'
import { useMarketStore } from '@/stores/market'
import { openAgentStream, type AgentStream, type ConnectionState } from '@/api/agentStream'
import { useErrorStore } from '@/stores/error'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/* ------------------------------------------------------------------ 纯常量（无状态） */

export const statusMeta: Record<
  AgentTask['status'],
  { label: string; tone: 'blue' | 'teal' | 'cyan' | 'ink'; hint: string }
> = {
  clarifying: { label: '待澄清', tone: 'cyan', hint: '还需要你回答 1–2 个问题' },
  searching: { label: '检索中', tone: 'blue', hint: '正在召回并过滤候选' },
  negotiating: { label: '议价中', tone: 'blue', hint: '3 路并行议价进行中' },
  awaiting: { label: '待确认', tone: 'teal', hint: '已谈到合适价格，等你点头' },
  done: { label: '已完成', tone: 'ink', hint: '订单已生成' },
  failed: { label: '已降级', tone: 'cyan', hint: '未谈成，已给出建议价' },
}

export const verdictMeta: Record<Verdict, { label: string; cls: string }> = {
  pass: { label: 'PASS', cls: 'border-teal/30 bg-teal/[0.08] text-teal' },
  suggest: { label: 'SUGGEST', cls: 'border-cyan/30 bg-cyan/[0.08] text-cyan' },
  block: { label: 'BLOCK', cls: 'border-azure/30 bg-azure/[0.08] text-azure' },
}

/* ------------------------------------------------------------------ 文本解析 */

const categoryHints: { keys: string[]; category: Category }[] = [
  { keys: ['显示器', '屏幕', '键盘', '鼠标', '耳机', '手机', '电脑', '相机', '平板', '投影'], category: '数码' },
  { keys: ['书', '教材', '考研', '真题', '笔记', '词典'], category: '书籍' },
  { keys: ['衣', '鞋', '外套', '卫衣', '裙', '包'], category: '服饰' },
  { keys: ['自行车', '滑板', '球拍', '哑铃', '瑜伽', '帐篷'], category: '运动' },
  { keys: ['台灯', '锅', '水壶', '收纳', '风扇', '吹风'], category: '生活' },
]

const itemNames: Record<string, string> = {
  显示器: '显示器',
  键盘: '机械键盘',
  投影: '投影仪',
  教材: '教材',
  自行车: '自行车',
  耳机: '耳机',
  手机: '手机',
  平板: '平板',
  相机: '相机',
  帐篷: '帐篷',
}

function parseTask(raw: string) {
  const budgetMatch = raw.match(/(\d{2,5})\s*(?:元|块|以内|左右|预算)?/)
  const budget = budgetMatch ? Number(budgetMatch[1]) : 500
  const hit = categoryHints.find((h) => h.keys.some((k) => raw.includes(k)))
  const itemKey = Object.keys(itemNames).find((k) => raw.includes(k))
  const deadline = /今天/.test(raw)
    ? '今天内'
    : /明天/.test(raw)
      ? '明天内'
      : /月底/.test(raw)
        ? '月底前'
        : /本?周/.test(raw)
          ? '本周内'
          : '时间待定'
  return {
    budget,
    category: hit?.category ?? ('其他' as Category),
    itemName: itemKey ? (itemNames[itemKey] as string) : '闲置物品',
    deadline,
  }
}

function nowLabel() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ 商店 */

export const useAgentStore = defineStore('agent', () => {
  const market = useMarketStore()
  const errors = useErrorStore()

  /** 任务只存在内存：刷新即回到初始剧本，避免未完成的模拟写入脏状态 */
  const state = reactive({
    tasks: clone(seedTasks) as AgentTask[],
  })

  /** SSE 连接状态，UI 据此先提示「连接丢失」再提示「正在重连」 */
  const connection = ref<ConnectionState>('idle')
  const reconnectAttempt = ref(0)
  const lostAt = ref<string | null>(null)

  let stream: AgentStream | undefined
  let recoveredOnce = false

  const taskById = (id: string) => state.tasks.find((t) => t.id === id)

  const processingTasks = computed(() =>
    state.tasks.filter((t) => ['clarifying', 'searching', 'negotiating'].includes(t.status)),
  )

  const awaitingTasks = computed(() => state.tasks.filter((t) => t.status === 'awaiting'))

  const agentStats = computed(() => ({
    active: processingTasks.value.length,
    pending: awaitingTasks.value.length,
    saved: state.tasks.reduce((sum, t) => sum + t.savings, 0),
  }))

  const connectionLabel = computed(() => {
    switch (connection.value) {
      case 'lost':
        return '连接丢失'
      case 'reconnecting':
        return `连接丢失 · 正在重连（第 ${reconnectAttempt.value} 次）`
      default:
        // connecting / open / idle / closed 都不算异常，不占领状态条
        return ''
    }
  })

  const bestLane = (task: AgentTask): NegotiationLane | undefined => {
    if (task.recommendedLaneId) return task.lanes.find((l) => l.id === task.recommendedLaneId)
    return [...task.lanes].filter((l) => l.price > 0).sort((a, b) => a.price - b.price)[0]
  }

  const laneProduct = (lane: NegotiationLane) => market.productById(lane.productId)

  /* ---------------------------------------------------------------- 实时流 */

  /** 订阅小谦实时流；重复调用无副作用 */
  function ensureAgentLoop() {
    if (stream) return
    stream = openAgentStream(undefined, {
      onStatus(status, attempt) {
        connection.value = status
        reconnectAttempt.value = attempt
        if (status === 'lost') {
          lostAt.value = new Date().toISOString()
          if (recoveredOnce) market.toast('与实时流的连接已丢失，正在重连', 'warn')
          return
        }
        if (status === 'open') {
          // 只有曾经断过才提示恢复，首次连接不打扰
          if (recoveredOnce) market.toast('连接已恢复，实时议价继续')
          recoveredOnce = recoveredOnce || lostAt.value !== null
          lostAt.value = null
        }
      },
      onEvent(event) {
        // 演示流只推 round；真实流的其它事件由后续后端接入时在此扩展
        if (event.type === 'round') {
          state.tasks.filter((t) => t.status === 'negotiating').forEach(stepNegotiation)
        }
      },
    })
  }

  /** 演示用：手动触发断线，验证「先提示连接丢失」 */
  function simulateDrop() {
    if (!stream) ensureAgentLoop()
    stream?.drop()
  }

  /* ---------------------------------------------------------------- 任务 */

  /** 一句话需求 → 需求清单 + 最多 2 个追问 */
  function createTask(rawInput: string): AgentTask {
    const text = rawInput.trim()
    const { budget, category, itemName, deadline } = parseTask(text)
    const questions: ClarifyQuestion[] = []

    if (!/成色|新|划痕|瑕疵/.test(text)) {
      questions.push({
        id: 'q-condition',
        text: '成色可以接受到什么程度？',
        options: ['几乎全新', '九成新即可', '能正常用就行'],
      })
    }
    if (!/校区|面交|自提|送货|地点/.test(text)) {
      questions.push({
        id: 'q-place',
        text: '希望在哪个校区面交？',
        options: ['东校区', '西校区', '南苑宿舍', '都可以'],
      })
    }

    const task: AgentTask = {
      id: `task-${Math.random().toString(36).slice(2, 6)}`,
      rawInput: text,
      title: `${itemName} · 预算 ${budget}`,
      createdAt: new Date().toISOString(),
      status: questions.length ? 'clarifying' : 'negotiating',
      budget,
      deadline,
      category,
      needs: [
        { key: 'item', label: '物品', value: itemName, source: 'user', confidence: 0.94 },
        { key: 'budget', label: '预算', value: `≤ ¥${budget}`, source: 'user', confidence: 0.98 },
        { key: 'time', label: '时间', value: deadline, source: 'user', confidence: 0.8 },
        { key: 'place', label: '交易', value: '校内面交优先', source: 'inferred', confidence: 0.62 },
      ],
      questions: questions.slice(0, 2),
      lanes: [],
      savings: 0,
      progress: questions.length ? 8 : 20,
      health: [],
      pickup: [],
      events: [
        {
          id: `e-${Date.now()}`,
          at: nowLabel(),
          text: questions.length ? `已生成 4 项需求，还有 ${questions.length} 个问题待确认` : '一句话已生成需求清单，无需追问',
          kind: 'info',
        },
      ],
      moderation: [],
    }

    state.tasks = [task, ...state.tasks]
    market.toast(questions.length ? '小谦已拆好需求，先回答 2 个小问题' : '小谦已开始检索候选')
    if (!questions.length) beginNegotiation(task)
    return task
  }

  function answerQuestion(taskId: string, questionId: string, answer: string) {
    const task = taskById(taskId)
    if (!task) return
    const q = task.questions.find((x) => x.id === questionId)
    if (!q) return
    q.answer = answer
    if (q.id === 'q-place') {
      const need = task.needs.find((n) => n.key === 'place')
      if (need) need.value = `${answer}面交`
    }
    if (task.questions.every((x) => x.answer)) {
      task.progress = 18
      pushEvent(task, `补充条件已写入清单（${task.questions.map((x) => x.answer).join(' / ')}）`, 'info')
      beginNegotiation(task)
    }
  }

  function beginNegotiation(task: AgentTask) {
    task.status = 'searching'
    task.progress = 26
    pushEvent(task, `正在按「${task.category} · ≤¥${task.budget}」召回候选，审核 Agent 同步过滤`, 'info')

    const sellable = market.state.products.filter(
      (p) => p.status === 'on' && p.sellerId !== market.state.userId && p.price <= task.budget * 1.2,
    )
    // 先按标题里的物品词精确匹配，匹配不足 3 个时退回到同品类候选
    const sameItem = sellable.filter((p) => task.title.includes(p.title.split(' ')[0] ?? ''))
    const candidates = (sameItem.length >= 3 ? sameItem : sellable.filter((p) => p.category === task.category))
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)

    window.setTimeout(() => {
      if (candidates.length < 3) {
        task.status = 'failed'
        task.progress = 100
        pushEvent(
          task,
          `候选不足（仅 ${candidates.length} 个可交易），建议把预算放宽到 ¥${Math.round(task.budget * 1.25)} 或延长到周末`,
          'warn',
        )
        market.toast('候选不足，小谦给了一个建议价，由你来定', 'warn')
        return
      }
      task.lanes = candidates.map((p, i) => ({
        id: `lane-${i + 1}`,
        productId: p.id,
        sellerId: p.sellerId,
        status: 'running',
        startPrice: p.price,
        target: Math.round(task.budget * 0.86),
        price: p.price,
        rounds: 1,
        maxRounds: 8,
        health: ['等待卖家响应'],
        messages: [
          {
            id: `m-${p.id}-1`,
            from: 'agent',
            at: nowLabel(),
            text: `你好，我在帮同学收「${p.title.split(' · ')[0]}」，预算 ¥${task.budget}，¥${Math.round(
              p.price * 0.88,
            )} 能出吗？可以校内面交。`,
            verdict: 'pass',
            checkNote: '硬校验：报价 ≤ 预算，未要求站外交易',
          },
        ],
      }))
      task.status = 'negotiating'
      task.progress = 44
      pushEvent(task, `召回 ${candidates.length + 3} 个候选，去重后选 3 路并行议价`, 'info')
      market.toast('小谦已开 3 路并行议价')
      ensureAgentLoop()
    }, 1600)
  }

  /* ---------------------------------------------------------------- 议价 */

  function pushEvent(task: AgentTask, text: string, kind: 'info' | 'ok' | 'warn') {
    task.events = [
      { id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, at: nowLabel(), text, kind },
      ...task.events,
    ].slice(0, 12)
  }

  function addRound(lane: NegotiationLane, round: LaneRound) {
    lane.messages = [...lane.messages, round]
    lane.rounds += 1
    if (round.price) lane.price = round.price
  }

  function settle(task: AgentTask, lane: NegotiationLane) {
    lane.status = 'won'
    task.lanes.forEach((l) => {
      if (l.id !== lane.id && l.status === 'running') l.status = 'backup'
    })
    task.status = 'awaiting'
    task.recommendedLaneId = lane.id
    task.savings = Math.max(0, task.budget - lane.price)
    task.progress = 96
    pushEvent(task, `${lane.id.toUpperCase()} 路谈到 ¥${lane.price}，其余两路降级为备选，等你确认`, 'ok')
    market.toast(`小谦已谈到 ¥${lane.price}，等你确认`)
  }

  /** 每轮：LLM 提案 → Validator 校验 → 落库 → 推送 */
  function stepNegotiation(task: AgentTask) {
    if (task.status !== 'negotiating') return
    task.lanes.forEach((lane) => {
      if (lane.status !== 'running') return

      if (lane.rounds >= lane.maxRounds) {
        lane.status = 'lost'
        pushEvent(task, `${lane.id.toUpperCase()} 路超过 ${lane.maxRounds} 轮仍未达目标价，已放弃`, 'warn')
        return
      }

      const agentPrice = Math.max(lane.target, lane.price - 8)
      if (lane.rounds % 2 === 0) {
        addRound(lane, {
          id: `r-${lane.id}-${Date.now()}`,
          from: 'agent',
          at: nowLabel(),
          text: `我这边预算固定，¥${agentPrice} 今天就能定，${task.pickup[0]?.label ?? '校内面交'}可以吗？`,
          price: agentPrice,
          verdict: 'pass',
          checkNote: '硬校验通过：未超预算、未承诺站外支付',
        })
      } else {
        const sellerPrice = Math.max(lane.target, lane.price - 5)
        addRound(lane, {
          id: `r-${lane.id}-${Date.now()}-s`,
          from: 'seller',
          at: nowLabel(),
          text:
            lane.rounds >= 4
              ? `行吧，¥${sellerPrice}，你诚心要的话就这个价。`
              : `有点低了，¥${sellerPrice} 吧，东西都在这。`,
          price: sellerPrice,
          verdict: 'pass',
          checkNote: '价格下行，未触发让步异常',
        })
      }

      task.savings = Math.max(0, task.budget - lane.price)
      task.progress = Math.min(94, 44 + task.lanes.reduce((s, l) => s + l.rounds, 0) * 3)

      if (lane.price <= lane.target) settle(task, lane)
    })

    const alive = task.lanes.some((l) => l.status === 'running')
    if (!alive && task.status === 'negotiating') {
      task.status = 'failed'
      task.progress = 100
      task.savings = 0
      pushEvent(task, `三路都未谈成，建议价 ¥${Math.round(task.budget * 0.92)}，可一键把预算上调后重跑`, 'warn')
      market.toast('三路议价均未成功，小谦改成了「给你建议价」', 'warn')
    }
  }

  /* ---------------------------------------------------------------- 确认 */

  function confirmTask(taskId: string): Order | undefined {
    const task = taskById(taskId)
    if (!task) return
    const lane = bestLane(task)
    if (!lane) return
    const product = market.productById(lane.productId)
    if (!product) {
      market.toast('商品已被下架，小谦已重新开启检索', 'warn')
      task.status = 'negotiating'
      return
    }

    const order: Order = {
      id: `o${Date.now()}`,
      productId: product.id,
      buyerId: market.state.userId,
      sellerId: lane.sellerId,
      price: lane.price,
      status: '待确认',
      createdAt: new Date().toISOString(),
      method: '校内面交',
      location: task.pickup[0]?.label ?? '校内公共区域',
      note: `小谦议价成交 · 挂牌价 ¥${lane.startPrice}，省 ¥${lane.startPrice - lane.price}`,
      reviewed: false,
      timeline: [
        { label: '小谦议价成交', time: nowLabel(), done: true },
        { label: '订单已创建', time: nowLabel(), done: true },
        { label: '卖家确认', time: '等待卖家确认', done: false },
        { label: '约定面交', time: '待约定', done: false },
      ],
    }
    market.state.orders = [order, ...market.state.orders]
    task.orderId = order.id
    task.status = 'done'
    task.progress = 100
    pushEvent(task, `已按 ¥${lane.price} 生成订单，等卖家确认后按取货路线面交`, 'ok')
    market.toast('订单已生成，去订单详情跟进')
    return order
  }

  function abortTask(taskId: string) {
    const task = taskById(taskId)
    if (!task) return
    task.status = 'failed'
    task.progress = 100
    pushEvent(task, '你取消了本次任务，三路议价已全部停止', 'warn')
    market.toast('任务已取消', 'warn')
  }

  /* ---------------------------------------------------------------- 审核 Agent */

  const phoneRe = /1[3-9]\d{9}/

  /** 发布预检：图片 / 描述 / 品类 / 图文一致性 */
  function checkPublish(input: { title: string; desc: string; condition: string }): ModerationFinding[] {
    const findings: ModerationFinding[] = []
    const text = `${input.title} ${input.desc}`
    const push = (verdict: Verdict, rule: string, message: string, fix?: string) =>
      findings.push({
        id: `f-${findings.length + 1}`,
        verdict,
        scene: 'publish',
        rule,
        target: input.title.slice(0, 18) || '未命名商品',
        message,
        fix,
      })

    if (/代考|代写|代课|论文代/.test(text)) {
      push('block', 'R-101 违禁品类', '命中「代考代写」，属于校园违禁品类，不允许发布。')
    }
    if (/校园卡|学生证|出借|租借证件/.test(text)) {
      push('block', 'R-101 违禁品类', '证件出借存在身份冒用风险，不允许发布。')
    }
    if (/电动车|电池|大功率|电热锅|烟|酒|处方药/.test(text)) {
      push('block', 'R-101 违禁品类', '命中宿舍安全/管控品类，建议改为同功能合规替代品。')
    }
    if (/微信|加v|加V|qq|QQ|转账|私下|扫码/.test(text)) {
      push('block', 'R-102 站外交易', '描述中出现站外联系方式或私下转账引导。', '删除联系方式，改用平台内「私聊」与「立即购买」。')
    }
    if (/全网最低|最便宜|第一|绝对|永不/.test(text)) {
      push('suggest', 'R-201 绝对化用语', '标题/描述含绝对化用语，容易被举报且不利于信任。', '「全网最低」→「校内自提价」；「绝对全新」→「九成新，细节见图」。')
    }
    if (/几乎全新|全新/.test(input.condition) && /裂纹|划痕|磕碰|掉漆|亮点|坏点/.test(input.desc)) {
      push('suggest', 'R-202 图文一致性', `成色写「${input.condition}」，但描述提到了瑕疵，两者不一致。`, '补充瑕疵特写图，或把成色改为「八成新」。')
    }
    if (phoneRe.test(text)) {
      push('suggest', 'R-203 隐私信息', '描述中出现手机号，存在隐私泄露风险。', '删除号码，改用平台内私聊沟通。')
    }
    if (!findings.length) {
      push('pass', '全部规则通过', '未发现违禁品类、站外交易或图文不一致问题。')
    }
    return findings
  }

  /** 聊天合规：不阻断对话，只给修改建议 */
  function checkChat(text: string): ModerationFinding | undefined {
    if (/微信|加v|加V|扫码|私下|转账|红包|代付/.test(text)) {
      return {
        id: `chat-${Date.now()}`,
        verdict: 'suggest',
        scene: 'chat',
        rule: 'R-204 交易沟通',
        target: '当前输入',
        message: '平台内沟通可保留议价与交易凭证，建议不要引导到站外。',
        fix: '「加微信转账」→「我们在平台内确认，约在图书馆面交」。',
      }
    }
    if (/代考|代写|校园卡|学生证/.test(text)) {
      return {
        id: `chat-${Date.now()}`,
        verdict: 'block',
        scene: 'chat',
        rule: 'R-101 违禁品类',
        target: '当前输入',
        message: '该内容涉及校园违禁事项，不会进入聊天记录。',
        fix: '请修改为正常交易沟通。',
      }
    }
    return undefined
  }

  /** 仅用于演示：手动制造一次可被错误边界捕获的异常 */
  function simulateCrash() {
    errors.report(new Error('演示：小谦渲染异常（由错误边界兜底）'), 'demo:crash')
    throw new Error('演示：小谦渲染异常（由错误边界兜底）')
  }

  return {
    state,
    connectionLabel,
    processingTasks,
    awaitingTasks,
    agentStats,
    taskById,
    bestLane,
    laneProduct,
    ensureAgentLoop,
    simulateDrop,
    createTask,
    answerQuestion,
    stepNegotiation,
    confirmTask,
    abortTask,
    checkPublish,
    checkChat,
    simulateCrash,
  }
})
