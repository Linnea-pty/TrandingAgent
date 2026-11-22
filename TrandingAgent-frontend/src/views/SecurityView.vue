<script setup lang="ts">
import { ref } from 'vue'
import {
  Check,
  KeyRound,
  Laptop,
  Mail,
  Monitor,
  ShieldCheck,
  Smartphone,
  Tablet,
  TriangleAlert,
} from 'lucide-vue-next'
import AppModal from '@/components/AppModal.vue'
import ProfileSidebar from '@/components/ProfileSidebar.vue'
import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { toast } = market
const { me } = storeToRefs(market)

const oldPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')
const modal = ref<'phone' | 'email' | ''>('')
const inputValue = ref('')

const devices = ref([
  { id: 1, name: 'Chrome · Windows 11', place: '校园网 · 东校区', time: '当前在线', icon: Monitor, current: true },
  { id: 2, name: 'iPhone 15 · 谦价 App', place: '移动网络 · 本市', time: '2 小时前', icon: Smartphone, current: false },
  { id: 3, name: 'Safari · iPad Air', place: '校园网 · 图书馆', time: '3 天前', icon: Tablet, current: false },
])

function savePassword() {
  if (!oldPwd.value || !newPwd.value) return toast('请填写完整的密码信息', 'warn')
  if (newPwd.value.length < 8) return toast('新密码至少 8 位', 'warn')
  if (newPwd.value !== confirmPwd.value) return toast('两次输入的新密码不一致', 'warn')
  oldPwd.value = ''
  newPwd.value = ''
  confirmPwd.value = ''
  toast('密码已更新，下次登录请使用新密码')
}

function openModal(kind: 'phone' | 'email') {
  modal.value = kind
  inputValue.value = ''
}

function saveContact() {
  if (!inputValue.value.trim()) return toast('请输入新的手机号或邮箱', 'warn')
  toast(modal.value === 'phone' ? '手机号已更新' : '邮箱已更新')
  modal.value = ''
}

function removeDevice(id: number) {
  devices.value = devices.value.filter((d) => d.id !== id)
  toast('该设备已被下线', 'warn')
}
</script>

