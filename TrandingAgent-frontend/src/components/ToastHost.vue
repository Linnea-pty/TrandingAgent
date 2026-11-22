<script setup lang="ts">
import { Check, TriangleAlert } from 'lucide-vue-next'

import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { toasts } = storeToRefs(market)
</script>

<template>
  <div class="pointer-events-none fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2 md:bottom-6 md:right-6">
    <TransitionGroup
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-3 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-x-4 opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="flex max-w-[320px] items-center gap-2.5 rounded-full border border-ink/15 bg-[#F7FBFF] px-4 py-2.5 shadow-lift"
      >
        <span
          class="grid h-5 w-5 shrink-0 place-items-center rounded-full text-haze"
          :class="t.tone === 'ok' ? 'bg-teal' : 'bg-azure'"
        >
          <Check v-if="t.tone === 'ok'" :size="12" :stroke-width="3" />
          <TriangleAlert v-else :size="11" :stroke-width="2.4" />
        </span>
        <span class="text-[12.5px] text-ink2">{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
