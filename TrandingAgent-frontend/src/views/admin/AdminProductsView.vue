<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Package, ShoppingBasket, Trash2, X } from 'lucide-vue-next'
import ProductArt from '@/components/ProductArt.vue'
import { money, timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { setProductStatus, state, toast, userById } = market

const tab = ref<'products' | 'wanted'>('products')
const onlyPending = ref(false)

const products = computed(() =>
  onlyPending.value ? state.products.filter((p) => p.status === 'review') : state.products,
)

const wanted = computed(() => state.wanted)

const statusText: Record<string, string> = {
  on: '在架',
  review: '待审核',
  sold: '已售出',
  off: '已下架',
}
const statusCls: Record<string, string> = {
  on: 'bg-teal/10 text-teal',
  review: 'bg-cyan/15 text-[#0A6E8A]',
  sold: 'bg-ink/[0.06] text-ink3',
  off: 'bg-azure/[0.07] text-azure',
}

const pendingCount = computed(() => state.products.filter((p) => p.status === 'review').length)

function approve(id: string) {
  setProductStatus(id, 'on')
  toast('审核通过，商品已在商品大厅展示')
}

function reject(id: string) {
  setProductStatus(id, 'off')
  toast('已驳回并下架该商品', 'warn')
}

function remove(id: string) {
  state.products = state.products.filter((p) => p.id !== id)
  toast('已删除该商品', 'warn')
}

function removeWanted(id: string) {
  state.wanted = state.wanted.filter((w) => w.id !== id)
  toast('已删除该求购', 'warn')
}

function closeWanted(id: string) {
  const w = state.wanted.find((x) => x.id === id)
  if (w) {
    w.status = '已完成'
    toast('已关闭该求购')
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3">
      <div class="flex gap-1.5">
        <button
          class="chip !px-3 !py-1.5 !text-[12px]"
          :class="{ 'chip-on': tab === 'products' }"
          @click="tab = 'products'"
        >
          <Package :size="12" /> 商品 {{ state.products.length }}
        </button>
        <button
          class="chip !px-3 !py-1.5 !text-[12px]"
          :class="{ 'chip-on': tab === 'wanted' }"
          @click="tab = 'wanted'"
        >
          <ShoppingBasket :size="12" /> 求购 {{ state.wanted.length }}
        </button>
      </div>

      <label v-if="tab === 'products'" class="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] text-ink3">
        <input v-model="onlyPending" type="checkbox" class="accent-azure" />
        只看待审核
        <span v-if="pendingCount" class="rounded-full bg-cyan/20 px-1.5 font-mono text-[9px] text-[#0A6E8A]">{{ pendingCount }}</span>
      </label>
    </div>

    <!-- 商品 -->
    <div v-if="tab === 'products'" class="overflow-hidden rounded-2xl border border-ink/10 bg-[#F7FBFF]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px]">
          <thead>
            <tr>
              <th class="table-head">商品</th>
              <th class="table-head">卖家</th>
              <th class="table-head">价格</th>
              <th class="table-head">分类</th>
              <th class="table-head">状态</th>
              <th class="table-head">发布</th>
              <th class="table-head text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id" class="transition hover:bg-haze2/40">
              <td class="table-cell">
                <div class="flex items-center gap-2.5">
                  <div class="h-10 w-12 shrink-0 overflow-hidden rounded-md border border-ink/10">
                    <ProductArt :product="p" />
                  </div>
                  <router-link :to="`/product/${p.id}`" class="line-clamp-1 max-w-[220px] font-serif text-[12.5px] font-semibold hover:text-azure">
                    {{ p.title }}
                  </router-link>
                </div>
              </td>
              <td class="table-cell text-[11.5px]">{{ userById(p.sellerId)?.name }}</td>
              <td class="table-cell font-mono text-[11.5px]">¥{{ money(p.price) }}</td>
              <td class="table-cell text-[11.5px]">{{ p.category }} · {{ p.condition }}</td>
              <td class="table-cell">
                <span class="rounded-full px-2 py-0.5 font-mono text-[9.5px]" :class="statusCls[p.status]">
                  {{ statusText[p.status] }}
                </span>
              </td>
              <td class="table-cell font-mono text-[10px] text-ink3">{{ timeAgo(p.createdAt) }}</td>
              <td class="table-cell">
                <div class="flex justify-end gap-1.5">
                  <template v-if="p.status === 'review'">
                    <button class="btn btn-teal btn-sm !px-2 !py-1 !text-[10px]" @click="approve(p.id)"><Check :size="10" /> 通过</button>
                    <button class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure" @click="reject(p.id)"><X :size="10" /> 驳回</button>
                  </template>
                  <button
                    v-else-if="p.status === 'on'"
                    class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure"
                    @click="reject(p.id)"
                  >
                    下架
                  </button>
                  <button class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px]" @click="remove(p.id)">
                    <Trash2 :size="10" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!products.length">
              <td colspan="7" class="px-4 py-12 text-center text-[12px] text-ink3">没有待审核的商品</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 求购 -->
    <div v-else class="overflow-hidden rounded-2xl border border-ink/10 bg-[#F7FBFF]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px]">
          <thead>
            <tr>
              <th class="table-head">求购</th>
              <th class="table-head">发布者</th>
              <th class="table-head">预算</th>
              <th class="table-head">分类</th>
              <th class="table-head">回应</th>
              <th class="table-head">状态</th>
              <th class="table-head text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in wanted" :key="w.id" class="transition hover:bg-haze2/40">
              <td class="table-cell">
                <p class="line-clamp-1 max-w-[260px] text-[12.5px] font-medium text-ink">{{ w.title }}</p>
                <p class="mt-0.5 line-clamp-1 max-w-[260px] text-[10px] text-ink3">{{ w.desc }}</p>
              </td>
              <td class="table-cell text-[11.5px]">{{ userById(w.userId)?.name }}</td>
              <td class="table-cell font-mono text-[11.5px]">≤ ¥{{ money(w.budget) }}</td>
              <td class="table-cell text-[11.5px]">{{ w.category }}</td>
              <td class="table-cell font-mono text-[11.5px]">{{ w.replies }}</td>
              <td class="table-cell">
                <span
                  class="rounded-full px-2 py-0.5 font-mono text-[9.5px]"
                  :class="w.status === '招募中' ? 'bg-teal/10 text-teal' : 'bg-ink/[0.06] text-ink3'"
                >
                  {{ w.status }}
                </span>
              </td>
              <td class="table-cell">
                <div class="flex justify-end gap-1.5">
                  <button
                    v-if="w.status === '招募中'"
                    class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px]"
                    @click="closeWanted(w.id)"
                  >
                    关闭
                  </button>
                  <button class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure" @click="removeWanted(w.id)">
                    <Trash2 :size="10" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!wanted.length">
              <td colspan="7" class="px-4 py-12 text-center text-[12px] text-ink3">暂无求购信息</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
