<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'

const groups = [
  {
    title: '逛逛',
    links: [
      { label: '商品大厅', to: '/market' },
      { label: '求购大厅', to: '/wanted' },
      { label: '校园广场', to: '/square' },
      { label: '发布闲置', to: '/publish' },
    ],
  },
  {
    title: '我的',
    links: [
      { label: '个人主页', to: '/profile' },
      { label: '我的订单', to: '/orders' },
      { label: '我的收藏', to: '/favorites' },
      { label: '信用与评价', to: '/credit' },
    ],
  },
  {
    title: '保障',
    links: [
      { label: '实名认证', to: '/verify' },
      { label: '账号安全', to: '/security' },
      { label: '交易安全指南', to: '/square' },
      { label: '运营后台', to: '/admin' },
    ],
  },
]
</script>

<template>
  <footer class="mt-24 border-t border-ink/10 bg-haze2/50">
    <div class="wrap grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="grid h-9 w-9 -rotate-3 place-items-center rounded-[6px] bg-ink font-serif text-base text-cyan">谦</span>
          <span class="display text-xl font-semibold">谦价</span>
        </div>
        <p class="mt-4 max-w-xs font-serif text-[13px] leading-relaxed text-ink2/85">
          以谦让之心，让闲置有价。<br />
          只属于校园的二手交易与互助社区。
        </p>
        <div class="mt-5 inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-haze/70 px-3 py-2">
          <ShieldCheck :size="15" class="text-teal" />
          <span class="text-[11px] text-ink2">实名校园 · 校内面交 · 全程留痕</span>
        </div>
      </div>

      <div v-for="g in groups" :key="g.title">
        <p class="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ink3">{{ g.title }}</p>
        <ul class="space-y-2.5">
          <li v-for="l in g.links" :key="l.to">
            <router-link :to="l.to" class="text-[13px] text-ink2 transition hover:text-azure">{{ l.label }}</router-link>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-ink/10">
      <div class="wrap flex flex-col items-start justify-between gap-2 py-5 font-mono text-[10px] uppercase tracking-wider text-ink3 sm:flex-row sm:items-center">
        <span>© 2026 QIANJIA · 校园二手交易平台</span>
        <span class="normal-case tracking-normal">演示项目 · 所有用户与商品信息均为虚构</span>
      </div>
    </div>
  </footer>
</template>
