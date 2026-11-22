<script setup lang="ts">
import { BadgeCheck } from 'lucide-vue-next'
import type { User } from '@/types'

withDefaults(
  defineProps<{
    user?: User
    size?: 'xs' | 'sm' | 'md' | 'lg'
    showVerified?: boolean
  }>(),
  { size: 'sm', showVerified: false },
)

const sizes = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-11 w-11 text-sm',
  lg: 'h-20 w-20 text-2xl',
}

const badge = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
}
</script>

<template>
  <span class="relative inline-flex shrink-0">
    <span
      class="inline-grid place-items-center rounded-full font-serif font-bold text-haze ring-1 ring-ink/10"
      :class="sizes[size]"
      :style="{ background: user?.color ?? '#2C4B69' }"
      :title="user?.name"
    >
      {{ user?.name?.slice(0, 1) ?? '?' }}
    </span>
    <span
      v-if="showVerified && user?.verified"
      class="absolute -bottom-0.5 -right-0.5 rounded-full bg-haze p-[1px] text-teal"
    >
      <BadgeCheck :class="badge[size]" :stroke-width="2.4" />
    </span>
  </span>
</template>
