<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean; title?: string; width?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div class="absolute inset-0 bg-ink/45 backdrop-blur-[3px]" @click="emit('close')" />
        <div
          class="relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl border border-ink/10 bg-[#F7FBFF] p-6 shadow-lift sm:rounded-3xl"
          :class="width ?? 'sm:max-w-lg'"
        >
          <div class="mb-4 flex items-start justify-between gap-4">
            <h3 class="font-serif text-lg font-semibold">{{ title }}</h3>
            <button
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 transition hover:bg-haze2"
              aria-label="关闭"
              @click="emit('close')"
            >
              <X :size="16" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
