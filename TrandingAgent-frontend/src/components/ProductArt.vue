<script setup lang="ts">
import { computed } from 'vue'
import {
  Bike,
  BookOpen,
  Guitar,
  Lamp,
  Laptop,
  Package,
  Shirt,
  Sparkles,
  Tent,
} from 'lucide-vue-next'
import type { Product } from '@/types'

const props = withDefaults(defineProps<{ product: Product; variant?: number }>(), { variant: 0 })

const palettes = [
  { bg: '#DCE9F9', ink: '#0A1B2E', accent: '#0B63F6' },
  { bg: '#D8EEF6', ink: '#0B2B3A', accent: '#00A6B8' },
  { bg: '#E2E4FB', ink: '#19193A', accent: '#6D5CFF' },
  { bg: '#DDEBF8', ink: '#0E2438', accent: '#0B93B3' },
  { bg: '#E7E3FC', ink: '#201A40', accent: '#0B63F6' },
  { bg: '#D9F1F8', ink: '#0A2A33', accent: '#22D3EE' },
  { bg: '#E3EEFA', ink: '#122A3E', accent: '#00A6B8' },
  { bg: '#E9E9FA', ink: '#1A1E3A', accent: '#7FA6CC' },
]

const iconMap = {
  数码: Laptop,
  书籍: BookOpen,
  生活: Lamp,
  运动: Bike,
  乐器: Guitar,
  美妆: Sparkles,
  户外: Tent,
  服饰: Shirt,
}

const seed = computed(() => props.product.seed + props.variant * 3)
const palette = computed(() => palettes[seed.value % palettes.length]!)
const motif = computed(() => (props.product.seed + props.variant) % 4)
const icon = computed(() => iconMap[props.product.category] ?? Package)
const serial = computed(() => String(seed.value + 1).padStart(3, '0'))
</script>

<template>
  <div class="relative h-full w-full overflow-hidden" :style="{ background: palette.bg }">
    <svg viewBox="0 0 400 300" class="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
      <!-- 0 · 落日与山脊 -->
      <g v-if="motif === 0">
        <circle cx="302" cy="82" r="88" :fill="palette.accent" />
        <path d="M0 214 Q 90 168 190 208 T 400 196 V300 H0 Z" :fill="palette.ink" />
        <path d="M0 252 Q 120 226 250 254 T 400 244" fill="none" :stroke="palette.bg" stroke-width="1.4" opacity=".55" />
      </g>

      <!-- 1 · 同心圆 -->
      <g v-else-if="motif === 1" fill="none" :stroke="palette.accent">
        <circle cx="200" cy="150" r="130" stroke-width="26" opacity=".9" />
        <circle cx="200" cy="150" r="82" :stroke="palette.ink" stroke-width="1.6" opacity=".5" />
        <circle cx="200" cy="150" r="46" :fill="palette.ink" stroke="none" opacity=".14" />
      </g>

      <!-- 2 · 斜切条纹 -->
      <g v-else-if="motif === 2">
        <rect x="0" y="0" width="400" height="300" :fill="palette.bg" />
        <g :stroke="palette.accent" stroke-width="30" opacity=".85">
          <line x1="-40" y1="330" x2="150" y2="-30" />
          <line x1="60" y1="330" x2="250" y2="-30" />
          <line x1="160" y1="330" x2="350" y2="-30" />
        </g>
        <rect x="0" y="212" width="400" height="88" :fill="palette.ink" />
      </g>

      <!-- 3 · 拱门 -->
      <g v-else>
        <path d="M90 300 V168 a110 110 0 0 1 220 0 V300 Z" :fill="palette.accent" opacity=".92" />
        <path d="M150 300 V178 a50 50 0 0 1 100 0 V300 Z" :fill="palette.bg" />
        <rect x="0" y="0" width="400" height="300" :fill="palette.ink" opacity=".06" />
        <line x1="0" y1="268" x2="400" y2="268" :stroke="palette.ink" stroke-width="1" opacity=".35" />
      </g>
    </svg>

    <!-- 品类图标 -->
    <div
      class="absolute left-4 top-4 grid h-14 w-14 place-items-center rounded-full border border-current/20 backdrop-blur-[1px]"
      :style="{ color: palette.ink, background: 'rgba(255,255,255,.22)' }"
    >
      <component :is="icon" :size="26" :stroke-width="1.2" />
    </div>

    <!-- 编号 -->
    <div
      class="absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-[0.2em]"
      :style="{ color: palette.ink, opacity: 0.55 }"
    >
      NO.{{ serial }}
    </div>
    <div
      class="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-[0.24em]"
      :style="{ color: palette.ink, opacity: 0.45 }"
    >
      QIANJIA / {{ product.campus }}
    </div>

    <!-- 纸张颗粒 -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-multiply"
      style="background-image: repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 1px, transparent 1px 3px)"
    />
  </div>
</template>
