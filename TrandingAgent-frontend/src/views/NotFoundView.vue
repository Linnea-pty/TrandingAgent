<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, Compass } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="wrap grid min-h-[62vh] place-items-center py-16">
    <div class="relative max-w-lg text-center">
      <p class="display select-none text-[110px] font-semibold leading-none text-ink/[0.07] md:text-[150px]">404</p>
      <div class="-mt-8 md:-mt-12">
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Page not found</p>
        <h1 class="mt-2 display text-[28px] font-semibold md:text-[34px]">这页大概已经被卖掉了</h1>
        <p class="mx-auto mt-3 max-w-sm text-[12.5px] leading-relaxed text-ink2/80">
          链接可能过期，或者商品已经下架。回大厅看看，说不定有更合适的。
        </p>
        <div class="mt-7 flex flex-wrap justify-center gap-2">
          <router-link to="/market" class="btn btn-primary btn-sm"><Compass :size="14" /> 去商品大厅</router-link>
          <button class="btn btn-ghost btn-sm" @click="router.back()"><ArrowLeft :size="14" /> 返回上一页</button>
        </div>
      </div>
    </div>
  </div>
</template>
