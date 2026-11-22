<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bold, Check, ImagePlus, Italic, List, Plus, ScanEye, ShieldCheck, Sparkles, X } from 'lucide-vue-next'
import CategoryIcon from '@/components/CategoryIcon.vue'
import ProductArt from '@/components/ProductArt.vue'
import ModerationDrawer from '@/components/ModerationDrawer.vue'
import { categories } from '@/data/mock'
import type { Category, Condition, Product } from '@/types'

import { money, useMarketStore } from '@/stores/market'
import { useAgentStore, verdictMeta } from '@/stores/agent'
const market = useMarketStore()
const { addProduct, productById, toast, updateProduct } = market
const agent = useAgentStore()
const { checkPublish } = agent

const route = useRoute()
const router = useRouter()
const editId = computed(() => (route.query.edit ? String(route.query.edit) : ''))
const editing = computed(() => (editId.value ? productById(editId.value) : undefined))

const title = ref('')
const desc = ref('')
const price = ref('')
const original = ref('')
const category = ref<Category>('数码')
const condition = ref<Condition>('九成新')
const campus = ref('东校区')
const tags = ref<string[]>([])
const tagInput = ref('')
const methods = ref<string[]>(['校内面交'])
const agreed = ref(false)
const photos = ref<number[]>([0, 1])
const drawer = ref(false)

/** 审核 Agent：发布即预检，随输入实时更新 */
const findings = computed(() => checkPublish({ title: title.value, desc: desc.value, condition: condition.value }))
const blocked = computed(() => findings.value.some((f) => f.verdict === 'block'))
const topFindings = computed(() => [...findings.value].sort((a, b) => (a.verdict === 'block' ? -1 : b.verdict === 'block' ? 1 : 0)).slice(0, 3))

const conditions: Condition[] = ['全新', '几乎全新', '九成新', '七成新']
const campuses = ['东校区', '西校区', '南苑', '图书馆']
const suggestions = ['可小刀', '含配件', '可验机', '自提', '全新未拆', '毕业清仓']

onMounted(() => {
  if (!editing.value) return
  const p = editing.value
  title.value = p.title
  desc.value = p.desc
  price.value = String(p.price)
  original.value = String(p.original)
  category.value = p.category
  condition.value = p.condition
  campus.value = p.campus
  tags.value = [...p.tags]
})

const previewProduct = computed<Product>(() => ({
  id: 'preview',
  title: title.value || '给你的闲置起个标题',
  desc: desc.value,
  price: Number(price.value) || 0,
  original: Number(original.value) || Number(price.value) || 1,
  category: category.value,
  condition: condition.value,
  campus: campus.value,
  sellerId: editing.value?.sellerId ?? 'u0',
  createdAt: new Date().toISOString(),
  tags: tags.value,
  views: 0,
  likes: 0,
  status: 'on',
  seed: editing.value?.seed ?? 5,
}))

const suggested = computed(() => {
  const p = Number(price.value)
  if (!p) return '参考同类的定价，更容易成交'
  if (p < 50) return '一杯奶茶的价格，通常当天就能出掉'
  if (p < 300) return '这个价位在校园里比较好成交'
  return '高价值商品建议补充购买凭证和实拍图'
})

