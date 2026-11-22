<script setup lang="ts">
import { Star } from 'lucide-vue-next'

withDefaults(defineProps<{ value: number; size?: number; showValue?: boolean }>(), {
  size: 13,
  showValue: false,
})
</script>

<template>
  <span class="inline-flex items-center gap-0.5">
    <Star
      v-for="i in 5"
      :key="i"
      :size="size"
      :stroke-width="1.6"
      :class="i <= Math.round(value) ? 'fill-cyan text-cyan' : 'text-ink/25'"
    />
    <span v-if="showValue" class="ml-1 font-mono text-[11px] text-ink3">{{ value.toFixed(1) }}</span>
  </span>
</template>
