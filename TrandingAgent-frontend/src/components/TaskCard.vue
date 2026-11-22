<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, BadgeCheck, Gavel, HandCoins, Sparkles } from 'lucide-vue-next'
import type { AgentTask } from '@/types'
import Avatar from '@/components/Avatar.vue'

import { money, timeAgo, useMarketStore } from '@/stores/market'
import { statusMeta, useAgentStore } from '@/stores/agent'
const market = useMarketStore()
const { userById } = market
const agent = useAgentStore()
const { bestLane, laneProduct } = agent

const props = defineProps<{ task: AgentTask }>()
const emit = defineEmits<{ (e: 'confirm', id: string): void }>()

const meta = computed(() => statusMeta[props.task.status])
const lane = computed(() => bestLane(props.task))
const product = computed(() => (lane.value ? laneProduct(lane.value) : undefined))
const seller = computed(() => (lane.value ? userById(lane.value.sellerId) : undefined))
const toneCls: Record<string, string> = {
  blue: 'border-azure/30 bg-azure/[0.08] text-azure',
  teal: 'border-teal/30 bg-teal/[0.08] text-teal',
  cyan: 'border-cyan/30 bg-cyan/[0.08] text-cyan',
  ink: 'border-ink/15 bg-ink/[0.05] text-ink2',
}
const laneDot: Record<string, string> = {
  running: 'bg-azure animate-pulseDot',
  won: 'bg-teal',
  backup: 'bg-cyan/60',
  blocked: 'bg-ink/25',
  lost: 'bg-ink/20',
  queued: 'bg-ink/20',
}
const live = computed(() => props.task.status === 'negotiating' || props.task.status === 'searching')
</script>

<template>
  <article class="hud-panel group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-azure/30">
    <div class="flex items-start gap-3">
      <span
        class="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider"
        :class="toneCls[meta.tone]"
      >
        <span v-if="live" class="h-1.5 w-1.5 animate-pulseDot rounded-full bg-current" />
        {{ meta.label }}
      </span>
      <span class="font-mono text-[9.5px] text-ink3">{{ timeAgo(task.createdAt) }}</span>
      <span class="ml-auto font-mono text-[9px] text-ink3">#{{ task.id.slice(-4) }}</span>
    </div>

    <h3 class="mt-3 font-display text-[17px] font-semibold leading-snug text-ink">{{ task.title }}</h3>
    <p class="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink3">「{{ task.rawInput }}」</p>

    <div class="mt-4 grid grid-cols-3 gap-2">
      <div class="rounded-lg border border-azure/10 bg-white/50 px-2.5 py-2">
        <p class="mono-label !text-[9px]">预算</p>
        <p class="num-display mt-0.5 text-[14px]">¥{{ money(task.budget) }}</p>
      </div>
      <div class="rounded-lg border border-azure/10 bg-white/50 px-2.5 py-2">
        <p class="mono-label !text-[9px]">当前最好</p>
        <p class="num-display mt-0.5 text-[14px] text-azure">{{ lane ? `¥${money(lane.price)}` : '—' }}</p>
      </div>
      <div class="rounded-lg border border-azure/10 bg-white/50 px-2.5 py-2">
        <p class="mono-label !text-[9px]">已省</p>
        <p class="num-display mt-0.5 text-[14px]" :class="task.savings ? 'text-teal' : 'text-ink3'">
          {{ task.savings ? `¥${money(task.savings)}` : '—' }}
        </p>
      </div>
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-between font-mono text-[9px] text-ink3">
        <span>{{ meta.hint }}</span>
        <span>{{ task.progress }}%</span>
      </div>
      <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          class="h-full rounded-full transition-all duration-700"
          :class="task.status === 'awaiting' ? 'bg-teal' : task.status === 'failed' ? 'bg-ink/30' : 'bg-azure'"
          :style="{ width: `${task.progress}%` }"
        />
      </div>
    </div>

    <ul v-if="task.lanes.length" class="mt-4 space-y-1.5 border-t border-dashed border-azure/15 pt-3">
      <li v-for="l in task.lanes" :key="l.id" class="flex items-center gap-2 text-[10.5px]">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="laneDot[l.status]" />
        <span class="w-4 font-mono text-[9px] text-ink3">{{ l.id.slice(-1).toUpperCase() }}</span>
        <span class="min-w-0 flex-1 truncate text-ink2">{{ laneProduct(l)?.title ?? '商品已下架' }}</span>
        <span class="font-mono text-[10.5px]" :class="l.status === 'won' ? 'text-teal' : 'text-ink3'">¥{{ money(l.price) }}</span>
      </li>
    </ul>

    <div v-if="task.status === 'searching'" class="mt-4 flex items-center gap-2 rounded-lg border border-azure/15 bg-azure/[0.04] px-3 py-2 font-mono text-[10px] text-azure">
      <Sparkles :size="11" class="animate-pulseDot" /> 正在召回候选 · 审核 Agent 同步过滤
    </div>

    <div v-if="task.status === 'clarifying'" class="mt-4 rounded-lg border border-cyan/25 bg-cyan/[0.06] px-3 py-2 text-[10.5px] text-cyan">
      还有 {{ task.questions.filter((q) => !q.answer).length }} 个问题需要你确认
    </div>

    <div class="mt-auto flex items-center gap-2 pt-5">
      <router-link :to="`/task/${task.id}`" class="btn btn-sm flex-1">
        任务详情 <ArrowUpRight :size="12" />
      </router-link>
      <router-link
        v-if="task.lanes.length"
        :to="`/arena/${task.id}`"
        class="btn btn-sm btn-ghost"
      >
        <Gavel :size="12" /> 议价
      </router-link>
      <button
        v-if="task.status === 'awaiting' && lane"
        class="btn btn-sm btn-primary"
        @click="emit('confirm', task.id)"
      >
        <HandCoins :size="12" /> 确认
      </button>
      <router-link
        v-else-if="task.orderId"
        :to="`/order/${task.orderId}`"
        class="btn btn-sm btn-teal"
      >
        <BadgeCheck :size="12" /> 订单
      </router-link>
    </div>

    <div v-if="seller" class="mt-3 flex items-center gap-1.5 border-t border-azure/10 pt-2.5">
      <Avatar :user="seller" size="xs" show-verified />
      <span class="text-[10px] text-ink3">{{ seller.name }}</span>
      <span v-if="product" class="ml-auto font-mono text-[9px] text-ink3">原价 ¥{{ money(product.price) }}</span>
    </div>
  </article>
</template>
