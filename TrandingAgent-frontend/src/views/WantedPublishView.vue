<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-vue-next'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { categories } from '@/data/mock'
import type { Category } from '@/types'

import { useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { addWanted, toast } = market

const router = useRouter()
const title = ref('')
const budget = ref('')
const desc = ref('')
const category = ref<Category>('书籍')
const deadline = ref('一周内')
const agreed = ref(false)

const ready = computed(() => title.value.trim() && Number(budget.value) > 0 && desc.value.trim())

function submit() {
  if (!title.value.trim()) return toast('请填写求购物品名称', 'warn')
  if (!budget.value || Number(budget.value) <= 0) return toast('请填写一个期望价格', 'warn')
  if (!desc.value.trim()) return toast('补充一点细节，更容易被回应', 'warn')
  if (!agreed.value) return toast('请先确认求购规范', 'warn')
  const w = addWanted({
    title: title.value.trim(),
    budget: Number(budget.value),
    desc: desc.value.trim(),
    category: category.value,
  })
  toast('求购已发布，有货的同学会来找你')
  router.push({ path: '/wanted', hash: `#${w.id}` })
}
</script>

<template>
  <div class="wrap py-8">
    <button class="mb-6 flex items-center gap-1.5 text-[12px] text-ink3 transition hover:text-ink" @click="router.back()">
      <ArrowLeft :size="13" /> 返回求购大厅
    </button>

    <div class="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Post a request</p>
        <h1 class="mt-2 display text-[32px] font-semibold md:text-[40px]">发布求购</h1>
        <p class="mt-2 max-w-lg text-[13px] leading-relaxed text-ink2/80">
          把需求说清楚：要什么、什么版本、能接受什么价位。求购信息会在大厅展示 14 天。
        </p>

        <form class="mt-7 space-y-4" @submit.prevent="submit">
          <section class="panel p-5 md:p-6">
            <div>
              <label class="label" for="wtitle">求购物品 <span class="text-azure">*</span></label>
              <input
                id="wtitle"
                v-model="title"
                maxlength="30"
                class="field"
                placeholder="例如：求购《线性代数》同济七版 + 习题册"
              />
              <p class="mt-1.5 text-right font-mono text-[10px] text-ink3">{{ title.length }}/30</p>
            </div>

            <div class="mt-4">
              <label class="label">分类</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="c in categories"
                  :key="c.name"
                  type="button"
                  class="chip"
                  :class="{ 'chip-on': category === c.name }"
                  @click="category = c.name"
                >
                  <CategoryIcon :name="c.name" :size="12" /> {{ c.name }}
                </button>
              </div>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label" for="budget">期望价格 <span class="text-azure">*</span></label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-ink3">¥</span>
                  <input id="budget" v-model="budget" type="number" min="0" class="field !pl-9 font-display !text-lg" placeholder="0" />
                </div>
              </div>
              <div>
                <label class="label" for="deadline">希望多久内收到</label>
                <select id="deadline" v-model="deadline" class="field cursor-pointer">
                  <option v-for="d in ['三天内', '一周内', '两周内', '不着急']" :key="d">{{ d }}</option>
                </select>
              </div>
            </div>
          </section>

          <section class="panel p-5 md:p-6">
            <label class="label" for="wdesc">详细描述 <span class="text-azure">*</span></label>
            <textarea
              id="wdesc"
              v-model="desc"
              rows="5"
              maxlength="300"
              class="field resize-none"
              placeholder="版本、成色要求、可接受的小瑕疵、你能来取的时间段……"
            />
            <div class="mt-1.5 flex justify-between font-mono text-[10px] text-ink3">
              <span>写得越具体，回应越精准</span>
              <span>{{ desc.length }}/300</span>
            </div>

            <div class="mt-4 flex flex-wrap gap-1.5">
              <button
                v-for="q in ['可接受轻微使用痕迹', '需要有笔记', '可自提', '价格可小刀']"
                :key="q"
                type="button"
                class="rounded-full border border-dashed border-ink/20 px-2.5 py-1 text-[10.5px] text-ink3 transition hover:border-ink/40 hover:text-ink"
                @click="desc = desc ? `${desc}；${q}` : q"
              >
                + {{ q }}
              </button>
            </div>
          </section>

          <section class="panel p-5 md:p-6">
            <label class="flex cursor-pointer items-start gap-2.5">
              <input v-model="agreed" type="checkbox" class="mt-0.5 accent-azure" />
              <span class="text-[11.5px] leading-relaxed text-ink3">
                我确认求购内容真实，不发布违规或代写、代考等需求，并同意
                <span class="text-ink underline decoration-ink/30 underline-offset-2">《求购发布规范》</span>。
              </span>
            </label>
            <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" class="btn btn-ghost" @click="router.back()">取消</button>
              <button type="submit" class="btn btn-primary !px-8">
                发布求购 <ArrowRight :size="14" />
              </button>
            </div>
          </section>
        </form>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-32">
        <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
          <p class="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">Preview</p>
          <div class="rounded-xl border border-ink/10 bg-haze p-4">
            <span class="flex w-fit items-center gap-1 rounded-full bg-haze2 px-2 py-1 font-mono text-[9px]">
              <CategoryIcon :name="category" :size="10" /> {{ category }}
            </span>
            <h3 class="mt-2.5 font-serif text-[14px] font-semibold leading-snug">{{ title || '求购物品名称' }}</h3>
            <p class="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-ink3">{{ desc || '详细描述会显示在这里。' }}</p>
            <div class="mt-3 border-t border-dashed border-ink/15 pt-2.5">
              <p class="font-mono text-[8px] uppercase tracking-wider text-ink3">期望价格</p>
              <p class="display text-[20px] font-semibold text-azure">≤ ¥{{ budget || '0' }}</p>
            </div>
          </div>
          <p class="mt-3 flex items-center gap-1 text-[10.5px]" :class="ready ? 'text-teal' : 'text-ink3'">
            <Check :size="11" /> {{ ready ? '信息完整，可以发布了' : '补充完整后发布效果更好' }}
          </p>
        </div>

        <div class="rounded-2xl border border-ink/10 bg-ink p-5 text-haze">
          <Sparkles :size="16" class="text-cyan" />
          <p class="mt-3 font-serif text-[13.5px] leading-relaxed">
            “一句‘随便收’，<br />通常收不到任何回应。”
          </p>
          <p class="mt-2 font-mono text-[9px] uppercase tracking-widest text-haze/40">求购经验 · 来自 42 条成功求购</p>
        </div>
      </aside>
    </div>
  </div>
</template>
