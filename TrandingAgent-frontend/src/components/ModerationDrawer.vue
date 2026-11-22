<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRightLeft, ScanEye, ShieldCheck, X } from 'lucide-vue-next'
import type { ModerationFinding } from '@/types'
import { reviewRules, snapshotDiff } from '@/data/agent'
import { useAgentStore, verdictMeta } from '@/stores/agent'
const agent = useAgentStore()

const props = withDefaults(
  defineProps<{ open: boolean; findings?: ModerationFinding[]; title?: string }>(),
  { findings: () => [], title: '审核台' },
)
defineEmits<{ (e: 'close'): void }>()

const items = computed(() =>
  props.findings.length
    ? props.findings
    : [
        {
          id: 'demo-1',
          verdict: 'suggest' as const,
          scene: 'publish' as const,
          rule: 'R-201 绝对化用语',
          target: '「全网最低价 iPad」',
          message: '标题含「全网最低」，建议改为「校内自提价」。',
          fix: '标题：iPad Air 5 · 64G · 校内自提价',
        },
        {
          id: 'demo-2',
          verdict: 'block' as const,
          scene: 'publish' as const,
          rule: 'R-101 违禁品类',
          target: '「代写课程论文」',
          message: '命中校园违禁品类，已拦截，不进入商品池。',
          fix: '不可发布，如需申诉请联系学生会权益部。',
        },
      ],
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" @click="$emit('close')" />
        <aside
          class="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-azure/20 bg-[#F4F9FF] shadow-2xl"
        >
          <header class="flex items-start gap-3 border-b border-azure/10 bg-gradient-to-r from-azure/[0.08] to-neon/[0.08] px-5 py-4">
            <span class="mt-0.5 grid h-8 w-8 place-items-center rounded-lg border border-azure/25 bg-white/70 text-azure">
              <ShieldCheck :size="16" />
            </span>
            <div class="min-w-0 flex-1">
              <h2 class="font-display text-[15px] font-semibold">{{ title }}</h2>
              <p class="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink3">
                同步函数 · 不参与议价 · 不主动发起
              </p>
            </div>
            <button class="rounded-md p-1 text-ink3 transition hover:bg-white hover:text-ink" aria-label="关闭审核台" @click="$emit('close')">
              <X :size="16" />
            </button>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            <section>
              <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
                <ScanEye :size="12" /> 本次检查
              </h3>
              <ul class="mt-2 space-y-2">
                <li v-for="f in items" :key="f.id" class="rounded-xl border border-azure/10 bg-white/70 p-3">
                  <div class="flex items-center gap-2">
                    <span class="rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider" :class="verdictMeta[f.verdict].cls">
                      {{ verdictMeta[f.verdict].label }}
                    </span>
                    <span class="font-mono text-[9px] text-ink3">{{ f.rule }}</span>
                  </div>
                  <p class="mt-2 text-[11.5px] font-medium text-ink">{{ f.target }}</p>
                  <p class="mt-1 text-[11px] leading-relaxed text-ink2">{{ f.message }}</p>
                  <p v-if="f.fix" class="mt-1.5 rounded-md bg-azure/[0.05] px-2 py-1 text-[10.5px] leading-relaxed text-azure">
                    建议：{{ f.fix }}
                  </p>
                </li>
              </ul>
            </section>

            <section>
              <h3 class="font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">规则集（硬编码，可测试）</h3>
              <ul class="mt-2 divide-y divide-azure/10 rounded-xl border border-azure/10 bg-white/60">
                <li v-for="r in reviewRules" :key="r.code" class="flex gap-2.5 px-3 py-2.5">
                  <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" :class="r.level === 'block' ? 'bg-azure' : 'bg-cyan'" />
                  <div>
                    <p class="font-mono text-[9.5px] text-ink3">{{ r.code }} · {{ r.name }}</p>
                    <p class="mt-0.5 text-[10.5px] leading-relaxed text-ink2">{{ r.detail }}</p>
                  </div>
                </li>
              </ul>
            </section>

            <section>
              <h3 class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
                <ArrowRightLeft :size="12" /> 快照比对（纠纷材料）
              </h3>
              <div class="mt-2 overflow-hidden rounded-xl border border-azure/10 bg-white/60">
                <div class="grid grid-cols-3 border-b border-azure/10 bg-azure/[0.04] px-3 py-1.5 font-mono text-[9px] text-ink3">
                  <span>字段</span><span>发布时</span><span>实物</span>
                </div>
                <div v-for="d in snapshotDiff" :key="d.field" class="grid grid-cols-3 items-start gap-1 border-b border-azure/[0.06] px-3 py-2 text-[10.5px] last:border-0">
                  <span class="text-ink3">{{ d.field }}</span>
                  <span class="text-ink2">{{ d.listed }}</span>
                  <span :class="d.verdict === 'block' ? 'text-azure' : 'text-ink2'">{{ d.actual }}</span>
                </div>
              </div>
            </section>
          </div>

          <footer class="border-t border-azure/10 bg-white/60 px-5 py-3">
            <p class="text-[10px] leading-relaxed text-ink3">
              审核 Agent 只做同步判定：发布拦截、聊天提示、快照存档。不参与议价，也不会主动弹窗。
            </p>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
