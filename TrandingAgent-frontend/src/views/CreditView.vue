<script setup lang="ts">
import { computed } from 'vue'
import { BadgeCheck, CircleHelp, Info, ShieldCheck, Star, TrendingUp } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ProfileSidebar from '@/components/ProfileSidebar.vue'
import Stars from '@/components/Stars.vue'
import { creditLedger } from '@/data/mock'
import { timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { state, userById } = market
const { me } = storeToRefs(market)

const received = computed(() =>
  state.reviews
    .filter((r) => r.toId === state.userId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
)

const total = computed(() => me.value.credit)
const level = computed(() => (total.value >= 95 ? '信用极好' : total.value >= 85 ? '信用良好' : '需要加油'))
const nextAt = computed(() => (total.value >= 95 ? 100 : 95))
const progress = computed(() => Math.min(100, Math.round((total.value / nextAt.value) * 100)))

const gained = computed(() => creditLedger.filter((c) => c.delta > 0).reduce((s, c) => s + c.delta, 0))
const lost = computed(() => creditLedger.filter((c) => c.delta < 0).reduce((s, c) => s + c.delta, 0))

const avg = computed(() =>
  received.value.length ? received.value.reduce((s, r) => s + r.rating, 0) / received.value.length : me.value.rating,
)
const dist = computed(() =>
  [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: received.value.filter((r) => Math.round(r.rating) === n).length,
  })),
)
</script>

