<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowUpRight,
  Bell,
  Flag,
  Images,
  LayoutDashboard,
  Package,
  ReceiptText,
  Users,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { state } = market
const { me } = storeToRefs(market)

const route = useRoute()

const nav = [
  { label: '数据看板', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: '用户管理', to: '/admin/users', icon: Users },
  { label: '商品审核', to: '/admin/products', icon: Package },
  { label: '交易监控', to: '/admin/orders', icon: ReceiptText },
  { label: '举报与评价', to: '/admin/reports', icon: Flag },
  { label: '轮播与公告', to: '/admin/content', icon: Images },
]

const pending = computed(() => ({
  products: state.products.filter((p) => p.status === 'review').length,
  reports: state.reports.filter((r) => r.status === '待处理').length,
}))

const title = computed(() => nav.find((n) => n.to === route.path)?.label ?? '运营后台')
</script>

<template>
  <div class="wrap py-6">
    <div class="overflow-hidden rounded-3xl border border-ink/10 bg-haze/60 shadow-tag">
      <div class="flex min-h-[720px] flex-col lg:flex-row">
        <!-- 侧栏 -->
        <aside class="shrink-0 bg-ink text-haze lg:flex lg:w-[232px] lg:flex-col">
          <div class="border-b border-haze/10 px-5 py-5">
            <p class="flex items-center gap-2">
              <span class="grid h-8 w-8 -rotate-3 place-items-center rounded-[6px] bg-cyan font-serif text-[15px] text-ink">谦</span>
              <span class="display text-[17px] font-semibold">谦价 · 后台</span>
            </p>
            <p class="mt-2 font-mono text-[8.5px] uppercase tracking-[0.2em] text-haze/40">Operations console</p>
          </div>

          <nav class="p-2.5">
            <router-link
              v-for="n in nav"
              :key="n.to"
              :to="n.to"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] text-haze/70 transition hover:bg-haze/10 hover:text-haze"
              active-class="!bg-haze !text-ink hover:!bg-haze"
            >
              <component :is="n.icon" :size="15" :stroke-width="1.7" />
              {{ n.label }}
              <span
                v-if="n.to === '/admin/products' && pending.products"
                class="ml-auto rounded-full bg-cyan px-1.5 font-mono text-[9px] text-ink"
              >{{ pending.products }}</span>
              <span
                v-else-if="n.to === '/admin/reports' && pending.reports"
                class="ml-auto rounded-full bg-azure px-1.5 font-mono text-[9px] text-haze"
              >{{ pending.reports }}</span>
            </router-link>
          </nav>

          <div class="hidden flex-1 lg:block" />
          <div class="border-t border-haze/10 p-3">
            <router-link to="/" class="flex items-center gap-2 rounded-xl px-3 py-2 text-[11.5px] text-haze/60 transition hover:bg-haze/10 hover:text-haze">
              返回前台 <ArrowUpRight :size="12" class="ml-auto" />
            </router-link>
          </div>
        </aside>

        <!-- 主区 -->
        <div class="min-w-0 flex-1 bg-haze/40">
          <header class="flex items-center gap-3 border-b border-ink/10 px-5 py-4 md:px-6">
            <div class="min-w-0">
              <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">Admin / {{ title }}</p>
              <h1 class="mt-1 font-serif text-[19px] font-semibold">{{ title }}</h1>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <button class="relative grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-haze transition hover:bg-haze2" aria-label="通知">
                <Bell :size="15" />
                <span class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-azure" />
              </button>
              <div class="flex items-center gap-2 rounded-full border border-ink/15 bg-haze py-1 pl-1 pr-3">
                <Avatar :user="me" size="sm" />
                <span class="hidden text-[11.5px] font-medium sm:block">{{ me.name }} · 运营</span>
              </div>
            </div>
          </header>

          <div class="p-4 md:p-6">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
