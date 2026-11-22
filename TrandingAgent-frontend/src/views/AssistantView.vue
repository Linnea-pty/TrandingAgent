<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CircleHelp,
  Gavel,
  Radar,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  Wallet,
} from 'lucide-vue-next'
import TaskCard from '@/components/TaskCard.vue'
import ModerationDrawer from '@/components/ModerationDrawer.vue'
import { useMarketStore } from '@/stores/market'
import { useAgentStore } from '@/stores/agent'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { toast } = market
const agent = useAgentStore()
const { answerQuestion, confirmTask, createTask, ensureAgentLoop, simulateCrash, simulateDrop } = agent
const { agentStats, connectionLabel } = storeToRefs(agent)
const agentState = agent.state

/** 仅开发环境展示演示开关，生产构建不会出现 */
const isDev = import.meta.env.DEV

const router = useRouter()
const input = ref('')
const drawer = ref(false)

const examples = [
  '收一台 27 寸显示器，预算 900，这周就要',
  '求考研数学全套教材，预算 120',
  '收一把 87 键机械键盘，预算 260',
  '社团活动借投影仪，预算 1500，月底用',
]

const clarifying = computed(() => agentState.tasks.filter((t) => t.status === 'clarifying'))
const tasks = computed(() =>
  [...agentState.tasks].sort((a, b) => {
    const rank: Record<string, number> = { awaiting: 0, negotiating: 1, searching: 2, clarifying: 3, done: 4, failed: 5 }
    return (rank[a.status] ?? 9) - (rank[b.status] ?? 9)
  }),
)
const pendingTask = computed(() => tasks.value.find((t) => t.status === 'awaiting'))

function submit() {
  const value = input.value.trim()
  if (!value) {
    toast('先用一句话说清要买什么', 'warn')
    return
  }
  const task = createTask(value)
  input.value = ''
  router.push(`/task/${task.id}`)
}

function pick(example: string) {
  input.value = example
}

function confirm(id: string) {
  const order = confirmTask(id)
  if (order) router.push(`/order/${order.id}`)
}

onMounted(ensureAgentLoop)
</script>

