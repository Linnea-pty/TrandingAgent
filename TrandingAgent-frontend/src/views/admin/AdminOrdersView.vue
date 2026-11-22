<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, CheckCheck, ExternalLink, XCircle } from 'lucide-vue-next'
import type { OrderStatus } from '@/types'

import { money, orderCode, timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { advanceOrder, cancelOrder, state, toast, userById } = market

const filter = ref<'全部' | OrderStatus>('全部')
const statuses: ('全部' | OrderStatus)[] = ['全部', '待确认', '交易中', '已完成', '已取消']

const list = computed(() =>
  filter.value === '全部' ? state.orders : state.orders.filter((o) => o.status === filter.value),
)
const counts = computed(() => ({
  all: state.orders.length,
  doing: state.orders.filter((o) => o.status === '待确认' || o.status === '交易中').length,
  done: state.orders.filter((o) => o.status === '已完成').length,
  gmv: state.orders.filter((o) => o.status === '已完成').reduce((s, o) => s + o.price, 0),
}))

const statusCls: Record<string, string> = {
  待确认: 'bg-cyan/15 text-[#0A6E8A]',
  交易中: 'bg-teal/10 text-teal',
  已完成: 'bg-ink/[0.06] text-ink3',
  已取消: 'bg-azure/[0.07] text-azure',
}

function forceDone(id: string) {
  advanceOrder(id)
  toast('已强制推进订单状态')
}

function dispute(id: string) {
  const o = state.orders.find((x) => x.id === id)
  if (!o) return
  toast(`订单 ${orderCode(o)} 已标记为纠纷，等待人工介入`, 'warn')
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-4">
      <div v-for="s in [
        { k: '全部订单', v: String(counts.all) },
        { k: '进行中', v: String(counts.doing) },
        { k: '已完成', v: String(counts.done) },
        { k: '本地成交额', v: `¥${money(counts.gmv)}` },
      ]" :key="s.k" class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
        <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">{{ s.k }}</p>
        <p class="mt-2 display text-[22px] font-semibold leading-none">{{ s.v }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-1.5 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3">
      <button
        v-for="s in statuses"
        :key="s"
        class="chip !px-3 !py-1 !text-[11.5px]"
        :class="{ 'chip-on': filter === s }"
        @click="filter = s"
      >
        {{ s }}
      </button>
      <span class="ml-auto font-mono text-[10px] text-ink3">{{ list.length }} 条记录</span>
    </div>

    <div class="overflow-hidden rounded-2xl border border-ink/10 bg-[#F7FBFF]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead>
            <tr>
              <th class="table-head">订单号</th>
              <th class="table-head">商品</th>
              <th class="table-head">买家 / 卖家</th>
              <th class="table-head">方式</th>
              <th class="table-head">金额</th>
              <th class="table-head">状态</th>
              <th class="table-head">时间</th>
              <th class="table-head text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in list" :key="o.id" class="transition hover:bg-haze2/40">
              <td class="table-cell font-mono text-[10px]">{{ orderCode(o) }}</td>
              <td class="table-cell">
                <p class="line-clamp-1 max-w-[180px] text-[12px]">
                  {{ state.products.find((p) => p.id === o.productId)?.title ?? '商品已删除' }}
                </p>
              </td>
              <td class="table-cell text-[11px]">
                {{ userById(o.buyerId)?.name }} <span class="text-ink3">→</span> {{ userById(o.sellerId)?.name }}
              </td>
              <td class="table-cell text-[11px]">{{ o.method }}</td>
              <td class="table-cell font-mono text-[11.5px]">¥{{ money(o.price) }}</td>
              <td class="table-cell">
                <span class="rounded-full px-2 py-0.5 font-mono text-[9.5px]" :class="statusCls[o.status]">{{ o.status }}</span>
              </td>
              <td class="table-cell font-mono text-[10px] text-ink3">{{ timeAgo(o.createdAt) }}</td>
              <td class="table-cell">
                <div class="flex justify-end gap-1">
                  <router-link :to="`/order/${o.id}`" class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px]">
                    <ExternalLink :size="10" /> 详情
                  </router-link>
                  <button
                    v-if="o.status === '交易中'"
                    class="btn btn-teal btn-sm !px-2 !py-1 !text-[10px]"
                    @click="forceDone(o.id)"
                  >
                    <CheckCheck :size="10" /> 确认
                  </button>
                  <button
                    v-if="o.status === '待确认'"
                    class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure"
                    @click="cancelOrder(o.id)"
                  >
                    <XCircle :size="10" /> 取消
                  </button>
                  <button
                    v-if="o.status === '交易中'"
                    class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure"
                    @click="dispute(o.id)"
                  >
                    <AlertTriangle :size="10" /> 纠纷
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="8" class="px-4 py-12 text-center text-[12px] text-ink3">没有符合筛选条件的订单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