<template>
  <div class="wrap py-8">
    <div class="grid items-start gap-6 lg:grid-cols-[264px_1fr]">
      <ProfileSidebar />

      <div class="min-w-0 space-y-4">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Credit & reviews</p>
          <h1 class="mt-2 display text-[30px] font-semibold md:text-[36px]">信用与评价</h1>
          <p class="mt-2 text-[12.5px] text-ink3">信用分由交易完成、评价与违规记录共同计算，每月 1 日更新。</p>
        </div>

        <!-- 信用分 -->
        <section class="relative overflow-hidden rounded-3xl border border-ink/10 bg-ink p-6 text-haze md:p-7">
          <div class="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-cyan/20" />
          <div class="absolute -right-6 -top-10 h-40 w-40 rounded-full border border-cyan/20" />

          <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <div class="relative grid h-[132px] w-[132px] shrink-0 place-items-center">
              <svg viewBox="0 0 120 120" class="absolute inset-0 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(247,241,229,0.14)" stroke-width="7" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#0B93B3" stroke-width="7"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(progress / 100) * 327} 327`"
                />
              </svg>
              <div class="text-center">
                <p class="display text-[38px] font-semibold leading-none text-cyan">{{ total }}</p>
                <p class="mt-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-haze/50">Credit</p>
              </div>
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="rounded-full border border-cyan/50 px-2.5 py-0.5 font-mono text-[10px] text-cyan">{{ level }}</span>
                <span class="flex items-center gap-1 font-mono text-[10px] text-haze/50"><BadgeCheck :size="11" /> 已实名</span>
              </div>
              <p class="mt-3 max-w-md text-[12px] leading-relaxed text-haze/70">
                距离 {{ nextAt }} 分还差 {{ Math.max(0, nextAt - total) }} 分。完成 1 次面交 +8，收到五星评价 +5，按时面交还能额外 +2。
              </p>
              <div class="mt-4 grid grid-cols-3 gap-2">
                <div v-for="s in [
                  { k: '累计加分', v: `+${gained}` },
                  { k: '累计扣分', v: `${lost}` },
                  { k: '好评率', v: `${received.length ? Math.round((received.filter((r) => r.rating >= 4).length / received.length) * 100) : 100}%` },
                ]" :key="s.k" class="rounded-xl border border-haze/15 bg-haze/[0.06] px-3 py-2">
                  <p class="display text-[17px] font-semibold leading-none">{{ s.v }}</p>
                  <p class="mt-1 font-mono text-[8.5px] uppercase tracking-widest text-haze/45">{{ s.k }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
          <!-- 明细 -->
          <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
            <div class="flex items-center justify-between">
              <h2 class="flex items-center gap-2 font-serif text-[15px] font-semibold"><TrendingUp :size="15" class="text-ink3" /> 信用明细</h2>
              <span class="font-mono text-[9px] uppercase tracking-widest text-ink3">近 6 个月</span>
            </div>
            <ul class="mt-4 space-y-0">
              <li v-for="(c, i) in creditLedger" :key="i" class="flex items-center gap-3 border-b border-dashed border-ink/10 py-2.5 last:border-0">
                <span
                  class="grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px]"
                  :class="c.delta > 0 ? 'bg-teal/10 text-teal' : 'bg-azure/10 text-azure'"
                >
                  {{ c.delta > 0 ? '+' : '−' }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[12px] text-ink2">{{ c.label }}</p>
                  <p class="font-mono text-[9.5px] text-ink3">{{ c.date }}</p>
                </div>
                <span class="font-mono text-[12px]" :class="c.delta > 0 ? 'text-teal' : 'text-azure'">
                  {{ c.delta > 0 ? '+' : '' }}{{ c.delta }}
                </span>
              </li>
            </ul>
          </section>

          <!-- 评价分布 -->
          <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
            <div class="flex items-center justify-between">
              <h2 class="flex items-center gap-2 font-serif text-[15px] font-semibold"><Star :size="15" class="text-ink3" /> 评价分布</h2>
              <span class="font-mono text-[9px] uppercase tracking-widest text-ink3">{{ received.length }} 条</span>
            </div>

            <div class="mt-4 flex items-end gap-4">
              <div>
                <p class="display text-[40px] font-semibold leading-none">{{ avg.toFixed(1) }}</p>
                <Stars :value="avg" :size="14" class="mt-1.5" />
              </div>
              <div class="flex-1 space-y-1.5">
                <div v-for="d in dist" :key="d.n" class="flex items-center gap-2">
                  <span class="w-6 font-mono text-[9.5px] text-ink3">{{ d.n }}★</span>
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                    <div
                      class="h-full rounded-full bg-cyan"
                      :style="{ width: `${received.length ? (d.count / received.length) * 100 : 0}%` }"
                    />
                  </div>
                  <span class="w-4 text-right font-mono text-[9.5px] text-ink3">{{ d.count }}</span>
                </div>
              </div>
            </div>

            <div class="mt-4 rounded-xl bg-teal/[0.06] p-3">
              <p class="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-teal">
                <Info :size="12" class="mt-0.5 shrink-0" />
                评价只统计已完成订单。若认为评价不实，可在 15 天内发起申诉，平台会核对聊天记录与交易凭证。
              </p>
            </div>
          </section>
        </div>

        <!-- 收到的评价 -->
        <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-[15px] font-semibold">收到的评价</h2>
            <span class="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ink3">
              <ShieldCheck :size="10" /> 全部来自真实订单
            </span>
          </div>

          <div v-if="!received.length" class="mt-4 rounded-xl border border-dashed border-ink/20 px-4 py-10 text-center text-[12px] text-ink3">
            还没有收到评价，完成一次交易试试。
          </div>

          <div v-else class="mt-4 space-y-3">
            <article v-for="r in received" :key="r.id" class="rounded-xl border border-ink/10 bg-haze/60 p-4">
              <header class="flex items-center gap-2.5">
                <Avatar :user="userById(r.fromId)" size="sm" show-verified />
                <div>
                  <p class="text-[12px] font-medium">{{ userById(r.fromId)?.name }}</p>
                  <p class="font-mono text-[9px] text-ink3">{{ timeAgo(r.createdAt) }}</p>
                </div>
                <Stars :value="r.rating" :size="11" class="ml-auto" />
              </header>
              <p class="mt-2.5 text-[12px] leading-relaxed text-ink2">{{ r.text }}</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span v-for="t in r.tags" :key="t" class="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[9.5px] text-ink3">{{ t }}</span>
              </div>
            </article>
          </div>
        </section>

        <p class="flex items-center gap-1.5 px-1 font-mono text-[9.5px] text-ink3">
          <CircleHelp :size="11" /> 信用规则说明：交易完成 +8，五星评价 +5，违规发布 −5，恶意取消 −2。
        </p>
      </div>
    </div>
  </div>
</template>
