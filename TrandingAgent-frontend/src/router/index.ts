import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/components/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '谦价 · 校园二手交易' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录 / 注册 · 谦价' },
    },
    {
      path: '/verify',
      name: 'verify',
      component: () => import('@/views/VerifyView.vue'),
      meta: { title: '实名认证 · 谦价' },
    },
    {
      path: '/security',
      name: 'security',
      component: () => import('@/views/SecurityView.vue'),
      meta: { title: '账号安全 · 谦价' },
    },
    {
      path: '/assistant',
      name: 'assistant',
      component: () => import('@/views/AssistantView.vue'),
      meta: { title: '小谦 · 自主交易 · 谦价' },
    },
    {
      path: '/task/:id',
      name: 'task',
      component: () => import('@/views/TaskDetailView.vue'),
      meta: { title: '任务详情 · 小谦 · 谦价' },
    },
    {
      path: '/arena/:taskId',
      name: 'arena',
      component: () => import('@/views/ArenaView.vue'),
      meta: { title: '三列议价大厅 · 小谦 · 谦价' },
    },
    {
      path: '/market',
      name: 'market',
      component: () => import('@/views/MarketView.vue'),
      meta: { title: '商品大厅 · 谦价' },
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('@/views/ProductDetailView.vue'),
      meta: { title: '商品详情 · 谦价' },
    },
    {
      path: '/publish',
      alias: '/sell/new',
      name: 'publish',
      component: () => import('@/views/PublishView.vue'),
      meta: { title: '发布闲置 · 谦价' },
    },
    {
      path: '/checkout/:id',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { title: '确认订单 · 谦价' },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: { title: '我的订单 · 谦价' },
    },
    {
      path: '/order/:id',
      name: 'order',
      component: () => import('@/views/OrderDetailView.vue'),
      meta: { title: '订单详情 · 谦价' },
    },
    {
      path: '/review/:orderId',
      name: 'review',
      component: () => import('@/views/ReviewView.vue'),
      meta: { title: '评价交易 · 谦价' },
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'),
      meta: { title: '消息 · 谦价' },
    },
    {
      path: '/wanted',
      name: 'wanted',
      component: () => import('@/views/WantedView.vue'),
      meta: { title: '求购大厅 · 谦价' },
    },
    {
      path: '/wanted/new',
      name: 'wanted-new',
      component: () => import('@/views/WantedPublishView.vue'),
      meta: { title: '发布求购 · 谦价' },
    },
    {
      path: '/square',
      name: 'square',
      component: () => import('@/views/PlazaView.vue'),
      meta: { title: '广场 · 谦价' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: '个人主页 · 谦价' },
    },
    {
      path: '/my/listings',
      name: 'my-listings',
      component: () => import('@/views/MyListingsView.vue'),
      meta: { title: '我的发布 · 谦价' },
    },
    {
      path: '/my/wanted',
      name: 'my-wanted',
      component: () => import('@/views/MyWantedView.vue'),
      meta: { title: '我的求购 · 谦价' },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { title: '我的收藏 · 谦价' },
    },
    {
      path: '/credit',
      name: 'credit',
      component: () => import('@/views/CreditView.vue'),
      meta: { title: '信用与评价 · 谦价' },
    },
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
          meta: { title: '数据看板 · 谦价后台' },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsersView.vue'),
          meta: { title: '用户管理 · 谦价后台' },
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/admin/AdminProductsView.vue'),
          meta: { title: '商品审核 · 谦价后台' },
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/AdminOrdersView.vue'),
          meta: { title: '交易监控 · 谦价后台' },
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('@/views/admin/AdminReportsView.vue'),
          meta: { title: '举报与评价 · 谦价后台' },
        },
        {
          path: 'content',
          name: 'admin-content',
          component: () => import('@/views/admin/AdminContentView.vue'),
          meta: { title: '轮播与公告 · 谦价后台' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面不存在 · 谦价' },
    },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 96 }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})

export default router
