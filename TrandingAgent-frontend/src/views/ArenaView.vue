<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BadgeCheck, Gavel, Info, Timer, WifiOff } from 'lucide-vue-next'
import NegotiationLaneCard from '@/components/NegotiationLane.vue'
import { money, useMarketStore } from '@/stores/market'
import { statusMeta, useAgentStore } from '@/stores/agent'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const agent = useAgentStore()
const { bestLane, confirmTask, ensureAgentLoop, taskById } = agent
const { connectionLabel } = storeToRefs(agent)

const route = useRoute()
const router = useRouter()
const task = computed(() => taskById(String(route.params.taskId)))
const best = computed(() => (task.value ? bestLane(task.value) : undefined))
const status = computed(() => (task.value ? statusMeta[task.value.status] : undefined))
const showHint = ref(true)

function confirmDeal() {
  if (!task.value) return
  const order = confirmTask(task.value.id)
  if (order) router.push(`/order/${order.id}`)
}

onMounted(ensureAgentLoop)
</script>

<template>
  <div v-if="!task" class="wrap py-24 text-center">
    <p class="font-mono text-[11px] uppercase tracking-widest text-ink3">ARENA NOT FOUND</p>
    <h1 class="mt-2 font-display text-[24px] font-semibold">这个议价大厅不存在</h1>
    <router-link to="/assistant" class="btn btn-primary mt-6">回到小谦</router-link>
  </div>

  <div v-else class="flex min-h-[calc(100vh-64px)] flex-col">
    <!-- 顶栏 -->
    <section class="border-b border-azure/10 bg-white/45 backdrop-blur-xl">
      <div class="wrap py-4">
        <div class="flex flex-wrap items-start gap-4">
          <router-link :to="`/task/${task.id}`" class="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink3 transition hover:text-azure">
            <ArrowLeft :size="11" /> 任务详情
          </router-link>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge-live"><span class="h-1 w-1 animate-pulseDot rounded-full bg-teal" /> PARALLEL NEGOTIATION</span>
              <span class="font-mono text-[9.5px] text-ink3">{{ task.id }}</span>
              <span class="rounded-full border border-azure/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-azure">{{ status?.label }}</span>
            </div>
            <h1 class="mt-1.5 font-display text-[22px] font-semibold leading-tight md:text-[27px]">
              三列并行议价 · {{ task.title }}
            </h1>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="mono-label !text-[8.5px]">预算</p>
              <p class="num-display text-[17px]">¥{{ money(task.budget) }}</p>
            </div>
            <div class="text-right">
              <p class="mono-label !text-[8.5px]">当前最优</p>
              <p class="num-display text-[17px] text-teal">{{ best ? `¥${money(best.price)}` : '—' }}</p>
            </div>
            <button
              v-if="task.status === 'awaiting' && best"
              class="btn btn-sm btn-primary"
              @click="confirmDeal"
            >
              <BadgeCheck :size="13" /> 确认成交
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 提示条 -->
    <div v-if="showHint" class="border-b border-azure/10 bg-azure/[0.04]">
      <div class="wrap flex items-center gap-2 py-1.5 font-mono text-[10px] text-ink3">
        <Info :size="11" class="text-azure" />
        每轮：LLM 提案 → Validator 硬校验 → 落库 → SSE 推送。一路成交后其余自动降级为备选。
        <button class="ml-auto text-ink3 hover:text-ink" @click="showHint = false">收起</button>
      </div>
    </div>

    <!-- 断线提示：先告知丢失，再显示重连进度 -->
    <div v-if="connectionLabel" class="border-b border-azure/25 bg-azure/[0.08]" role="alert" aria-live="assertive">
      <div class="wrap flex flex-wrap items-center gap-2 py-2 font-mono text-[10.5px] text-azure">
        <WifiOff :size="12" />
        <span class="font-semibold">连接丢失</span>
        <span class="text-ink2">实时议价已暂停，下列价格可能不是最新，恢复后会自动追平。</span>
        <span class="ml-auto">{{ connectionLabel }}</span>
      </div>
    </div>

    <!-- 三列 -->
    <main class="wrap flex-1 py-5">
      <div v-if="!task.lanes.length" class="flex h-[420px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-azure/25 bg-white/40">
        <Gavel :size="28" class="text-azure/50" />
        <p class="font-display text-[16px] font-semibold">还在检索候选</p>
        <p class="max-w-[360px] text-center text-[11.5px] leading-relaxed text-ink3">
          审核 Agent 正在核对品类与图文一致性，通过后会同时开出 3 路议价。
        </p>
        <router-link :to="`/task/${task.id}`" class="btn btn-sm">看任务进度</router-link>
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-3">
        <NegotiationLaneCard
          v-for="l in task.lanes"
          :key="l.id"
          :lane="l"
          dense
          class="h-[460px] lg:h-[calc(100vh-300px)]"
        />
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-azure/10 bg-white/55 px-4 py-3">
        <span class="flex items-center gap-1.5 font-mono text-[10px] text-ink3">
          <Timer :size="12" /> 已进行 {{ Math.max(3, task.lanes.reduce((s, l) => s + l.rounds, 0) * 2) }} 分钟
        </span>
        <span class="font-mono text-[10px] text-ink3">·</span>
        <span class="font-mono text-[10px] text-ink3">{{ task.lanes.reduce((s, l) => s + l.rounds, 0) }} 轮提案已落库</span>
        <span class="ml-auto flex items-center gap-3 font-mono text-[9.5px] text-ink3">
          <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-azure" /> 议价中</span>
          <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-teal" /> 成交</span>
          <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-cyan/60" /> 备选</span>
          <span class="flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-ink/20" /> 终止</span>
        </span>
      </div>
    </main>
  </div>
</template>
