<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Bot, CircleDot, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-vue-next'
import type { NegotiationLane } from '@/types'
import Avatar from '@/components/Avatar.vue'
import ProductArt from '@/components/ProductArt.vue'

import { money, timeAgo, useMarketStore } from '@/stores/market'
import { useAgentStore, verdictMeta } from '@/stores/agent'
const market = useMarketStore()
const { userById } = market
const agent = useAgentStore()
const { laneProduct } = agent

const props = withDefaults(defineProps<{ lane: NegotiationLane; dense?: boolean }>(), { dense: false })

const product = computed(() => laneProduct(props.lane))
const seller = computed(() => userById(props.lane.sellerId))
const scroller = ref<HTMLElement | null>(null)

const statusText: Record<string, string> = {
  queued: '排队中',
  running: '议价中',
  won: '已成交',
  backup: '降级备选',
  lost: '已放弃',
  blocked: '已拦截',
}
const statusCls: Record<string, string> = {
  queued: 'text-ink3',
  running: 'text-azure',
  won: 'text-teal',
  backup: 'text-cyan',
  lost: 'text-ink3',
  blocked: 'text-azure',
}

const progress = computed(() => {
  const span = Math.max(1, props.lane.startPrice - props.lane.target)
  const done = Math.max(0, props.lane.startPrice - props.lane.price)
  return Math.min(100, Math.round((done / span) * 100))
})

watch(
  () => props.lane.messages.length,
  () => nextTick(() => scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })),
)

watch(
  () => props.lane.status,
  () => nextTick(() => scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })),
)
</script>

<template>
  <section
    class="hud-panel flex min-h-0 flex-col overflow-hidden transition"
    :class="{
      'hud-glow border-teal/40': lane.status === 'won',
      'opacity-80': lane.status === 'backup' || lane.status === 'lost',
      'border-azure/30': lane.status === 'running',
    }"
  >
    <header class="flex items-start gap-2.5 border-b border-azure/10 bg-white/55 px-3.5 py-3">
      <div class="h-9 w-11 shrink-0 overflow-hidden rounded-md border border-azure/15">
        <ProductArt v-if="product" :product="product" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <Avatar :user="seller" size="xs" />
          <span class="truncate text-[11px] font-medium text-ink">{{ seller?.name ?? '未知卖家' }}</span>
          <span class="ml-auto shrink-0 font-mono text-[9px]" :class="statusCls[lane.status]">
            {{ statusText[lane.status] }}
          </span>
        </div>
        <p class="mt-0.5 line-clamp-1 text-[10px] text-ink3">{{ product?.title ?? '商品已下架' }}</p>
        <p v-if="!dense" class="mt-0.5 line-clamp-1 font-mono text-[9px] text-ink3">{{ timeAgo(product?.createdAt ?? new Date().toISOString()) }} · {{ lane.health[0] }}</p>
      </div>
    </header>

    <div class="flex items-end justify-between px-3.5 py-2.5">
      <div>
        <p class="mono-label !text-[8.5px]">当前报价</p>
        <p class="num-display text-[22px] font-semibold leading-none" :class="lane.status === 'won' ? 'text-teal' : 'text-ink'">
          ¥{{ money(lane.price) }}
        </p>
      </div>
      <div class="text-right">
        <p class="mono-label !text-[8.5px]">目标 / 挂牌</p>
        <p class="font-mono text-[10px] text-ink3">¥{{ money(lane.target) }} / ¥{{ money(lane.startPrice) }}</p>
      </div>
    </div>

    <div class="px-3.5">
      <div class="h-1 overflow-hidden rounded-full bg-ink/[0.07]">
        <div class="h-full rounded-full transition-all duration-700" :class="lane.status === 'won' ? 'bg-teal' : 'bg-azure'" :style="{ width: `${progress}%` }" />
      </div>
      <div class="mt-1 flex justify-between font-mono text-[8.5px] text-ink3">
        <span>{{ lane.rounds }} / {{ lane.maxRounds }} 轮</span>
        <span>{{ progress }}% to target</span>
      </div>
    </div>

    <div ref="scroller" class="lane-scroll mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
      <div
        v-for="m in lane.messages"
        :key="m.id"
        class="animate-fadeUp"
        :class="m.from === 'agent' ? 'pl-4' : 'pr-4'"
      >
        <div
          class="rounded-xl border px-2.5 py-2 text-[10.5px] leading-relaxed"
          :class="
            m.from === 'agent'
              ? 'border-azure/18 bg-azure/[0.06] text-ink2'
              : 'border-azure/10 bg-white/75 text-ink2'
          "
        >
          <div class="mb-1 flex items-center gap-1 font-mono text-[8.5px] text-ink3">
            <Bot v-if="m.from === 'agent'" :size="9" />
            <CircleDot v-else :size="9" />
            {{ m.from === 'agent' ? '小谦' : seller?.name }}
            <span class="ml-auto">{{ m.at }}</span>
          </div>
          <p>{{ m.text }}</p>
          <p v-if="m.price" class="mt-1 font-mono text-[9.5px] text-azure">报价 ¥{{ money(m.price) }}</p>
        </div>

        <div v-if="m.verdict && m.verdict !== 'pass'" class="mt-1 flex items-start gap-1 rounded-md border px-2 py-1 text-[9px] leading-snug" :class="verdictMeta[m.verdict].cls">
          <ShieldAlert v-if="m.verdict === 'block'" :size="10" class="mt-px shrink-0" />
          <ShieldQuestion v-else :size="10" class="mt-px shrink-0" />
          <span>{{ m.checkNote }}</span>
        </div>
        <div v-else-if="m.verdict === 'pass' && !dense" class="mt-1 flex items-center gap-1 font-mono text-[8.5px] text-teal/80">
          <ShieldCheck :size="9" /> VALIDATOR PASS
        </div>
      </div>

      <p v-if="lane.status === 'running'" class="flex items-center gap-1.5 px-1 font-mono text-[9px] text-ink3">
        <span class="h-1 w-1 animate-pulseDot rounded-full bg-azure" /> 小谦正在等待卖家回复…
      </p>
    </div>
  </section>
</template>
