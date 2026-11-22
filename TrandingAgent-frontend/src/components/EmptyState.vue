<script setup lang="ts">
import { PackageOpen } from 'lucide-vue-next'

withDefaults(defineProps<{ title: string; desc?: string }>(), { desc: '' })
</script>

<template>
  <div class="grid place-items-center rounded-3xl border border-dashed border-ink/20 bg-haze2/40 px-6 py-16 text-center">
    <div class="mb-4 grid h-14 w-14 place-items-center rounded-full border border-ink/10 bg-haze">
      <PackageOpen :size="24" :stroke-width="1.3" class="text-ink3" />
    </div>
    <p class="font-serif text-base font-semibold">{{ title }}</p>
    <p v-if="desc" class="mt-1.5 max-w-xs text-[13px] leading-relaxed text-ink3">{{ desc }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
