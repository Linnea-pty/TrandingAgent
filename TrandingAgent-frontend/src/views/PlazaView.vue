<script setup lang="ts">
import { computed, ref } from 'vue'
import { Heart, MessageSquare, PenLine, Plus, ShieldCheck, Sparkles, X } from 'lucide-vue-next'
import Avatar from '@/components/Avatar.vue'
import EmptyState from '@/components/EmptyState.vue'
import { timeAgo, useMarketStore } from '@/stores/market'
const market = useMarketStore()
const { addPost, state, toast, toggleLike, userById } = market

const topics = ['全部', '交易心得', '防骗指南', '闲置吐槽', '互助问答']
const topic = ref('全部')
const composing = ref(false)
const liked = ref<string[]>([])
const form = ref({ title: '', body: '', topic: '交易心得' })

const list = computed(() =>
  topic.value === '全部' ? state.posts : state.posts.filter((p) => p.topic === topic.value),
)

const hot = computed(() => [...state.posts].sort((a, b) => b.likes - a.likes).slice(0, 4))

function like(id: string) {
  if (liked.value.includes(id)) {
    toast('你已经点过赞了', 'warn')
    return
  }
  toggleLike(id)
  liked.value = [...liked.value, id]
}

function publish() {
  if (!form.value.title.trim()) return toast('给这条分享起个标题', 'warn')
  if (!form.value.body.trim()) return toast('内容还空着', 'warn')
  addPost({ title: form.value.title.trim(), body: form.value.body.trim(), topic: form.value.topic })
  form.value = { title: '', body: '', topic: '交易心得' }
  composing.value = false
}
</script>

