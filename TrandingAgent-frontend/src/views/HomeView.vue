<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-vue-next'
import CategoryIcon from '@/components/CategoryIcon.vue'
import ProductArt from '@/components/ProductArt.vue'
import ProductCard from '@/components/ProductCard.vue'
import SectionHead from '@/components/SectionHead.vue'
import Avatar from '@/components/Avatar.vue'
import { categories } from '@/data/mock'
import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { productById, state, userById } = market
const { onSale } = storeToRefs(market)

const router = useRouter()
const keyword = ref('')
const activeCat = ref('全部')

const hotWords = ['考研书', '显示器', '自行车', '台灯', '吉他']

const filtered = computed(() => {
  const list = activeCat.value === '全部'
    ? onSale.value
    : onSale.value.filter((p) => p.category === activeCat.value)
  return list.slice(0, 12)
})

const featured = computed(() =>
  ['p1', 'p5', 'p3']
    .map((id) => productById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p)),
)

const wantedTop = computed(() => state.wanted.slice(0, 3))
const postsTop = computed(() => state.posts.slice(0, 3))

function search(word?: string) {
  router.push({ path: '/market', query: { q: word ?? keyword.value } })
}

const stats = [
  { value: '12,864', label: '实名同学' },
  { value: '4,213', label: '在售闲置' },
  { value: '2,176', label: '累计成交' },
  { value: '98.2%', label: '交易好评' },
]
</script>