<template>
  <div class="pb-20">
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-azure/10">
      <div class="absolute inset-0 -z-10 bg-grid-soft bg-[length:22px_22px] opacity-60" />
      <div class="absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-azure/20 blur-3xl" />
      <div class="absolute -right-16 top-10 -z-10 h-64 w-64 rounded-full bg-neon/20 blur-3xl" />

      <div class="wrap py-10 md:py-14">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge-live"><span class="h-1.5 w-1.5 animate-pulseDot rounded-full bg-teal" /> AGENT ONLINE</span>
          <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-ink3">自主交易 · 主线 Agent</span>
        </div>

        <div class="mt-5 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <h1 class="font-display text-[34px] font-semibold leading-[1.12] tracking-tight text-ink md:text-[46px]">
              一句话，<br class="sm:hidden" />小谦去谈。
            </h1>
            <p class="mt-3 max-w-[560px] text-[13px] leading-relaxed text-ink2">
              说清要什么、预算多少。小谦会拆需求、召回候选、同时开 3 路议价，
              谈成后把订单交给你点头。不合规的候选与聊天，会在中途被拦下。
            </p>

            <form class="mt-6" @submit.prevent="submit">
              <div class="hud-panel flex items-center gap-2 p-2 focus-within:border-azure/40 focus-within:shadow-glow">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-azure/10 text-azure">
                  <Sparkles :size="16" />
                </span>
                <input
                  v-model="input"
                  class="min-w-0 flex-1 bg-transparent px-1 py-2 text-[13px] text-ink outline-none placeholder:text-ink3/70"
                  placeholder="例如：收一台 27 寸显示器，预算 900，本周要，能当面验机"
                />
                <button type="submit" class="btn btn-primary btn-sm shrink-0">
                  交给小谦 <ArrowRight :size="13" />
                </button>
              </div>
            </form>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <button v-for="e in examples" :key="e" class="chip !text-[11px]" @click="pick(e)">{{ e }}</button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div class="hud-panel px-3.5 py-3">
              <p class="mono-label !text-[8.5px]">处理中</p>
              <p class="num-display mt-1 text-[26px] font-semibold leading-none">{{ agentStats.active }}</p>
              <p class="mt-1 font-mono text-[9px] text-ink3">tasks</p>
            </div>
            <div class="hud-panel px-3.5 py-3">
              <p class="mono-label !text-[8.5px]">待确认</p>
              <p class="num-display mt-1 text-[26px] font-semibold leading-none text-teal">{{ agentStats.pending }}</p>
              <p class="mt-1 font-mono text-[9px] text-ink3">pending</p>
            </div>
            <div class="hud-panel px-3.5 py-3">
              <p class="mono-label !text-[8.5px]">已省</p>
              <p class="num-display mt-1 text-[26px] font-semibold leading-none text-azure">¥{{ agentStats.saved }}</p>
              <p class="mt-1 font-mono text-[9px] text-ink3">saved</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="wrap grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
      <div class="min-w-0">
        <!-- 待确认置顶 -->
        <div
          v-if="pendingTask"
          class="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-teal/30 bg-gradient-to-r from-teal/[0.1] to-white/40 px-4 py-3.5"
        >
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-teal/15 text-teal"><BadgeCheck :size="18" /></span>
          <div class="min-w-0 flex-1">
            <p class="text-[12.5px] font-medium text-ink">「{{ pendingTask.title }}」已谈到合适价格</p>
            <p class="mt-0.5 font-mono text-[10px] text-ink3">只差你点一下确认，其它两路已自动降级</p>
          </div>
          <router-link :to="`/task/${pendingTask.id}`" class="btn btn-sm">查看</router-link>
          <button class="btn btn-sm btn-teal" @click="confirm(pendingTask.id)">确认成交</button>
        </div>

        <!-- 澄清问题 -->
        <div v-for="t in clarifying" :key="t.id" class="mb-5 rounded-2xl border border-cyan/30 bg-white/70 p-4 backdrop-blur">
          <div class="flex items-center gap-2">
            <CircleHelp :size="15" class="text-cyan" />
            <p class="text-[13px] font-medium">小谦需要再确认 {{ t.questions.length }} 件事</p>
            <span class="ml-auto font-mono text-[9px] text-ink3">#{{ t.id.slice(-4) }}</span>
          </div>
          <div v-for="q in t.questions" :key="q.id" class="mt-3 rounded-xl border border-azure/10 bg-white/60 p-3">
            <p class="text-[11.5px] font-medium text-ink">{{ q.text }}</p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="opt in q.options"
                :key="opt"
                class="chip !text-[11px]"
                :class="{ 'chip-on': q.answer === opt }"
                @click="answerQuestion(t.id, q.id, opt)"
              >
                {{ opt }}
              </button>
            </div>
          </div>
        </div>

        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-[15px] font-semibold">任务流</h2>
          <span class="font-mono text-[10px] text-ink3">{{ tasks.length }} 个任务 · 状态实时推进</span>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <TaskCard v-for="t in tasks" :key="t.id" :task="t" @confirm="confirm" />
        </div>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-4">
        <section class="hud-panel p-4">
          <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
            <Radar :size="12" /> 运行方式
          </h3>
          <ol class="mt-3 space-y-3">
            <li v-for="(s, i) in [
              { t: '解析一句话', d: '生成需求清单，最多追问 2 个问题' },
              { t: '召回与过滤', d: '检索候选，审核 Agent 同步剔除违规' },
              { t: '三路并行议价', d: '每轮提案 → 硬校验 → 落库 → 推送' },
              { t: '汇总成交', d: '一路成交，其余降级为备选' },
              { t: '你来点确认', d: '生成订单，给出取货路线' },
            ]" :key="s.t" class="flex gap-2.5">
              <span class="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-azure/30 font-mono text-[8px] text-azure">
                {{ i + 1 }}
              </span>
              <div>
                <p class="text-[11.5px] font-medium text-ink">{{ s.t }}</p>
                <p class="mt-0.5 text-[10px] leading-relaxed text-ink3">{{ s.d }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="hud-panel p-4">
          <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
            <ShieldCheck :size="12" /> 守门 Agent
          </h3>
          <p class="mt-2 text-[10.5px] leading-relaxed text-ink3">
            审核是同步函数，监控是异步事件。两者都不参与议价，也不会主动说话。
          </p>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-lg border border-azure/10 bg-white/60 px-2 py-2">
              <p class="font-mono text-[9px] text-ink3">拦截率</p>
              <p class="num-display mt-0.5 text-[16px] text-azure">6.4%</p>
            </div>
            <div class="rounded-lg border border-azure/10 bg-white/60 px-2 py-2">
              <p class="font-mono text-[9px] text-ink3">异常降级</p>
              <p class="num-display mt-0.5 text-[16px] text-teal">1</p>
            </div>
          </div>
          <button class="btn btn-sm btn-ghost mt-3 w-full" @click="drawer = true">
            <ScanEye :size="12" /> 打开审核台
          </button>
        </section>

        <section class="hud-panel p-4">
          <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
            <Wallet :size="12" /> 最近提示
          </h3>
          <ul class="mt-2.5 space-y-2">
            <li class="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink2">
              <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-cyan" />
              U3 卖家响应偏慢，B 路已标记健康度
            </li>
            <li class="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink2">
              <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-teal" />
              A 路谈到 ¥835，低于预算 ¥65
            </li>
            <li class="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink2">
              <span class="mt-1 h-1 w-1 shrink-0 rounded-full bg-azure" />
              C 路卖家要求微信转账，已拦截
            </li>
          </ul>
          <router-link to="/arena/task-8f2a" class="btn btn-sm btn-ghost mt-3 w-full">
            <Gavel :size="12" /> 看三列议价大厅
          </router-link>
        </section>

        <section v-if="isDev" class="hud-panel border-dashed p-4">
          <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
            <Radar :size="12" /> 演示控制 · DEV
          </h3>
          <p class="mt-2 font-mono text-[10px] text-ink3" aria-live="polite">
            实时流：{{ connectionLabel || '已连接' }}
          </p>
          <div class="mt-2.5 grid gap-1.5">
            <button class="btn btn-sm btn-ghost w-full" @click="simulateDrop">
              <Timer :size="12" /> 模拟 SSE 断线
            </button>
            <button class="btn btn-sm btn-ghost w-full" @click="simulateCrash">
              <TriangleAlert :size="12" /> 触发渲染异常
            </button>
          </div>
          <p class="mt-2 text-[9.5px] leading-relaxed text-ink3">
            断线后顶栏先提示「连接丢失」，再显示重连次数；异常由错误边界接管，只替换页面区块。
          </p>
        </section>

        <p class="flex items-center gap-1.5 px-1 font-mono text-[9px] text-ink3">
          <Bot :size="11" /> 小谦只是任务流，不是聊天窗口
        </p>
      </aside>
    </div>

    <ModerationDrawer :open="drawer" title="审核台 · 演示" @close="drawer = false" />
  </div>
</template>
