import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useErrorStore } from '@/stores/error'
import { useMarketStore } from '@/stores/market'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const errors = useErrorStore(pinia)
const market = useMarketStore(pinia)

/**
 * 全局兜底：错误边界没接住的异常（组件事件、watch、生命周期）统一进错误商店，
 * 同时给一次轻提示，避免用户以为按钮没反应。
 */
app.config.errorHandler = (error, _instance, info) => {
  errors.report(error, `vue:${info}`)
  market.toast('页面出现异常，已记录，可重试', 'warn')
}

/** 路由懒加载 chunk 拉取失败（弱网/发版）单独走一条记录，便于区分 */
router.onError((error) => {
  errors.report(error, 'router')
  market.toast('页面加载失败，请检查网络后重试', 'warn')
})

window.addEventListener('unhandledrejection', (event) => {
  errors.report(event.reason, 'window:unhandledrejection')
})

window.addEventListener('error', (event) => {
  errors.report(event.error ?? event.message, 'window:error')
})

app.mount('#app')