<template>
  <div class="wrap py-8">
    <div class="grid gap-8 lg:grid-cols-[260px_1fr]">
      <ProfileSidebar />

      <div class="min-w-0">
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Account security</p>
        <h1 class="mt-3 display text-[32px] font-semibold md:text-[38px]">账号安全</h1>
        <p class="mt-2 text-[13px] text-ink2/80">管理登录凭证、绑定方式与设备，保护你的校园账号。</p>

        <!-- 安全评分 -->
        <div class="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-teal/[0.07] p-5">
          <div class="relative grid h-16 w-16 place-items-center rounded-full border-2 border-teal/40">
            <span class="display text-xl font-semibold text-teal">92</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 font-serif text-[14px] font-semibold"><ShieldCheck :size="15" class="text-teal" /> 账号安全良好</p>
            <p class="mt-1 text-[11.5px] leading-relaxed text-ink3">已开启实名认证与设备验证。建议定期更换密码，并检查登录设备。</p>
          </div>
          <div class="flex items-center gap-1.5 rounded-full border border-teal/25 bg-haze/60 px-3 py-1.5 font-mono text-[10px] text-teal">
            <Check :size="11" /> 已实名
          </div>
        </div>

        <!-- 密码 -->
        <section class="panel mt-4 p-5 md:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="flex items-center gap-2 font-serif text-[15px] font-semibold">
                <KeyRound :size="15" class="text-ink3" /> 登录密码
              </h2>
              <p class="mt-1 text-[11.5px] text-ink3">上次修改：2026-08-14 · 建议每 6 个月更新一次。</p>
            </div>
            <span class="tag">已设置</span>
          </div>

          <form class="mt-5 grid gap-4 sm:grid-cols-3" @submit.prevent="savePassword">
            <div>
              <label class="label" for="old">当前密码</label>
              <input id="old" v-model="oldPwd" type="password" class="field" placeholder="••••••••" />
            </div>
            <div>
              <label class="label" for="new">新密码</label>
              <input id="new" v-model="newPwd" type="password" class="field" placeholder="至少 8 位" />
            </div>
            <div>
              <label class="label" for="confirm">确认新密码</label>
              <input id="confirm" v-model="confirmPwd" type="password" class="field" placeholder="再次输入" />
            </div>
            <div class="sm:col-span-3 flex justify-end">
              <button type="submit" class="btn btn-ink btn-sm">保存修改</button>
            </div>
          </form>
        </section>

        <!-- 绑定方式 -->
        <section class="panel mt-4 p-5 md:p-6">
          <h2 class="font-serif text-[15px] font-semibold">绑定方式</h2>
          <div class="mt-4 divide-y divide-dashed divide-ink/15">
            <div class="flex flex-wrap items-center gap-3 py-4 first:pt-0">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-haze2"><Smartphone :size="16" class="text-ink2" /></span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-medium">手机号</p>
                <p class="mt-0.5 font-mono text-[11px] text-ink3">138 **** 6721</p>
              </div>
              <span class="flex items-center gap-1 font-mono text-[10px] text-teal"><Check :size="10" /> 已绑定</span>
              <button class="btn btn-ghost btn-sm" @click="openModal('phone')">更换</button>
            </div>
            <div class="flex flex-wrap items-center gap-3 py-4">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-haze2"><Mail :size="16" class="text-ink2" /></span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-medium">邮箱</p>
                <p class="mt-0.5 font-mono text-[11px] text-ink3">linz***@stu.edu.cn</p>
              </div>
              <span class="flex items-center gap-1 font-mono text-[10px] text-teal"><Check :size="10" /> 已绑定</span>
              <button class="btn btn-ghost btn-sm" @click="openModal('email')">更换</button>
            </div>
            <div class="flex flex-wrap items-center gap-3 py-4">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-haze2"><ShieldCheck :size="16" class="text-ink2" /></span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-medium">校园统一身份</p>
                <p class="mt-0.5 font-mono text-[11px] text-ink3">学号 {{ '2023123456' }} · {{ me.college }}</p>
              </div>
              <span class="tag">已认证</span>
            </div>
          </div>
        </section>

        <!-- 设备 -->
        <section class="panel mt-4 p-5 md:p-6">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-[15px] font-semibold">登录设备</h2>
            <span class="font-mono text-[10px] text-ink3">{{ devices.length }} 台设备</span>
          </div>
          <ul class="mt-4 space-y-2">
            <li
              v-for="d in devices"
              :key="d.id"
              class="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
              :class="d.current ? 'border-teal/30 bg-teal/[0.05]' : 'border-ink/10 bg-haze/50'"
            >
              <span class="grid h-9 w-9 place-items-center rounded-full bg-haze">
                <component :is="d.icon" :size="16" class="text-ink2" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="flex items-center gap-2 text-[12.5px] font-medium">
                  {{ d.name }}
                  <span v-if="d.current" class="rounded-full bg-teal px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-haze">当前设备</span>
                </p>
                <p class="mt-0.5 font-mono text-[10px] text-ink3">{{ d.place }} · {{ d.time }}</p>
              </div>
              <button v-if="!d.current" class="text-[11.5px] text-azure hover:underline" @click="removeDevice(d.id)">下线</button>
            </li>
          </ul>
          <p class="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">
            <Laptop :size="11" /> 发现陌生设备？立即修改密码并下线
          </p>
        </section>

        <!-- 危险区 -->
        <section class="mt-4 rounded-2xl border border-azure/25 bg-azure/[0.04] p-5 md:p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="flex items-center gap-2 font-serif text-[15px] font-semibold text-azure">
                <TriangleAlert :size="15" /> 注销账号
              </h2>
              <p class="mt-1 max-w-lg text-[11.5px] leading-relaxed text-ink3">
                注销后商品将下架、聊天记录清除，信用分不可恢复。若仍有进行中的订单，需先完成或取消。
              </p>
            </div>
            <button class="btn btn-sm border-azure/30 text-azure hover:bg-azure/10" @click="toast('注销需在真实产品中二次验证（演示）', 'warn')">
              申请注销
            </button>
          </div>
        </section>
      </div>
    </div>

    <AppModal :open="!!modal" :title="modal === 'phone' ? '更换手机号' : '更换邮箱'" @close="modal = ''">
      <p class="mb-4 text-[12px] leading-relaxed text-ink3">
        需要先验证当前{{ modal === 'phone' ? '手机号' : '邮箱' }}，再输入新的{{ modal === 'phone' ? '手机号' : '邮箱' }}。演示环境跳过验证码。
      </p>
      <label class="label">{{ modal === 'phone' ? '新手机号' : '新邮箱' }}</label>
      <input v-model="inputValue" class="field" :placeholder="modal === 'phone' ? '请输入 11 位手机号' : '请输入常用邮箱'" />
      <div class="mt-5 flex justify-end gap-2">
        <button class="btn btn-ghost btn-sm" @click="modal = ''">取消</button>
        <button class="btn btn-primary btn-sm" @click="saveContact">确认更换</button>
      </div>
    </AppModal>
  </div>
</template>
