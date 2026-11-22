<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Image,
  Info,
  MoreHorizontal,
  Package,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ProductArt from '@/components/ProductArt.vue'
import { money, timeAgo, useMarketStore } from '@/stores/market'
import { useAgentStore, verdictMeta } from '@/stores/agent'
const market = useMarketStore()
const { markRead, productById, sendMessage, state, toast, userById } = market
const agent = useAgentStore()
const { checkChat } = agent

const route = useRoute()
const router = useRouter()
const draft = ref('')
const search = ref('')
const scroller = ref<HTMLElement | null>(null)
const activeId = ref<string>(
  typeof window !== 'undefined' && window.innerWidth >= 1024 ? (state.conversations[0]?.id ?? '') : '',
)

/** 审核 Agent：随输入实时给出聊天合规建议，不阻断发送 */
const risk = computed(() => (draft.value.trim() ? checkChat(draft.value) : undefined))

function useRiskSample() {
  draft.value = '加我微信吧，私下转账可以便宜 50'
}

function applyFix() {
  draft.value = '我们在平台内确认吧，约在图书馆一层面交，可以当面验货。'
}

const active = computed(() => state.conversations.find((c) => c.id === activeId.value))
const peer = computed(() => (active.value ? userById(active.value.peerId) : undefined))
const activeProduct = computed(() => (active.value ? productById(active.value.productId) : undefined))

const list = computed(() => {
  const kw = search.value.trim().toLowerCase()
  return state.conversations.filter((c) => {
    const u = userById(c.peerId)
    if (!kw) return true
    return `${u?.name ?? ''}${c.messages.at(-1)?.text ?? ''}`.toLowerCase().includes(kw)
  })
})

