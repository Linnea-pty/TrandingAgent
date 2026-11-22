<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, WifiOff } from 'lucide-vue-next'
import { useAgentStore } from '@/stores/agent'
import { storeToRefs } from 'pinia'

const agent = useAgentStore()
const { agentStats, connectionLabel } = storeToRefs(agent)

/** 断线/重连期间先占领这条状态条，避免用户以为议价还在实时推进 */
const offline = computed(() => Boolean(connectionLabel.value))

const text = computed(() => {
  if (offline.value) return connectionLabel.value
  if (!agentStats.value.active && !agentStats.value.pending) return '小谦空闲中 · 说一句话就能开始'
  const parts: string[] = []
  if (agentStats.value.active) parts.push(`正在处理 ${agentStats.value.active} 个任务`)
  if (agentStats.value.pending) parts.push(`${agentStats.value.pending} 条待确认`)
  return parts.join(' · ')
})
</script>

<template>
  <router-link
    to="/assistant"
    class="group block border-t transition"
    :class="offline ? 'border-azure/20 bg-azure/[0.06]' : 'border-azure/10 bg-gradient-to-r from-azure/[0.09] via-white/50 to-neon/[0.12] hover:from-azure/[0.14]'"
  >
    <div class="wrap flex items-center gap-2 py-1.5">
      <span class="relative flex h-2 w-2 shrink-0">
        <span
          v-if="!offline"
          class="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70"
        />
        <span class="relative inline-flex h-2 w-2 rounded-full" :class="offline ? 'bg-azure' : 'bg-teal'" />
      </span>
      <span class="font-mono text-[10px] uppercase tracking-[0.18em]" :class="offline ? 'text-azure' : 'text-azure'">
        {{ offline ? '小谦 · 流' : '小谦' }}
      </span>
      <span
        class="truncate font-mono text-[10.5px]"
        :class="offline ? 'text-azure' : 'text-ink3'"
        role="status"
        aria-live="polite"
      >
        {{ text }}
      </span>
      <span class="ml-auto hidden shrink-0 items-center gap-1 font-mono text-[10px] text-ink3 sm:flex">
        <template v-if="offline">
          <WifiOff :size="11" class="text-azure" /> 实时价格可能已过期
        </template>
        <template v-else>
          今日已省 ¥{{ agentStats.saved }}
        </template>
        <ChevronRight :size="11" class="transition group-hover:translate-x-0.5" />
      </span>
    </div>
  </router-link>
</template>
