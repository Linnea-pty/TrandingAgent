<script setup lang="ts">
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

withDefaults(defineProps<{ name: string; size?: number; strokeWidth?: number }>(), {
  size: 16,
  strokeWidth: 1.6,
})

const icons = {
  数码: Laptop,
  书籍: BookOpen,
  生活: Lamp,
  运动: Bike,
  乐器: Guitar,
  美妆: Sparkles,
  户外: Tent,
  服饰: Shirt,
}

const resolve = (name: string) => icons[name as keyof typeof icons] ?? Package
</script>

<template>
  <component :is="resolve(name)" :size="size" :stroke-width="strokeWidth" />
</template>
