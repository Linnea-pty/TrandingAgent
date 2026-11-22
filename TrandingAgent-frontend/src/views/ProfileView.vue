<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, BadgeCheck, CalendarDays, MapPin, PenLine, Star } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProfileSidebar from '@/components/ProfileSidebar.vue'
import Stars from '@/components/Stars.vue'
import { creditLedger } from '@/data/mock'

import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { state, toast, userById } = market
const { myProducts, onSale, me } = storeToRefs(market)

const tab = ref<'selling' | 'reviews'>('selling')

const selling = computed(() => myProducts.value.filter((p) => p.status === 'on'))
const received = computed(() =>
  state.reviews.filter((r) => r.toId === state.userId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
)
const avg = computed(() =>
  received.value.length
    ? received.value.reduce((s, r) => s + r.rating, 0) / received.value.length
    : me.value.rating,
)
const goodRate = computed(() => {
  if (!received.value.length) return 100
  return Math.round((received.value.filter((r) => r.rating >= 4).length / received.value.length) * 100)
})
</script>

<template>
  <div class="wrap py-8">
    <div class="grid items-start gap-6 lg:grid-cols-[264px_1fr]">
      <ProfileSidebar />

      <div class="min-w-0 space-y-5">
        <!-- 名片 -->
        <section class="relative overflow-hidden rounded-3xl border border-ink/10 bg-ink text-haze">
          <div class="absolute inset-0 opacity-[0.16]">
            <svg viewBox="0 0 600 240" class="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <circle cx="520" cy="40" r="150" fill="none" stroke="#0B93B3" stroke-width="1.2" />
              <circle cx="520" cy="40" r="105" fill="none" stroke="#0B93B3" stroke-width="1.2" />
              <circle cx="520" cy="40" r="60" fill="none" stroke="#0B93B3" stroke-width="1.2" />
              <path d="M0 200 Q 150 150 300 195 T 600 180" fill="none" stroke="#E9F1FB" stroke-width="1" />
            </svg>
          </div>

          <div class="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center md:p-7">
            <div class="flex items-center gap-4">
              <Avatar :user="me" size="lg" show-verified />
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="display text-[26px] font-semibold leading-none">{{ me.name }}</h1>
                  <span class="seal !border-cyan !text-cyan">校 园 实 名</span>
                </div>
                <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-haze/60">
                  <span class="flex items-center gap-1"><BadgeCheck :size="10" /> {{ me.college }}</span>
                  <span class="flex items-center gap-1"><CalendarDays :size="10" /> {{ me.grade }}</span>
                  <span class="flex items-center gap-1"><MapPin :size="10" /> 东校区</span>
                </p>
                <p class="mt-2.5 max-w-sm text-[11.5px] leading-relaxed text-haze/70">{{ me.bio }}</p>
              </div>
            </div>

            <div class="grid flex-1 grid-cols-3 gap-2 sm:max-w-[260px]">
              <div v-for="s in [
                { k: '信用分', v: me.credit },
                { k: '成交', v: me.sold },
                { k: '好评', v: `${goodRate}%` },
              ]" :key="s.k" class="rounded-xl border border-haze/15 bg-haze/[0.06] px-2 py-2.5 text-center">
                <p class="display text-[20px] font-semibold leading-none text-cyan">{{ s.v }}</p>
                <p class="mt-1 font-mono text-[8.5px] uppercase tracking-widest text-haze/50">{{ s.k }}</p>
              </div>
            </div>

            <div class="flex gap-2 sm:flex-col">
              <button class="btn btn-sm flex-1 border-haze/25 bg-haze text-ink hover:bg-haze2" @click="toast('资料编辑已保存（演示）')">
                <PenLine :size="12" /> 编辑资料
              </button>
              <router-link to="/credit" class="btn btn-sm flex-1 border-haze/25 text-haze hover:bg-haze/10">
                信用明细 <ArrowUpRight :size="12" />
              </router-link>
            </div>
          </div>
        </section>

        <!-- 评价概览 -->
        <section class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">综合评分</p>
            <div class="mt-2 flex items-end gap-2">
              <span class="display text-[26px] font-semibold leading-none">{{ avg.toFixed(1) }}</span>
              <Stars :value="avg" />
            </div>
            <p class="mt-1.5 font-mono text-[9.5px] text-ink3">{{ received.length }} 条公开评价</p>
          </div>
          <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">在售闲置</p>
            <p class="mt-2 display text-[26px] font-semibold leading-none">{{ selling.length }}</p>
            <p class="mt-1.5 font-mono text-[9.5px] text-ink3">共 {{ myProducts.length }} 件发布</p>
          </div>
          <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">最近信用变动</p>
            <p class="mt-2 display text-[26px] font-semibold leading-none text-teal">
              +{{ creditLedger[0]?.delta ?? 0 }}
            </p>
            <p class="mt-1.5 truncate font-mono text-[9.5px] text-ink3">{{ creditLedger[0]?.label }}</p>
          </div>
        </section>

        <!-- 切换 -->
        <div class="flex items-center gap-1 border-b border-ink/15">
          <button
            v-for="t in [{ k: 'selling', label: '在售闲置', n: selling.length }, { k: 'reviews', label: '收到的评价', n: received.length }] as const"
            :key="t.k"
            class="relative px-4 py-3 text-[13px] font-medium transition"
            :class="tab === t.k ? 'text-ink' : 'text-ink3 hover:text-ink2'"
            @click="tab = t.k"
          >
            {{ t.label }} <span class="ml-1 font-mono text-[10px] text-ink3">{{ t.n }}</span>
            <span v-if="tab === t.k" class="absolute inset-x-0 -bottom-px h-[2.5px] bg-azure" />
          </button>
          <router-link to="/my/listings" class="ml-auto pb-1 font-mono text-[10px] uppercase tracking-widest text-ink3 hover:text-ink">
            管理发布 →
          </router-link>
        </div>

        <!-- 在售 -->
        <div v-if="tab === 'selling'">
          <div v-if="!selling.length">
            <EmptyState title="暂时没有在售的闲置" desc="把宿舍里用不上的东西挂上来吧。">
              <router-link to="/publish" class="btn btn-primary btn-sm">发布闲置</router-link>
            </EmptyState>
          </div>
          <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ProductCard v-for="p in selling" :key="p.id" :product="p" />
          </div>
        </div>

        <!-- 评价 -->
        <div v-else>
          <div v-if="!received.length">
            <EmptyState title="还没有收到评价" desc="完成一次交易后，对方可以给你留下评价。" />
          </div>
          <div v-else class="space-y-3">
            <article v-for="r in received" :key="r.id" class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
              <header class="flex items-center gap-3">
                <Avatar :user="userById(r.fromId)" size="sm" show-verified />
                <div class="min-w-0">
                  <p class="text-[12.5px] font-medium">{{ userById(r.fromId)?.name }}</p>
                  <p class="font-mono text-[9.5px] text-ink3">{{ timeAgo(r.createdAt) }}</p>
                </div>
                <div class="ml-auto flex items-center gap-2">
                  <Stars :value="r.rating" :show-value="true" />
                </div>
              </header>
              <p class="mt-3 text-[12.5px] leading-relaxed text-ink2">{{ r.text }}</p>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <span v-for="t in r.tags" :key="t" class="rounded-full bg-teal/[0.09] px-2.5 py-0.5 text-[10px] text-teal">{{ t }}</span>
                <span class="ml-auto font-mono text-[9px] uppercase tracking-widest text-ink3">订单 {{ r.orderId }}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
