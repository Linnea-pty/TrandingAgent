<script setup lang="ts">
import { computed, ref } from 'vue'
import { Ban, Search, UserCheck } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import { useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { state, toast } = market

const keyword = ref('')
const scope = ref<'全部' | '已实名' | '待审核'>('全部')
const banned = ref<string[]>([])

const list = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return state.users.filter((u) => {
    if (scope.value === '已实名' && !u.verified) return false
    if (scope.value === '待审核' && u.verified) return false
    if (kw && !`${u.name}${u.college}${u.id}`.toLowerCase().includes(kw)) return false
    return true
  })
})

const pendingCount = computed(() => state.users.filter((u) => !u.verified).length)

function approve(id: string) {
  const u = state.users.find((x) => x.id === id)
  if (!u) return
  u.verified = true
  u.credit += 10
  toast(`已通过 ${u.name} 的实名认证`)
}

function toggleBan(id: string) {
  const u = state.users.find((x) => x.id === id)
  if (!u) return
  if (banned.value.includes(id)) {
    banned.value = banned.value.filter((x) => x !== id)
    toast(`已解除 ${u.name} 的封禁`)
  } else {
    banned.value = [...banned.value, id]
    toast(`已封禁 ${u.name}，其商品全部下架`, 'warn')
    state.products.filter((p) => p.sellerId === id).forEach((p) => (p.status = 'off'))
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
        <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">总用户</p>
        <p class="mt-2 display text-[24px] font-semibold leading-none">{{ state.users.length }}</p>
      </div>
      <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
        <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">待审核实名</p>
        <p class="mt-2 display text-[24px] font-semibold leading-none text-[#0A6E8A]">{{ pendingCount }}</p>
      </div>
      <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-4">
        <p class="font-mono text-[9px] uppercase tracking-[0.18em] text-ink3">已封禁</p>
        <p class="mt-2 display text-[24px] font-semibold leading-none text-azure">{{ banned.length }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-[#F7FBFF] p-3">
      <div class="relative min-w-[180px] flex-1">
        <Search :size="13" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
        <input
          v-model="keyword"
          class="w-full rounded-full border border-ink/15 bg-haze/70 py-2 pl-8 pr-3 text-[12px] outline-none focus:border-ink/35 focus:bg-white"
          placeholder="搜索昵称 / 学院 / 用户 ID"
        />
      </div>
      <div class="flex gap-1.5">
        <button
          v-for="s in (['全部', '已实名', '待审核'] as const)"
          :key="s"
          class="chip !px-3 !py-1 !text-[11.5px]"
          :class="{ 'chip-on': scope === s }"
          @click="scope = s"
        >
          {{ s }}
        </button>
      </div>
      <span class="ml-auto font-mono text-[10px] text-ink3">{{ list.length }} / {{ state.users.length }}</span>
    </div>

    <div class="overflow-hidden rounded-2xl border border-ink/10 bg-[#F7FBFF]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px]">
          <thead>
            <tr>
              <th class="table-head">用户</th>
              <th class="table-head">学院 / 年级</th>
              <th class="table-head">信用</th>
              <th class="table-head">成交</th>
              <th class="table-head">实名</th>
              <th class="table-head">状态</th>
              <th class="table-head text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in list" :key="u.id" class="transition hover:bg-haze2/40">
              <td class="table-cell">
                <div class="flex items-center gap-2.5">
                  <Avatar :user="u" size="sm" />
                  <div>
                    <p class="text-[12.5px] font-medium text-ink">{{ u.name }}</p>
                    <p class="font-mono text-[9px] text-ink3">{{ u.id }} · {{ u.joined }} 加入</p>
                  </div>
                </div>
              </td>
              <td class="table-cell text-[11.5px]">
                {{ u.college }}
                <span class="ml-1 font-mono text-[9.5px] text-ink3">{{ u.grade }}</span>
              </td>
              <td class="table-cell">
                <span
                  class="font-mono text-[12px]"
                  :class="u.credit >= 90 ? 'text-teal' : u.credit >= 80 ? 'text-ink2' : 'text-azure'"
                >
                  {{ u.credit }}
                </span>
              </td>
              <td class="table-cell font-mono text-[11.5px]">{{ u.sold }}</td>
              <td class="table-cell">
                <span
                  class="rounded-full px-2 py-0.5 font-mono text-[9.5px]"
                  :class="u.verified ? 'bg-teal/10 text-teal' : 'bg-cyan/15 text-[#0A6E8A]'"
                >
                  {{ u.verified ? '已实名' : '待审核' }}
                </span>
              </td>
              <td class="table-cell">
                <span
                  class="rounded-full px-2 py-0.5 font-mono text-[9.5px]"
                  :class="banned.includes(u.id) ? 'bg-azure/10 text-azure' : 'bg-ink/[0.06] text-ink3'"
                >
                  {{ banned.includes(u.id) ? '已封禁' : '正常' }}
                </span>
              </td>
              <td class="table-cell">
                <div class="flex justify-end gap-1.5">
                  <button
                    v-if="!u.verified"
                    class="btn btn-teal btn-sm !px-2 !py-1 !text-[10px]"
                    @click="approve(u.id)"
                  >
                    <UserCheck :size="10" /> 通过
                  </button>
                  <button
                    class="btn btn-ghost btn-sm !px-2 !py-1 !text-[10px]"
                    :class="banned.includes(u.id) ? '' : '!text-azure'"
                    @click="toggleBan(u.id)"
                  >
                    <Ban :size="10" /> {{ banned.includes(u.id) ? '解封' : '封禁' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="7" class="px-4 py-12 text-center text-[12px] text-ink3">没有匹配的用户</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
