<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowUpRight,
  Eye,
  Heart,
  PackageCheck,
  PencilLine,
  Plus,
  RotateCcw,
  Trash2,
  UploadCloud,
} from 'lucide-vue-next'
import EmptyState from '@/components/EmptyState.vue'
import ProductArt from '@/components/ProductArt.vue'
import ProfileSidebar from '@/components/ProfileSidebar.vue'
import type { ProductStatus } from '@/types'

import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { setProductStatus, state, toast } = market
const { myProducts } = storeToRefs(market)

const router = useRouter()
const filter = ref<'全部' | ProductStatus>('全部')

const tabs: { key: '全部' | ProductStatus; label: string }[] = [
  { key: '全部', label: '全部' },
  { key: 'on', label: '在售' },
  { key: 'review', label: '审核中' },
  { key: 'sold', label: '已售出' },
  { key: 'off', label: '已下架' },
]

const statusMeta: Record<ProductStatus, { text: string; cls: string }> = {
  on: { text: '在售中', cls: 'bg-teal/10 text-teal border-teal/30' },
  review: { text: '审核中', cls: 'bg-cyan/15 text-[#0A6E8A] border-cyan/40' },
  sold: { text: '已售出', cls: 'bg-ink/[0.06] text-ink3 border-ink/15' },
  off: { text: '已下架', cls: 'bg-azure/[0.07] text-azure border-azure/25' },
}

const list = computed(() =>
  filter.value === '全部' ? myProducts.value : myProducts.value.filter((p) => p.status === filter.value),
)

const stats = computed(() => ({
  on: myProducts.value.filter((p) => p.status === 'on').length,
  sold: myProducts.value.filter((p) => p.status === 'sold').length,
  views: myProducts.value.reduce((s, p) => s + p.views, 0),
}))

function remove(id: string) {
  state.products = state.products.filter((p) => p.id !== id)
  toast('已删除这条发布', 'warn')
}

function markSold(id: string) {
  setProductStatus(id, 'sold')
  toast('已标记为售出，恭喜成交')
}

function toggleOff(id: string, status: ProductStatus) {
  setProductStatus(id, status === 'off' ? 'on' : 'off')
  toast(status === 'off' ? '已重新上架' : '已下架，不再展示在大厅')
}
</script>

<template>
  <div class="wrap py-8">
    <div class="grid items-start gap-6 lg:grid-cols-[264px_1fr]">
      <ProfileSidebar />

      <div class="min-w-0">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">My listings</p>
            <h1 class="mt-2 display text-[30px] font-semibold md:text-[36px]">我的发布</h1>
            <p class="mt-2 text-[12.5px] text-ink3">共 {{ myProducts.length }} 件闲置 · 累计浏览 {{ stats.views }} 次</p>
          </div>
          <router-link to="/publish" class="btn btn-primary btn-sm"><Plus :size="14" /> 发布闲置</router-link>
        </div>

        <!-- 概览 -->
        <div class="mt-5 grid grid-cols-3 gap-3">
          <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] px-4 py-3">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">在售</p>
            <p class="mt-1 display text-[24px] font-semibold leading-none">{{ stats.on }}</p>
          </div>
          <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] px-4 py-3">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">已售出</p>
            <p class="mt-1 display text-[24px] font-semibold leading-none">{{ stats.sold }}</p>
          </div>
          <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] px-4 py-3">
            <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">累计浏览</p>
            <p class="mt-1 display text-[24px] font-semibold leading-none">{{ stats.views }}</p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap gap-1.5">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="chip !px-3 !py-1.5 !text-[12px]"
            :class="{ 'chip-on': filter === t.key }"
            @click="filter = t.key"
          >
            {{ t.label }}
          </button>
        </div>

        <div v-if="!list.length" class="mt-5">
          <EmptyState title="这里还是空的" desc="发布第一件闲置，让它遇见下一位同学。">
            <router-link to="/publish" class="btn btn-primary btn-sm">去发布</router-link>
          </EmptyState>
        </div>

        <div v-else class="mt-4 space-y-3">
          <article
            v-for="p in list"
            :key="p.id"
            class="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3.5 transition hover:border-ink/20 sm:flex-row"
          >
            <router-link :to="`/product/${p.id}`" class="h-[86px] w-[112px] shrink-0 overflow-hidden rounded-xl border border-ink/10">
              <ProductArt :product="p" />
            </router-link>

            <div class="min-w-0 flex-1">
              <div class="flex items-start gap-2">
                <router-link :to="`/product/${p.id}`" class="line-clamp-1 font-serif text-[14px] font-semibold transition hover:text-azure">
                  {{ p.title }}
                </router-link>
                <span class="ml-auto shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9.5px]" :class="statusMeta[p.status].cls">
                  {{ statusMeta[p.status].text }}
                </span>
              </div>
              <div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-ink3">
                <span class="display text-[15px] font-semibold text-ink">¥{{ money(p.price) }}</span>
                <span class="flex items-center gap-0.5"><Eye :size="10" /> {{ p.views }}</span>
                <span class="flex items-center gap-0.5"><Heart :size="10" /> {{ p.likes }}</span>
                <span>{{ p.condition }} · {{ p.campus }}</span>
                <span>{{ timeAgo(p.createdAt) }}</span>
              </div>

              <div class="mt-2.5 flex flex-wrap gap-1.5">
                <button class="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10.5px]" @click="router.push(`/publish?edit=${p.id}`)">
                  <PencilLine :size="11" /> 编辑
                </button>
                <button
                  v-if="p.status === 'on' || p.status === 'off'"
                  class="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10.5px]"
                  @click="toggleOff(p.id, p.status)"
                >
                  <UploadCloud v-if="p.status === 'off'" :size="11" />
                  <RotateCcw v-else :size="11" />
                  {{ p.status === 'off' ? '重新上架' : '下架' }}
                </button>
                <button
                  v-if="p.status === 'on'"
                  class="btn btn-teal btn-sm !px-2.5 !py-1 !text-[10.5px]"
                  @click="markSold(p.id)"
                >
                  <PackageCheck :size="11" /> 标记已售出
                </button>
                <button
                  class="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10.5px] !text-azure hover:!bg-azure/10"
                  @click="remove(p.id)"
                >
                  <Trash2 :size="11" /> 删除
                </button>
                <router-link :to="`/product/${p.id}`" class="ml-auto flex items-center gap-0.5 self-center font-mono text-[9.5px] uppercase tracking-widest text-ink3 hover:text-ink">
                  查看 <ArrowUpRight :size="10" />
                </router-link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>
