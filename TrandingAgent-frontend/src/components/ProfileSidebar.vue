<script setup lang="ts">
import {
  BadgeCheck,
  Heart,
  Plus,
  Settings2,
  ShoppingBag,
  ShoppingBasket,
  Star,
  Store,
  UserRound,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { favoriteProducts, me, myProducts, myWanted } = storeToRefs(market)

const links = [
  { label: '个人主页', to: '/profile', icon: UserRound },
  { label: '我的发布', to: '/my/listings', icon: Store },
  { label: '我的订单', to: '/orders', icon: ShoppingBag },
  { label: '我的收藏', to: '/favorites', icon: Heart },
  { label: '我的求购', to: '/my/wanted', icon: ShoppingBasket },
  { label: '信用与评价', to: '/credit', icon: Star },
  { label: '账号安全', to: '/security', icon: Settings2 },
]
</script>

<template>
  <aside class="space-y-4">
    <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
      <div class="flex items-center gap-3">
        <Avatar :user="me" size="lg" show-verified />
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 font-serif text-[17px] font-semibold">
            {{ me.name }}
          </p>
          <p class="mt-1 font-mono text-[10px] text-ink3">{{ me.college }} · {{ me.grade }}</p>
          <span v-if="me.verified" class="seal mt-2 inline-block !text-[9px]">校 园 实 名</span>
          <span v-else class="mt-2 inline-block rounded border border-ink/20 px-1.5 py-0.5 font-mono text-[9px] text-ink3">未实名</span>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 divide-x divide-ink/10 border-y border-dashed border-ink/15 py-3 text-center">
        <div>
          <p class="display text-lg font-semibold">{{ myProducts.length }}</p>
          <p class="font-mono text-[9px] uppercase tracking-wider text-ink3">发布</p>
        </div>
        <div>
          <p class="display text-lg font-semibold">{{ me.sold }}</p>
          <p class="font-mono text-[9px] uppercase tracking-wider text-ink3">卖出</p>
        </div>
        <div>
          <p class="display text-lg font-semibold">{{ favoriteProducts.length }}</p>
          <p class="font-mono text-[9px] uppercase tracking-wider text-ink3">收藏</p>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between rounded-lg bg-teal/[0.08] px-3 py-2">
        <span class="flex items-center gap-1 text-[11px] text-teal"><BadgeCheck :size="12" /> 信用分</span>
        <span class="font-display text-lg font-semibold text-teal">{{ me.credit }}</span>
      </div>
    </div>

    <nav class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-2">
      <router-link
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-ink2 transition hover:bg-haze2 hover:text-ink"
        active-class="!bg-ink !text-haze hover:!bg-ink hover:!text-haze"
      >
        <component :is="l.icon" :size="15" :stroke-width="1.7" />
        {{ l.label }}
        <span v-if="l.to === '/my/wanted' && myWanted.length" class="ml-auto font-mono text-[10px] opacity-60">
          {{ myWanted.length }}
        </span>
      </router-link>
    </nav>

    <router-link to="/publish" class="btn btn-primary w-full !rounded-2xl">
      <Plus :size="15" /> 发布闲置
    </router-link>
  </aside>
</template>