function select(id: string) {
  activeId.value = id
  const conv = state.conversations.find((c) => c.id === id)
  if (conv) {
    markRead(conv.id)
    router.replace({ path: '/messages', query: { peer: conv.peerId } })
  }
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

function send() {
  if (!active.value || !draft.value.trim()) return
  sendMessage(active.value.id, draft.value)
  draft.value = ''
  scrollToBottom()
}

function onEnter(e: KeyboardEvent) {
  if (e.isComposing) return
  send()
}

onMounted(() => {
  const peerId = route.query.peer ? String(route.query.peer) : ''
  const found = state.conversations.find((c) => c.peerId === peerId)
  if (found) activeId.value = found.id
  if (active.value) markRead(active.value.id)
  scrollToBottom()
})

watch(activeId, scrollToBottom)
</script>

<template>
  <div class="wrap py-6">
    <div class="flex items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Messages</p>
        <h1 class="mt-2 display text-[30px] font-semibold md:text-[36px]">消息</h1>
      </div>
      <p class="hidden items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3 sm:flex">
        <ShieldCheck :size="12" class="text-teal" /> 对话留存 · 可作为交易凭证
      </p>
    </div>

    <div class="mt-5 grid h-[calc(100vh-230px)] min-h-[540px] overflow-hidden rounded-3xl border border-ink/10 bg-[#F7FBFF] shadow-tag lg:grid-cols-[300px_1fr]">
      <!-- 会话列表 -->
      <aside class="flex min-h-0 flex-col border-ink/10 lg:border-r" :class="active ? 'hidden lg:flex' : 'flex'">
        <div class="border-b border-ink/10 p-3">
          <div class="relative">
            <Search :size="13" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              v-model="search"
              class="w-full rounded-full border border-ink/10 bg-haze/70 py-2 pl-8 pr-3 text-[12px] outline-none transition focus:border-ink/30 focus:bg-white"
              placeholder="搜索会话"
            />
          </div>
        </div>

        <div class="no-bar flex-1 overflow-y-auto">
          <button
            v-for="c in list"
            :key="c.id"
            class="flex w-full items-start gap-3 border-b border-ink/[0.06] px-3 py-3.5 text-left transition hover:bg-haze2/40"
            :class="c.id === activeId ? 'bg-haze2/60' : ''"
            @click="select(c.id)"
          >
            <div class="relative shrink-0">
              <Avatar :user="userById(c.peerId)" size="md" />
              <span v-if="c.unread" class="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-azure px-1 font-mono text-[9px] text-haze">
                {{ c.unread }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="truncate text-[12.5px] font-medium">{{ userById(c.peerId)?.name }}</span>
                <span class="shrink-0 font-mono text-[9px] text-ink3">{{ c.time }}</span>
              </div>
              <p class="mt-1 truncate text-[11px] text-ink3">
                {{ c.messages.at(-1)?.cardProductId ? '[商品卡片] ' : '' }}{{ c.messages.at(-1)?.text ?? '暂无消息' }}
              </p>
              <p class="mt-1 flex items-center gap-1 font-mono text-[9px] text-ink3/70">
                <Package :size="9" /> {{ productById(c.productId)?.title }}
              </p>
            </div>
          </button>
          <p v-if="!list.length" class="p-6 text-center text-[11.5px] text-ink3">没有匹配的会话</p>
        </div>
      </aside>

      <!-- 聊天 -->
      <section v-if="active" class="flex min-h-0 min-w-0 flex-col">
        <header class="flex items-center gap-3 border-b border-ink/10 px-4 py-3">
          <button class="grid h-8 w-8 place-items-center rounded-full border border-ink/15 lg:hidden" aria-label="返回" @click="activeId = ''">
            <ArrowLeft :size="14" />
          </button>
          <Avatar :user="peer" size="md" show-verified />
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 text-[13px] font-semibold">
              {{ peer?.name }}
              <span class="font-mono text-[9px] font-normal text-ink3">{{ peer?.college }}</span>
            </p>
            <p class="mt-0.5 flex items-center gap-1 font-mono text-[9px] text-teal">
              <span class="h-1.5 w-1.5 rounded-full bg-teal" /> 在线 · 信用 {{ peer?.credit }}
            </p>
          </div>
          <button class="grid h-8 w-8 place-items-center rounded-full text-ink3 transition hover:bg-haze2" aria-label="更多" @click="toast('会话设置（演示）')">
            <MoreHorizontal :size="16" />
          </button>
        </header>

        <!-- 商品卡 -->
        <router-link
          v-if="activeProduct"
          :to="`/product/${activeProduct.id}`"
          class="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-ink/10 bg-haze2/40 p-2.5 transition hover:border-ink/25"
        >
          <div class="h-12 w-14 shrink-0 overflow-hidden rounded-md">
            <ProductArt :product="activeProduct" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-serif text-[12px] font-semibold">{{ activeProduct.title }}</p>
            <p class="mt-0.5 font-mono text-[10px] text-ink3">{{ activeProduct.condition }} · {{ activeProduct.campus }}</p>
          </div>
          <span class="display shrink-0 pr-1 text-[17px] font-semibold text-azure">¥{{ money(activeProduct.price) }}</span>
        </router-link>

        <!-- 消息 -->
        <div ref="scroller" class="no-bar flex-1 overflow-y-auto px-4 py-4">
          <div class="mx-auto mb-4 w-fit rounded-full bg-haze2/70 px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-ink3">
            交易对话已加密留存
          </div>
          <div
            v-for="(m, i) in active.messages"
            :key="i"
            class="mb-3 flex items-end gap-2"
            :class="m.from === 'me' ? 'flex-row-reverse' : ''"
          >
            <Avatar v-if="m.from === 'peer'" :user="peer" size="xs" />
            <div class="max-w-[74%]">
              <div
                v-if="m.cardProductId"
                class="w-[220px] overflow-hidden rounded-2xl border border-ink/10 bg-haze shadow-tag"
              >
                <div v-if="productById(m.cardProductId)" class="aspect-[16/10]">
                  <ProductArt :product="productById(m.cardProductId)!" />
                </div>
                <div class="p-2.5">
                  <p class="line-clamp-1 font-serif text-[11.5px] font-semibold">{{ productById(m.cardProductId)?.title }}</p>
                  <p class="mt-1 display text-[16px] font-semibold text-azure">¥{{ money(productById(m.cardProductId)?.price ?? 0) }}</p>
                </div>
              </div>
              <div
                v-else
                class="rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed"
                :class="m.from === 'me' ? 'rounded-br-sm bg-ink text-haze' : 'rounded-bl-sm bg-haze2 text-ink2'"
              >
                {{ m.text }}
              </div>
              <p class="mt-1 font-mono text-[8.5px] text-ink3" :class="m.from === 'me' ? 'text-right' : ''">{{ m.time }}</p>
            </div>
          </div>
        </div>

        <!-- 聊天合规提示（不阻断） -->
        <div v-if="risk" class="mx-3 mb-2 rounded-xl border border-cyan/30 bg-cyan/[0.06] px-3 py-2.5">
          <div class="flex items-center gap-1.5">
            <ShieldCheck :size="12" class="text-cyan" />
            <span class="rounded border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold tracking-wider" :class="verdictMeta[risk.verdict].cls">
              {{ verdictMeta[risk.verdict].label }}
            </span>
            <span class="font-mono text-[9px] text-ink3">{{ risk.rule }}</span>
            <button class="ml-auto font-mono text-[9px] text-ink3 hover:text-ink" @click="draft = ''">忽略</button>
          </div>
          <p class="mt-1.5 text-[10.5px] leading-relaxed text-ink2">{{ risk.message }}</p>
          <p v-if="risk.fix" class="mt-1 text-[10px] leading-relaxed text-azure">{{ risk.fix }}</p>
          <div class="mt-2 flex gap-1.5">
            <button class="btn btn-sm !px-2.5 !py-1 !text-[10px]" @click="applyFix">采纳建议</button>
            <button class="btn btn-sm btn-ghost !px-2.5 !py-1 !text-[10px]" @click="send">仍然发送</button>
          </div>
        </div>

        <!-- 输入 -->
        <div class="border-t border-ink/10 bg-haze/60 p-3">
          <div class="flex items-end gap-2 rounded-2xl border border-ink/15 bg-white/70 p-2 transition focus-within:border-ink/35">
            <button class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink3 transition hover:bg-haze2" aria-label="发送图片" @click="toast('演示环境暂不支持上传图片')">
              <Image :size="16" />
            </button>
            <button class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink3 transition hover:bg-haze2" aria-label="发送商品卡片" @click="toast('已把当前商品加入对话（演示）')">
              <Package :size="16" />
            </button>
            <textarea
              v-model="draft"
              rows="1"
              class="max-h-24 flex-1 resize-none bg-transparent px-1 py-2 text-[12.5px] outline-none placeholder:text-ink3/60"
              placeholder="说点什么…支持粘贴商品信息"
              @keydown.enter.exact.prevent="onEnter"
            />
            <button
              class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-azure text-haze transition hover:bg-azure2 disabled:opacity-40"
              :disabled="!draft.trim()"
              aria-label="发送"
              @click="send"
            >
              <Send :size="15" />
            </button>
          </div>
          <div class="mt-1.5 flex items-center gap-1 px-1 font-mono text-[9px] text-ink3">
            <Info :size="9" /> 面交前请再次确认时间与地点，避免站外转账。
            <button v-if="!risk" class="ml-auto text-azure hover:underline" @click="useRiskSample">试用合规提示</button>
          </div>
        </div>
      </section>

      <section v-else class="hidden place-items-center lg:grid">
        <div class="text-center">
          <div class="mx-auto grid h-12 w-12 place-items-center rounded-full border border-ink/15 text-ink3">
            <Package :size="18" :stroke-width="1.4" />
          </div>
          <p class="mt-3 font-serif text-[13px] text-ink2">选择左侧会话开始聊天</p>
        </div>
      </section>
    </div>

  </div>
</template>
