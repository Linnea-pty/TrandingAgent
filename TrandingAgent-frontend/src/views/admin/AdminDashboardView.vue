<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowUpRight,
  CircleDollarSign,
  Flag,
  Package,
  ReceiptText,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { categories } from '@/data/mock'
import { money, orderCode, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { state, userById } = market
const { platformStats } = storeToRefs(market)

const stats = computed(() => platformStats.value)

const kpis = computed(() => [
  { label: '注册用户', value: stats.value.users.toLocaleString('zh-CN'), delta: '+3.2%', icon: Users, tone: 'text-teal', bg: 'bg-teal/[0.08]' },
  { label: '在架商品', value: stats.value.products.toLocaleString('zh-CN'), delta: '+1.8%', icon: Package, tone: 'text-ink2', bg: 'bg-ink/[0.06]' },
  { label: '累计订单', value: stats.value.orders.toLocaleString('zh-CN'), delta: '+5.6%', icon: ReceiptText, tone: 'text-[#0A6E8A]', bg: 'bg-cyan/15' },
  { label: '成交金额', value: `¥${money(stats.value.gmv)}`, delta: '+8.4%', icon: CircleDollarSign, tone: 'text-azure', bg: 'bg-azure/[0.08]' },
])

const trend = [38, 52, 46, 68, 61, 84, 96]
const trendLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const chart = computed(() => {
  const max = Math.max(...trend) * 1.15
  return trend.map((v, i) => ({
    x: 24 + (i * 552) / (trend.length - 1),
    y: 180 - (v / max) * 140,
    v,
  }))
})
const linePath = computed(() => chart.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '))
const areaPath = computed(() => `${linePath.value} L${chart.value.at(-1)!.x},190 L${chart.value[0]!.x},190 Z`)

const categoryStats = computed(() =>
  categories.map((c, i) => ({
    name: c.name,
    count: Math.round(c.count / 12),
    pct: [88, 74, 61, 52, 44, 36, 28, 24][i] ?? 20,
  })),
)

const recentOrders = computed(() => state.orders.slice(0, 5))
const pendingReports = computed(() => state.reports.filter((r) => r.status === '待处理').slice(0, 3))

const statusCls: Record<string, string> = {
  待确认: 'bg-cyan/15 text-[#0A6E8A]',
  交易中: 'bg-teal/10 text-teal',
  已完成: 'bg-ink/[0.06] text-ink3',
  已取消: 'bg-azure/[0.07] text-azure',
}
</script>

<template>
  <div class="space-y-4">
    <!-- KPI -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="k in kpis" :key="k.label" class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
        <div class="flex items-start justify-between">
          <span class="grid h-8 w-8 place-items-center rounded-lg" :class="k.bg">
            <component :is="k.icon" :size="15" :class="k.tone" />
          </span>
          <span class="flex items-center gap-0.5 font-mono text-[9.5px] text-teal"><TrendingUp :size="10" />{{ k.delta }}</span>
        </div>
        <p class="mt-3 display text-[26px] font-semibold leading-none">{{ k.value }}</p>
        <p class="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink3">{{ k.label }}</p>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <!-- 趋势 -->
      <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 class="font-serif text-[15px] font-semibold">成交趋势</h2>
            <p class="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink3">近 7 天完成订单量</p>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="display text-[28px] font-semibold leading-none">445</span>
            <span class="font-mono text-[9.5px] text-teal">环比 +8.4%</span>
          </div>
        </div>

        <svg viewBox="0 0 600 210" class="mt-4 h-[190px] w-full">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00A6B8" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#00A6B8" stop-opacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#0A1B2E" stroke-opacity="0.07">
            <line v-for="y in [40, 80, 120, 160]" :key="y" x1="24" :y1="y" x2="576" :y2="y" />
          </g>
          <path :d="areaPath" fill="url(#g1)" />
          <path :d="linePath" fill="none" stroke="#00A6B8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
          <g v-for="p in chart" :key="p.x">
            <circle :cx="p.x" :cy="p.y" r="3.6" fill="#F7FBFF" stroke="#00A6B8" stroke-width="2" />
          </g>
          <g font-family="JetBrains Mono, monospace" font-size="9" fill="#7C8578">
            <text v-for="(l, i) in trendLabels" :key="l" :x="24 + (i * 552) / 6" y="205" text-anchor="middle">{{ l }}</text>
          </g>
        </svg>
      </section>

      <!-- 分类 -->
      <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
        <h2 class="font-serif text-[15px] font-semibold">分类占比</h2>
        <p class="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink3">按在架商品数</p>
        <div class="mt-4 space-y-2.5">
          <div v-for="c in categoryStats" :key="c.name" class="flex items-center gap-2">
            <span class="w-9 font-mono text-[10px] text-ink2">{{ c.name }}</span>
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
              <div class="h-full rounded-full bg-ink/60" :style="{ width: `${c.pct}%` }" />
            </div>
            <span class="w-8 text-right font-mono text-[9.5px] text-ink3">{{ c.count }}</span>
          </div>
        </div>
        <div class="mt-4 rounded-xl bg-azure/[0.05] p-3">
          <p class="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-azure">
            <ShieldAlert :size="12" class="mt-0.5 shrink-0" />
            数码类纠纷率最高（2.1%），建议加强验机提示与高价值商品人工复审。
          </p>
        </div>
      </section>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <!-- 最新订单 -->
      <section class="overflow-hidden rounded-2xl border border-ink/10 bg-[#F7FBFF]">
        <div class="flex items-center justify-between px-5 py-4">
          <h2 class="font-serif text-[15px] font-semibold">最新订单</h2>
          <router-link to="/admin/orders" class="flex items-center gap-0.5 font-mono text-[9.5px] uppercase tracking-widest text-ink3 hover:text-ink">
            全部 <ArrowUpRight :size="10" />
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[520px]">
            <thead>
              <tr>
                <th class="table-head">订单号</th>
                <th class="table-head">商品</th>
                <th class="table-head">金额</th>
                <th class="table-head">状态</th>
                <th class="table-head">时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in recentOrders" :key="o.id">
                <td class="table-cell font-mono text-[10px]">{{ orderCode(o) }}</td>
                <td class="table-cell max-w-[180px] truncate">
                  {{ state.products.find((p) => p.id === o.productId)?.title ?? '已删除' }}
                </td>
                <td class="table-cell font-mono">¥{{ money(o.price) }}</td>
                <td class="table-cell">
                  <span class="rounded-full px-2 py-0.5 font-mono text-[9.5px]" :class="statusCls[o.status]">{{ o.status }}</span>
                </td>
                <td class="table-cell font-mono text-[10px] text-ink3">{{ timeAgo(o.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 待处理 -->
      <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-1.5 font-serif text-[15px] font-semibold"><Flag :size="14" class="text-azure" /> 待处理举报</h2>
          <router-link to="/admin/reports" class="font-mono text-[9.5px] uppercase tracking-widest text-ink3 hover:text-ink">处理 →</router-link>
        </div>
        <ul class="mt-3 space-y-2.5">
          <li v-for="r in pendingReports" :key="r.id" class="rounded-xl border border-ink/10 bg-haze/60 p-3">
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-azure/10 px-2 py-0.5 font-mono text-[9px] text-azure">{{ r.type }}</span>
              <span class="font-mono text-[9px] text-ink3">{{ timeAgo(r.createdAt) }}</span>
            </div>
            <p class="mt-1.5 truncate text-[12px] font-medium">{{ r.target }}</p>
            <p class="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-ink3">{{ r.reason }}</p>
            <p class="mt-1.5 font-mono text-[9px] text-ink3">举报人 {{ userById(r.reporterId)?.name }}</p>
          </li>
          <li v-if="!pendingReports.length" class="rounded-xl border border-dashed border-ink/15 p-6 text-center text-[11px] text-ink3">
            暂无待处理举报
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
