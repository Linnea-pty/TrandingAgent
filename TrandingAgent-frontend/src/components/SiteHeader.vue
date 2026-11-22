<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  UserRound,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import AgentStatusBar from '@/components/AgentStatusBar.vue'
import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { state, toast } = market
const { me, totalUnread } = storeToRefs(market)

const router = useRouter()
const keyword = ref('')
const menuOpen = ref(false)

const notices = computed(() => state.notices)

function submitSearch() {
  router.push({ path: '/market', query: keyword.value ? { q: keyword.value } : {} })
}

const menu = [
  { label: '个人主页', to: '/profile', icon: UserRound },
  { label: '我的发布', to: '/my/listings', icon: Store },
  { label: '我的订单', to: '/orders', icon: ShoppingBag },
  { label: '我的收藏', to: '/favorites', icon: Heart },
  { label: '账号安全', to: '/security', icon: ShieldCheck },
  { label: '运营后台', to: '/admin', icon: LayoutDashboard },
]

function logout() {
  menuOpen.value = false
  toast('已退出登录（演示环境会保留当前数据）', 'warn')
}
</script>

<template>
  <header class="sticky top-0 z-50">
    <!-- 公告跑马灯 -->
    <div class="overflow-hidden border-b border-ink/20 bg-ink text-haze">
      <div class="wrap flex h-8 items-center gap-4">
        <span class="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan sm:flex">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
          校园公告
        </span>
        <div class="ticker-mask relative flex-1 overflow-hidden">
          <div class="flex w-max animate-marquee gap-10 whitespace-nowrap py-0.5 text-[11px] text-haze/85">
            <span v-for="(n, i) in [...notices, ...notices]" :key="`${n.id}-${i}`">
              {{ n.text }}
            </span>
          </div>
        </div>
        <router-link
          to="/admin"
          class="hidden shrink-0 font-mono text-[10px] uppercase tracking-widest text-haze/50 transition hover:text-cyan md:block"
        >
          运营后台 ↗
        </router-link>
      </div>
    </div>

    <div class="border-b border-ink/10 bg-haze/85 backdrop-blur-md">
      <div class="wrap flex h-16 items-center gap-5">
        <router-link to="/" class="flex shrink-0 items-center gap-2.5">
          <span class="relative grid h-10 w-10 place-items-center rounded-[10px] bg-ink font-display text-[19px] text-neon shadow-glow ring-1 ring-azure/40">
            谦
            <span class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-teal" />
          </span>
          <span class="leading-none">
            <span class="display block text-[21px] font-semibold tracking-tight">谦价</span>
            <span class="mt-1 block font-mono text-[8px] uppercase tracking-[0.26em] text-ink3">Campus Exchange</span>
          </span>
        </router-link>

        <nav class="ml-2 hidden items-center gap-0.5 lg:flex">
          <router-link to="/" class="nav-link" exact-active-class="router-link-active">首页</router-link>
          <router-link to="/assistant" class="nav-link flex items-center gap-1.5">
            <Sparkles :size="12" class="text-azure" /> 小谦
            <span class="h-1 w-1 rounded-full bg-teal" />
          </router-link>
          <router-link to="/market" class="nav-link">商品大厅</router-link>
          <router-link to="/wanted" class="nav-link">求购大厅</router-link>
          <router-link to="/square" class="nav-link">广场</router-link>
        </nav>

        <form class="ml-auto hidden max-w-[280px] flex-1 items-center md:flex" @submit.prevent="submitSearch">
          <div class="relative w-full">
            <Search :size="14" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              v-model="keyword"
              class="w-full rounded-full border border-ink/15 bg-white/60 py-2 pl-9 pr-3 text-[13px] outline-none transition placeholder:text-ink3/70 focus:border-ink/35 focus:bg-white"
              placeholder="搜教材、耳机、自行车…"
              aria-label="搜索商品"
            />
          </div>
        </form>

        <div class="ml-auto flex items-center gap-2 md:ml-0">
          <router-link
            to="/messages"
            class="relative grid h-9 w-9 place-items-center rounded-full border border-ink/15 transition hover:bg-haze2"
            aria-label="消息"
          >
            <MessageCircle :size="16" />
            <span
              v-if="totalUnread"
              class="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-azure px-1 font-mono text-[9px] text-haze"
            >
              {{ totalUnread }}
            </span>
          </router-link>

          <router-link to="/publish" class="btn btn-primary btn-sm hidden sm:inline-flex">
            <Plus :size="14" :stroke-width="2.4" /> 发布闲置
          </router-link>

          <div class="relative">
            <button
              class="flex items-center gap-1.5 rounded-full border border-ink/15 py-1 pl-1 pr-2 transition hover:bg-haze2"
              @click="menuOpen = !menuOpen"
            >
              <Avatar :user="me" size="sm" />
              <span class="hidden text-[12px] font-medium sm:block">{{ me.name }}</span>
              <ChevronDown :size="13" class="text-ink3" />
            </button>

            <Transition
              enter-active-class="transition duration-150"
              enter-from-class="opacity-0 -translate-y-1"
              leave-active-class="transition duration-100"
              leave-to-class="opacity-0"
            >
              <div v-if="menuOpen" class="absolute right-0 top-12 w-56">
                <div class="mb-1 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-2 shadow-lift">
                  <div class="flex items-center gap-2.5 border-b border-dashed border-ink/15 px-2.5 pb-2.5 pt-1.5">
                    <Avatar :user="me" size="md" show-verified />
                    <div class="leading-tight">
                      <p class="text-[13px] font-semibold">{{ me.name }}</p>
                      <p class="mt-0.5 font-mono text-[10px] text-ink3">信用 {{ me.credit }} · {{ me.college }}</p>
                    </div>
                  </div>
                  <router-link
                    v-for="item in menu"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-ink2 transition hover:bg-haze2 hover:text-ink"
                    @click="menuOpen = false"
                  >
                    <component :is="item.icon" :size="15" :stroke-width="1.7" />
                    {{ item.label }}
                  </router-link>
                  <button
                    class="mt-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-azure transition hover:bg-azure/10"
                    @click="logout"
                  >
                    <LogOut :size="15" :stroke-width="1.7" /> 退出登录
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <AgentStatusBar />

    <div v-if="menuOpen" class="fixed inset-0 -z-10" @click="menuOpen = false" />
  </header>
</template>
