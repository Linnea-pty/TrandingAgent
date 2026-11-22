<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  IdCard,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-vue-next'
import { useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { toast } = market

const router = useRouter()
const mode = ref<'login' | 'register'>('login')
const identity = ref<'学号' | '手机号'>('学号')
const account = ref('')
const password = ref('')
const agree = ref(true)

function enter() {
  if (!agree.value) return toast('请先同意用户协议与隐私政策', 'warn')
  toast(mode.value === 'login' ? '登录成功，欢迎回到谦价' : '注册成功，去完成实名认证吧')
  router.push(mode.value === 'login' ? '/' : '/verify')
}

function sso() {
  toast('已通过校园统一身份认证')
  router.push('/')
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
    <!-- 左侧海报 -->
    <section class="relative hidden overflow-hidden bg-ink text-haze lg:flex lg:flex-col lg:justify-between">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.15]"
        style="background-image: radial-gradient(#E9F1FB 0.8px, transparent 0.8px); background-size: 26px 26px"
      />
      <svg class="pointer-events-none absolute -right-24 top-24 h-[520px] w-[520px] opacity-[0.13]" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="96" stroke="#0B93B3" stroke-width="0.8" />
        <circle cx="100" cy="100" r="70" stroke="#0B93B3" stroke-width="0.8" />
        <circle cx="100" cy="100" r="44" stroke="#0B93B3" stroke-width="0.8" />
        <path d="M4 100h192M100 4v192" stroke="#0B93B3" stroke-width="0.8" />
      </svg>

      <div class="relative p-10 xl:p-14">
        <router-link to="/" class="inline-flex items-center gap-2.5">
          <span class="grid h-10 w-10 -rotate-3 place-items-center rounded-[7px] bg-cyan font-serif text-lg text-ink">谦</span>
          <span class="display text-xl font-semibold">谦价</span>
        </router-link>
      </div>

      <div class="relative px-10 xl:px-14">
        <p class="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan">Campus Trading Community</p>
        <h1 class="display text-[62px] font-semibold leading-[1.02] xl:text-[76px]">
          旧物<br />新同学
        </h1>
        <p class="mt-7 max-w-sm font-serif text-[14px] leading-[2] text-haze/65">
          每一件闲置都值得被重新使用。
          谦价用学号实名与校内面交，把交易变回一件轻松、可信的小事。
        </p>

        <div class="mt-10 flex max-w-sm flex-col gap-3">
          <div v-for="(f, i) in [
            { t: '学号实名，一人一号', d: '校园统一身份认证，杜绝外部商家' },
            { t: '校内面交，不用快递', d: '图书馆、食堂、宿舍楼下都能约' },
            { t: '聊天留痕，交易可回溯', d: '订单与对话均可作为凭证' },
          ]" :key="f.t" class="flex items-start gap-3 border-b border-haze/10 pb-3">
            <span class="font-mono text-[10px] text-cyan">0{{ i + 1 }}</span>
            <div>
              <p class="text-[13px] font-medium">{{ f.t }}</p>
              <p class="mt-0.5 text-[11.5px] text-haze/45">{{ f.d }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative flex items-end justify-between p-10 xl:p-14">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-haze/35">© 2026 QIANJIA</p>
        <span class="seal !border-cyan !text-cyan">校 园 实 名</span>
      </div>
    </section>

    <!-- 右侧表单 -->
    <section class="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
      <router-link to="/" class="absolute left-6 top-6 flex items-center gap-1.5 text-[12px] text-ink3 transition hover:text-ink">
        <ArrowLeft :size="13" /> 返回首页
      </router-link>

      <div class="mx-auto w-full max-w-[400px]">
        <div class="mb-8 lg:hidden">
          <div class="flex items-center gap-2.5">
            <span class="grid h-10 w-10 -rotate-3 place-items-center rounded-[7px] bg-ink font-serif text-lg text-cyan">谦</span>
            <span class="display text-xl font-semibold">谦价</span>
          </div>
        </div>

        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Welcome back</p>
        <h2 class="mt-3 display text-[34px] font-semibold leading-tight">
          {{ mode === 'login' ? '登录谦价' : '创建谦价账号' }}
        </h2>
        <p class="mt-2 text-[12.5px] leading-relaxed text-ink3">
          {{ mode === 'login' ? '用学号或手机号登录，继续你的校园交易。' : '仅限在校学生注册，注册后需完成实名认证。' }}
        </p>

        <div class="mt-6 flex rounded-full border border-ink/10 bg-haze2/50 p-1">
          <button
            class="flex-1 rounded-full py-2 text-[12.5px] font-medium transition"
            :class="mode === 'login' ? 'bg-ink text-haze' : 'text-ink3'"
            @click="mode = 'login'"
          >
            登录
          </button>
          <button
            class="flex-1 rounded-full py-2 text-[12.5px] font-medium transition"
            :class="mode === 'register' ? 'bg-ink text-haze' : 'text-ink3'"
            @click="mode = 'register'"
          >
            注册
          </button>
        </div>

        <button class="btn mt-4 w-full !rounded-xl border-teal/30 bg-teal/[0.07] text-teal hover:bg-teal/10" @click="sso">
          <ShieldCheck :size="16" /> 校园统一身份认证登录
        </button>

        <div class="my-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
          <span class="h-px flex-1 bg-ink/10" />
          或使用账号密码
          <span class="h-px flex-1 bg-ink/10" />
        </div>

        <div class="mb-4 flex gap-2">
          <button
            v-for="i in (['学号', '手机号'] as const)"
            :key="i"
            class="chip !px-3 !py-1.5 !text-[12px]"
            :class="{ 'chip-on': identity === i }"
            @click="identity = i"
          >
            <IdCard v-if="i === '学号'" :size="12" />
            <Phone v-else :size="12" />
            {{ i }}
          </button>
        </div>

        <form class="space-y-3.5" @submit.prevent="enter">
          <div class="relative">
            <UserRound :size="15" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              v-model="account"
              class="field !py-3.5 !pl-11"
              :placeholder="identity === '学号' ? '请输入学号（如 2023123456）' : '请输入手机号'"
            />
          </div>
          <div class="relative">
            <LockKeyhole :size="15" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
            <input
              v-model="password"
              type="password"
              class="field !py-3.5 !pl-11"
              placeholder="请输入密码"
            />
          </div>

          <div v-if="mode === 'register'" class="relative">
            <UserRound :size="15" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3" />
            <input class="field !py-3.5 !pl-11" placeholder="给自己起个昵称（如：林知夏）" />
          </div>

          <div class="flex items-center justify-between text-[11.5px]">
            <label class="flex cursor-pointer items-center gap-2 text-ink3">
              <input v-model="agree" type="checkbox" class="accent-azure" />
              我已阅读并同意
              <span class="text-ink underline decoration-ink/30 underline-offset-2">用户协议</span>
            </label>
            <button v-if="mode === 'login'" type="button" class="text-ink3 hover:text-ink" @click="toast('验证码已发送（演示）')">
              忘记密码？
            </button>
          </div>

          <button type="submit" class="btn btn-primary w-full !rounded-xl !py-3.5">
            {{ mode === 'login' ? '登录' : '注册并继续' }}
            <ArrowRight :size="15" />
          </button>
        </form>

        <p class="mt-5 flex items-start gap-2 rounded-xl border border-dashed border-ink/15 bg-haze2/30 px-3 py-2.5 text-[10.5px] leading-relaxed text-ink3">
          <Sparkles :size="12" class="mt-0.5 shrink-0 text-cyan" />
          演示环境：任意账号密码均可登录，数据保存在浏览器本地。
        </p>
      </div>
    </section>
  </div>
</template>
