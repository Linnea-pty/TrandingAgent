<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChevronRight,
  Heart,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-vue-next'
import CategoryIcon from '@/components/CategoryIcon.vue'
import ProductArt from '@/components/ProductArt.vue'
import ProductCard from '@/components/ProductCard.vue'
import Avatar from '@/components/Avatar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { categories } from '@/data/mock'
import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { isFavorite, toggleFavorite, userById } = market
const { onSale } = storeToRefs(market)

const route = useRoute()
const router = useRouter()

const keyword = ref(String(route.query.q ?? ''))
const cat = ref(String(route.query.cat ?? '全部'))
const condition = ref('全部')
const campus = ref('全部')
const time = ref('全部')
const priceMin = ref('')
const priceMax = ref('')
const onlyVerified = ref(false)
const sort = ref('最新发布')
const view = ref<'grid' | 'list'>('grid')
const filtersOpen = ref(false)

const sorts = ['最新发布', '价格从低到高', '价格从高到低', '最多收藏']

const campuses = ['全部', '东校区', '西校区', '南苑', '图书馆']
const conditions = ['全部', '全新', '几乎全新', '九成新', '七成新']
const times = [
  { key: '全部', days: 9999 },
  { key: '24 小时内', days: 1 },
  { key: '近 7 天', days: 7 },
  { key: '近 30 天', days: 30 },
]

watch(
  () => route.query,
  (q) => {
    keyword.value = String(q.q ?? '')
    cat.value = String(q.cat ?? '全部')
  },
)

const results = computed(() => {
  const min = priceMin.value ? Number(priceMin.value) : 0
  const max = priceMax.value ? Number(priceMax.value) : Number.POSITIVE_INFINITY
  const dayLimit = times.find((t) => t.key === time.value)?.days ?? 9999
  const kw = keyword.value.trim().toLowerCase()

  const list = onSale.value.filter((p) => {
    if (cat.value !== '全部' && p.category !== cat.value) return false
    if (condition.value !== '全部' && p.condition !== condition.value) return false
    if (campus.value !== '全部' && p.campus !== campus.value) return false
    if (p.price < min || p.price > max) return false
    if (dayLimit < 9999 && Date.now() - new Date(p.createdAt).getTime() > dayLimit * 86400000) return false
    if (onlyVerified.value && !userById(p.sellerId)?.verified) return false
    if (kw && !`${p.title}${p.desc}${p.tags.join('')}${p.category}`.toLowerCase().includes(kw)) return false
    return true
  })

  const sorted = [...list]
  if (sort.value === '价格从低到高') sorted.sort((a, b) => a.price - b.price)
  else if (sort.value === '价格从高到低') sorted.sort((a, b) => b.price - a.price)
  else if (sort.value === '最多收藏') sorted.sort((a, b) => b.likes - a.likes)
  else sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  return sorted
})

const activeCount = computed(
  () =>
    (cat.value !== '全部' ? 1 : 0) +
    (condition.value !== '全部' ? 1 : 0) +
    (campus.value !== '全部' ? 1 : 0) +
    (time.value !== '全部' ? 1 : 0) +
    (priceMin.value ? 1 : 0) +
    (priceMax.value ? 1 : 0) +
    (onlyVerified.value ? 1 : 0),
)

function clearAll() {
  cat.value = '全部'
  condition.value = '全部'
  campus.value = '全部'
  time.value = '全部'
  priceMin.value = ''
  priceMax.value = ''
  onlyVerified.value = false
  keyword.value = ''
  router.replace({ path: '/market' })
}

function search() {
  router.replace({ path: '/market', query: keyword.value ? { q: keyword.value } : {} })
}
</script>

