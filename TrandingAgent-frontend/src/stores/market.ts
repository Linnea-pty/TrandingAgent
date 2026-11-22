import { computed, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  ME_ID,
  seedBanners,
  seedConversations,
  seedNotices,
  seedOrders,
  seedPosts,
  seedProducts,
  seedReports,
  seedReviews,
  seedUsers,
  seedWanted,
} from '@/data/mock'
import type { Conversation, Order, Product, ProductStatus, ToastItem, User, Wanted } from '@/types'
import { useErrorStore } from '@/stores/error'

const STORAGE_KEY = 'qianjia:state:v1'

/* ------------------------------------------------------------------ 纯工具（无状态，直接导出） */

export const money = (n: number) => n.toLocaleString('zh-CN')

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export function orderCode(order: Order) {
  const d = new Date(order.createdAt)
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `QJ${stamp}${order.id.replace(/\D/g, '').padStart(4, '0')}`
}

function nowLabel() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ------------------------------------------------------------------ 商店 */

export const useMarketStore = defineStore('market', () => {
  const errors = useErrorStore()

  /** 全局业务数据，刷新后从 localStorage 恢复 */
  const state = reactive({
    userId: ME_ID,
    users: [...seedUsers] as User[],
    products: [...seedProducts] as Product[],
    orders: [...seedOrders] as Order[],
    wanted: [...seedWanted] as Wanted[],
    posts: [...seedPosts],
    conversations: [...seedConversations] as Conversation[],
    reviews: [...seedReviews],
    reports: [...seedReports],
    banners: [...seedBanners],
    notices: [...seedNotices],
    favorites: ['p5', 'p7', 'p9', 'p14'] as string[],
  })

  const toasts = ref<ToastItem[]>([])
  let toastSeq = 0

  function hydrate() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      Object.assign(state, JSON.parse(raw) as Partial<typeof state>)
    } catch (error) {
      // 缓存损坏不应阻断启动：丢弃脏数据，用种子数据继续
      errors.report(error, 'market:hydrate')
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      // 隐私模式或配额不足：降级为纯内存，不打断操作
      errors.report(error, 'market:persist')
    }
  }

  hydrate()
  watch(state, persist, { deep: true })

  /* ---------------------------------------------------------------- 派生数据 */

  const me = computed<User>(() => state.users.find((u) => u.id === state.userId) ?? state.users[0]!)

  const onSale = computed(() => state.products.filter((p) => p.status === 'on'))

  const myProducts = computed(() => state.products.filter((p) => p.sellerId === state.userId))

  const myWanted = computed(() => state.wanted.filter((w) => w.userId === state.userId))

  const myOrders = computed(() =>
    state.orders.filter((o) => o.buyerId === state.userId || o.sellerId === state.userId),
  )

  const favoriteProducts = computed(() =>
    state.favorites.map((id) => state.products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
  )

  const totalUnread = computed(() => state.conversations.reduce((sum, c) => sum + c.unread, 0))

  const platformStats = computed(() => {
    const done = state.orders.filter((o) => o.status === '已完成')
    return {
      users: 12864,
      products: state.products.length + 4213,
      orders: state.orders.length + 2176,
      gmv: done.reduce((s, o) => s + o.price, 0) + 186420,
    }
  })

  /* ---------------------------------------------------------------- 查询 */

  const userById = (id: string) => state.users.find((u) => u.id === id)
  const productById = (id: string) => state.products.find((p) => p.id === id)
  const orderById = (id: string) => state.orders.find((o) => o.id === id)
  const isFavorite = (id: string) => state.favorites.includes(id)

  /* ---------------------------------------------------------------- 提示 */

  function toast(text: string, tone: 'ok' | 'warn' = 'ok') {
    const id = ++toastSeq
    toasts.value.push({ id, text, tone })
    window.setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 2600)
  }

  /* ---------------------------------------------------------------- 操作 */

  function toggleFavorite(id: string) {
    if (isFavorite(id)) {
      state.favorites = state.favorites.filter((f) => f !== id)
      toast('已取消收藏')
    } else {
      state.favorites = [id, ...state.favorites]
      toast('已收藏，降价时会通知你')
    }
  }

  function addProduct(input: {
    title: string
    desc: string
    price: number
    original: number
    category: Product['category']
    condition: Product['condition']
    campus: string
    tags: string[]
  }) {
    const product: Product = {
      id: `p${Date.now()}`,
      ...input,
      sellerId: state.userId,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      status: 'review',
      seed: Math.floor(Math.random() * 20),
    }
    state.products = [product, ...state.products]
    return product
  }

  function updateProduct(id: string, patch: Partial<Product>) {
    const target = state.products.find((p) => p.id === id)
    if (target) Object.assign(target, patch)
  }

  function setProductStatus(id: string, status: ProductStatus) {
    updateProduct(id, { status })
  }

  function buyProduct(product: Product, method: '校内面交' | '自提', location: string, note: string) {
    const order: Order = {
      id: `o${Date.now()}`,
      productId: product.id,
      buyerId: state.userId,
      sellerId: product.sellerId,
      price: product.price,
      status: '待确认',
      createdAt: new Date().toISOString(),
      method,
      location,
      note,
      reviewed: false,
      timeline: [
        { label: '买家下单', time: nowLabel(), done: true },
        { label: '卖家确认', time: '等待卖家确认', done: false },
        { label: '约定面交', time: '待约定', done: false },
        { label: '交易完成', time: '待完成', done: false },
      ],
    }
    state.orders = [order, ...state.orders]
    return order
  }

  function advanceOrder(id: string) {
    const order = state.orders.find((o) => o.id === id)
    if (!order) return
    const next: Record<string, Order['status']> = { 待确认: '交易中', 交易中: '已完成' }
    const target = next[order.status]
    if (!target) return
    order.status = target
    if (target === '交易中') {
      order.timeline[1]!.time = nowLabel()
      order.timeline[1]!.done = true
      order.timeline[2]!.done = true
      order.timeline[2]!.time = `${order.method} · ${order.location}`
      toast('订单已确认，可以约定面交时间了')
    } else {
      order.timeline[2]!.time = nowLabel()
      order.timeline[2]!.done = true
      order.timeline[3]!.done = true
      order.timeline[3]!.time = nowLabel()
      updateProduct(order.productId, { status: 'sold' })
      const seller = userById(order.sellerId)
      if (seller) seller.sold += 1
      toast('交易完成，别忘了给对方一个评价')
    }
  }

  function cancelOrder(id: string) {
    const order = state.orders.find((o) => o.id === id)
    if (!order) return
    order.status = '已取消'
    order.timeline[2]!.time = '已取消'
    order.timeline[3]!.time = '已取消'
    toast('订单已取消', 'warn')
  }

  function submitReview(orderId: string, rating: number, text: string, tags: string[]) {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return
    order.reviewed = true
    const toId = order.buyerId === state.userId ? order.sellerId : order.buyerId
    state.reviews = [
      {
        id: `r${Date.now()}`,
        fromId: state.userId,
        toId,
        orderId,
        rating,
        text,
        tags,
        createdAt: new Date().toISOString(),
      },
      ...state.reviews,
    ]
    toast('评价已发布，感谢你的认真反馈')
  }

  function addWanted(input: { title: string; budget: number; desc: string; category: Wanted['category'] }) {
    const item: Wanted = {
      id: `w${Date.now()}`,
      ...input,
      userId: state.userId,
      createdAt: new Date().toISOString(),
      replies: 0,
      status: '招募中',
    }
    state.wanted = [item, ...state.wanted]
    return item
  }

  function addPost(input: { title: string; body: string; topic: string }) {
    state.posts = [
      {
        id: `s${Date.now()}`,
        ...input,
        userId: state.userId,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
      },
      ...state.posts,
    ]
    toast('已发布到广场')
  }

  function sendMessage(conversationId: string, text: string) {
    const conv = state.conversations.find((c) => c.id === conversationId)
    if (!conv || !text.trim()) return
    const d = new Date()
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    conv.messages.push({ from: 'me', text: text.trim(), time })
    conv.time = time
  }

  function markRead(conversationId: string) {
    const conv = state.conversations.find((c) => c.id === conversationId)
    if (conv) conv.unread = 0
  }

  function verifyMe() {
    const user = state.users.find((u) => u.id === state.userId)
    if (user) user.verified = true
    toast('实名认证已通过，信用分 +10')
  }

  function toggleLike(postId: string) {
    const post = state.posts.find((p) => p.id === postId)
    if (post) post.likes += 1
  }

  return {
    state,
    toasts,
    me,
    onSale,
    myProducts,
    myWanted,
    myOrders,
    favoriteProducts,
    totalUnread,
    platformStats,
    userById,
    productById,
    orderById,
    isFavorite,
    toast,
    toggleFavorite,
    addProduct,
    updateProduct,
    setProductStatus,
    buyProduct,
    advanceOrder,
    cancelOrder,
    submitReview,
    addWanted,
    addPost,
    sendMessage,
    markRead,
    verifyMe,
    toggleLike,
  }
})
