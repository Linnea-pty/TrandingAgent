<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Home, RotateCcw, TriangleAlert } from 'lucide-vue-next'
import { useErrorStore } from '@/stores/error'

const props = withDefaults(
  defineProps<{
    /** 出错区域标题，默认「这个区域」 */
    title?: string
    /** 紧凑模式：用于侧栏、抽屉等小容器 */
    compact?: boolean
  }>(),
  { title: '这个区域', compact: false },
)

const router = useRouter()
const errors = useErrorStore()

const failed = ref<string | null>(null)
const detail = ref('')
const retryKey = ref(0)

/**
 * 捕获子树内的渲染/生命周期/事件异常。
 * 返回 false 阻止继续冒泡到 app.config.errorHandler，避免同一条错误被记录两次。
 */
onErrorCaptured((error, _instance, info) => {
  failed.value = error instanceof Error ? error.message : String(error)
  detail.value = info
  errors.report(error, `boundary:${props.title}:${info}`)
  return false
})

function retry() {
  failed.value = null
  detail.value = ''
  retryKey.value += 1
}

function goHome() {
  failed.value = null
  detail.value = ''
  void router.push('/')
}

async function copyDiagnostics() {
  const payload = [
    `区域：${props.title}`,
    `信息：${failed.value ?? ''}`,
    `阶段：${detail.value || '未知'}`,
    `记录编号：#${errors.latest?.id ?? '-'}`,
    `时间：${errors.latest?.at ?? '-'}`,
  ].join('\n')
  try {
    await navigator.clipboard.writeText(payload)
  } catch {
    /* 非安全上下文或拒绝授权时静默，用户仍可肉眼查看 */
  }
}
</script>

<template>
  <div v-if="failed" :class="compact ? 'p-3' : 'wrap py-16'">
    <div class="hud-panel mx-auto max-w-xl p-5">
      <div class="flex items-start gap-3">
        <span class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-azure/25 bg-azure/[0.08] text-azure">
          <TriangleAlert :size="16" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="mono-label text-azure">RUNTIME FAULT</p>
          <h2 class="mt-1 font-display text-lg font-semibold text-ink">{{ title }}出了点问题</h2>
          <p class="mt-1 text-[12.5px] leading-relaxed text-ink3">
            页面其余部分仍可使用。重试只重建这一块，不会刷新整页或丢失已填内容。
          </p>
        </div>
      </div>

      <dl class="mt-4 grid gap-1.5 rounded-xl border border-line/70 bg-haze/50 px-3 py-2.5 font-mono text-[10.5px]">
        <div class="flex gap-2">
          <dt class="shrink-0 text-ink3">MESSAGE</dt>
          <dd class="min-w-0 flex-1 break-words text-ink2">{{ failed }}</dd>
        </div>
        <div v-if="detail" class="flex gap-2">
          <dt class="shrink-0 text-ink3">PHASE</dt>
          <dd class="text-ink2">{{ detail }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="shrink-0 text-ink3">TRACE</dt>
          <dd class="text-ink2">#{{ errors.latest?.id ?? '-' }} · 已记录到全局错误商店</dd>
        </div>
      </dl>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" class="btn-primary" @click="retry">
          <RotateCcw :size="13" /> 重试这一块
        </button>
        <button type="button" class="btn-ghost" @click="goHome">
          <Home :size="13" /> 回首页
        </button>
        <button type="button" class="ml-auto font-mono text-[10.5px] text-ink3 underline-offset-2 hover:text-azure hover:underline" @click="copyDiagnostics">
          复制诊断信息
        </button>
      </div>
    </div>
  </div>

  <div v-else :key="retryKey">
    <slot />
  </div>
</template>
