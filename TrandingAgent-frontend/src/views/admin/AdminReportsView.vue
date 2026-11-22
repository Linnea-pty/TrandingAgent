<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Flag, MessageSquareQuote, ShieldCheck, Star, Trash2, X } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import Stars from '@/components/Stars.vue'
import type { Report } from '@/types'

import { timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { state, toast, userById } = market

const tab = ref<'reports' | 'reviews'>('reports')
const scope = ref<'全部' | Report['status']>('全部')

const reports = computed(() =>
  scope.value === '全部' ? state.reports : state.reports.filter((r) => r.status === scope.value),
)
const reviews = computed(() =>
  [...state.reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
)

const counts = computed(() => ({
  pending: state.reports.filter((r) => r.status === '待处理').length,
  done: state.reports.filter((r) => r.status === '已处理').length,
}))

function resolve(id: string, status: Report['status']) {
  const r = state.reports.find((x) => x.id === id)
  if (!r) return
  r.status = status
  toast(status === '已处理' ? '举报已处理，违规内容已下架' : '举报已驳回', status === '已处理' ? 'ok' : 'warn')
}

function removeReview(id: string) {
  state.reviews = state.reviews.filter((r) => r.id !== id)
  toast('该评价已删除，信用分已回滚', 'warn')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3">
      <div class="flex gap-1.5">
        <button class="chip !px-3 !py-1.5 !text-[12px]" :class="{ 'chip-on': tab === 'reports' }" @click="tab = 'reports'">
          <Flag :size="12" /> 举报 {{ state.reports.length }}
        </button>
        <button class="chip !px-3 !py-1.5 !text-[12px]" :class="{ 'chip-on': tab === 'reviews' }" @click="tab = 'reviews'">
          <Star :size="12" /> 评价 {{ state.reviews.length }}
        </button>
      </div>

      <div v-if="tab === 'reports'" class="ml-auto flex flex-wrap gap-1.5">
        <button
          v-for="s in (['全部', '待处理', '已处理', '已驳回'] as const)"
          :key="s"
          class="chip !px-2.5 !py-1 !text-[11px]"
          :class="{ 'chip-on': scope === s }"
          @click="scope = s"
        >
          {{ s }}
        </button>
      </div>

      <span v-if="tab === 'reports'" class="font-mono text-[10px] text-ink3">
        待处理 {{ counts.pending }} · 已处理 {{ counts.done }}
      </span>
    </div>

    <!-- 举报 -->
    <div v-if="tab === 'reports'" class="grid gap-3 md:grid-cols-2">
      <article
        v-for="r in reports"
        :key="r.id"
        class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4"
      >
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-ink/[0.06] px-2 py-0.5 font-mono text-[9px] text-ink2">{{ r.type }}</span>
          <span
            class="rounded-full px-2 py-0.5 font-mono text-[9px]"
            :class="r.status === '待处理' ? 'bg-azure/10 text-azure' : r.status === '已处理' ? 'bg-teal/10 text-teal' : 'bg-ink/[0.06] text-ink3'"
          >
            {{ r.status }}
          </span>
          <span class="ml-auto font-mono text-[9px] text-ink3">{{ timeAgo(r.createdAt) }}</span>
        </div>

        <h3 class="mt-2.5 font-serif text-[13.5px] font-semibold">{{ r.target }}</h3>
        <p class="mt-1 text-[11.5px] leading-relaxed text-ink3">{{ r.reason }}</p>
        <div class="mt-2.5 flex items-center gap-2 border-t border-dashed border-ink/15 pt-2.5">
          <Avatar :user="userById(r.reporterId)" size="xs" />
          <span class="text-[10.5px] text-ink3">举报人 {{ userById(r.reporterId)?.name }}</span>
          <div class="ml-auto flex gap-1.5">
            <template v-if="r.status === '待处理'">
              <button class="btn btn-teal btn-sm !px-2 !py-1 !text-[10px]" @click="resolve(r.id, '已处理')">
                <Check :size="10" /> 受理
              </button>
              <button class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px]" @click="resolve(r.id, '已驳回')">
                <X :size="10" /> 驳回
              </button>
            </template>
            <span v-else class="flex items-center gap-1 font-mono text-[9.5px] text-ink3">
              <ShieldCheck :size="10" /> 已完成审核
            </span>
          </div>
        </div>
      </article>
      <div v-if="!reports.length" class="md:col-span-2 rounded-2xl border border-dashed border-ink/20 py-12 text-center text-[12px] text-ink3">
        没有该状态的举报
      </div>
    </div>

    <!-- 评价 -->
    <div v-else class="space-y-3">
      <article v-for="r in reviews" :key="r.id" class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
        <div class="flex flex-wrap items-center gap-2.5">
          <Avatar :user="userById(r.fromId)" size="sm" show-verified />
          <div>
            <p class="text-[12px] font-medium">
              {{ userById(r.fromId)?.name }} <span class="text-ink3">评价</span> {{ userById(r.toId)?.name }}
            </p>
            <p class="font-mono text-[9px] text-ink3">订单 {{ r.orderId }} · {{ timeAgo(r.createdAt) }}</p>
          </div>
          <Stars :value="r.rating" :size="11" class="ml-auto" />
          <button
            class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure"
            @click="removeReview(r.id)"
          >
            <Trash2 :size="10" /> 删除
          </button>
        </div>
        <p class="mt-2.5 text-[12px] leading-relaxed text-ink2">{{ r.text }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-1.5">
          <span v-for="t in r.tags" :key="t" class="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[9.5px] text-ink3">{{ t }}</span>
          <span class="ml-auto flex items-center gap-1 font-mono text-[9px] text-ink3">
            <MessageSquareQuote :size="10" /> 已通过内容审核
          </span>
        </div>
      </article>
      <div v-if="!reviews.length" class="rounded-2xl border border-dashed border-ink/20 py-12 text-center text-[12px] text-ink3">
        暂无评价
      </div>
    </div>
  </div>
</template>