<template>
  <div class="wrap py-7">
    <nav class="mb-6 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">
      <router-link to="/" class="hover:text-ink">首页</router-link>
      <ChevronRight :size="11" />
      <span class="text-ink">商品大厅</span>
    </nav>

    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="display text-[34px] font-semibold leading-none md:text-[42px]">商品大厅</h1>
        <p class="mt-3 max-w-xl text-[13px] leading-relaxed text-ink2/80">
          全校 {{ onSale.length + 4205 }} 件在售闲置，按成色、价格、校区慢慢挑。
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="hidden items-center rounded-full border border-ink/15 bg-white/60 p-1 sm:flex">
          <button
            class="grid h-8 w-8 place-items-center rounded-full transition"
            :class="view === 'grid' ? 'bg-ink text-haze' : 'text-ink3'"
            aria-label="网格视图"
            @click="view = 'grid'"
          >
            <LayoutGrid :size="14" />
          </button>
          <button
            class="grid h-8 w-8 place-items-center rounded-full transition"
            :class="view === 'list' ? 'bg-ink text-haze' : 'text-ink3'"
            aria-label="列表视图"
            @click="view = 'list'"
          >
            <List :size="14" />
          </button>
        </div>
        <button class="btn btn-ghost btn-sm lg:hidden" @click="filtersOpen = !filtersOpen">
          <SlidersHorizontal :size="13" /> 筛选
          <span v-if="activeCount" class="grid h-4 w-4 place-items-center rounded-full bg-azure text-[9px] text-haze">{{ activeCount }}</span>
        </button>
      </div>
    </div>

    <div class="mt-7 grid gap-8 lg:grid-cols-[236px_1fr]">
      <!-- 筛选 -->
      <aside :class="filtersOpen ? 'block' : 'hidden lg:block'">
        <div class="space-y-5 lg:sticky lg:top-32">
          <div class="flex items-center justify-between">
            <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-ink3">Filters</p>
            <button v-if="activeCount" class="flex items-center gap-1 text-[11px] text-azure" @click="clearAll">
              <X :size="11" /> 清空
            </button>
          </div>

          <div class="border-b border-dashed border-ink/15 pb-5">
            <p class="label !mb-3">分类</p>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="c in ['全部', ...categories.map((x) => x.name)]"
                :key="c"
                class="flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left text-[12px] transition"
                :class="cat === c
                  ? 'border-ink bg-ink text-haze'
                  : 'border-ink/10 bg-haze/40 text-ink2 hover:border-ink/30'"
                @click="cat = c"
              >
                <CategoryIcon v-if="c !== '全部'" :name="c" :size="13" />
                {{ c }}
              </button>
            </div>
          </div>

          <div class="border-b border-dashed border-ink/15 pb-5">
            <p class="label !mb-3">价格区间</p>
            <div class="flex items-center gap-2">
              <input v-model="priceMin" type="number" min="0" class="field !px-3 !py-2 !text-[12px]" placeholder="最低" />
              <span class="text-ink3">—</span>
              <input v-model="priceMax" type="number" min="0" class="field !px-3 !py-2 !text-[12px]" placeholder="最高" />
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="r in [{ l: '0-50', a: '', b: '50' }, { l: '50-200', a: '50', b: '200' }, { l: '200-600', a: '200', b: '600' }, { l: '600+', a: '600', b: '' }]"
                :key="r.l"
                class="rounded-full border border-ink/15 px-2.5 py-1 font-mono text-[10px] text-ink3 transition hover:border-ink/40 hover:text-ink"
                @click="priceMin = r.a; priceMax = r.b"
              >
                ¥{{ r.l }}
              </button>
            </div>
          </div>

          <div class="border-b border-dashed border-ink/15 pb-5">
            <p class="label !mb-3">成色</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="c in conditions"
                :key="c"
                class="chip !px-2.5 !py-1 !text-[11.5px]"
                :class="{ 'chip-on': condition === c }"
                @click="condition = c"
              >
                {{ c }}
              </button>
            </div>
          </div>

          <div class="border-b border-dashed border-ink/15 pb-5">
            <p class="label !mb-3">发布时间</p>
            <div class="space-y-1.5">
              <button
                v-for="t in times"
                :key="t.key"
                class="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[12px] transition hover:bg-haze2"
                :class="time === t.key ? 'bg-haze2 font-medium text-ink' : 'text-ink3'"
                @click="time = t.key"
              >
                {{ t.key }}
                <span v-if="time === t.key" class="h-1.5 w-1.5 rounded-full bg-azure" />
              </button>
            </div>
          </div>

          <div class="border-b border-dashed border-ink/15 pb-5">
            <p class="label !mb-3">交易校区</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="c in campuses"
                :key="c"
                class="chip !px-2.5 !py-1 !text-[11.5px]"
                :class="{ 'chip-on': campus === c }"
                @click="campus = c"
              >
                {{ c }}
              </button>
            </div>
          </div>

          <label class="flex cursor-pointer items-center justify-between gap-3">
            <span class="text-[12.5px] text-ink2">只看已实名卖家</span>
            <span
              class="relative h-5 w-9 rounded-full transition"
              :class="onlyVerified ? 'bg-teal' : 'bg-ink/20'"
            >
              <input v-model="onlyVerified" type="checkbox" class="peer sr-only" />
              <span
                class="absolute top-0.5 h-4 w-4 rounded-full bg-haze transition-all"
                :class="onlyVerified ? 'left-[18px]' : 'left-0.5'"
              />
            </span>
          </label>
        </div>
      </aside>

      <!-- 结果 -->
      <section class="min-w-0">
        <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-2.5">
          <form class="relative min-w-[180px] flex-1" @submit.prevent="search">
            <Search :size="14" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              v-model="keyword"
              class="w-full rounded-full border border-transparent bg-haze2/60 py-2 pl-9 pr-3 text-[13px] outline-none transition placeholder:text-ink3/70 focus:border-ink/25 focus:bg-white"
              placeholder="在结果中搜索…"
            />
          </form>
          <span class="hidden font-mono text-[10px] uppercase tracking-widest text-ink3 sm:block">
            共 {{ results.length }} 件
          </span>
          <select
            v-model="sort"
            class="cursor-pointer rounded-full border border-ink/15 bg-haze px-3 py-2 text-[12px] text-ink2 outline-none"
            aria-label="排序方式"
          >
            <option v-for="s in sorts" :key="s">{{ s }}</option>
          </select>
        </div>

        <div v-if="activeCount || keyword" class="mt-3 flex flex-wrap items-center gap-2">
          <span class="font-mono text-[10px] uppercase tracking-widest text-ink3">已选</span>
          <span v-if="cat !== '全部'" class="tag !border-ink/25 bg-haze">{{ cat }} <button @click="cat = '全部'"><X :size="10" /></button></span>
          <span v-if="condition !== '全部'" class="tag !border-ink/25 bg-haze">{{ condition }} <button @click="condition = '全部'"><X :size="10" /></button></span>
          <span v-if="campus !== '全部'" class="tag !border-ink/25 bg-haze">{{ campus }} <button @click="campus = '全部'"><X :size="10" /></button></span>
          <span v-if="time !== '全部'" class="tag !border-ink/25 bg-haze">{{ time }} <button @click="time = '全部'"><X :size="10" /></button></span>
          <span v-if="keyword" class="tag !border-ink/25 bg-haze">“{{ keyword }}” <button @click="keyword = ''; search()"><X :size="10" /></button></span>
          <button class="ml-auto text-[11px] text-azure underline underline-offset-2" @click="clearAll">全部清空</button>
        </div>

        <div v-if="!results.length" class="mt-8">
          <EmptyState title="暂时没有符合条件的闲置" desc="试着放宽价格或成色条件，或者发布一条求购，让同学来找你。">
            <div class="flex justify-center gap-2">
              <button class="btn btn-ghost btn-sm" @click="clearAll">清空筛选</button>
              <router-link to="/wanted/new" class="btn btn-primary btn-sm">发布求购</router-link>
            </div>
          </EmptyState>
        </div>

        <div v-else-if="view === 'grid'" class="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3">
          <ProductCard v-for="p in results" :key="p.id" :product="p" />
        </div>

        <div v-else class="mt-6 space-y-3">
          <router-link
            v-for="p in results"
            :key="p.id"
            :to="`/product/${p.id}`"
            class="group flex gap-4 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3 transition hover:border-ink/25 hover:shadow-tag"
          >
            <div class="h-[110px] w-[146px] shrink-0 overflow-hidden rounded-xl">
              <ProductArt :product="p" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col py-1">
              <div class="flex items-start gap-3">
                <h3 class="line-clamp-2 flex-1 font-serif text-[15px] font-semibold leading-snug group-hover:text-azure">
                  {{ p.title }}
                </h3>
                <span class="tag shrink-0">{{ p.condition }}</span>
              </div>
              <p class="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink3">{{ p.desc }}</p>
              <div class="mt-auto flex items-end justify-between gap-3 pt-3">
                <div class="flex items-baseline gap-2">
                  <span class="display text-[23px] font-semibold text-azure">¥{{ money(p.price) }}</span>
                  <span class="font-mono text-[10px] text-ink3 line-through">¥{{ money(p.original) }}</span>
                </div>
                <div class="flex items-center gap-2 text-[11px] text-ink3">
                  <Avatar :user="userById(p.sellerId)" size="xs" />
                  {{ userById(p.sellerId)?.name }} · {{ p.campus }} · {{ timeAgo(p.createdAt) }}
                  <button
                    class="grid h-7 w-7 place-items-center rounded-full border border-ink/15 bg-haze transition hover:scale-110"
                    :aria-label="isFavorite(p.id) ? '取消收藏' : '收藏'"
                    @click.prevent="toggleFavorite(p.id)"
                  >
                    <Heart :size="12" :class="isFavorite(p.id) ? 'fill-azure text-azure' : ''" />
                  </button>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>