<template>
  <div>
    <!-- ================= HERO ================= -->
    <section class="relative overflow-hidden border-b border-ink/10">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.5]"
        style="background-image: radial-gradient(#0A1B2E 0.7px, transparent 0.7px); background-size: 22px 22px; mask-image: linear-gradient(180deg,#000,transparent 78%)"
      />
      <div class="wrap relative grid gap-12 pb-14 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-16">
        <div class="animate-fadeUp">
          <p class="mb-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-ink3">
            <span class="rounded-sm bg-ink px-2 py-1 text-haze">EST. 2023</span>
            校园闲置 · 二次流动
            <span class="hidden h-px w-8 bg-ink/25 sm:block" />
          </p>

          <h1 class="display text-[46px] font-semibold leading-[1.04] tracking-tight sm:text-[64px] lg:text-[72px]">
            让闲置<br />
            <span class="relative inline-block text-azure">
              继续上课
              <svg class="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 7 Q 80 1 150 6 T 298 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".65" />
              </svg>
            </span>
          </h1>

          <p class="mt-6 max-w-md font-serif text-[15px] leading-[1.9] text-ink2">
            谦价是只属于校园的二手市场。学号实名、校内面交、聊天留痕——
            把用不上的东西，交给下一位同学。
          </p>

          <form class="mt-8 max-w-lg" @submit.prevent="search()">
            <div class="flex items-center gap-2 rounded-full border border-ink/15 bg-[#F7FBFF] p-1.5 pl-5 shadow-tag transition focus-within:border-ink/40">
              <Search :size="17" class="shrink-0 text-ink3" />
              <input
                v-model="keyword"
                class="w-full bg-transparent py-2 text-sm outline-none placeholder:text-ink3/70"
                placeholder="想淘点什么？比如「线性代数」"
                aria-label="搜索商品"
              />
              <button type="submit" class="btn btn-primary shrink-0 !px-5 !py-2.5">去淘</button>
            </div>
          </form>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="font-mono text-[10px] uppercase tracking-widest text-ink3">热门</span>
            <button
              v-for="w in hotWords"
              :key="w"
              class="rounded-full border border-ink/15 px-2.5 py-1 text-[11.5px] text-ink2 transition hover:border-azure hover:text-azure"
              @click="search(w)"
            >
              {{ w }}
            </button>
          </div>
        </div>

        <!-- 海报拼贴 -->
        <div class="relative mx-auto hidden h-[440px] w-full max-w-[460px] lg:block">
          <div
            v-for="(p, i) in featured"
            :key="p.id"
            class="absolute overflow-hidden rounded-[14px] border-[6px] border-[#F7FBFF] bg-haze shadow-lift transition duration-500 hover:z-20 hover:-translate-y-2 hover:rotate-0"
            :class="[
              i === 0 ? 'left-0 top-8 w-[250px] -rotate-6' : '',
              i === 1 ? 'right-2 top-0 w-[230px] rotate-3' : '',
              i === 2 ? 'bottom-2 left-24 w-[220px] rotate-2' : '',
            ]"
          >
            <div class="aspect-[4/3]">
              <ProductArt :product="p" :variant="i + 1" />
            </div>
            <div class="flex items-baseline justify-between gap-2 px-2.5 py-2">
              <span class="line-clamp-1 font-serif text-[12px] font-semibold">{{ p.title }}</span>
              <span class="display shrink-0 text-[15px] font-semibold text-azure">¥{{ money(p.price) }}</span>
            </div>
          </div>

          <div class="absolute -right-2 bottom-24 rotate-12 rounded-full border-2 border-azure bg-haze px-5 py-4 text-center shadow-tag">
            <p class="font-mono text-[9px] uppercase tracking-[0.16em] text-azure">今日新上</p>
            <p class="display text-2xl font-semibold text-azure">47</p>
            <p class="font-mono text-[9px] uppercase tracking-[0.16em] text-azure">件</p>
          </div>

          <div class="absolute -left-6 bottom-2 -rotate-6">
            <span class="seal !border-teal !text-teal !text-[12px]">校 园 实 名</span>
          </div>
        </div>
      </div>

      <!-- 数据条 -->
      <div class="border-t border-ink/10 bg-[#F7FBFF]/70">
        <div class="wrap grid grid-cols-2 divide-ink/10 md:grid-cols-4 md:divide-x">
          <div v-for="s in stats" :key="s.label" class="flex items-baseline gap-2 border-b border-ink/10 px-1 py-5 md:border-b-0 md:px-6">
            <span class="display text-[26px] font-semibold tracking-tight">{{ s.value }}</span>
            <span class="text-[11.5px] text-ink3">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 小谦入口 ================= -->
    <section class="wrap pt-8">
      <router-link
        to="/assistant"
        class="hud-panel group flex flex-wrap items-center gap-4 px-5 py-4 transition hover:border-azure/35"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-neon shadow-glow">
          <Sparkles :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-2 font-display text-[15px] font-semibold">
            不想自己砍价？交给小谦
            <span class="badge-live">AGENT</span>
          </p>
          <p class="mt-0.5 text-[11.5px] leading-relaxed text-ink3">
            一句话说明预算与时间，小谦同时开 3 路议价，谈成后再让你确认。
          </p>
        </div>
        <div class="hidden items-center gap-1.5 sm:flex">
          <span
            v-for="l in ['A', 'B', 'C']"
            :key="l"
            class="grid h-6 w-10 place-items-center rounded border border-azure/25 bg-azure/[0.06] font-mono text-[9px] text-azure"
          >
            {{ l }}
          </span>
        </div>
        <span class="btn btn-sm btn-primary shrink-0">进入 <ArrowRight :size="13" /></span>
      </router-link>
    </section>

    <!-- ================= 分类 ================= -->
    <section class="wrap mt-16">
      <div class="mb-6 flex items-end justify-between">
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-ink3">Browse by category</p>
        <router-link to="/market" class="link-u text-[12px] text-ink2">全部分类</router-link>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <router-link
          v-for="c in categories"
          :key="c.name"
          :to="{ path: '/market', query: { cat: c.name } }"
          class="group relative overflow-hidden rounded-2xl border border-ink/10 bg-[#F7FBFF] px-4 py-4 transition hover:-translate-y-1 hover:border-ink/25 hover:shadow-tag"
        >
          <span class="mb-6 grid h-9 w-9 place-items-center rounded-full text-haze transition group-hover:scale-110" :style="{ background: c.tone }">
            <CategoryIcon :name="c.name" :size="16" />
          </span>
          <span class="block font-serif text-[13.5px] font-semibold">{{ c.name }}</span>
          <span class="mt-0.5 block font-mono text-[10px] text-ink3">{{ c.count }} 件</span>
          <ArrowUpRight :size="13" class="absolute right-3 top-3.5 text-ink3 opacity-0 transition group-hover:opacity-100" />
        </router-link>
      </div>
    </section>

    <!-- ================= 瀑布流 ================= -->
    <section class="wrap mt-20">
      <SectionHead kicker="Just landed" title="刚刚上架的好东西" desc="教学楼、宿舍楼下、图书馆门口——都可能是下一个交易地点。">
        <template #action>
          <router-link to="/market" class="btn btn-ghost btn-sm">
            全部商品 <ArrowRight :size="13" />
          </router-link>
        </template>
      </SectionHead>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="c in ['全部', ...categories.slice(0, 5).map((x) => x.name)]"
          :key="c"
          class="chip"
          :class="{ 'chip-on': activeCat === c }"
          @click="activeCat = c"
        >
          {{ c }}
        </button>
        <span class="ml-auto hidden items-center gap-1 self-center font-mono text-[10px] uppercase tracking-widest text-ink3 sm:flex">
          <TrendingUp :size="12" /> 按发布时间排序
        </span>
      </div>

      <div class="masonry mt-7 columns-2 md:columns-3 xl:columns-4">
        <div v-for="(p, i) in filtered" :key="p.id">
          <ProductCard :product="p" :tall="i % 7 === 3" />
        </div>
      </div>
    </section>

    <!-- ================= 求购 ================= -->
    <section class="wrap mt-20">
      <div class="relative overflow-hidden rounded-[28px] bg-ink p-6 text-haze md:p-10">
        <div class="pointer-events-none absolute inset-0 opacity-20" style="background-image: radial-gradient(#E9F1FB 0.6px, transparent 0.6px); background-size: 18px 18px" />
        <div class="relative grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p class="mb-3 font-mono text-[10px] uppercase tracking-[0.26em] text-cyan">Wanted · 双向撮合</p>
            <h2 class="display text-[28px] font-semibold leading-tight md:text-[36px]">
              你有我想要的，<br />我有你正需要的。
            </h2>
            <p class="mt-4 max-w-sm text-[13px] leading-relaxed text-haze/70">
              没搜到合适的？发一条求购，让有货的同学主动找到你。成交同样计入信用。
            </p>
            <router-link to="/wanted/new" class="btn btn-sm mt-6 border-haze/25 bg-haze text-ink hover:bg-haze2">
              发布求购 <ArrowUpRight :size="14" />
            </router-link>
          </div>

          <ul class="space-y-2">
            <li v-for="w in wantedTop" :key="w.id">
              <router-link
                to="/wanted"
                class="group flex items-center gap-4 rounded-xl border border-haze/10 bg-haze/[0.04] px-4 py-3.5 transition hover:border-cyan/50 hover:bg-haze/[0.08]"
              >
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-haze/10 text-cyan">
                  <CategoryIcon :name="w.category" :size="15" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="line-clamp-1 block font-serif text-[13.5px] font-medium">{{ w.title }}</span>
                  <span class="mt-0.5 block font-mono text-[10px] text-haze/45">
                    {{ userById(w.userId)?.name }} · {{ timeAgo(w.createdAt) }} · {{ w.replies }} 条回应
                  </span>
                </span>
                <span class="shrink-0 font-mono text-[12px] text-cyan">≤ ¥{{ w.budget }}</span>
                <ArrowRight :size="14" class="shrink-0 text-haze/30 transition group-hover:translate-x-1 group-hover:text-cyan" />
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ================= 广场 ================= -->
    <section class="wrap mt-20">
      <SectionHead kicker="Campus square" title="广场上的闲谈" desc="交易心得、防骗提醒，以及一些关于旧物的故事。">
        <template #action>
          <router-link to="/square" class="btn btn-ghost btn-sm">进入广场 <ArrowRight :size="13" /></router-link>
        </template>
      </SectionHead>

      <div class="mt-7 grid gap-4 md:grid-cols-3">
        <router-link
          v-for="p in postsTop"
          :key="p.id"
          to="/square"
          class="group flex flex-col rounded-2xl border border-ink/10 bg-[#F7FBFF] p-6 transition hover:-translate-y-1 hover:shadow-tag"
        >
          <div class="mb-4 flex items-center justify-between">
            <span class="tag">{{ p.topic }}</span>
            <span class="font-mono text-[10px] text-ink3">{{ timeAgo(p.createdAt) }}</span>
          </div>
          <h3 class="font-serif text-[16px] font-semibold leading-snug transition group-hover:text-azure">
            {{ p.title }}
          </h3>
          <p class="mt-2 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-ink3">{{ p.body }}</p>
          <div class="mt-5 flex items-center gap-2 border-t border-dashed border-ink/15 pt-4">
            <Avatar :user="userById(p.userId)" size="xs" />
            <span class="text-[11.5px] text-ink2">{{ userById(p.userId)?.name }}</span>
            <span class="ml-auto flex items-center gap-3 font-mono text-[10px] text-ink3">
              <span class="flex items-center gap-1"><Heart :size="11" /> {{ p.likes }}</span>
              <span class="flex items-center gap-1"><Sparkles :size="11" /> {{ p.comments }}</span>
            </span>
          </div>
        </router-link>
      </div>
    </section>

    <!-- ================= 面交点 ================= -->
    <section class="wrap mt-20">
      <div class="grid gap-4 rounded-[28px] border border-ink/10 bg-haze2/50 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div class="grid gap-6 sm:grid-cols-3">
          <div v-for="(s, i) in [
            { icon: MapPin, t: '约在公共区域', d: '图书馆、食堂、宿舍楼下，不去偏僻角落。' },
            { icon: ShieldCheck, t: '当面验货', d: '电子产品点亮测试，书籍翻页确认。' },
            { icon: Store, t: '全程站内留痕', d: '聊天与订单记录可作为交易凭证。' },
          ]" :key="i" class="flex gap-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 bg-haze">
              <component :is="s.icon" :size="16" :stroke-width="1.5" />
            </span>
            <div>
              <p class="font-serif text-[13.5px] font-semibold">{{ s.t }}</p>
              <p class="mt-1 text-[11.5px] leading-relaxed text-ink3">{{ s.d }}</p>
            </div>
          </div>
        </div>
        <router-link to="/square" class="btn btn-ink btn-sm shrink-0 justify-self-start md:justify-self-end">
          阅读安全指南 <ArrowRight :size="13" />
        </router-link>
      </div>
    </section>
  </div>
</template>
