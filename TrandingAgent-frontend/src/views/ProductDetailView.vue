<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Eye,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
  ShoppingBag,
  Star,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import AppModal from '@/components/AppModal.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import ProductArt from '@/components/ProductArt.vue'
import ProductCard from '@/components/ProductCard.vue'
import { campusSpots } from '@/data/mock'
import { money, timeAgo, useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { isFavorite, productById, toast, toggleFavorite, userById } = market
const { onSale } = storeToRefs(market)

const route = useRoute()
const router = useRouter()
const variant = ref(0)
const reportOpen = ref(false)
const reportReason = ref('')

const product = computed(() => productById(String(route.params.id)))
const seller = computed(() => (product.value ? userById(product.value.sellerId) : undefined))
const discount = computed(() =>
  product.value ? Math.max(0, Math.round((1 - product.value.price / product.value.original) * 100)) : 0,
)
const related = computed(() => {
  if (!product.value) return []
  return onSale.value
    .filter((p) => p.id !== product.value!.id && p.category === product.value!.category)
    .slice(0, 4)
})

const spots = campusSpots.slice(0, 3)

const reportReasons = ['疑似假货 / 高仿', '描述与实际不符', '价格异常', '引导站外交易', '其他']

function chat() {
  if (!product.value) return
  router.push({ path: '/messages', query: { peer: product.value.sellerId, product: product.value.id } })
}

function buy() {
  if (!product.value) return
  router.push(`/checkout/${product.value.id}`)
}

function copyLink() {
  navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
  toast('商品链接已复制')
}

function submitReport() {
  if (!reportReason.value) return
  reportOpen.value = false
  toast('举报已提交，运营会在 24 小时内处理', 'warn')
  reportReason.value = ''
}
</script>

<template>
  <div v-if="product" class="wrap py-6">
    <div class="mb-5 flex items-center gap-2">
      <button class="flex items-center gap-1 text-[12px] text-ink3 transition hover:text-ink" @click="router.back()">
        <ArrowLeft :size="13" /> 返回
      </button>
      <nav class="ml-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">
        <router-link to="/market" class="hover:text-ink">商品大厅</router-link>
        <ChevronRight :size="11" />
        <router-link :to="{ path: '/market', query: { cat: product.category } }" class="hover:text-ink">{{ product.category }}</router-link>
        <ChevronRight :size="11" />
        <span class="max-w-[160px] truncate text-ink sm:max-w-none">{{ product.title }}</span>
      </nav>
    </div>

    <div class="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
      <!-- 图集 -->
      <div class="lg:sticky lg:top-32 lg:self-start">
        <div class="relative overflow-hidden rounded-[22px] border border-ink/10 shadow-tag">
          <div class="aspect-[4/3]">
            <ProductArt :product="product" :variant="variant" />
          </div>
          <span
            v-if="product.status === 'sold'"
            class="absolute inset-0 grid place-items-center bg-ink/50 backdrop-blur-[1px]"
          >
            <span class="rotate-[-8deg] rounded border border-haze/70 px-5 py-2 font-serif text-xl tracking-[0.3em] text-haze">已 售 出</span>
          </span>
          <div class="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-haze/85 px-3 py-1.5 backdrop-blur">
            <Eye :size="12" class="text-ink3" />
            <span class="font-mono text-[10px] text-ink2">{{ product.views }} 次浏览</span>
            <span class="mx-1 h-2.5 w-px bg-ink/15" />
            <Heart :size="12" class="text-azure" />
            <span class="font-mono text-[10px] text-ink2">{{ product.likes + (isFavorite(product.id) ? 1 : 0) }}</span>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-3 gap-3">
          <button
            v-for="i in 3"
            :key="i"
            class="overflow-hidden rounded-xl border-2 transition"
            :class="variant === i - 1 ? 'border-ink' : 'border-ink/10 opacity-70 hover:opacity-100'"
            @click="variant = i - 1"
          >
            <div class="aspect-[4/3]">
              <ProductArt :product="product" :variant="i" />
            </div>
          </button>
        </div>

        <p class="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">
          <ShieldCheck :size="12" class="text-teal" /> 图片由卖家上传 · 支持当面验货
        </p>
      </div>

      <!-- 信息 -->
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="tag !border-ink !bg-ink !text-haze">{{ product.category }}</span>
          <span class="tag">{{ product.condition }}</span>
          <span class="tag">{{ product.campus }}</span>
          <span class="ml-auto font-mono text-[10px] text-ink3">发布于 {{ timeAgo(product.createdAt) }}</span>
        </div>

        <h1 class="mt-4 font-serif text-[26px] font-bold leading-[1.35] md:text-[32px]">{{ product.title }}</h1>

        <div class="mt-5 flex items-end gap-3 border-b border-dashed border-ink/20 pb-5">
          <span class="display text-[42px] font-semibold leading-none text-azure">
            <span class="text-lg">¥</span>{{ money(product.price) }}
          </span>
          <span class="mb-1 font-mono text-[12px] text-ink3 line-through">原价 ¥{{ money(product.original) }}</span>
          <span v-if="discount > 0" class="mb-1.5 rounded-sm bg-azure/10 px-2 py-0.5 font-mono text-[11px] text-azure">
            省 {{ discount }}%
          </span>
        </div>

        <div class="mt-4 flex flex-wrap gap-1.5">
          <span v-for="t in product.tags" :key="t" class="rounded-full bg-haze2 px-2.5 py-1 text-[11px] text-ink2">
            # {{ t }}
          </span>
        </div>

        <!-- 卖家 -->
        <div class="mt-6 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
          <div class="flex items-center gap-3">
            <Avatar :user="seller" size="md" show-verified />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="font-serif text-[14px] font-semibold">{{ seller?.name }}</span>
                <span v-if="seller?.verified" class="seal !px-1 !py-0 !text-[9px]">实 名</span>
              </div>
              <p class="mt-0.5 font-mono text-[10px] text-ink3">
                {{ seller?.college }} · {{ seller?.grade }} · 信用 {{ seller?.credit }}
              </p>
            </div>
            <div class="text-right">
              <p class="flex items-center justify-end gap-1 font-mono text-[12px] text-ink2">
                <Star :size="11" class="fill-cyan text-cyan" /> {{ seller?.rating.toFixed(1) }}
              </p>
              <p class="mt-0.5 font-mono text-[10px] text-ink3">卖出 {{ seller?.sold }} 件</p>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button class="btn btn-ghost btn-sm !rounded-xl" @click="chat">
              <MessageCircle :size="13" /> 聊一聊
            </button>
            <router-link to="/profile" class="btn btn-ghost btn-sm !rounded-xl">
              <BadgeCheck :size="13" /> 看 TA 主页
            </router-link>
          </div>
        </div>

        <!-- 交易地点 -->
        <div class="mt-4 overflow-hidden rounded-2xl border border-ink/10">
          <div class="relative h-[104px] bg-[#E4E9DE]">
            <div
              class="absolute inset-0 opacity-40"
              style="background-image: linear-gradient(rgba(10,27,46,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(10,27,46,.14) 1px, transparent 1px); background-size: 26px 26px"
            />
            <div class="absolute left-[22%] top-[30%] h-2 w-2 rounded-full bg-azure ring-4 ring-azure/20" />
            <div class="absolute left-[58%] top-[58%] h-2 w-2 rounded-full bg-teal ring-4 ring-teal/20" />
            <div class="absolute left-[40%] top-[66%] h-1.5 w-1.5 rounded-full bg-ink/50" />
            <div class="absolute bottom-2 left-3 flex items-center gap-1 rounded-full bg-haze/90 px-2.5 py-1">
              <MapPin :size="11" class="text-azure" />
              <span class="font-mono text-[10px] text-ink2">推荐面交点</span>
            </div>
          </div>
          <div class="bg-[#F7FBFF] p-4">
            <p class="mb-2 text-[12px] font-medium text-ink">卖家建议的校内面交地点</p>
            <div class="space-y-1.5">
              <div v-for="(s, i) in spots" :key="s" class="flex items-center gap-2 text-[11.5px]" :class="i === 0 ? 'text-ink' : 'text-ink3'">
                <span class="grid h-4 w-4 place-items-center rounded-full font-mono text-[9px]" :class="i === 0 ? 'bg-azure text-haze' : 'bg-ink/10'">
                  {{ i + 1 }}
                </span>
                {{ s }}
                <span v-if="i === 0" class="ml-auto font-mono text-[9px] uppercase tracking-wider text-azure">推荐</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作 -->
        <div class="mt-5 space-y-2.5">
          <button
            class="btn w-full !py-3.5 text-[14px]"
            :class="product.status === 'sold' ? 'btn-ghost' : 'btn-primary'"
            :disabled="product.status === 'sold'"
            @click="buy"
          >
            <ShoppingBag :size="16" />
            {{ product.status === 'sold' ? '该商品已售出' : '立即购买' }}
          </button>
          <div class="grid grid-cols-[1fr_1fr_auto] gap-2">
            <button
              class="btn btn-ghost btn-sm !rounded-xl"
              :class="isFavorite(product.id) ? '!border-azure/40 !text-azure' : ''"
              @click="toggleFavorite(product.id)"
            >
              <Heart :size="13" :class="isFavorite(product.id) ? 'fill-azure' : ''" />
              {{ isFavorite(product.id) ? '已收藏' : '收藏' }}
            </button>
            <button class="btn btn-ghost btn-sm !rounded-xl" @click="copyLink">
              <Share2 :size="13" /> 分享
            </button>
            <button class="btn btn-ghost btn-sm !rounded-xl !px-3" aria-label="举报" @click="reportOpen = true">
              <Flag :size="13" />
            </button>
          </div>
          <p class="flex items-center justify-center gap-1.5 pt-1 font-mono text-[10px] uppercase tracking-widest text-ink3">
            <ShieldCheck :size="11" class="text-teal" /> 建议校内面交 · 拒绝任何站外转账
          </p>
        </div>
      </div>
    </div>

    <!-- 详情 -->
    <div class="mt-14 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
      <section>
        <h2 class="flex items-center gap-2 font-serif text-lg font-semibold">
          <span class="h-4 w-1 bg-azure" /> 商品描述
        </h2>
        <div class="mt-4 space-y-4 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-6 text-[13.5px] leading-[2] text-ink2">
          <p>{{ product.desc }}</p>
          <p class="text-ink3">交易方式：校内面交优先，也可以约在宿舍楼下自提。贵重物品建议当面验货后再确认收货。</p>
          <div class="flex items-center gap-2 border-t border-dashed border-ink/15 pt-4 font-mono text-[10px] uppercase tracking-widest text-ink3">
            <CategoryIcon :name="product.category" :size="12" />
            {{ product.category }} / {{ product.condition }} / {{ product.campus }}
          </div>
        </div>

        <h2 class="mt-8 flex items-center gap-2 font-serif text-lg font-semibold">
          <span class="h-4 w-1 bg-azure" /> 商品参数
        </h2>
        <dl class="mt-4 overflow-hidden rounded-2xl border border-ink/10">
          <div
            v-for="(row, i) in [
              { k: '分类', v: product.category },
              { k: '成色', v: product.condition },
              { k: '交易地点', v: product.campus },
              { k: '发布时间', v: new Date(product.createdAt).toLocaleDateString('zh-CN') },
              { k: '浏览量', v: `${product.views} 次` },
              { k: '商品编号', v: product.id.toUpperCase() },
            ]"
            :key="row.k"
            class="grid grid-cols-[110px_1fr] text-[12.5px]"
            :class="i % 2 === 0 ? 'bg-[#F7FBFF]' : 'bg-haze2/30'"
          >
            <dt class="border-r border-ink/10 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-ink3">{{ row.k }}</dt>
            <dd class="px-4 py-3 text-ink2">{{ row.v }}</dd>
          </div>
        </dl>
      </section>

      <section>
        <div class="flex items-end justify-between">
          <h2 class="font-serif text-lg font-semibold">同类闲置</h2>
          <router-link :to="{ path: '/market', query: { cat: product.category } }" class="link-u text-[11.5px] text-ink3">
            更多 {{ product.category }}
          </router-link>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-5">
          <ProductCard v-for="p in related" :key="p.id" :product="p" />
        </div>
        <div v-if="!related.length" class="mt-4 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-[12px] text-ink3">
          暂无同类商品
        </div>

        <div class="mt-6 rounded-2xl border border-ink/10 bg-ink p-5 text-haze">
          <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">Trading note</p>
          <p class="mt-2 font-serif text-[15px] leading-relaxed">
            “先验货，再确认。”<br />
            <span class="text-haze/60 text-[12px]">—— 谦价交易安全守则第一条</span>
          </p>
        </div>
      </section>
    </div>

    <AppModal :open="reportOpen" title="举报该商品" @close="reportOpen = false">
      <p class="mb-4 text-[12.5px] leading-relaxed text-ink3">
        请选择举报原因。恶意举报会影响你的信用分，我们会结合聊天与订单记录核实。
      </p>
      <div class="space-y-2">
        <label
          v-for="r in reportReasons"
          :key="r"
          class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[13px] transition"
          :class="reportReason === r ? 'border-azure bg-azure/5' : 'border-ink/10 hover:border-ink/25'"
        >
          <input v-model="reportReason" type="radio" :value="r" class="accent-azure" />
          {{ r }}
        </label>
      </div>
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn btn-ghost btn-sm" @click="reportOpen = false">取消</button>
        <button class="btn btn-primary btn-sm" :disabled="!reportReason" @click="submitReport">提交举报</button>
      </div>
    </AppModal>
  </div>

  <div v-else class="wrap py-24 text-center">
    <p class="display text-2xl font-semibold">商品不见了</p>
    <p class="mt-2 text-[13px] text-ink3">它可能已被卖家下架或售出。</p>
    <router-link to="/market" class="btn btn-ink btn-sm mt-6">回到商品大厅</router-link>
  </div>
</template>
