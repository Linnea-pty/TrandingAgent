<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, MessageCircle, Plus, Trash2, Users } from 'lucide-vue-next'
import CategoryIcon from '@/components/CategoryIcon.vue'
import EmptyState from '@/components/EmptyState.vue'
import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { state, toast, userById } = market
const { myWanted } = storeToRefs(market)

const filter = ref<'全部' | '招募中' | '已完成'>('全部')

const list = computed(() =>
  filter.value === '全部' ? myWanted.value : myWanted.value.filter((w) => w.status === filter.value),
)

function complete(id: string) {
  const w = state.wanted.find((x) => x.id === id)
  if (!w) return
  w.status = '已完成'
  toast('已标记为完成，恭喜收到心仪的东西')
}

function reopen(id: string) {
  const w = state.wanted.find((x) => x.id === id)
  if (!w) return
  w.status = '招募中'
  toast('求购已重新开放')
}

function remove(id: string) {
  state.wanted = state.wanted.filter((w) => w.id !== id)
  toast('已删除求购', 'warn')
}
</script>

<template>
  <div class="wrap py-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">My requests</p>
        <h1 class="mt-2 display text-[32px] font-semibold md:text-[38px]">我的求购</h1>
        <p class="mt-2 text-[12.5px] text-ink3">共 {{ myWanted.length }} 条 · 有货的同学会主动来联系你</p>
      </div>
      <router-link to="/wanted/new" class="btn btn-primary btn-sm"><Plus :size="14" /> 发布求购</router-link>
    </div>

    <div class="mt-5 flex flex-wrap gap-1.5">
      <button
        v-for="f in (['全部', '招募中', '已完成'] as const)"
        :key="f"
        class="chip !px-3 !py-1.5 !text-[12px]"
        :class="{ 'chip-on': filter === f }"
        @click="filter = f"
      >
        {{ f }}
      </button>
    </div>

    <div v-if="!list.length" class="mt-5">
      <EmptyState title="还没有发布求购" desc="缺教材、缺显示器、缺一把吉他？写下来，让有货的人找到你。">
        <router-link to="/wanted/new" class="btn btn-primary btn-sm">发布第一条求购</router-link>
      </EmptyState>
    </div>

    <div v-else class="mt-4 space-y-3">
      <article
        v-for="w in list"
        :key="w.id"
        class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5 transition hover:border-ink/20"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="flex items-center gap-1 rounded-full bg-haze2 px-2.5 py-1 font-mono text-[10px] text-ink2">
                <CategoryIcon :name="w.category" :size="11" /> {{ w.category }}
              </span>
              <span
                class="rounded-full border px-2 py-0.5 font-mono text-[9.5px]"
                :class="w.status === '招募中' ? 'border-teal/30 bg-teal/10 text-teal' : 'border-ink/15 bg-ink/[0.06] text-ink3'"
              >
                {{ w.status }}
              </span>
              <span class="font-mono text-[9.5px] text-ink3">{{ timeAgo(w.createdAt) }}发布</span>
            </div>
            <h2 class="mt-2.5 font-serif text-[15px] font-semibold leading-snug">{{ w.title }}</h2>
            <p class="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink3">{{ w.desc }}</p>
          </div>

          <div class="text-right">
            <p class="font-mono text-[9px] uppercase tracking-wider text-ink3">期望价格</p>
            <p class="display text-[22px] font-semibold leading-none text-azure">≤ ¥{{ money(w.budget) }}</p>
          </div>
        </div>

        <div class="mt-3.5 flex flex-wrap items-center gap-2 border-t border-dashed border-ink/15 pt-3">
          <span class="flex items-center gap-1 font-mono text-[10px] text-ink3"><Users :size="11" /> {{ w.replies }} 人回应</span>
          <span class="flex items-center gap-1 font-mono text-[10px] text-ink3">
            <MessageCircle :size="11" /> 发布者 {{ userById(w.userId)?.name }}
          </span>

          <div class="ml-auto flex flex-wrap gap-1.5">
            <button
              v-if="w.status === '招募中'"
              class="btn btn-teal btn-sm !px-2.5 !py-1 !text-[10.5px]"
              @click="complete(w.id)"
            >
              <CheckCircle2 :size="11" /> 标记完成
            </button>
            <button
              v-else
              class="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10.5px]"
              @click="reopen(w.id)"
            >
              重新开放
            </button>
            <router-link to="/wanted" class="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10.5px]">
              查看大厅
            </router-link>
            <button
              class="btn btn-ghost btn-sm !px-2.5 !py-1 !text-[10.5px] !text-azure hover:!bg-azure/10"
              @click="remove(w.id)"
            >
              <Trash2 :size="11" /> 删除
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
