<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowUpRight, MessageCircle, Plus, Search, Sparkles } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import { categories } from '@/data/mock'
import { money, timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { state, toast, userById } = market

const router = useRouter()
const keyword = ref('')
const cat = ref('全部')
const sort = ref<'最新' | '预算最高'>('最新')

const list = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const items = state.wanted.filter((w) => {
    if (cat.value !== '全部' && w.category !== cat.value) return false
    if (kw && !`${w.title}${w.desc}`.toLowerCase().includes(kw)) return false
    return true
  })
  return sort.value === '预算最高' ? [...items].sort((a, b) => b.budget - a.budget) : items
})

function respond(id: string) {
  const w = state.wanted.find((x) => x.id === id)
  if (!w) return
  toast('已告诉对方你有这件东西，去消息里聊吧')
  router.push({ path: '/messages', query: { peer: w.userId } })
}
</script>

<template>
  <div class="wrap py-7">
    <div class="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Wanted board</p>
        <div class="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="display text-[34px] font-semibold leading-none md:text-[42px]">求购大厅</h1>
            <p class="mt-3 max-w-lg text-[13px] leading-relaxed text-ink2/80">
              有人正在找你可能正打算扔掉的东西。回应求购，让交易反向发生。
            </p>
          </div>
          <router-link to="/wanted/new" class="btn btn-primary btn-sm"><Plus :size="14" /> 发布求购</router-link>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-2.5">
          <div class="relative min-w-[180px] flex-1">
            <Search :size="14" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              v-model="keyword"
              class="w-full rounded-full bg-haze2/60 py-2 pl-9 pr-3 text-[12.5px] outline-none transition placeholder:text-ink3/70 focus:bg-white"
              placeholder="搜求购，例如「显示器」"
            />
          </div>
          <div class="flex gap-1.5">
            <button
              v-for="s in (['最新', '预算最高'] as const)"
              :key="s"
              class="chip !px-3 !py-1.5 !text-[11.5px]"
              :class="{ 'chip-on': sort === s }"
              @click="sort = s"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-1.5">
          <button
            v-for="c in ['全部', ...categories.map((x) => x.name)]"
            :key="c"
            class="chip !px-3 !py-1 !text-[11.5px]"
            :class="{ 'chip-on': cat === c }"
            @click="cat = c"
          >
            {{ c }}
          </button>
        </div>

        <div v-if="!list.length" class="mt-6">
          <EmptyState title="没有匹配的求购" desc="换个关键词，或者自己发一条求购试试。">
            <router-link to="/wanted/new" class="btn btn-primary btn-sm">发布求购</router-link>
          </EmptyState>
        </div>

        <div v-else class="mt-5 grid gap-3 md:grid-cols-2">
          <article
            v-for="w in list"
            :id="w.id"
            :key="w.id"
            class="group relative scroll-mt-28 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5 transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-tag"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="flex items-center gap-1.5 rounded-full bg-haze2 px-2.5 py-1 font-mono text-[10px] text-ink2">
                <CategoryIcon :name="w.category" :size="11" /> {{ w.category }}
              </span>
              <span class="font-mono text-[9px] uppercase tracking-wider text-ink3">{{ timeAgo(w.createdAt) }}</span>
            </div>

            <h3 class="mt-3 font-serif text-[15px] font-semibold leading-snug transition group-hover:text-azure">
              {{ w.title }}
            </h3>
            <p class="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink3">{{ w.desc }}</p>

            <div class="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-ink/15 pt-3.5">
              <div>
                <p class="font-mono text-[9px] uppercase tracking-wider text-ink3">期望价格</p>
                <p class="display mt-0.5 text-[22px] font-semibold leading-none text-azure">≤ ¥{{ money(w.budget) }}</p>
              </div>
              <div class="flex items-center gap-1.5">
                <Avatar :user="userById(w.userId)" size="xs" />
                <span class="text-[10.5px] text-ink3">{{ userById(w.userId)?.name }}</span>
              </div>
            </div>

            <div class="mt-3 flex gap-2">
              <button class="btn btn-teal btn-sm flex-1 !rounded-lg" @click="respond(w.id)">
                <Sparkles :size="12" /> 我有这个
              </button>
              <button
                class="btn btn-ghost btn-sm !rounded-lg"
                @click="router.push({ path: '/messages', query: { peer: w.userId } })"
              >
                <MessageCircle :size="12" /> 问问
              </button>
            </div>

            <span class="absolute -top-2 right-4 rounded-sm bg-ink px-2 py-0.5 font-mono text-[9px] text-haze">
              {{ w.replies }} 人回应
            </span>
          </article>
        </div>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div class="rounded-2xl border border-ink/10 bg-ink p-5 text-haze">
          <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">How it works</p>
          <h2 class="mt-2 font-serif text-[17px] font-semibold">求购怎么用？</h2>
          <ol class="mt-4 space-y-4">
            <li v-for="(t, i) in ['写下你缺的东西与预算', '有货的同学会来回应', '约在校园里当面交易']" :key="t" class="flex gap-3">
              <span class="font-mono text-[10px] text-cyan">0{{ i + 1 }}</span>
              <span class="text-[11.5px] leading-relaxed text-haze/70">{{ t }}</span>
            </li>
          </ol>
          <router-link to="/wanted/new" class="btn btn-sm mt-5 w-full border-haze/25 bg-haze text-ink hover:bg-haze2">
            我要发布求购 <ArrowUpRight :size="13" />
          </router-link>
        </div>

        <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
          <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">本周热搜</p>
          <div class="mt-3 space-y-2">
            <button
              v-for="(k, i) in ['考研数学真题', '27 寸显示器', '宿舍小冰箱', '二手吉他', '折叠自行车']"
              :key="k"
              class="flex w-full items-center gap-2.5 text-left text-[12px] text-ink2 transition hover:text-azure"
              @click="keyword = k.split(' ')[0] ?? ''"
            >
              <span class="font-mono text-[10px]" :class="i < 3 ? 'text-azure' : 'text-ink3'">0{{ i + 1 }}</span>
              {{ k }}
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-ink/20 p-5">
          <p class="font-serif text-[13px] font-semibold">求购小技巧</p>
          <p class="mt-2 text-[11px] leading-relaxed text-ink3">
            写清版本、型号和心理价位，比“随便收一个”更容易得到回应。留下可交易的时间段也很加分。
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
