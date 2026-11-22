<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Store,
  Ticket,
  Truck,
} from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import ProductArt from '@/components/ProductArt.vue'
import { campusSpots } from '@/data/mock'
import { money, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { buyProduct, productById, toast, userById } = market

const route = useRoute()
const router = useRouter()

const product = computed(() => productById(String(route.params.id)))
const seller = computed(() => (product.value ? userById(product.value.sellerId) : undefined))

const method = ref<'校内面交' | '自提'>('校内面交')
const spot = ref(campusSpots[0]!)
const room = ref('')
const note = ref('')
const phone = ref('138 6721 0043')
const useCoupon = ref(true)

const coupon = 5
const total = computed(() => Math.max(0, (product.value?.price ?? 0) - (useCoupon.value ? coupon : 0)))

function submit() {
  if (!product.value) return
  if (method.value === '自提' && !room.value.trim()) return toast('请填写自提宿舍楼与房间号', 'warn')
  const location = method.value === '校内面交' ? spot.value : `自提 · ${room.value.trim()}`
  const order = buyProduct(product.value, method.value, location, note.value.trim())
  toast('下单成功，等待卖家确认')
  router.push(`/order/${order.id}`)
}
</script>

<template>
  <div v-if="product" class="wrap py-7">
    <button class="mb-5 flex items-center gap-1.5 text-[12px] text-ink3 transition hover:text-ink" @click="router.back()">
      <ArrowLeft :size="13" /> 返回商品
    </button>

    <!-- 步骤 -->
    <div class="mb-7 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 text-[12px] text-ink">
        <span class="grid h-6 w-6 place-items-center rounded-full bg-ink font-mono text-[10px] text-haze">1</span> 确认订单
      </div>
      <ChevronRight :size="13" class="text-ink3" />
      <div class="flex items-center gap-2 text-[12px] text-ink3">
        <span class="grid h-6 w-6 place-items-center rounded-full border border-ink/20 font-mono text-[10px]">2</span> 卖家确认
      </div>
      <ChevronRight :size="13" class="text-ink3" />
      <div class="flex items-center gap-2 text-[12px] text-ink3">
        <span class="grid h-6 w-6 place-items-center rounded-full border border-ink/20 font-mono text-[10px]">3</span> 当面交易
      </div>
    </div>

    <h1 class="display text-[30px] font-semibold md:text-[36px]">确认订单</h1>
    <p class="mt-2 text-[13px] text-ink2/80">核对商品与交易方式，提交后卖家会收到通知。</p>

    <div class="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div class="space-y-4">
        <!-- 商品 -->
        <section class="panel p-5">
          <h2 class="mb-4 font-serif text-[15px] font-semibold">商品信息</h2>
          <div class="flex gap-4">
            <router-link :to="`/product/${product.id}`" class="h-[96px] w-[128px] shrink-0 overflow-hidden rounded-xl border border-ink/10">
              <ProductArt :product="product" />
            </router-link>
            <div class="min-w-0 flex-1">
              <h3 class="line-clamp-2 font-serif text-[15px] font-semibold leading-snug">{{ product.title }}</h3>
              <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span class="tag !text-[9px]">{{ product.condition }}</span>
                <span class="tag !text-[9px]">{{ product.category }}</span>
                <span class="tag !text-[9px]">{{ product.campus }}</span>
              </div>
              <div class="mt-2 flex items-baseline gap-2">
                <span class="display text-xl font-semibold text-azure">¥{{ money(product.price) }}</span>
                <span class="font-mono text-[10px] text-ink3 line-through">¥{{ money(product.original) }}</span>
              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2.5 border-t border-dashed border-ink/15 pt-4">
            <Avatar :user="seller" size="sm" show-verified />
            <div class="text-[11.5px]">
              <p class="font-medium">{{ seller?.name }} <span class="font-normal text-ink3">· {{ seller?.college }}</span></p>
              <p class="font-mono text-[10px] text-ink3">信用 {{ seller?.credit }} · 卖出 {{ seller?.sold }} 件</p>
            </div>
            <button class="ml-auto flex items-center gap-1 text-[11.5px] text-teal hover:underline" @click="router.push({ path: '/messages', query: { peer: seller?.id, product: product.id } })">
              <MessageCircle :size="12" /> 联系卖家
            </button>
          </div>
        </section>

        <!-- 交易方式 -->
        <section class="panel p-5">
          <h2 class="mb-4 font-serif text-[15px] font-semibold">交易方式</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            <button
              class="flex items-start gap-3 rounded-xl border p-4 text-left transition"
              :class="method === '校内面交' ? 'border-teal bg-teal/[0.06]' : 'border-ink/10 hover:border-ink/25'"
              @click="method = '校内面交'"
            >
              <Store :size="17" class="mt-0.5 shrink-0 text-ink2" />
              <span class="flex-1">
                <span class="flex items-center justify-between text-[13px] font-medium">
                  校内面交
                  <span v-if="method === '校内面交'" class="grid h-4 w-4 place-items-center rounded-full bg-teal text-haze"><Check :size="9" :stroke-width="4" /></span>
                </span>
                <span class="mt-1 block text-[11px] leading-relaxed text-ink3">约在公共区域，当面验货后确认</span>
              </span>
            </button>
            <button
              class="flex items-start gap-3 rounded-xl border p-4 text-left transition"
              :class="method === '自提' ? 'border-teal bg-teal/[0.06]' : 'border-ink/10 hover:border-ink/25'"
              @click="method = '自提'"
            >
              <Truck :size="17" class="mt-0.5 shrink-0 text-ink2" />
              <span class="flex-1">
                <span class="flex items-center justify-between text-[13px] font-medium">
                  自提
                  <span v-if="method === '自提'" class="grid h-4 w-4 place-items-center rounded-full bg-teal text-haze"><Check :size="9" :stroke-width="4" /></span>
                </span>
                <span class="mt-1 block text-[11px] leading-relaxed text-ink3">到卖家宿舍楼下取件</span>
              </span>
            </button>
          </div>

          <div v-if="method === '校内面交'" class="mt-4">
            <label class="label">选择面交地点</label>
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="s in campusSpots"
                :key="s"
                class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[11.5px] transition"
                :class="spot === s ? 'border-ink bg-haze2/60 text-ink' : 'border-ink/10 text-ink3 hover:border-ink/25'"
              >
                <input v-model="spot" type="radio" :value="s" class="accent-azure" />
                <MapPin :size="12" class="shrink-0" />
                <span class="truncate">{{ s }}</span>
              </label>
            </div>
          </div>

          <div v-else class="mt-4">
            <label class="label" for="room">自提地址</label>
            <input id="room" v-model="room" class="field" placeholder="例如：东校区 6 号楼 302" />
          </div>
        </section>

        <!-- 联系方式与留言 -->
        <section class="panel p-5">
          <h2 class="mb-4 font-serif text-[15px] font-semibold">联系方式与留言</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label">联系人</label>
              <input :value="'林知夏'" class="field bg-haze2/40" readonly />
            </div>
            <div>
              <label class="label" for="phone">手机号</label>
              <input id="phone" v-model="phone" class="field" />
            </div>
          </div>
          <div class="mt-4">
            <label class="label" for="note">给卖家留言</label>
            <textarea
              id="note"
              v-model="note"
              rows="3"
              class="field resize-none"
              placeholder="例如：周三下午四点后都有空，麻烦带一下原装充电器。"
            />
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="q in ['今天下午可以交易吗？', '可以小刀吗？', '麻烦带齐配件']"
                :key="q"
                class="rounded-full border border-dashed border-ink/20 px-2.5 py-1 text-[10.5px] text-ink3 transition hover:border-ink/40 hover:text-ink"
                @click="note = q"
              >
                {{ q }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- 结算 -->
      <aside class="space-y-3 lg:sticky lg:top-32">
        <div class="panel p-5">
          <h2 class="font-serif text-[15px] font-semibold">费用明细</h2>
          <div class="mt-4 space-y-2.5 text-[12.5px]">
            <div class="flex justify-between text-ink2">
              <span>商品金额</span>
              <span class="font-mono">¥{{ money(product.price) }}</span>
            </div>
            <div class="flex justify-between text-ink2">
              <span>平台服务费</span>
              <span class="font-mono text-teal">¥0</span>
            </div>
            <label class="flex cursor-pointer items-center justify-between text-ink2">
              <span class="flex items-center gap-1.5">
                <Ticket :size="13" class="text-cyan" /> 校园新人券
              </span>
              <span class="flex items-center gap-2">
                <span class="font-mono text-azure">-¥{{ coupon }}</span>
                <input v-model="useCoupon" type="checkbox" class="accent-azure" />
              </span>
            </label>
          </div>
          <div class="mt-4 flex items-end justify-between border-t border-dashed border-ink/20 pt-4">
            <span class="text-[12px] text-ink3">合计</span>
            <span class="display text-[30px] font-semibold leading-none text-azure">
              <span class="text-sm">¥</span>{{ money(total) }}
            </span>
          </div>

          <button class="btn btn-primary mt-5 w-full !rounded-xl !py-3.5" @click="submit">提交订单</button>
          <p class="mt-3 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ink3">
            <ShieldCheck :size="10" class="text-teal" /> 确认收货前请当面验货
          </p>
        </div>

        <div class="rounded-2xl border border-ink/10 bg-haze2/40 p-4">
          <p class="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">交易提醒</p>
          <ul class="space-y-1.5 text-[11px] leading-relaxed text-ink2">
            <li>· 平台不会要求你站外转账或扫码付款</li>
            <li>· 面交时请在公共区域，避免单独进入宿舍</li>
            <li>· 聊天与订单记录会自动保存为凭证</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>

  <div v-else class="wrap py-24 text-center">
    <p class="display text-2xl font-semibold">商品不存在</p>
    <router-link to="/market" class="btn btn-ink btn-sm mt-6">回到商品大厅</router-link>
  </div>
</template>
