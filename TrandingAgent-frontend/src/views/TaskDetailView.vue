<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleDashed,
  Clock,
  Gavel,
  MapPin,
  Radar,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ModerationDrawer from '@/components/ModerationDrawer.vue'

import { money, timeAgo, useMarketStore } from '@/stores/market'
import { statusMeta, useAgentStore, verdictMeta } from '@/stores/agent'
const market = useMarketStore()
const { userById } = market
const agent = useAgentStore()
const { bestLane, confirmTask, ensureAgentLoop, laneProduct, taskById } = agent

const route = useRoute()
const router = useRouter()
const task = computed(() => taskById(String(route.params.id)))
const meta = computed(() => (task.value ? statusMeta[task.value.status] : undefined))
const lane = computed(() => (task.value ? bestLane(task.value) : undefined))
const drawer = ref(false)

const laneStatusText: Record<string, string> = {
  queued: '排队',
  running: '议价中',
  won: '已成交',
  backup: '备选',
  lost: '放弃',
  blocked: '已拦截',
}
const laneStatusCls: Record<string, string> = {
  queued: 'text-ink3',
  running: 'text-azure',
  won: 'text-teal',
  backup: 'text-cyan',
  lost: 'text-ink3',
  blocked: 'text-azure',
}
const eventDot: Record<string, string> = {
  info: 'bg-azure',
  ok: 'bg-teal',
  warn: 'bg-cyan',
}

function confirmDeal() {
  if (!task.value) return
  const order = confirmTask(task.value.id)
  if (order) router.push(`/order/${order.id}`)
}

onMounted(ensureAgentLoop)
</script>