<template>
  <div class="wrap py-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.26em] text-azure">Campus square</p>
        <h1 class="mt-2 display text-[34px] font-semibold md:text-[42px]">广场</h1>
        <p class="mt-2 max-w-xl text-[13px] leading-relaxed text-ink2/80">
          交易心得、防骗经验、闲置吐槽。这里不卖东西，只交换经验。
        </p>
      </div>
      <button class="btn btn-primary btn-sm" @click="composing = !composing">
        <PenLine v-if="!composing" :size="14" />
        <X v-else :size="14" />
        {{ composing ? '收起编辑器' : '写点什么' }}
      </button>
    </div>

    <div class="mt-6 grid gap-7 lg:grid-cols-[1fr_300px]">
      <div>
        <!-- 编辑器 -->
        <Transition
          enter-active-class="transition duration-300"
          enter-from-class="opacity-0 -translate-y-2"
          leave-active-class="transition duration-200"
          leave-to-class="opacity-0"
        >
          <section v-if="composing" class="panel mb-5 p-5">
            <div class="flex flex-wrap items-center gap-2">
              <select v-model="form.topic" class="field !w-auto !py-2 !text-[12px]">
                <option v-for="t in topics.slice(1)" :key="t">{{ t }}</option>
              </select>
              <span class="font-mono text-[9px] uppercase tracking-widest text-ink3">话题</span>
            </div>
            <input v-model="form.title" maxlength="40" class="field mt-3" placeholder="一个具体的标题，更容易被读完" />
            <textarea
              v-model="form.body"
              rows="4"
              maxlength="500"
              class="field mt-3 resize-none"
              placeholder="发生了什么？你是怎么处理的？给其他同学什么建议？"
            />
            <div class="mt-3 flex items-center justify-between">
              <p class="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ink3">
                <ShieldCheck :size="10" /> 发布前请隐去他人隐私
              </p>
              <button class="btn btn-primary btn-sm" @click="publish"><Plus :size="13" /> 发布</button>
            </div>
          </section>
        </Transition>

        <!-- 话题 -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="t in topics"
            :key="t"
            class="chip !px-3 !py-1.5 !text-[12px]"
            :class="{ 'chip-on': topic === t }"
            @click="topic = t"
          >
            {{ t }}
          </button>
        </div>

        <div v-if="!list.length" class="mt-5">
          <EmptyState title="这个话题还没有内容" desc="成为第一个开口的人。">
            <button class="btn btn-primary btn-sm" @click="composing = true">写点什么</button>
          </EmptyState>
        </div>

        <div v-else class="mt-4 space-y-3">
          <article
            v-for="p in list"
            :key="p.id"
            class="group rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5 transition hover:border-ink/20 hover:shadow-tag"
          >
            <header class="flex items-center gap-2.5">
              <Avatar :user="userById(p.userId)" size="sm" show-verified />
              <div class="min-w-0">
                <p class="text-[12.5px] font-medium">{{ userById(p.userId)?.name }}</p>
                <p class="font-mono text-[9.5px] text-ink3">
                  {{ userById(p.userId)?.college }} · {{ timeAgo(p.createdAt) }}
                </p>
              </div>
              <span class="ml-auto rounded-full border border-ink/15 px-2.5 py-0.5 font-mono text-[9.5px] text-ink3">
                # {{ p.topic }}
              </span>
            </header>

            <h2 class="mt-3.5 font-serif text-[16.5px] font-semibold leading-snug transition group-hover:text-azure">
              {{ p.title }}
            </h2>
            <p class="mt-2 whitespace-pre-line text-[12.5px] leading-[1.85] text-ink2/85">{{ p.body }}</p>

            <footer class="mt-4 flex items-center gap-4 border-t border-dashed border-ink/15 pt-3">
              <button
                class="flex items-center gap-1.5 text-[11.5px] transition"
                :class="liked.includes(p.id) ? 'text-azure' : 'text-ink3 hover:text-azure'"
                @click="like(p.id)"
              >
                <Heart :size="13" :class="liked.includes(p.id) ? 'fill-azure' : ''" /> {{ p.likes }}
              </button>
              <button class="flex items-center gap-1.5 text-[11.5px] text-ink3 transition hover:text-ink" @click="toast('评论区在演示版中未开放')">
                <MessageSquare :size="13" /> {{ p.comments }}
              </button>
              <span class="ml-auto font-mono text-[9px] uppercase tracking-widest text-ink3/70">校园广场</span>
            </footer>
          </article>
        </div>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div class="rounded-2xl border border-ink/10 bg-ink p-5 text-haze">
          <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">House rules</p>
          <h2 class="mt-2 font-serif text-[16px] font-semibold">广场三条</h2>
          <ul class="mt-3 space-y-3 text-[11.5px] leading-relaxed text-haze/70">
            <li>01 · 不挂人，不泄露宿舍号与手机号。</li>
            <li>02 · 交易纠纷请走订单举报，不在广场对线。</li>
            <li>03 · 广告与拉群一律删除，不接受求情。</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-ink/10 bg-[#F7FBFF] p-5">
          <p class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink3">
            <Sparkles :size="10" /> 本周热帖
          </p>
          <ol class="mt-3 space-y-3">
            <li v-for="(p, i) in hot" :key="p.id" class="flex gap-2.5">
              <span class="font-mono text-[10px]" :class="i === 0 ? 'text-azure' : 'text-ink3'">0{{ i + 1 }}</span>
              <p class="line-clamp-2 text-[11.5px] leading-snug text-ink2">{{ p.title }}</p>
            </li>
          </ol>
        </div>

        <div class="rounded-2xl border border-dashed border-azure/40 bg-azure/[0.04] p-5">
          <p class="font-serif text-[13px] font-semibold text-azure">遇到诈骗？</p>
          <p class="mt-2 text-[11px] leading-relaxed text-ink2/80">
            立刻停止转账，保留聊天记录，在订单页发起举报。平台会冻结相关账号并同步学校保卫处。
          </p>
          <router-link to="/orders" class="mt-3 inline-block font-mono text-[10px] uppercase tracking-widest text-azure hover:underline">
            前往订单举报 →
          </router-link>
        </div>
      </aside>
    </div>
  </div>
</template>
