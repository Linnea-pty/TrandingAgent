<script setup lang="ts">
import { computed, ref } from 'vue'
import { ImagePlus, Megaphone, Plus, Save, Trash2 } from 'lucide-vue-next'
import type { Banner } from '@/types'

import { useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { state, toast } = market

const toneMap: Record<string, string> = {
  teal: 'bg-teal',
  azure: 'bg-azure',
  cyan: 'bg-cyan',
}
const online = computed(() => state.banners.filter((b) => b.on).length)
const draftNotice = ref('')

function saveBanner(b: Banner) {
  if (!b.title.trim()) return toast('轮播标题不能为空', 'warn')
  toast('轮播图配置已保存')
}

function toggleBanner(b: Banner) {
  b.on = !b.on
  toast(b.on ? '轮播图已上线' : '轮播图已下线', b.on ? 'ok' : 'warn')
}

function addBanner() {
  state.banners = [
    ...state.banners,
    { id: `b${Date.now()}`, title: '新的校园活动', sub: '在这里填写活动说明', tone: 'teal', on: false },
  ]
  toast('已新增一张轮播图草稿')
}

function removeBanner(id: string) {
  state.banners = state.banners.filter((b) => b.id !== id)
  toast('轮播图已删除', 'warn')
}

function addNotice() {
  const text = draftNotice.value.trim()
  if (!text) return toast('请输入公告内容', 'warn')
  state.notices = [
    { id: `n${Date.now()}`, text, time: '刚刚发布' },
    ...state.notices,
  ]
  draftNotice.value = ''
  toast('公告已发布，首页跑马灯会立即更新')
}

function removeNotice(id: string) {
  state.notices = state.notices.filter((n) => n.id !== id)
  toast('公告已撤下', 'warn')
}
</script>

<template>
  <div class="space-y-4">
    <!-- 轮播 -->
    <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="flex items-center gap-1.5 font-serif text-[15px] font-semibold"><ImagePlus :size="15" class="text-ink3" /> 首页轮播</h2>
          <p class="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink3">{{ online }} / {{ state.banners.length }} 张在线</p>
        </div>
        <button class="btn btn-primary btn-sm" @click="addBanner"><Plus :size="13" /> 新增轮播</button>
      </div>

      <div class="mt-4 space-y-2.5">
        <article
          v-for="b in state.banners"
          :key="b.id"
          class="rounded-xl border border-ink/10 bg-haze/60 p-3.5"
        >
          <div class="flex flex-wrap items-center gap-3">
            <span class="h-10 w-16 shrink-0 rounded-lg" :class="toneMap[b.tone] ?? 'bg-ink'" />
            <div class="min-w-0 flex-1">
              <input
                v-model="b.title"
                class="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-[13px] font-medium outline-none transition hover:border-ink/10 focus:border-ink/30 focus:bg-white"
              />
              <input
                v-model="b.sub"
                class="mt-0.5 w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-[11px] text-ink3 outline-none transition hover:border-ink/10 focus:border-ink/30 focus:bg-white"
              />
            </div>

            <button
              class="relative h-6 w-11 shrink-0 rounded-full transition"
              :class="b.on ? 'bg-teal' : 'bg-ink/20'"
              role="switch"
              :aria-checked="b.on"
              @click="toggleBanner(b)"
            >
              <span
                class="absolute top-0.5 h-5 w-5 rounded-full bg-haze shadow transition-all"
                :class="b.on ? 'left-[22px]' : 'left-0.5'"
              />
            </button>

            <div class="flex gap-1">
              <button class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px]" @click="saveBanner(b)">
                <Save :size="10" /> 保存
              </button>
              <button class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px] !text-azure" @click="removeBanner(b.id)">
                <Trash2 :size="10" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 公告 -->
      <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
        <h2 class="flex items-center gap-1.5 font-serif text-[15px] font-semibold"><Megaphone :size="15" class="text-ink3" /> 校园公告</h2>
        <p class="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink3">显示在顶部跑马灯</p>

        <div class="mt-3 flex gap-2">
          <input
            v-model="draftNotice"
            class="field !py-2 !text-[12px]"
            placeholder="输入新公告，例如「本周六面交点调整」"
            @keydown.enter="addNotice"
          />
          <button class="btn btn-primary btn-sm shrink-0" @click="addNotice"><Plus :size="13" /></button>
        </div>

        <ul class="mt-3 space-y-2">
          <li v-for="n in state.notices" :key="n.id" class="flex items-start gap-2 rounded-xl border border-ink/10 bg-haze/60 p-2.5">
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-azure" />
            <div class="min-w-0 flex-1">
              <p class="text-[11.5px] leading-relaxed text-ink2">{{ n.text }}</p>
              <p class="mt-0.5 font-mono text-[9px] text-ink3">{{ n.time }}</p>
            </div>
            <button class="text-ink3 transition hover:text-azure" aria-label="删除公告" @click="removeNotice(n.id)">
              <Trash2 :size="12" />
            </button>
          </li>
        </ul>
      </section>

      <!-- 预览 -->
      <section class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
        <h2 class="font-serif text-[15px] font-semibold">首页预览</h2>
        <p class="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink3">仅展示已上线的轮播</p>
        <div class="mt-3 space-y-2">
          <div
            v-for="b in state.banners.filter((x) => x.on)"
            :key="b.id"
            class="relative overflow-hidden rounded-xl px-4 py-5 text-haze"
            :class="toneMap[b.tone] ?? 'bg-ink'"
          >
            <div class="absolute -right-8 -top-10 h-24 w-24 rounded-full border border-haze/25" />
            <p class="relative font-serif text-[14px] font-semibold">{{ b.title }}</p>
            <p class="relative mt-1 line-clamp-1 text-[10.5px] text-haze/75">{{ b.sub }}</p>
          </div>
          <p v-if="!online" class="rounded-xl border border-dashed border-ink/20 py-10 text-center text-[11.5px] text-ink3">
            当前没有在线轮播，首页将使用默认视觉
          </p>
        </div>
        <p class="mt-3 font-mono text-[9px] leading-relaxed text-ink3">
          提示：线上修改会立即写入本地演示数据，刷新后保留。
        </p>
      </section>
    </div>
  </div>
</template>