<template>
  <div v-if="!task" class="wrap py-24 text-center">
    <p class="font-mono text-[11px] uppercase tracking-widest text-ink3">TASK NOT FOUND</p>
    <h1 class="mt-2 font-display text-[24px] font-semibold">这个任务不存在或已被清空</h1>
    <router-link to="/assistant" class="btn btn-primary mt-6">回到小谦</router-link>
  </div>

  <div v-else class="pb-20">
    <!-- 顶部 -->
    <section class="relative overflow-hidden border-b border-azure/10">
      <div class="absolute inset-0 -z-10 bg-grid-soft bg-[length:22px_22px] opacity-50" />
      <div class="wrap py-7">
        <router-link to="/assistant" class="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition hover:text-azure">
          <ArrowLeft :size="11" /> 任务卡片流
        </router-link>

        <div class="mt-3 flex flex-wrap items-start gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-azure/30 bg-azure/[0.08] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-azure">
                {{ meta?.label }}
              </span>
              <span class="font-mono text-[10px] text-ink3">{{ task.id }}</span>
              <span class="font-mono text-[10px] text-ink3">· {{ timeAgo(task.createdAt) }}创建</span>
            </div>
            <h1 class="mt-2 font-display text-[26px] font-semibold leading-tight md:text-[32px]">{{ task.title }}</h1>
            <p class="mt-2 max-w-[680px] text-[12px] leading-relaxed text-ink3">「{{ task.rawInput }}」</p>
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <router-link v-if="task.lanes.length" :to="`/arena/${task.id}`" class="btn btn-sm">
              <Gavel :size="13" /> 议价大厅
            </router-link>
            <button
              v-if="task.status === 'awaiting'"
              class="btn btn-sm btn-primary"
              @click="confirmDeal"
            >
              <BadgeCheck :size="13" /> 确认成交
            </button>
            <router-link v-if="task.orderId" :to="`/order/${task.orderId}`" class="btn btn-sm btn-teal">
              查看订单 <ArrowUpRight :size="12" />
            </router-link>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div class="hud-panel px-3 py-2.5">
            <p class="mono-label !text-[8.5px]">预算</p>
            <p class="num-display mt-1 text-[16px]">¥{{ money(task.budget) }}</p>
          </div>
          <div class="hud-panel px-3 py-2.5">
            <p class="mono-label !text-[8.5px]">当前最好价</p>
            <p class="num-display mt-1 text-[16px] text-azure">{{ lane ? `¥${money(lane.price)}` : '—' }}</p>
          </div>
          <div class="hud-panel px-3 py-2.5">
            <p class="mono-label !text-[8.5px]">已省</p>
            <p class="num-display mt-1 text-[16px] text-teal">{{ task.savings ? `¥${money(task.savings)}` : '—' }}</p>
          </div>
          <div class="hud-panel px-3 py-2.5">
            <p class="mono-label !text-[8.5px]">进度</p>
            <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/[0.07]">
              <div class="h-full rounded-full bg-azure transition-all duration-700" :style="{ width: `${task.progress}%` }" />
            </div>
            <p class="mt-1 font-mono text-[9px] text-ink3">{{ task.progress }}%</p>
          </div>
        </div>
      </div>
    </section>

    <div class="wrap grid gap-5 py-6 lg:grid-cols-[1fr_320px]">
      <div class="min-w-0 space-y-5">
        <!-- 需求清单 -->
        <section class="hud-panel p-5">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-1.5 font-display text-[15px] font-semibold"><Radar :size="15" class="text-azure" /> 需求清单</h2>
            <span class="font-mono text-[9.5px] uppercase tracking-wider text-ink3">parsed · {{ task.needs.length }} items</span>
          </div>
          <ul class="mt-3 divide-y divide-azure/[0.08]">
            <li v-for="n in task.needs" :key="n.key" class="flex items-center gap-3 py-2.5">
              <span class="w-10 shrink-0 font-mono text-[10px] text-ink3">{{ n.label }}</span>
              <span class="min-w-0 flex-1 text-[12.5px] text-ink">{{ n.value }}</span>
              <span
                class="shrink-0 rounded px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-wider"
                :class="n.source === 'user' ? 'bg-azure/[0.08] text-azure' : 'bg-cyan/[0.08] text-cyan'"
              >
                {{ n.source === 'user' ? '原话' : '推断' }}
              </span>
              <span class="hidden w-16 shrink-0 sm:block">
                <span class="block h-0.5 rounded-full bg-ink/[0.08]">
                  <span class="block h-full rounded-full bg-teal" :style="{ width: `${Math.round(n.confidence * 100)}%` }" />
                </span>
              </span>
            </li>
          </ul>
          <div v-if="task.questions.some((q) => !q.answer)" class="mt-3 rounded-lg border border-cyan/25 bg-cyan/[0.05] p-3">
            <p class="text-[11px] font-medium text-ink">还有 {{ task.questions.filter((q) => !q.answer).length }} 个问题待确认</p>
            <router-link to="/assistant" class="mt-1 inline-flex items-center gap-1 text-[10.5px] text-azure">去回答 <ArrowUpRight :size="10" /></router-link>
          </div>
        </section>

        <!-- 三路议价 -->
        <section class="hud-panel p-5">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-1.5 font-display text-[15px] font-semibold"><Gavel :size="15" class="text-azure" /> 三路并行议价</h2>
            <span v-if="task.status === 'negotiating'" class="badge-live">
              <span class="h-1 w-1 animate-pulseDot rounded-full bg-teal" /> LIVE
            </span>
          </div>

          <div v-if="!task.lanes.length" class="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-azure/25 px-4 py-6 text-[11.5px] text-ink3">
            <CircleDashed :size="16" class="animate-spin text-azure" />
            正在召回候选，审核 Agent 核对违规与图文一致性后会开出 3 路议价。
          </div>

          <ul v-else class="mt-3 space-y-2.5">
            <li v-for="l in task.lanes" :key="l.id" class="rounded-xl border border-azure/10 bg-white/60 p-3">
              <div class="flex items-center gap-2.5">
                <span class="grid h-6 w-6 shrink-0 place-items-center rounded border border-azure/25 font-mono text-[9px] text-azure">
                  {{ l.id.slice(-1).toUpperCase() }}
                </span>
                <Avatar :user="userById(l.sellerId)" size="xs" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[11.5px] font-medium">{{ laneProduct(l)?.title ?? '商品已下架' }}</p>
                  <p class="font-mono text-[9px] text-ink3">{{ userById(l.sellerId)?.name }} · {{ l.rounds }}/{{ l.maxRounds }} 轮</p>
                </div>
                <div class="text-right">
                  <p class="num-display text-[14px]" :class="l.status === 'won' ? 'text-teal' : 'text-ink'">¥{{ money(l.price) }}</p>
                  <p class="font-mono text-[9px]" :class="laneStatusCls[l.status]">{{ laneStatusText[l.status] }}</p>
                </div>
                <router-link :to="`/arena/${task.id}`" class="shrink-0 rounded-md border border-azure/20 p-1.5 text-ink3 transition hover:text-azure">
                  <ArrowUpRight :size="12" />
                </router-link>
              </div>
              <div class="mt-2.5 h-1 overflow-hidden rounded-full bg-ink/[0.06]">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="l.status === 'won' ? 'bg-teal' : l.status === 'blocked' ? 'bg-azure/40' : 'bg-azure'"
                  :style="{ width: `${l.status === 'blocked' ? 100 : Math.min(100, Math.round((l.rounds / l.maxRounds) * 100))}%` }"
                />
              </div>
            </li>
          </ul>
        </section>

        <!-- 事件流 -->
        <section class="hud-panel p-5">
          <h2 class="flex items-center gap-1.5 font-display text-[15px] font-semibold"><Sparkles :size="15" class="text-azure" /> 事件流</h2>
          <ol class="mt-3 space-y-2.5">
            <li v-for="e in task.events" :key="e.id" class="flex gap-2.5">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" :class="eventDot[e.kind]" />
              <div class="min-w-0 flex-1">
                <p class="text-[11.5px] leading-relaxed text-ink2">{{ e.text }}</p>
                <p class="mt-0.5 font-mono text-[9px] text-ink3">{{ e.at }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- 审核记录 -->
        <section class="hud-panel p-5">
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-1.5 font-display text-[15px] font-semibold"><ShieldCheck :size="15" class="text-azure" /> 审核记录</h2>
            <button class="font-mono text-[10px] text-azure hover:underline" @click="drawer = true">打开审核台</button>
          </div>
          <ul v-if="task.moderation.length" class="mt-3 space-y-2">
            <li v-for="f in task.moderation" :key="f.id" class="rounded-xl border border-azure/10 bg-white/60 p-3">
              <div class="flex items-center gap-2">
                <span class="rounded border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold" :class="verdictMeta[f.verdict].cls">{{ verdictMeta[f.verdict].label }}</span>
                <span class="font-mono text-[9px] text-ink3">{{ f.rule }}</span>
                <span class="ml-auto font-mono text-[9px] text-ink3">{{ f.scene }}</span>
              </div>
              <p class="mt-1.5 text-[11px] text-ink2">{{ f.message }}</p>
              <p v-if="f.fix" class="mt-1 text-[10.5px] text-azure">{{ f.fix }}</p>
            </li>
          </ul>
          <p v-else class="mt-3 rounded-lg border border-dashed border-azure/20 px-3 py-4 text-[11px] text-ink3">
            本任务未触发拦截规则；发布快照已存档，发生纠纷时可自动比对。
          </p>
        </section>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-4">
        <section v-if="task.status === 'awaiting' && lane" class="hud-panel border-teal/30 p-4">
          <p class="mono-label !text-[9px]">待你确认</p>
          <p class="mt-2 font-display text-[17px] font-semibold leading-snug">{{ laneProduct(lane)?.title }}</p>
          <div class="mt-3 flex items-end gap-2">
            <span class="num-display text-[28px] font-semibold text-teal">¥{{ money(lane.price) }}</span>
            <span class="mb-1 font-mono text-[10px] text-ink3 line-through">¥{{ money(lane.startPrice) }}</span>
            <span class="mb-1 ml-auto rounded bg-teal/10 px-1.5 py-0.5 font-mono text-[9px] text-teal">省 ¥{{ task.budget - lane.price }}</span>
          </div>
          <ul class="mt-3 space-y-1.5 border-t border-dashed border-azure/15 pt-2.5 text-[10.5px] text-ink3">
            <li class="flex items-center gap-1.5"><Avatar :user="userById(lane.sellerId)" size="xs" /> {{ userById(lane.sellerId)?.name }} · 信用 {{ userById(lane.sellerId)?.credit }}</li>
            <li class="flex items-center gap-1.5"><Clock :size="11" /> {{ task.deadline }} 内完成面交</li>
          </ul>
          <button class="btn btn-primary mt-3 w-full" @click="confirmDeal">确认成交并生成订单</button>
          <p class="mt-2 text-center font-mono text-[9px] text-ink3">确认前不会扣款，也不会通知卖家</p>
        </section>

        <section class="hud-panel p-4">
          <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
            <MapPin :size="12" /> 取货路线
          </h3>
          <ol v-if="task.pickup.length" class="mt-3 space-y-3">
            <li v-for="s in task.pickup" :key="s.id" class="relative flex gap-2.5 pl-1">
              <span
                class="mt-1 h-2 w-2 shrink-0 rounded-full border"
                :class="s.state === 'now' ? 'border-teal bg-teal' : s.state === 'done' ? 'border-teal/40 bg-teal/40' : 'border-azure/30 bg-white'"
              />
              <div class="min-w-0 flex-1">
                <p class="text-[11.5px] font-medium text-ink">{{ s.label }}</p>
                <p class="mt-0.5 text-[10px] leading-relaxed text-ink3">{{ s.detail }}</p>
              </div>
              <span class="shrink-0 font-mono text-[9px] text-ink3">{{ s.minutes }}min</span>
            </li>
          </ol>
          <p v-else class="mt-2 text-[10.5px] text-ink3">谈成后自动生成路线，优先校内公共区域。</p>
        </section>

        <section class="hud-panel p-4">
          <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
            <TriangleAlert :size="12" /> 健康度与监控
          </h3>
          <ul v-if="task.health.length" class="mt-2.5 space-y-2">
            <li v-for="h in task.health" :key="h.sellerId + h.label" class="flex items-start gap-1.5 text-[10.5px] leading-relaxed">
              <span class="mt-1 h-1 w-1 shrink-0 rounded-full" :class="h.tone === 'warn' ? 'bg-cyan' : 'bg-teal'" />
              <span :class="h.tone === 'warn' ? 'text-ink2' : 'text-ink3'">{{ h.label }}</span>
            </li>
          </ul>
          <p v-else class="mt-2 text-[10.5px] text-ink3">监控 Agent 异步运行，暂无异常。</p>
        </section>

        <section class="hud-panel p-4">
          <h3 class="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">任务参数</h3>
          <dl class="mt-2.5 space-y-1.5 text-[10.5px]">
            <div class="flex justify-between"><dt class="text-ink3">品类</dt><dd>{{ task.category }}</dd></div>
            <div class="flex justify-between"><dt class="text-ink3">期限</dt><dd>{{ task.deadline }}</dd></div>
            <div class="flex justify-between"><dt class="text-ink3">路径数</dt><dd>{{ task.lanes.length }} / 3</dd></div>
            <div class="flex justify-between"><dt class="text-ink3">确认方式</dt><dd>人工确认</dd></div>
          </dl>
        </section>
      </aside>
    </div>

    <ModerationDrawer :open="drawer" :findings="task.moderation" title="审核台 · 任务" @close="drawer = false" />
  </div>
</template>
