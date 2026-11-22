<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, MessageCircle, PackageCheck, Star } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductArt from '@/components/ProductArt.vue'
import type { OrderStatus } from '@/types'

import { money, orderCode, timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { advanceOrder, cancelOrder, productById, state, toast, userById } = market

const router = useRouter()
const side = ref<'buy' | 'sell'>('buy')
const statusFilter = ref<'全部' | OrderStatus>('全部')

const statuses: ('全部' | OrderStatus)[] = ['全部', '待确认', '交易中', '已完成', '已取消']

const base = computed(() =>
  side.value === 'buy'
    ? state.orders.filter((o) => o.buyerId === state.userId)
    : state.orders.filter((o) => o.sellerId === state.userId),
)

const list = computed(() =>
  statusFilter.value === '全部' ? base.value : base.value.filter((o) => o.status === statusFilter.value),
)

const counts = computed(() => ({
  buy: state.orders.filter((o) => o.buyerId === state.userId).length,
  sell: state.orders.filter((o) => o.sellerId === state.userId).length,
}))

const statusStyle: Record<OrderStatus, string> = {
  待确认: 'bg-cyan/15 text-[#0A6E8A] border-cyan/40',
  交易中: 'bg-teal/10 text-teal border-teal/30',
  已完成: 'bg-ink/[0.06] text-ink3 border-ink/15',
  已取消: 'bg-azure/[0.07] text-azure border-azure/25',
}

function counterpart(orderId: string) {
  const o = state.orders.find((x) => x.id === orderId)
  if (!o) return undefined
  return userById(side.value === 'buy' ? o.sellerId : o.buyerId)
}

function confirm(orderId: string) {
  advanceOrder(orderId)
}
</script>

<template>
  <div class="wrap py-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">My orders</p>
        <h1 class="mt-2 display text-[32px] font-semibold md:text-[40px]">我的订单</h1>
        <p class="mt-2 text-[13px] text-ink2/80">面交、自提都在这里流转，每一步都有记录。</p>
      </div>
      <div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink3">
        <span class="flex items-center gap-1"><PackageCheck :size="12" class="text-teal" /> 近 30 天成交 4 单</span>
      </div>
    </div>

    <!-- 买卖切换 -->
    <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-0">
      <div class="flex gap-1">
        <button
          class="relative px-5 py-3 text-[13.5px] font-medium transition"
          :class="side === 'buy' ? 'text-ink' : 'text-ink3 hover:text-ink2'"
          @click="side = 'buy'; statusFilter = '全部'"
        >
          我买到的
          <span class="ml-1 font-mono text-[10px] text-ink3">{{ counts.buy }}</span>
          <span v-if="side === 'buy'" class="absolute inset-x-0 -bottom-px h-[2.5px] bg-azure" />
        </button>
        <button
          class="relative px-5 py-3 text-[13.5px] font-medium transition"
          :class="side === 'sell' ? 'text-ink' : 'text-ink3 hover:text-ink2'"
          @click="side = 'sell'; statusFilter = '全部'"
        >
          我卖出的
          <span class="ml-1 font-mono text-[10px] text-ink3">{{ counts.sell }}</span>
          <span v-if="side === 'sell'" class="absolute inset-x-0 -bottom-px h-[2.5px] bg-azure" />
        </button>
      </div>

      <div class="flex flex-wrap gap-1.5 pb-2">
        <button
          v-for="s in statuses"
          :key="s"
          class="chip !px-3 !py-1 !text-[11.5px]"
          :class="{ 'chip-on': statusFilter === s }"
          @click="statusFilter = s"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <div v-if="!list.length" class="mt-8">
      <EmptyState
        :title="side === 'buy' ? '还没有买到的订单' : '还没有卖出的订单'"
        :desc="side === 'buy' ? '去商品大厅逛逛，遇到合适的就约个面交吧。' : '把闲置发布出来，让它遇见下一位同学。'"
      >
        <router-link :to="side === 'buy' ? '/market' : '/publish'" class="btn btn-primary btn-sm">
          {{ side === 'buy' ? '去逛商品大厅' : '发布闲置' }}
        </router-link>
      </EmptyState>
    </div>

    <div v-else class="mt-5 space-y-3">
      <div v-for="o in list" :key="o.id" class="panel overflow-hidden">
        <!-- 头部 -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ink/10 bg-haze2/30 px-4 py-2.5">
          <span class="font-mono text-[10px] uppercase tracking-wider text-ink3">订单号 {{ orderCode(o) }}</span>
          <span class="font-mono text-[10px] text-ink3">{{ timeAgo(o.createdAt) }}</span>
          <span class="ml-auto flex items-center gap-2">
            <span class="rounded-full border px-2.5 py-0.5 font-mono text-[10px]" :class="statusStyle[o.status]">
              {{ o.status }}
            </span>
          </span>
        </div>

        <!-- 内容 -->
        <div class="flex flex-col gap-4 p-4 sm:flex-row">
          <router-link
            v-if="productById(o.productId)"
            :to="`/product/${o.productId}`"
            class="h-[104px] w-[138px] shrink-0 overflow-hidden rounded-xl border border-ink/10"
          >
            <ProductArt :product="productById(o.productId)!" />
          </router-link>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <h3 class="line-clamp-1 font-serif text-[14.5px] font-semibold">
                {{ productById(o.productId)?.title ?? '商品已删除' }}
              </h3>
              <span class="display shrink-0 text-[19px] font-semibold">¥{{ money(o.price) }}</span>
            </div>
            <p class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-ink3">
              <span>{{ o.method }}</span>
              <span class="h-2.5 w-px bg-ink/15" />
              <span>{{ o.location }}</span>
            </p>
            <p v-if="o.note" class="mt-1.5 line-clamp-1 text-[11.5px] text-ink3">留言：{{ o.note }}</p>

            <div class="mt-2.5 flex items-center gap-2">
              <Avatar :user="counterpart(o.id)" size="xs" />
              <span class="text-[11px] text-ink3">
                {{ side === 'buy' ? '卖家' : '买家' }} {{ counterpart(o.id)?.name }}
              </span>
              <span class="ml-auto flex flex-wrap gap-2">
                <button
                  class="btn btn-ghost btn-sm !px-3 !py-1 !text-[11px]"
                  @click="router.push({ path: '/messages', query: { peer: counterpart(o.id)?.id } })"
                >
                  <MessageCircle :size="11" /> 联系
                </button>
                <button
                  v-if="o.status === '待确认' && side === 'sell'"
                  class="btn btn-teal btn-sm !px-3 !py-1 !text-[11px]"
                  @click="confirm(o.id)"
                >
                  确认订单
                </button>
                <button
                  v-if="o.status === '待确认' && side === 'buy'"
                  class="btn btn-ghost btn-sm !px-3 !py-1 !text-[11px]"
                  @click="toast('已提醒卖家确认订单')"
                >
                  提醒确认
                </button>
                <button
                  v-if="o.status === '交易中'"
                  class="btn btn-teal btn-sm !px-3 !py-1 !text-[11px]"
                  @click="confirm(o.id)"
                >
                  确认完成
                </button>
                <button
                  v-if="o.status === '待确认'"
                  class="btn btn-ghost btn-sm !px-3 !py-1 !text-[11px] !text-ink3"
                  @click="cancelOrder(o.id)"
                >
                  取消
                </button>
                <button
                  v-if="o.status === '已完成' && !o.reviewed && side === 'buy'"
                  class="btn btn-primary btn-sm !px-3 !py-1 !text-[11px]"
                  @click="router.push(`/review/${o.id}`)"
                >
                  <Star :size="11" /> 去评价
                </button>
                <router-link
                  :to="`/order/${o.id}`"
                  class="btn btn-ghost btn-sm !px-3 !py-1 !text-[11px]"
                >
                  详情 <ChevronRight :size="11" />
                </router-link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
