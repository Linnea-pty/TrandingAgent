<script setup lang="ts">
withDefaults(
  defineProps<{
    kicker?: string
    title: string
    desc?: string
    align?: 'left' | 'center'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <div
    class="flex flex-wrap items-end justify-between gap-4"
    :class="align === 'center' ? 'justify-center text-center' : ''"
  >
    <div :class="align === 'center' ? 'mx-auto max-w-2xl' : ''">
      <p v-if="kicker" class="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-azure">
        <span class="h-px w-6 bg-azure/60" />
        {{ kicker }}
      </p>
      <h2 class="display text-[26px] font-semibold leading-tight md:text-[34px]">{{ title }}</h2>
      <p v-if="desc" class="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink2/80">{{ desc }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
