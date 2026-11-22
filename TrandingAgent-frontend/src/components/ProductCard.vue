<script setup lang="ts">
import { computed } from 'vue'
import { Heart, MapPin } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ProductArt from '@/components/ProductArt.vue'
import type { Product } from '@/types'

import { money, timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { isFavorite, toggleFavorite, userById } = market

const props = withDefaults(defineProps<{ product: Product; tall?: boolean }>(), { tall: false })

const seller = computed(() => userById(props.product.sellerId))
const discount = computed(() =>
  Math.max(0, Math.round((1 - props.product.price / props.product.original) * 100)),
)
const sold = computed(() => props.product.status === 'sold')
</script>

<template>
  <router-link :to="`/product/${product.id}`" class="group block">
    <div class="relative overflow-hidden rounded-[18px] border border-ink/10 shadow-tag transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lift">
      <div :class="tall ? 'aspect-[3/4]' : 'aspect-[4/3]'">
        <ProductArt :product="product" />
      </div>

      <span class="absolute right-3 top-3 rounded-full bg-haze/90 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-ink2 backdrop-blur">
        {{ product.condition }}
      </span>

      <span
        v-if="discount > 0 && !sold"
        class="absolute left-20 top-5 -rotate-6 rounded-sm bg-azure px-2 py-0.5 font-mono text-[10px] font-semibold text-haze shadow"
      >
        -{{ discount }}%
      </span>

      <button
        class="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border border-ink/10 bg-haze/90 text-ink backdrop-blur transition hover:scale-110 hover:bg-haze"
        :aria-label="isFavorite(product.id) ? '取消收藏' : '收藏'"
        @click.prevent="toggleFavorite(product.id)"
      >
        <Heart
          :size="14"
          :stroke-width="1.8"
          :class="isFavorite(product.id) ? 'fill-azure text-azure' : ''"
        />
      </button>

      <div
        v-if="sold"
        class="absolute inset-0 grid place-items-center bg-ink/45 backdrop-blur-[1px]"
      >
        <span class="rotate-[-8deg] rounded border border-haze/70 px-3 py-1 font-serif text-sm tracking-[0.2em] text-haze">
          已 售 出
        </span>
      </div>
    </div>

    <div class="mt-3 px-0.5">
      <h3 class="line-clamp-2 font-serif text-[15px] font-semibold leading-snug transition group-hover:text-azure">
        {{ product.title }}
      </h3>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="display text-[23px] font-semibold leading-none">
          <span class="mr-0.5 text-[13px]">¥</span>{{ money(product.price) }}
        </span>
        <span class="font-mono text-[10px] text-ink3 line-through">¥{{ money(product.original) }}</span>
      </div>
      <div class="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink3">
        <Avatar :user="seller" size="xs" />
        <span class="truncate">{{ seller?.name }}</span>
        <span class="ml-auto flex shrink-0 items-center gap-0.5">
          <MapPin :size="10" />{{ product.campus }}
        </span>
        <span class="shrink-0 text-ink3/60">·</span>
        <span class="shrink-0">{{ timeAgo(product.createdAt) }}</span>
      </div>
    </div>
  </router-link>
</template>
