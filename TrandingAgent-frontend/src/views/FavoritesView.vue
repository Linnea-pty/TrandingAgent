<script setup lang="ts">
import { computed, ref } from 'vue'
import { Heart, LayoutGrid, List, Trash2 } from 'lucide-vue-next'
import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductArt from '@/components/ProductArt.vue'
import Stars from '@/components/Stars.vue'
import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { isFavorite, state, toast, toggleFavorite, userById } = market
const { favoriteProducts } = storeToRefs(market)

const view = ref<'grid' | 'list'>('grid')
const list = computed(() => favoriteProducts.value)
const total = computed(() => list.value.reduce((s, p) => s + p.price, 0))

function clearAll() {
  state.favorites = []
  toast('已清空收藏', 'warn')
}
</script>

<template>
  <div class="wrap py-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Saved items</p>
        <h1 class="mt-2 display text-[32px] font-semibold md:text-[38px]">我的收藏</h1>
        <p class="mt-2 text-[12.5px] text-ink3">
          {{ list.length }} 件 · 合计 ¥{{ money(total) }}，降价时会第一时间提醒你
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-full border border-ink/15 bg-haze/60 p-0.5">
          <button
            class="grid h-7 w-8 place-items-center rounded-full transition"
            :class="view === 'grid' ? 'bg-ink text-haze' : 'text-ink3'"
            aria-label="网格视图"
            @click="view = 'grid'"
          >
            <LayoutGrid :size="13" />
          </button>
          <button
            class="grid h-7 w-8 place-items-center rounded-full transition"
            :class="view === 'list' ? 'bg-ink text-haze' : 'text-ink3'"
            aria-label="列表视图"
            @click="view = 'list'"
          >
            <List :size="13" />
          </button>
        </div>
        <button v-if="list.length" class="btn btn-ghost btn-sm !text-azure" @click="clearAll">
          <Trash2 :size="12" /> 清空
        </button>
      </div>
    </div>

    <div v-if="!list.length" class="mt-6">
      <EmptyState title="收藏夹空着" desc="看到心动的闲置，点一下右下角的心，就会存到这里。">
        <router-link to="/market" class="btn btn-primary btn-sm"><Heart :size="13" /> 去逛商品大厅</router-link>
      </EmptyState>
    </div>

    <div v-else-if="view === 'grid'" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ProductCard v-for="p in list" :key="p.id" :product="p" />
    </div>

    <div v-else class="mt-5 space-y-2.5">
      <article
        v-for="p in list"
        :key="p.id"
        class="flex items-center gap-4 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3 transition hover:border-ink/20"
      >
        <router-link :to="`/product/${p.id}`" class="h-[74px] w-[96px] shrink-0 overflow-hidden rounded-xl border border-ink/10">
          <ProductArt :product="p" />
        </router-link>
        <div class="min-w-0 flex-1">
          <router-link :to="`/product/${p.id}`" class="line-clamp-1 font-serif text-[13.5px] font-semibold hover:text-azure">
            {{ p.title }}
          </router-link>
          <p class="mt-1 flex flex-wrap items-center gap-x-2.5 font-mono text-[10px] text-ink3">
            <span>{{ p.condition }}</span>
            <span>·</span>
            <span>{{ p.campus }}</span>
            <span>·</span>
            <span>{{ timeAgo(p.createdAt) }}</span>
          </p>
          <div class="mt-1 flex items-center gap-1.5">
            <span class="text-[10.5px] text-ink2">{{ userById(p.sellerId)?.name }}</span>
            <Stars :value="userById(p.sellerId)?.rating ?? 5" :size="10" />
          </div>
        </div>
        <div class="text-right">
          <p class="display text-[19px] font-semibold leading-none">¥{{ money(p.price) }}</p>
          <p class="mt-1 font-mono text-[9.5px] text-ink3 line-through">¥{{ money(p.original) }}</p>
        </div>
        <button
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 transition hover:bg-azure/10"
          aria-label="取消收藏"
          @click="toggleFavorite(p.id)"
        >
          <Heart :size="14" :class="isFavorite(p.id) ? 'fill-azure text-azure' : 'text-ink3'" />
        </button>
      </article>
    </div>

    <p class="mt-6 text-center font-mono text-[9px] uppercase tracking-widest text-ink3">
      Campus second-hand · 让闲置继续流动
    </p>
  </div>
</template>
