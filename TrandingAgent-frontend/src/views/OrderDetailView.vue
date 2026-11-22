<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Store,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ProductArt from '@/components/ProductArt.vue'
import type { OrderStatus } from '@/types'

import { money, orderCode, timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { advanceOrder, cancelOrder, orderById, productById, state, toast, userById } = market

const route = useRoute()
const router = useRouter()

const order = computed(() => orderById(String(route.params.id)))
const product = computed(() => (order.value ? productById(order.value.productId) : undefined))
const buyer = computed(() => (order.value ? userById(order.value.buyerId) : undefined))
const seller = computed(() => (order.value ? userById(order.value.sellerId) : undefined))
const role = computed(() => (order.value?.sellerId === state.userId ? 'seller' : 'buyer'))

const statusStyle: Record<OrderStatus, string> = {
  待确认: 'bg-cyan/15 text-[#0A6E8A] border-cyan/40',
  交易中: 'bg-teal/10 text-teal border-teal/30',
  已完成: 'bg-ink/[0.06] text-ink3 border-ink/15',
  已取消: 'bg-azure/[0.07] text-azure border-azure/25',
}

const voucherChat = [
  { from: 'peer', text: '你到了吗？我在图书馆南门台阶这边。', time: '16:02' },
  { from: 'me', text: '到了，穿灰色外套。', time: '16:04' },
]
</script>

<template>
  <div v-if="order" class="wrap py-7">
    <button class="mb-5 flex items-center gap-1.5 text-[12px] text-ink3 transition hover:text-ink" @click="router.push('/orders')">
      <ArrowLeft :size="13" /> 返回订单列表
    </button>

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full border px-2.5 py-0.5 font-mono text-[10px]" :class="statusStyle[order.status]">{{ order.status }}</span>
          <span class="font-mono text-[10px] uppercase tracking-widest text-ink3">订单号 {{ orderCode(order) }}</span>
        </div>
        <h1 class="mt-3 display text-[30px] font-semibold md:text-[36px]">
          {{ order.status === '已完成' ? '这笔交易完成了' : order.status === '已取消' ? '订单已取消' : '订单进行中' }}
        </h1>
        <p class="mt-2 text-[12.5px] text-ink3">下单于 {{ new Date(order.createdAt).toLocaleString('zh-CN') }} · 你是{{ role === 'buyer' ? '买家' : '卖家' }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="btn btn-ghost btn-sm"
          @click="router.push({ path: '/messages', query: { peer: role === 'buyer' ? seller?.id : buyer?.id } })"
        >
          <MessageCircle :size="13" /> 联系{{ role === 'buyer' ? '卖家' : '买家' }}
        </button>
        <button
          v-if="order.status === '待确认' && role === 'seller'"
          class="btn btn-teal btn-sm"
          @click="advanceOrder(order.id)"
        >
          确认订单
        </button>
        <button
          v-if="order.status === '交易中'"
          class="btn btn-teal btn-sm"
          @click="advanceOrder(order.id)"
        >
          <Check :size="13" /> 确认完成
        </button>
        <button
          v-if="order.status === '已完成' && role === 'buyer' && !order.reviewed"
          class="btn btn-primary btn-sm"
          @click="router.push(`/review/${order.id}`)"
        >
          <Star :size="13" /> 评价这笔交易
        </button>
        <button
          v-if="order.status === '待确认'"
          class="btn btn-ghost btn-sm !text-ink3"
          @click="cancelOrder(order.id)"
        >
          取消订单
        </button>
      </div>
    </div>

    <div class="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div class="space-y-4">
        <!-- 时间轴 -->
        <section class="panel p-5 md:p-6">
          <h2 class="flex items-center gap-2 font-serif text-[15px] font-semibold">
            <Clock :size="15" class="text-ink3" /> 订单流转
          </h2>
          <ol class="mt-6 space-y-0">
            <li v-for="(t, i) in order.timeline" :key="t.label" class="relative flex gap-4 pb-7 last:pb-0">
              <span v-if="i < order.timeline.length - 1" class="absolute left-[13px] top-7 h-full w-px" :class="t.done ? 'bg-teal/40' : 'bg-ink/10'" />
              <span
                class="relative z-10 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border-2 font-mono text-[10px]"
                :class="t.done ? 'border-teal bg-teal text-haze' : 'border-ink/20 bg-haze text-ink3'"
              >
                <Check v-if="t.done" :size="12" :stroke-width="4" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <div class="pt-0.5">
                <p class="text-[13px] font-medium" :class="t.done ? 'text-ink' : 'text-ink3'">{{ t.label }}</p>
                <p class="mt-0.5 font-mono text-[10.5px] text-ink3">{{ t.time }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- 交易信息 -->
        <section class="panel p-5 md:p-6">
          <h2 class="font-serif text-[15px] font-semibold">交易信息</h2>
          <dl class="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">交易方式</dt>
              <dd class="mt-1 flex items-center gap-1.5 text-[12.5px]"><Store :size="12" class="text-ink3" /> {{ order.method }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">交易地点</dt>
              <dd class="mt-1 flex items-center gap-1.5 text-[12.5px]"><MapPin :size="12" class="text-ink3" /> {{ order.location }}</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">联系电话</dt>
              <dd class="mt-1 flex items-center gap-1.5 text-[12.5px]"><Phone :size="12" class="text-ink3" /> 138 **** 0043</dd>
            </div>
            <div>
              <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">订单金额</dt>
              <dd class="mt-1 flex items-center gap-1.5 text-[12.5px]"><CircleDollarSign :size="12" class="text-ink3" /> ¥{{ money(order.price) }} · 服务费 ¥0</dd>
            </div>
          </dl>
          <div v-if="order.note" class="mt-4 rounded-xl bg-haze2/50 px-4 py-3">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">买家留言</p>
            <p class="mt-1 text-[12.5px] leading-relaxed text-ink2">{{ order.note }}</p>
          </div>
        </section>

        <!-- 双方 -->
        <section class="grid gap-4 sm:grid-cols-2">
          <div v-for="p in [{ u: buyer, role: '买家' }, { u: seller, role: '卖家' }]" :key="p.role" class="panel p-5">
            <div class="flex items-center justify-between">
              <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">{{ p.role }}</p>
              <span v-if="p.u?.id === state.userId" class="tag !text-[9px]">我</span>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <Avatar :user="p.u" size="md" show-verified />
              <div class="min-w-0">
                <p class="font-serif text-[14px] font-semibold">{{ p.u?.name }}</p>
                <p class="mt-0.5 font-mono text-[10px] text-ink3">{{ p.u?.college }} · 信用 {{ p.u?.credit }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 交易凭证 -->
        <section class="panel p-5 md:p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-[15px] font-semibold">交易凭证</h2>
            <span class="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-teal"><ShieldCheck :size="10" /> 平台留存</span>
          </div>
          <div class="mt-4 rounded-xl border border-ink/10 bg-haze2/30 p-4">
            <div class="space-y-3">
              <div v-for="(m, i) in voucherChat" :key="i" class="flex" :class="m.from === 'me' ? 'justify-end' : 'justify-start'">
                <div
                  class="max-w-[80%] rounded-2xl px-3.5 py-2 text-[11.5px]"
                  :class="m.from === 'me' ? 'rounded-br-sm bg-ink text-haze' : 'rounded-bl-sm bg-haze text-ink2'"
                >
                  {{ m.text }}
                  <span class="mt-0.5 block text-right font-mono text-[8px] opacity-50">{{ m.time }}</span>
                </div>
              </div>
            </div>
            <p class="mt-3 border-t border-dashed border-ink/15 pt-3 font-mono text-[9px] uppercase tracking-widest text-ink3">
              对话记录 #{{ orderCode(order) }} · 仅交易双方与平台可见
            </p>
          </div>
        </section>
      </div>

      <!-- 侧栏商品 -->
      <aside class="space-y-3 lg:sticky lg:top-32">
        <div class="panel p-5">
          <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">商品</p>
          <router-link v-if="product" :to="`/product/${product.id}`" class="block">
            <div class="overflow-hidden rounded-xl border border-ink/10">
              <div class="aspect-[4/3]"><ProductArt :product="product" /></div>
            </div>
            <h3 class="mt-3 line-clamp-2 font-serif text-[14px] font-semibold">{{ product.title }}</h3>
          </router-link>
          <div class="mt-3 flex items-end justify-between border-t border-dashed border-ink/15 pt-3">
            <span class="text-[11.5px] text-ink3">成交价</span>
            <span class="display text-[26px] font-semibold text-azure">¥{{ money(order.price) }}</span>
          </div>
        </div>

        <div class="rounded-2xl border border-ink/10 bg-ink p-4 text-haze">
          <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan">安全提示</p>
          <p class="mt-2 text-[11.5px] leading-relaxed text-haze/70">
            请在公共区域面交，当面验货后再确认完成。平台不会以任何理由要求你转账到个人账户。
          </p>
          <button class="mt-3 font-mono text-[10px] uppercase tracking-widest text-cyan hover:underline" @click="toast('已复制举报入口（演示）', 'warn')">
            遇到问题？举报订单
          </button>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="wrap py-24 text-center">
    <p class="display text-2xl font-semibold">订单不存在</p>
    <router-link to="/orders" class="btn btn-ink btn-sm mt-6">返回订单列表</router-link>
  </div>
</template>