function addTag(value?: string) {
  const t = (value ?? tagInput.value).trim().replace(/^#/, '')
  if (!t) return
  if (tags.value.length >= 6) {
    toast('最多添加 6 个标签', 'warn')
    return
  }
  if (!tags.value.includes(t)) tags.value.push(t)
  tagInput.value = ''
}

function toggleMethod(m: string) {
  methods.value = methods.value.includes(m)
    ? methods.value.filter((x) => x !== m)
    : [...methods.value, m]
}

function addPhoto() {
  if (photos.value.length >= 5) {
    toast('最多上传 5 张图片', 'warn')
    return
  }
  photos.value.push(photos.value.length)
}

function wrapText(before: string, after = before) {
  const el = document.getElementById('desc-input') as HTMLTextAreaElement | null
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  desc.value = `${desc.value.slice(0, start)}${before}${desc.value.slice(start, end)}${after}${desc.value.slice(end)}`
  el.focus()
}

function submit() {
  if (!title.value.trim()) return toast('请填写商品标题', 'warn')
  if (!price.value || Number(price.value) <= 0) return toast('请填写合理的价格', 'warn')
  if (!desc.value.trim()) return toast('补充一点描述，成交会更快', 'warn')
  if (!agreed.value) return toast('请先确认发布规范', 'warn')
  if (blocked.value) {
    drawer.value = true
    return toast('审核 Agent 拦截：请先处理违禁或站外交易项', 'warn')
  }

  const payload = {
    title: title.value.trim(),
    desc: desc.value.trim(),
    price: Number(price.value),
    original: Number(original.value) || Number(price.value),
    category: category.value,
    condition: condition.value,
    campus: campus.value,
    tags: tags.value,
  }

  if (editing.value) {
    updateProduct(editing.value.id, payload)
    toast('修改已保存，等待重新审核')
  } else {
    addProduct(payload)
    toast('发布成功，审核通过后会出现在大厅')
  }
  router.push('/my/listings')
}
</script>

<template>
  <div class="wrap py-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 font-mono text-[10px] uppercase tracking-[0.26em] text-azure">
          {{ editing ? 'Edit listing' : 'New listing' }}
        </p>
        <h1 class="display text-[32px] font-semibold md:text-[40px]">{{ editing ? '编辑闲置' : '发布闲置' }}</h1>
        <p class="mt-2 max-w-lg text-[13px] leading-relaxed text-ink2/80">
          如实描述成色，能省掉一半的沟通成本。发布后需经过人工审核，通常 30 分钟内完成。
        </p>
      </div>
      <div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink3">
        <span class="flex items-center gap-1"><Check :size="11" class="text-teal" /> 实名才可发布</span>
        <span class="h-3 w-px bg-ink/15" />
        <span>每日上限 5 件</span>
      </div>
    </div>

    <div class="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <form class="space-y-8" @submit.prevent="submit">
        <!-- 图片 -->
        <section class="panel p-5 md:p-6">
          <div class="mb-4 flex items-baseline justify-between">
            <h2 class="font-serif text-[15px] font-semibold">商品图片 <span class="text-azure">*</span></h2>
            <span class="font-mono text-[10px] text-ink3">{{ photos.length }}/5 · 第一张为封面</span>
          </div>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <div v-for="(ph, i) in photos" :key="ph" class="group relative overflow-hidden rounded-xl border border-ink/15">
              <div class="aspect-square">
                <ProductArt :product="previewProduct" :variant="i" />
              </div>
              <span v-if="i === 0" class="absolute left-1.5 top-1.5 rounded bg-ink/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-haze">封面</span>
              <button
                type="button"
                class="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-haze/90 text-ink opacity-0 transition group-hover:opacity-100"
                aria-label="移除图片"
                @click="photos = photos.filter((x) => x !== ph)"
              >
                <X :size="11" />
              </button>
            </div>
            <button
              v-if="photos.length < 5"
              type="button"
              class="grid aspect-square place-items-center rounded-xl border border-dashed border-ink/25 text-ink3 transition hover:border-ink/50 hover:bg-haze2/50"
              @click="addPhoto"
            >
              <span class="flex flex-col items-center gap-1.5">
                <ImagePlus :size="20" :stroke-width="1.4" />
                <span class="text-[10.5px]">添加图片</span>
              </span>
            </button>
          </div>
          <p class="mt-3 font-mono text-[10px] text-ink3">
            演示环境使用程序生成的示意封面；真实产品在此处接入图片上传。
          </p>
        </section>

        <!-- 基本信息 -->
        <section class="panel space-y-5 p-5 md:p-6">
          <h2 class="font-serif text-[15px] font-semibold">基本信息</h2>

          <div>
            <label class="label" for="title">标题 <span class="text-azure">*</span></label>
            <input
              id="title"
              v-model="title"
              maxlength="30"
              class="field"
              placeholder="例如：iPad Air 5 · 64G 深空灰 · 含原装充电器"
            />
            <div class="mt-1.5 flex justify-between font-mono text-[10px] text-ink3">
              <span>写明品牌、型号与关键配件</span>
              <span>{{ title.length }}/30</span>
            </div>
          </div>

          <div>
            <label class="label">分类 <span class="text-azure">*</span></label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in categories"
                :key="c.name"
                type="button"
                class="chip"
                :class="{ 'chip-on': category === c.name }"
                @click="category = c.name"
              >
                <CategoryIcon :name="c.name" :size="13" /> {{ c.name }}
              </button>
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label">成色 <span class="text-azure">*</span></label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="c in conditions"
                  :key="c"
                  type="button"
                  class="chip !px-3 !py-1.5 !text-[12px]"
                  :class="{ 'chip-on': condition === c }"
                  @click="condition = c"
                >
                  {{ c }}
                </button>
              </div>
            </div>
            <div>
              <label class="label" for="campus">交易校区</label>
              <select id="campus" v-model="campus" class="field cursor-pointer">
                <option v-for="c in campuses" :key="c">{{ c }}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 描述 -->
        <section class="panel p-5 md:p-6">
          <div class="mb-3 flex items-baseline justify-between">
            <h2 class="font-serif text-[15px] font-semibold">详细描述 <span class="text-azure">*</span></h2>
            <span class="font-mono text-[10px] text-ink3">{{ desc.length }}/1000</span>
          </div>
          <div class="flex items-center gap-1 rounded-t-xl border border-b-0 border-ink/15 bg-haze2/50 px-2 py-1.5">
            <button type="button" class="grid h-7 w-7 place-items-center rounded text-ink3 hover:bg-haze hover:text-ink" aria-label="加粗" @click="wrapText('**')">
              <Bold :size="13" />
            </button>
            <button type="button" class="grid h-7 w-7 place-items-center rounded text-ink3 hover:bg-haze hover:text-ink" aria-label="斜体" @click="wrapText('_')">
              <Italic :size="13" />
            </button>
            <button type="button" class="grid h-7 w-7 place-items-center rounded text-ink3 hover:bg-haze hover:text-ink" aria-label="列表" @click="wrapText('\n- ', '')">
              <List :size="13" />
            </button>
            <span class="ml-auto font-mono text-[9px] uppercase tracking-widest text-ink3">Markdown</span>
          </div>
          <textarea
            id="desc-input"
            v-model="desc"
            maxlength="1000"
            rows="7"
            class="field !rounded-t-none"
            placeholder="购买时间、使用频率、瑕疵位置、配件清单……写得越具体，越容易被信任。"
          />
        </section>

        <!-- 定价 -->
        <section class="panel p-5 md:p-6">
          <h2 class="mb-4 font-serif text-[15px] font-semibold">价格与标签</h2>
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label" for="price">出售价 <span class="text-azure">*</span></label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-ink3">¥</span>
                <input id="price" v-model="price" type="number" min="0" class="field !pl-9 font-display !text-lg" placeholder="0" />
              </div>
            </div>
            <div>
              <label class="label" for="original">原价</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-ink3">¥</span>
                <input id="original" v-model="original" type="number" min="0" class="field !pl-9 font-display !text-lg" placeholder="选填" />
              </div>
            </div>
          </div>
          <p class="mt-3 flex items-start gap-1.5 rounded-lg bg-cyan/10 px-3 py-2 text-[11.5px] text-ink2">
            <Sparkles :size="12" class="mt-0.5 shrink-0 text-cyan" /> {{ suggested }}
          </p>

          <div class="mt-5">
            <label class="label" for="tag">标签（最多 6 个）</label>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <span v-for="t in tags" :key="t" class="tag !border-ink/25 !bg-haze">
                # {{ t }}
                <button type="button" aria-label="移除标签" @click="tags = tags.filter((x) => x !== t)"><X :size="10" /></button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                id="tag"
                v-model="tagInput"
                class="field !py-2.5"
                placeholder="输入后回车添加，如「含充电器」"
                @keydown.enter.prevent="addTag()"
              />
              <button type="button" class="btn btn-ghost btn-sm shrink-0 !rounded-xl" @click="addTag()">
                <Plus :size="13" /> 添加
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="s in suggestions"
                :key="s"
                type="button"
                class="rounded-full border border-dashed border-ink/20 px-2.5 py-1 text-[11px] text-ink3 transition hover:border-ink/40 hover:text-ink"
                @click="addTag(s)"
              >
                + {{ s }}
              </button>
            </div>
          </div>
        </section>

        <!-- 交易方式 -->
        <section class="panel p-5 md:p-6">
          <h2 class="mb-4 font-serif text-[15px] font-semibold">交易方式</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            <button
              v-for="m in ['校内面交', '自提']"
              :key="m"
              type="button"
              class="flex items-start gap-3 rounded-xl border p-4 text-left transition"
              :class="methods.includes(m) ? 'border-teal bg-teal/[0.06]' : 'border-ink/10 hover:border-ink/25'"
              @click="toggleMethod(m)"
            >
              <span class="mt-0.5 grid h-4 w-4 place-items-center rounded-full border" :class="methods.includes(m) ? 'border-teal bg-teal text-haze' : 'border-ink/25'">
                <Check v-if="methods.includes(m)" :size="10" :stroke-width="3" />
              </span>
              <span>
                <span class="block text-[13px] font-medium">{{ m }}</span>
                <span class="mt-0.5 block text-[11px] leading-relaxed text-ink3">
                  {{ m === '校内面交' ? '约在图书馆、食堂等公共区域' : '买家到指定宿舍楼自取' }}
                </span>
              </span>
            </button>
          </div>

          <label class="mt-5 flex cursor-pointer items-start gap-2.5">
            <input v-model="agreed" type="checkbox" class="mt-0.5 accent-azure" />
            <span class="text-[11.5px] leading-relaxed text-ink3">
              我确认商品描述真实，不发布违禁品、不引导站外交易，并同意
              <span class="text-ink underline decoration-ink/30 underline-offset-2">《谦价社区发布规范》</span>。
            </span>
          </label>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="btn btn-ghost" @click="router.back()">取消</button>
            <button type="submit" class="btn btn-primary !px-8">{{ editing ? '保存修改' : '发布闲置' }}</button>
          </div>
        </section>
      </form>

      <aside class="space-y-4 lg:sticky lg:top-32">
        <!-- 审核 Agent 预检 -->
        <div class="hud-panel p-4">
          <div class="flex items-center gap-2">
            <span class="grid h-7 w-7 place-items-center rounded-lg border border-azure/25 bg-white/70 text-azure">
              <ShieldCheck :size="14" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[12.5px] font-medium">发布预检</p>
              <p class="font-mono text-[9px] uppercase tracking-[0.14em] text-ink3">review agent · sync</p>
            </div>
            <span
              class="rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold"
              :class="findings[0] ? verdictMeta[findings[0].verdict].cls : 'border-teal/30 text-teal'"
            >
              {{ findings[0] ? verdictMeta[findings[0].verdict].label : 'PASS' }}
            </span>
          </div>

          <ul class="mt-3 space-y-2">
            <li v-for="f in topFindings" :key="f.id" class="rounded-lg border border-azure/10 bg-white/60 px-2.5 py-2">
              <div class="flex items-center gap-1.5">
                <span class="font-mono text-[8.5px] font-semibold" :class="f.verdict === 'block' ? 'text-azure' : f.verdict === 'suggest' ? 'text-cyan' : 'text-teal'">{{ verdictMeta[f.verdict].label }}</span>
                <span class="font-mono text-[8.5px] text-ink3">{{ f.rule }}</span>
              </div>
              <p class="mt-1 text-[10.5px] leading-relaxed text-ink2">{{ f.message }}</p>
              <p v-if="f.fix" class="mt-1 text-[10px] leading-relaxed text-azure">{{ f.fix }}</p>
            </li>
          </ul>

          <button type="button" class="btn btn-sm btn-ghost mt-3 w-full" @click="drawer = true">
            <ScanEye :size="12" /> 展开审查台
          </button>
        </div>

        <!-- 预览 -->
        <div class="mb-3 flex items-center justify-between">
          <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-ink3">Live preview</p>
          <span class="tag">实时预览</span>
        </div>
        <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4 shadow-tag">
          <div class="overflow-hidden rounded-xl border border-ink/10">
            <div class="aspect-[4/3]">
              <ProductArt :product="previewProduct" :variant="0" />
            </div>
          </div>
          <h3 class="mt-3 line-clamp-2 font-serif text-[15px] font-semibold">{{ previewProduct.title }}</h3>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="display text-2xl font-semibold">¥{{ money(previewProduct.price) }}</span>
            <span class="font-mono text-[10px] text-ink3 line-through">¥{{ money(previewProduct.original) }}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <span class="tag !text-[9px]">{{ category }}</span>
            <span class="tag !text-[9px]">{{ condition }}</span>
            <span class="tag !text-[9px]">{{ campus }}</span>
          </div>
          <p class="mt-3 line-clamp-3 border-t border-dashed border-ink/15 pt-3 text-[11.5px] leading-relaxed text-ink3">
            {{ desc || '商品描述会显示在这里，补充成色与配件信息更容易成交。' }}
          </p>
        </div>

        <div class="mt-4 rounded-xl border border-ink/10 bg-haze2/40 p-4">
          <p class="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">发布小贴士</p>
          <ul class="space-y-1.5 text-[11px] leading-relaxed text-ink2">
            <li>· 首图尽量用干净背景，成交率更高</li>
            <li>· 主动说明瑕疵，能减少一半纠纷</li>
            <li>· 定价参考同类商品，留一点议价空间</li>
          </ul>
        </div>
      </aside>
    </div>

    <ModerationDrawer :open="drawer" :findings="findings" title="审核台 · 发布预检" @close="drawer = false" />
  </div>
</template>
