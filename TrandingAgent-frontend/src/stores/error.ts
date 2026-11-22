import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** 一条被捕获的错误记录，供错误边界与全局处理器共用 */
export interface AppError {
  id: number
  message: string
  stack?: string
  context: string
  at: string
}

const MAX_RECORDS = 20
const DEDUPE_WINDOW = 3000

/** 全局错误商店：只负责收集与暴露最近错误，不参与业务状态 */
export const useErrorStore = defineStore('error', () => {
  const records = ref<AppError[]>([])
  let seq = 0
  let lastKey = ''
  let lastAt = 0

  const latest = computed<AppError | undefined>(() => records.value[0])

  /**
   * 记录一次错误。
   * 相同 message + context 在 3s 内只记一条，避免渲染异常在 watch 中反复触发造成刷屏。
   */
  function report(error: unknown, context = 'unknown') {
    const message = error instanceof Error ? error.message : String(error)
    const key = `${context}|${message}`
    const now = Date.now()
    if (key === lastKey && now - lastAt < DEDUPE_WINDOW) return
    lastKey = key
    lastAt = now

    records.value = [
      {
        id: ++seq,
        message,
        stack: error instanceof Error ? error.stack : undefined,
        context,
        at: new Date().toISOString(),
      },
      ...records.value,
    ].slice(0, MAX_RECORDS)
  }

  function clear() {
    records.value = []
    lastKey = ''
    lastAt = 0
  }

  return { records, latest, report, clear }
})
