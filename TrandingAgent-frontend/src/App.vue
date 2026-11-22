<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import ToastHost from '@/components/ToastHost.vue'

const route = useRoute()
/** 后台自带侧边栏骨架，不再套用前台页头页脚 */
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <AppShell v-if="!isAdmin">
    <!-- 按路径重建边界：切页即恢复，单页崩溃不影响页头页脚 -->
    <ErrorBoundary :key="route.path" title="页面">
      <RouterView />
    </ErrorBoundary>
  </AppShell>
  <ErrorBoundary v-else :key="route.path" title="后台页面">
    <RouterView />
  </ErrorBoundary>
  <ToastHost />
</template>
