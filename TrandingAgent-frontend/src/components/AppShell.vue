<script setup lang="ts">
import { Compass, Home, MessageCircle, Plus, UserRound } from 'lucide-vue-next'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { totalUnread } = storeToRefs(market)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />
    <main class="flex-1 pb-24 lg:pb-0">
      <slot />
    </main>
    <SiteFooter />

    <!-- 移动端底部导航 -->
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-haze/95 backdrop-blur-md lg:hidden">
      <div class="grid grid-cols-5 items-end px-2 pb-[env(safe-area-inset-bottom)]">
        <router-link to="/" class="flex flex-col items-center gap-1 py-2.5 text-[10px] text-ink3" exact-active-class="text-ink">
          <Home :size="19" :stroke-width="1.7" />
          首页
        </router-link>
        <router-link to="/market" class="flex flex-col items-center gap-1 py-2.5 text-[10px] text-ink3" active-class="text-ink">
          <Compass :size="19" :stroke-width="1.7" />
          大厅
        </router-link>
        <router-link to="/publish" class="flex flex-col items-center">
          <span class="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-azure text-haze shadow-lift ring-4 ring-haze">
            <Plus :size="22" :stroke-width="2.4" />
          </span>
          <span class="pb-2.5 pt-1 text-[10px] text-ink3">发布</span>
        </router-link>
        <router-link to="/messages" class="relative flex flex-col items-center gap-1 py-2.5 text-[10px] text-ink3" active-class="text-ink">
          <MessageCircle :size="19" :stroke-width="1.7" />
          消息
          <span v-if="totalUnread" class="absolute right-4 top-1.5 h-1.5 w-1.5 rounded-full bg-azure" />
        </router-link>
        <router-link to="/profile" class="flex flex-col items-center gap-1 py-2.5 text-[10px] text-ink3" active-class="text-ink">
          <UserRound :size="19" :stroke-width="1.7" />
          我的
        </router-link>
      </div>
    </nav>
  </div>
</template>
