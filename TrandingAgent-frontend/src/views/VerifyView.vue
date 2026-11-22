<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  FileCheck2,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-vue-next'
import { useMarketStore } from '@/stores/market'
import { storeToRefs } from 'pinia'
const market = useMarketStore()
const { toast, verifyMe } = market
const { me } = storeToRefs(market)

const router = useRouter()
const step = ref(1)
const uploaded = ref(false)
const cardType = ref<'学生证' | '校园卡'>('学生证')
const studentNo = ref('2023123456')
const realName = ref('林知夏')

function upload() {
  uploaded.value = true
  toast('证件已上传，请核对下方信息')
}

function next() {
  if (step.value === 1) {
    if (!uploaded.value) return toast('请先上传证件照片', 'warn')
    step.value = 2
    return
  }
  if (step.value === 2) {
    verifyMe()
    step.value = 3
  }
}

const steps = [
  { n: 1, label: '上传证件' },
  { n: 2, label: '核对信息' },
  { n: 3, label: '认证完成' },
]
</script>

<template>
  <div class="wrap py-8">
    <button class="mb-6 flex items-center gap-1.5 text-[12px] text-ink3 transition hover:text-ink" @click="router.back()">
      <ArrowLeft :size="13" /> 返回
    </button>

    <div class="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Identity verification</p>
        <h1 class="mt-3 display text-[34px] font-semibold md:text-[40px]">校园实名认证</h1>
        <p class="mt-2 max-w-lg text-[13px] leading-relaxed text-ink2/80">
          实名是校园交易的信任基础。认证信息仅用于身份核验，不会展示在商品页，也不会对外提供。
        </p>

        <!-- 步骤 -->
        <div class="mt-8 flex items-center">
          <div v-for="(s, i) in steps" :key="s.n" class="flex flex-1 items-center last:flex-none">
            <div class="flex items-center gap-2">
              <span
                class="grid h-8 w-8 place-items-center rounded-full border font-mono text-[11px] transition"
                :class="step > s.n ? 'border-teal bg-teal text-haze' : step === s.n ? 'border-ink bg-ink text-haze' : 'border-ink/20 text-ink3'"
              >
                <Check v-if="step > s.n" :size="13" :stroke-width="3" />
                <template v-else>0{{ s.n }}</template>
              </span>
              <span class="hidden text-[12px] sm:block" :class="step >= s.n ? 'text-ink' : 'text-ink3'">{{ s.label }}</span>
            </div>
            <span v-if="i < steps.length - 1" class="mx-3 h-px flex-1" :class="step > s.n ? 'bg-teal/50' : 'bg-ink/10'" />
          </div>
        </div>

        <!-- Step 1 -->
        <div v-if="step === 1" class="mt-7 panel p-6">
          <h2 class="font-serif text-[15px] font-semibold">选择证件类型</h2>
          <div class="mt-3 flex gap-2">
            <button
              v-for="t in (['学生证', '校园卡'] as const)"
              :key="t"
              class="chip"
              :class="{ 'chip-on': cardType === t }"
              @click="cardType = t; uploaded = false"
            >
              {{ t }}
            </button>
          </div>

          <button
            class="relative mt-6 grid w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-12 transition"
            :class="uploaded ? 'border-teal bg-teal/[0.05]' : 'border-ink/25 bg-haze2/30 hover:border-ink/45 hover:bg-haze2/50'"
            @click="upload"
          >
            <template v-if="!uploaded">
              <span class="grid h-12 w-12 place-items-center rounded-full bg-haze ">
                <Upload :size="20" :stroke-width="1.5" class="text-ink2" />
              </span>
              <span class="mt-3 text-[13px] font-medium">点击上传{{ cardType }}照片</span>
              <span class="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink3">JPG / PNG · 不超过 5MB</span>
            </template>
            <template v-else>
              <span class="grid h-12 w-12 place-items-center rounded-full bg-teal text-haze">
                <Camera :size="20" :stroke-width="1.6" />
              </span>
              <span class="mt-3 text-[13px] font-medium text-teal">{{ cardType }}已上传</span>
              <span class="mt-1 font-mono text-[10px] text-ink3">student-card-2026.jpg · 2.4MB</span>
              <span class="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-teal px-2 py-1 font-mono text-[9px] uppercase text-haze">
                <Check :size="9" :stroke-width="4" /> 已就绪
              </span>
            </template>
          </button>

          <div class="mt-5 flex items-start gap-2 rounded-xl bg-cyan/10 px-4 py-3 text-[11.5px] leading-relaxed text-ink2">
            <Lock :size="13" class="mt-0.5 shrink-0 text-cyan" />
            照片仅用于人工核验，认证完成后自动加密存储；请遮挡身份证号等无关信息（如证件上有）。
          </div>

          <button class="btn btn-primary mt-6 w-full !rounded-xl" @click="next">
            下一步 <ArrowRight :size="14" />
          </button>
        </div>

        <!-- Step 2 -->
        <div v-else-if="step === 2" class="mt-7 panel p-6">
          <h2 class="font-serif text-[15px] font-semibold">核对实名信息</h2>
          <p class="mt-1 text-[11.5px] text-ink3">信息需与证件一致，认证后不可自行修改。</p>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label">真实姓名</label>
              <input v-model="realName" class="field" />
            </div>
            <div>
              <label class="label">学号</label>
              <input v-model="studentNo" class="field" />
            </div>
            <div>
              <label class="label">所属学院</label>
              <input :value="me.college" class="field bg-haze2/40" readonly />
            </div>
            <div>
              <label class="label">年级</label>
              <input :value="me.grade" class="field bg-haze2/40" readonly />
            </div>
          </div>

          <div class="mt-5 flex items-start gap-2 rounded-xl border border-dashed border-ink/20 px-4 py-3 text-[11.5px] leading-relaxed text-ink3">
            <ShieldCheck :size="13" class="mt-0.5 shrink-0 text-teal" />
            提交后由校园运营团队人工核验，通常 1 个工作日内完成；认证通过后信用分 +10。
          </div>

          <div class="mt-6 flex gap-2">
            <button class="btn btn-ghost flex-1 !rounded-xl" @click="step = 1">上一步</button>
            <button class="btn btn-primary flex-1 !rounded-xl" @click="next">提交认证</button>
          </div>
        </div>

        <!-- Step 3 -->
        <div v-else class="mt-7 panel relative overflow-hidden p-8 text-center">
          <div class="pointer-events-none absolute inset-0 opacity-30" style="background-image: radial-gradient(#0A1B2E 0.6px, transparent 0.6px); background-size: 20px 20px" />
          <div class="relative">
            <div class="animate-stampIn mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-azure">
              <BadgeCheck :size="36" :stroke-width="1.3" class="text-azure" />
            </div>
            <h2 class="mt-6 display text-[26px] font-semibold">认证已通过</h2>
            <p class="mt-2 text-[12.5px] text-ink3">你的校园身份已生效，现在可以发布和交易了。</p>

            <div class="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
              <div class="rounded-xl border border-ink/10 bg-haze/60 px-4 py-3">
                <p class="font-mono text-[9px] uppercase tracking-widest text-ink3">信用分</p>
                <p class="display mt-1 text-xl font-semibold text-teal">{{ me.credit }} <span class="text-[11px] text-teal">+10</span></p>
              </div>
              <div class="rounded-xl border border-ink/10 bg-haze/60 px-4 py-3">
                <p class="font-mono text-[9px] uppercase tracking-widest text-ink3">身份</p>
                <p class="mt-1 flex items-center justify-center gap-1 font-serif text-[13px] font-semibold">
                  <FileCheck2 :size="13" class="text-teal" /> 在校学生
                </p>
              </div>
            </div>

            <div class="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <router-link to="/market" class="btn btn-primary">去逛逛 <ArrowRight :size="14" /></router-link>
              <router-link to="/profile" class="btn btn-ghost">回到个人主页</router-link>
            </div>
            <p class="mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ink3">
              <Sparkles :size="10" class="text-cyan" /> 已解锁「实名卖家」标识
            </p>
          </div>
        </div>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-4">
        <div class="rounded-2xl border border-ink/10 bg-ink p-5 text-haze">
          <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">Why verify</p>
          <h3 class="mt-2 font-serif text-[17px] font-semibold">为什么要实名？</h3>
          <ul class="mt-4 space-y-3 text-[11.5px] leading-relaxed text-haze/70">
            <li class="flex gap-2"><span class="text-cyan">01</span> 只有在校学生能发布商品，减少外部商家。</li>
            <li class="flex gap-2"><span class="text-cyan">02</span> 实名卖家会显示专属标识，更容易被信任。</li>
            <li class="flex gap-2"><span class="text-cyan">03</span> 发生纠纷时，平台可协助核实身份。</li>
          </ul>
          <div class="mt-5 flex items-center gap-2 border-t border-haze/15 pt-4">
            <ShieldCheck :size="15" class="text-cyan" />
            <span class="font-mono text-[9px] uppercase tracking-widest text-haze/50">信息加密存储</span>
          </div>
        </div>

        <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
          <p class="font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">常见问题</p>
          <div class="mt-3 space-y-3 text-[11.5px] leading-relaxed text-ink2">
            <p><span class="font-medium">证件照会公开吗？</span><br /><span class="text-ink3">不会。仅核验人员可见，前台只展示「已实名」标识。</span></p>
            <p><span class="font-medium">认证失败怎么办？</span><br /><span class="text-ink3">可重新上传清晰照片，或联系校园运营。</span></p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
