<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Lock, Star, ThumbsUp } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ProductArt from '@/components/ProductArt.vue'
import { money, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { orderById, productById, state, submitReview, toast, userById } = market

const route = useRoute()
const router = useRouter()

const order = computed(() => orderById(String(route.params.id)))
const product = computed(() => (order.value ? productById(order.value.productId) : undefined))
const peer = computed(() => {
  if (!order.value) return undefined
  return userById(order.value.buyerId === state.userId ? order.value.sellerId : order.value.buyerId)
})

const itemRating = ref(5)
const serviceRating = ref(5)
const hoverItem = ref(0)
const hoverService = ref(0)
const chosenTags = ref<string[]>([])
const text = ref('')
const anonymous = ref(false)

const tags = ['描述相符', '守时', '沟通顺畅', '物超所值', '包装用心', '态度友好', '还会再来']

function toggleTag(t: string) {
  chosenTags.value = chosenTags.value.includes(t)
    ? chosenTags.value.filter((x) => x !== t)
    : [...chosenTags.value, t]
}

function submit() {
  if (!order.value) return
  if (!text.value.trim()) return toast('写两句真实感受，能帮到其他同学', 'warn')
  submitReview(order.value.id, Math.round((itemRating.value + serviceRating.value) / 2), text.value.trim(), chosenTags.value)
  router.push('/orders')
}
</script>

<template>
  <div v-if="order" class="wrap py-8">
    <button class="mb-5 flex items-center gap-1.5 text-[12px] text-ink3 transition hover:text-ink" @click="router.back()">
      <ArrowLeft :size="13" /> 返回
    </button>

    <div class="max-w-2xl">
      <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Leave a review</p>
      <h1 class="mt-2 display text-[32px] font-semibold md:text-[38px]">评价这笔交易</h1>
      <p class="mt-2 text-[13px] leading-relaxed text-ink2/80">
        真实的评价是校园信用的基础。评价会同时影响商品排序与对方的信用分。
      </p>
    </div>

    <div class="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div class="space-y-4">
        <!-- 商品摘要 -->
        <section class="panel flex gap-4 p-4">
          <div v-if="product" class="h-[88px] w-[116px] shrink-0 overflow-hidden rounded-xl border border-ink/10">
            <ProductArt :product="product" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="line-clamp-1 font-serif text-[14.5px] font-semibold">{{ product?.title }}</h2>
            <p class="mt-1 font-mono text-[10.5px] text-ink3">成交价 ¥{{ money(order.price) }} · {{ order.method }}</p>
            <div class="mt-2 flex items-center gap-2">
              <Avatar :user="peer" size="xs" show-verified />
              <span class="text-[11px] text-ink2">{{ peer?.name }}</span>
              <span class="font-mono text-[10px] text-ink3">· 信用 {{ peer?.credit }}</span>
            </div>
          </div>
        </section>

        <!-- 打分 -->
        <section class="panel p-6">
          <h2 class="font-serif text-[15px] font-semibold">这次交易怎么样？</h2>

          <div class="mt-5 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-[13px] font-medium">商品满意度</p>
                <p class="mt-0.5 text-[11px] text-ink3">成色、功能是否与描述一致</p>
              </div>
              <div class="flex items-center gap-1" @mouseleave="hoverItem = 0">
                <button
                  v-for="i in 5"
                  :key="i"
                  class="transition hover:scale-110"
                  :aria-label="`${i} 星`"
                  @mouseenter="hoverItem = i"
                  @click="itemRating = i"
                >
                  <Star
                    :size="28"
                    :stroke-width="1.3"
                    :class="i <= (hoverItem || itemRating) ? 'fill-cyan text-cyan' : 'text-ink/20'"
                  />
                </button>
                <span class="ml-2 w-10 font-mono text-[11px] text-ink3">{{ hoverItem || itemRating }}.0</span>
              </div>
            </div>

            <div class="hairline" />

            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-[13px] font-medium">交易体验</p>
                <p class="mt-0.5 text-[11px] text-ink3">沟通、守时与整体感受</p>
              </div>
              <div class="flex items-center gap-1" @mouseleave="hoverService = 0">
                <button
                  v-for="i in 5"
                  :key="i"
                  class="transition hover:scale-110"
                  :aria-label="`${i} 星`"
                  @mouseenter="hoverService = i"
                  @click="serviceRating = i"
                >
                  <Star
                    :size="28"
                    :stroke-width="1.3"
                    :class="i <= (hoverService || serviceRating) ? 'fill-cyan text-cyan' : 'text-ink/20'"
                  />
                </button>
                <span class="ml-2 w-10 font-mono text-[11px] text-ink3">{{ hoverService || serviceRating }}.0</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 标签与文字 -->
        <section class="panel p-6">
          <h2 class="font-serif text-[15px] font-semibold">选几个标签</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="t in tags"
              :key="t"
              class="chip"
              :class="{ 'chip-on': chosenTags.includes(t) }"
              @click="toggleTag(t)"
            >
              <ThumbsUp :size="11" /> {{ t }}
            </button>
          </div>

          <h2 class="mt-6 font-serif text-[15px] font-semibold">写点具体的</h2>
          <textarea
            v-model="text"
            rows="5"
            maxlength="300"
            class="field mt-3 resize-none"
            placeholder="东西和描述一样吗？面交顺利吗？对其他同学有什么建议？"
          />
          <div class="mt-1.5 flex justify-between font-mono text-[10px] text-ink3">
            <span class="flex items-center gap-1"><Lock :size="10" /> 评价发布后不可修改</span>
            <span>{{ text.length }}/300</span>
          </div>

          <label class="mt-4 flex cursor-pointer items-center gap-2 text-[11.5px] text-ink3">
            <input v-model="anonymous" type="checkbox" class="accent-azure" />
            匿名发布（对方仍会看到评分，不显示昵称）
          </label>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button class="btn btn-ghost" @click="router.push('/orders')">稍后再说</button>
            <button class="btn btn-primary !px-8" @click="submit">发布评价</button>
          </div>
        </section>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-3">
        <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
          <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">评价如何计算</p>
          <ul class="mt-3 space-y-2.5 text-[11.5px] leading-relaxed text-ink2">
            <li>· 5 星评价：对方信用 +2</li>
            <li>· 带图 / 超过 30 字：额外 +1</li>
            <li>· 3 星及以下：进入纠纷复核流程</li>
          </ul>
        </div>
        <div class="rounded-2xl border border-ink/10 bg-ink p-5 text-haze">
          <Star :size="18" class="text-cyan" />
          <p class="mt-3 font-serif text-[14px] leading-relaxed">
            “评价不是打分游戏，<br />是下一位同学的参考。”
          </p>
          <p class="mt-2 font-mono text-[9px] uppercase tracking-widest text-haze/40">Qianjia community</p>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="wrap py-24 text-center">
    <p class="display text-2xl font-semibold">订单不存在</p>
    <router-link to="/orders" class="btn btn-ink btn-sm mt-6">返回订单列表</router-link>
  </div>
</template>
