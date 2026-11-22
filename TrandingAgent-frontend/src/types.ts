export type Category = '数码' | '书籍' | '生活' | '运动' | '乐器' | '美妆' | '户外' | '服饰'

export type Condition = '全新' | '几乎全新' | '九成新' | '七成新'

export type ProductStatus = 'on' | 'sold' | 'off' | 'review'

export type OrderStatus = '待确认' | '交易中' | '已完成' | '已取消'

export interface User {
  id: string
  name: string
  college: string
  grade: string
  credit: number
  verified: boolean
  color: string
  bio: string
  joined: string
  sold: number
  rating: number
}

export interface Product {
  id: string
  title: string
  desc: string
  price: number
  original: number
  category: Category
  condition: Condition
  campus: string
  sellerId: string
  createdAt: string
  tags: string[]
  views: number
  likes: number
  status: ProductStatus
  seed: number
}

export interface TimelineStep {
  label: string
  time: string
  done: boolean
}

export interface Order {
  id: string
  productId: string
  buyerId: string
  sellerId: string
  price: number
  status: OrderStatus
  createdAt: string
  method: '校内面交' | '自提'
  location: string
  note: string
  timeline: TimelineStep[]
  reviewed: boolean
}

export interface Wanted {
  id: string
  title: string
  budget: number
  desc: string
  userId: string
  createdAt: string
  category: Category
  replies: number
  status: '招募中' | '已完成'
}

export interface Post {
  id: string
  title: string
  body: string
  userId: string
  createdAt: string
  likes: number
  comments: number
  topic: string
}

export interface ChatMessage {
  from: 'me' | 'peer'
  text?: string
  time: string
  cardProductId?: string
  image?: boolean
}

export interface Conversation {
  id: string
  peerId: string
  productId: string
  unread: number
  time: string
  messages: ChatMessage[]
}

export interface Review {
  id: string
  fromId: string
  toId: string
  orderId: string
  rating: number
  text: string
  tags: string[]
  createdAt: string
}

export interface Report {
  id: string
  type: '商品' | '求购' | '用户' | '评价'
  target: string
  reason: string
  reporterId: string
  status: '待处理' | '已处理' | '已驳回'
  createdAt: string
}

export interface Banner {
  id: string
  title: string
  sub: string
  tone: string
  on: boolean
}

export interface Notice {
  id: string
  text: string
  time: string
}

export interface ToastItem {
  id: number
  text: string
  tone: 'ok' | 'warn'
}

/* ---------------------------------------------------------------- Agent 域 */

/** 审核结论：通过 / 可执行建议 / 拦截 */
export type Verdict = 'pass' | 'suggest' | 'block'

/** 自主交易任务状态机 */
export type TaskStatus = 'clarifying' | 'searching' | 'negotiating' | 'awaiting' | 'done' | 'failed'

/** 单路议价状态 */
export type LaneStatus = 'queued' | 'running' | 'won' | 'backup' | 'lost' | 'blocked'

/** 需求清单条目，标记来源是用户原话还是模型推断 */
export interface Requirement {
  key: string
  label: string
  value: string
  source: 'user' | 'inferred'
  confidence: number
}

/** 澄清问题，最多追问 2 个 */
export interface ClarifyQuestion {
  id: string
  text: string
  options: string[]
  answer?: string
}

/** 议价过程中的一条消息 */
export interface LaneRound {
  id: string
  from: 'agent' | 'seller'
  text: string
  price?: number
  at: string
  verdict?: Verdict
  checkNote?: string
}

/** 三路并行议价中的一路 */
export interface NegotiationLane {
  id: string
  productId: string
  sellerId: string
  status: LaneStatus
  startPrice: number
  target: number
  price: number
  rounds: number
  maxRounds: number
  messages: LaneRound[]
  health: string[]
}

/** 审核 Agent 的检查结论 */
export interface ModerationFinding {
  id: string
  verdict: Verdict
  scene: 'publish' | 'chat' | 'snapshot'
  rule: string
  target: string
  message: string
  fix?: string
}

/** 取货路线节点 */
export interface PickupStep {
  id: string
  label: string
  detail: string
  minutes: number
  state: 'todo' | 'now' | 'done'
}

/** 任务时间线事件 */
export interface TaskEvent {
  id: string
  at: string
  text: string
  kind: 'info' | 'ok' | 'warn'
}

/** 自主交易任务 */
export interface AgentTask {
  id: string
  rawInput: string
  title: string
  createdAt: string
  status: TaskStatus
  budget: number
  deadline: string
  category: Category
  needs: Requirement[]
  questions: ClarifyQuestion[]
  lanes: NegotiationLane[]
  recommendedLaneId?: string
  orderId?: string
  savings: number
  progress: number
  health: { sellerId: string; label: string; tone: 'ok' | 'warn' }[]
  pickup: PickupStep[]
  events: TaskEvent[]
  moderation: ModerationFinding[]
}

