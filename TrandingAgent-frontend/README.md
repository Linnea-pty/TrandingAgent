# 谦价 · 校园二手交易平台

> 让每一件旧物，在校园里遇见下一位主人。

「谦价」是一个面向高校的二手交易平台前端原型。在常规二手交易闭环之上，新增了 **三个 Agent**：

| Agent | 角色 | 可见度 | 呈现形式 |
| --- | --- | --- | --- |
| **小谦**（自主交易） | 主线：一句话下单 → 澄清 → 检索 → 三路并行议价 → 待确认 → 生成订单 | 高，唯一露出的 Agent | 任务卡片流 + 任务详情 + 三列议价大厅 + 顶栏状态条 |
| **审核 Agent** | 守门：发布预检、聊天合规、违禁品类、图文一致性、快照存档 | 中，按需出现 | 发布页侧栏 + 聊天提示卡 + 审查台抽屉 |
| **监控 Agent** | 后台：议价异常、纠纷预警、供需与卖家响应监控 | 低，几乎不可见 | 任务详情里的健康度标签 |

**协作关系**：主 Agent 调守门 Agent，**不是三方对聊**。审核是同步函数（拦在动作之前），监控是异步观察者（只写状态、不发起对话）。界面只露「小谦」一个身份，**不做悬浮球、不做聊天气泡流、不做客服头像**。

```text
用户一句话
    │
    ▼
┌──────────────────────────────────────────────────┐
│ 小谦（自主交易 Agent）                            │
│ 解析 → 澄清(≤2 问) → 召回 → 排序去重 → 3 路议价  │
│                          汇总成交 / 降级备选      │
└───────────┬──────────────────────────┬───────────┘
            │ 同步调用（阻塞动作）      │ 异步上报（只写状态）
            ▼                          ▼
   ┌──────────────────┐       ┌──────────────────┐
   │ 审核 Agent       │       │ 监控 Agent       │
   │ PASS/SUGGEST/BLOCK│      │ 轮次/让步/超时    │
   │ 发布 · 聊天 · 快照│      │ 纠纷预警 · 健康度 │
   └──────────────────┘       └──────────────────┘
```

---

## 1. 设计语言：浅蓝科幻（Light Sci-Fi HUD）

浅色仪表盘而非深色赛博：白蓝玻璃面板、细网格坐标、等宽小标签、发光描边。

| 元素 | 处理方式 |
| --- | --- |
| 底色 | 雾蓝 `haze #E9F1FB`，叠加蓝/青/紫三团柔光 + 32px 细网格 |
| 主色 | 电蓝 `azure #0B63F6`（行动）、青绿 `teal #00A6B8`（成交/通过）、青 `cyan #0B93B3`（提醒）、紫 `violet #6D5CFF`（辅助）、荧光 `neon #22D3EE`（活跃点） |
| 文字 | 深墨 `ink #0A1B2E` / `ink2 #2C4B69` / `ink3 #5E7E9B`，线框 `line #CBDDEF` |
| 字体 | Space Grotesk（标题/数字）+ Inter（正文）+ JetBrains Mono（编号、状态、元信息） |
| 组件 | `hud-panel`（左上光标线 + 玻璃质感）、`shadow-glow`（发光焦点）、`mono-label`、`num-display`、`badge-live`（脉冲在线点） |
| 图形 | 零外链图片，商品图由 `ProductArt.vue` 按品类 + seed 生成冷色系 SVG 插画 |
| 动效 | `pulseDot`（运行中脉冲）、`fadeUp`（入场）、`scan` / `gridPan`（大厅氛围） |

响应式优先：桌面三栏（列表 / 详情 / 侧栏），移动端折叠单栏 + 底部 Tab。

---

## 2. 技术栈

- **Vue 3.5**（`<script setup>` + TypeScript）
- **Vite 8**（Rolldown）
- **Vue Router 4**（History、懒加载、`alias`、`scrollBehavior`）
- **Tailwind CSS 3.4**（自定义色板 / 字体 / 阴影 / 关键帧 / 组件层）
- **lucide-vue-next** 图标
- **Pinia 4**：`useMarketStore` / `useAgentStore` / `useErrorStore` 三个 setup store
- 业务状态 `localStorage` 持久化（`qianjia:state:v1`），任务状态仅内存
- 实时流：统一 `openAgentStream()` 传输层，SSE 与本地 Mock 共用同一套事件与状态机
- 运行时治理：`ErrorBoundary` + `app.config.errorHandler` + 全局 `unhandledrejection` / `window.error` / 路由懒加载失败兜底
- **类型检查**：`vue-tsc --build`；`npm run build` 已通过

---

## 3. 快速开始

环境要求：Node.js `>= 22.18`（或 `>= 24.12`）

```bash
npm install        # 安装依赖
npm run dev        # 本地开发，默认 http://localhost:5173
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
npm run type-check # 仅类型检查
```

环境变量（可选）：

| 变量 | 作用 | 缺省行为 |
| --- | --- | --- |
| `VITE_AGENT_STREAM_URL` | 小谦实时流地址，如 `/api/agent/tasks/{id}/stream` | 不配置则使用本地 Mock 流（3.2s 一轮），断线/重连 UI 表现一致 |

---

## 4. 页面地图

共 30 条路由（29 个业务页面 + 品牌化 404）。★ 为本次新增的 Agent 页面。

### 4.1 小谦 · 自主交易 ★

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/assistant` ★ | 小谦工作台 | 一句话输入 + 示例 chips + 三格 KPI；待确认置顶条、澄清问题卡、任务网格；右侧「运行方式 / 守门 Agent / 最近提示」+ 审查台入口 |
| `/task/:id` ★ | 任务详情 | 需求清单（原话 vs 推断 + 置信度）、三路议价列表、事件流、审核记录；侧栏待确认卡、取货路线、健康度、任务参数 |
| `/arena/:taskId` ★ | 三列议价大厅 | 主视觉：三路并行议价实时直播（消息流、当前价、目标价、轮次、`VALIDATOR PASS`） |

顶栏常驻 `AgentStatusBar`：`小谦 · 正在处理 N 个任务 · M 条待确认`，右侧「今日已省 ¥X」。

### 4.2 用户与认证

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/login` | 登录 / 注册 | 学号或手机号登录、校园统一身份认证入口、注册切换 |
| `/verify` | 实名认证 | 上传学生证/校园卡、OCR 示意、审核进度、权益说明 |
| `/security` | 账号安全 | 改密、绑定手机/邮箱、登录设备管理、注销账号 |

### 4.3 商品与检索

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 轮播、公告跑马灯、**小谦入口卡**、热门分类、精选推荐、瀑布流、平台数据 |
| `/market` | 商品大厅 | 关键词、分类、价格、成色、时间筛选；综合/最新/价格/信用排序 |
| `/product/:id` | 商品详情 | 多图切换、卖家名片、交易地点建议、收藏/举报、立即购买 |
| `/publish`（别名 `/sell/new`） | 发布 / 编辑闲置 | 多图、富文本描述、成色分类、价格议价设置；**发布预检侧栏 + 审查台抽屉** |

### 4.4 交易与订单

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/checkout/:id` | 下单确认 | 校内面交 / 自提、地点选择、费用明细、下单 |
| `/orders` | 我的订单 | 我买到的 / 我卖出的，按状态筛选 |
| `/order/:id` | 订单详情 | 流转时间轴、买卖双方、交易凭证、订单操作 |
| `/review/:orderId` | 评价 | 双评分、标签、文字评价、匿名发布 |

### 4.5 互动与社区

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/messages` | 消息 / 私聊 | 会话列表、商品卡片、图文消息；**输入框上方合规提示卡（不阻断）** |
| `/wanted` | 求购大厅 | 求购信息流、分类排序、回应数、我有这个 / 问问 |
| `/wanted/new` | 发布求购 | 物品名称、期望价格、描述、实时预览 |
| `/square` | 广场 | 话题筛选、发帖、点赞、公约与热榜 |

### 4.6 个人中心

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/profile` | 个人主页 | 名片、信用分、成交/好评统计、在售闲置、收到的评价 |
| `/my/listings` | 我的发布 | 在售/审核中/已售出/已下架管理 |
| `/favorites` | 我的收藏 | 网格 / 列表双视图、取消收藏、清空 |
| `/my/wanted` | 我的求购 | 状态筛选、标记完成、重新开放、删除 |
| `/credit` | 信用与评价 | 信用分环形进度、流水、评价分布 |

### 4.7 运营后台（`/admin/*`）

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/admin/dashboard` | 数据看板 | KPI、7 日成交趋势、分类占比、最新订单、待处理举报 |
| `/admin/users` | 用户管理 | 搜索、实名审核、封禁/解封（联动下架商品） |
| `/admin/products` | 商品 / 求购管理 | 待审核队列、通过、驳回、删除、关闭求购 |
| `/admin/orders` | 交易监控 | 全平台订单、状态筛选、强制推进、取消、标记纠纷 |
| `/admin/reports` | 举报与评价 | 举报受理/驳回、评价检索与删除回滚 |
| `/admin/content` | 轮播与公告 | 上下线、文案编辑、公告新增与撤下 |

---

## 5. 三 Agent 运行机制

### 5.1 小谦的状态机

```text
clarifying ──答完 ≤2 问──▶ searching ──候选 ≥3──▶ negotiating ──达目标价──▶ awaiting ──确认──▶ done
     │                        │                      │
     │                        └─候选 <3──────────────┴─三路全败──▶ failed（给建议价，由人决定）
     └─未缺字段，直接进入 searching
```

单路议价状态：

```text
queued → running → won        （成交，主推）
                 → backup     （其他路成交后降级，保留报价）
                 → lost       （超过 maxRounds 未达目标价）
                 → blocked    （审核 Agent 拦截聊天，终止该路）
```

关键规则（对应 `src/stores/agent.ts`）：

1. **最多追问 2 个问题**：只补影响议价的关键字段（成色、交易地点），其余用推断值并标注置信度（`source: 'inferred'`）。
2. **召回优先级**：同物品优先，不足 3 个退回同品类，价格上限放宽到预算 ×1.2；候选仍不足 → `failed` + 建议价。
3. **每轮流水线**：LLM 提案 → Validator 硬校验（不超预算 / 不承诺站外支付 / 不让步异常）→ 落库 → 推送。校验结果以 `PASS` 徽章显示在气泡上。
4. **一路成交，其余降级**：`won` 之外的 `running` 全部转 `backup`，报价保留，可在待确认卡改选。
5. **全失败降级**：输出建议价 `预算 × 0.92` + 「放宽预算 / 延长期限」两个动作。
6. **确认才落单**：`awaiting` 只代表「谈好了」，用户确认后才创建 `Order`。

### 5.2 审核 Agent（同步守门）

- **发布预检**：`checkPublish({ title, desc, condition })` 边输入边跑，右侧最多 3 条；`BLOCK` 时提交被拦截并自动展开审查台。
- **聊天合规**：`checkChat(text)`，`SUGGEST` 只给建议（可「仍然发送」），`BLOCK` 不进入聊天记录。
- **不参与议价**：只校验每轮发出的消息是否合规，不发言、不主动发起。
- **快照存档**：发布通过时落快照，纠纷时做「挂牌描述 vs 买家实拍」字段比对（`snapshotDiff`）。

规则集（`src/data/agent.ts` → `reviewRules`）：

| 编号 | 名称 | 级别 |
| --- | --- | --- |
| R-101 | 校园违禁品类（代考代写、证件出借、大功率电器、电动车电池、烟酒、处方药） | BLOCK |
| R-102 | 站外交易引导（加微信、扫码、私下转账、外链） | BLOCK |
| R-201 | 绝对化用语（全网最低、最便宜、第一） | SUGGEST |
| R-202 | 图文一致性（称「几乎全新」但描述有划痕/亮点） | SUGGEST |
| R-203 | 隐私信息（手机号、门牌、身份证号） | SUGGEST |
| R-204 | 交易沟通合规（转账、代付、验证码） | BLOCK |

### 5.3 监控 Agent（异步观察）

- **议价异常**：轮次超限、单轮让步过大、卖家长时间未响应。
- **纠纷预警**：快照与描述/实拍字段比对，输出可调解材料。
- **供需与卖家质量**：同类在售量、挂售时长、卖家 30 天成交与响应速度。
- **呈现约束**：只在 `/task/:id` 以健康度标签出现；**不弹窗、不单独页面、不参与对话**。

---

## 6. 核心交互闭环

1. **发布 → 审核 → 上架**：填写即预检，`BLOCK` 拦截提交；通过后进入「审核中」，后台通过后上架。
2. **一句话 → 议价 → 订单**：`/assistant` 输入 →（必要时 2 问）→ 3 路议价 → 一路成交其余降级 → 待确认 → 生成订单。
3. **下单 → 确认 → 完成**：详情页立即购买 → 确认页 → 订单（待确认）→ 卖家确认（交易中）→ 双方确认（已完成，商品自动售出）→ 评价。
4. **评价影响信用**：提交评价写入卖家评价列表，信用页展示分布与流水；后台可删除异常评价。
5. **私聊即凭证**：商品页/订单页带 `peer` 参数直达会话；聊天内合规提示保留议价记录。
6. **后台联动**：审核商品即时改变前台可见性；封禁用户自动下架其全部商品；公告/轮播即时反映首页。

### 6.1 状态层（Pinia）

| Store | 职责 | 是否持久化 |
| --- | --- | --- |
| `useMarketStore` | 商品/订单/求购/会话/收藏、`me` 等派生数据、下单与评价等写操作、`toast` | 是，`localStorage` key `qianjia:state:v1` |
| `useAgentStore` | 任务状态机、澄清、召回、三路议价、确认落单、审核函数、SSE 连接状态 | 否（刷新回到初始剧本，避免模拟半成品污染演示） |
| `useErrorStore` | 收集 `ErrorBoundary` 与全局处理器上报的异常，最近 20 条、3s 内同源去重 | 否 |

约定：

- 组件内统一 `const market = useMarketStore()`，纯工具（`money` / `timeAgo` / `orderCode`）与常量（`statusMeta` / `verdictMeta`）直接从 `@/stores/*` 具名导入，不进 store。
- 派生数据（`me` / `onSale` / `agentStats` …）用 `storeToRefs` 取，保持响应式；`state` 是 `reactive` 对象，可直接解构。
- 持久化在 store 内部完成（`hydrate()` + `watch(state, persist, { deep: true })`）；存储损坏或配额不足时降级为纯内存，不阻断启动。

恢复初始演示数据：

```js
localStorage.removeItem('qianjia:state:v1')
location.reload()
```

### 6.2 错误边界与全局异常

| 层级 | 位置 | 行为 |
| --- | --- | --- |
| 组件树 | `src/components/ErrorBoundary.vue`（`onErrorCaptured`） | 只替换出错区块：展示消息/阶段/记录号，支持「重试这一块」「回首页」「复制诊断信息」；返回 `false` 阻止重复上报 |
| 应用级 | `app.config.errorHandler` | 记录到 `useErrorStore` + 一次轻提示，兜住事件处理器与生命周期异常 |
| 路由级 | `router.onError` | 懒加载 chunk 失败单独记录，提示检查网络 |
| 浏览器级 | `unhandledrejection` / `window.error` | 记录未捕获 Promise 与脚本错误 |

`App.vue` 用 `<ErrorBoundary :key="route.path">` 包住 `RouterView`：切页即重建边界，页头页脚不受影响；后台 `/admin/*` 同样包裹。

### 6.3 SSE 连接治理

`src/api/agentStream.ts` 把传输细节收在一处，对上层只暴露 `onStatus` / `onEvent`：

- 配置 `VITE_AGENT_STREAM_URL` 走真实 `EventSource`（`?taskId=` 透传），未配置走 Mock（3.2s 一轮议价），两者状态机一致。
- 状态顺序：`connecting → open`；断线先 `lost`（立即提示「连接丢失」），随后进入 `reconnecting`（第 N 次，Mock 延迟 800ms，真实 SSE 立即退避），成功后 `open` 并提示「连接已恢复」。
- 真实 SSE 采用指数退避（0.8s×2ⁿ，上限 8s）；单条脏报文只丢弃该条，不打断整条流。

---

## 7. 演示脚本（3 分钟走完全部能力）

1. 首页点「小谦入口」卡片，或访问 `/assistant`。
2. 输入 `收一台 27 寸显示器，预算 900，这周就要`：
   - 缺成色/地点 → 出现 2 个澄清问题，答完进入检索；
   - 输入已含成色与地点 → 零追问，直接检索。
3. 约 1.6s 后进入议价：点「三列大厅」→ `/arena/:taskId`，三列同时推进，每轮带 `VALIDATOR PASS`。
4. 某一路达目标价 → 其余两路变「备选」→ 状态变「待确认」，顶栏计数同步。
5. 回 `/task/:id` 看待确认卡、取货路线、健康度 → 确认 → 生成订单并跳转订单详情。
6. `/sell/new` 描述粘贴 `加我微信，私下转账便宜 20` → 侧栏 `BLOCK`，提交被拦截 → 展开审查台。
7. `/messages` → 「试用合规提示」→ 输入框上方出现 `SUGGEST` 卡，可「采纳建议」或「仍然发送」。
8. 打开预置任务 `/task/task-71bd`：C 路卖家要求微信转账被审核拦截并终止，A 路成交、B 路降级。
9. `/assistant` 右侧「演示控制 · DEV」→「模拟 SSE 断线」：顶栏**先**显示「连接丢失」，随后变「连接丢失 · 正在重连（第 1 次）」，恢复后提示「连接已恢复」；同时打开 `/arena/:taskId` 可看到大厅顶部告警条「实时价格可能已过期」。
10. 同一区域「触发渲染异常」：仅当前页面区块被错误边界替换（页头页脚、已输入内容仍在），点「重试这一块」即恢复。

---

## 8. 目录结构

```text
src/
├─ main.ts                    # 应用入口
├─ App.vue                    # 前台 AppShell / 后台独立布局
├─ style.css                  # Tailwind 层 + HUD 组件类（hud-panel/mono-label/badge-live…）
├─ types.ts                   # User/Product/Order + AgentTask/NegotiationLane/ModerationFinding…
├─ router/index.ts            # 30 条路由、懒加载、标题与滚动行为
├─ data/
│  ├─ mock.ts                 # 商品(含 p16–p21)、用户、订单、会话、评价、举报、轮播
│  └─ agent.ts                # 演示任务种子、审核规则集、快照差异
├─ api/
│  └─ agentStream.ts          # 实时流传输层：EventSource / Mock 双实现，统一 lost→reconnecting→open
├─ stores/                    # Pinia setup stores
│  ├─ market.ts               # 业务状态 + 持久化、下单/评价/消息、toast
│  ├─ agent.ts                # 任务状态机、澄清、召回、三路议价、确认落单、审核函数、连接状态
│  └─ error.ts                # 全局错误收集（错误边界与全局处理器共用）
├─ components/
│  ├─ AppShell / SiteHeader / SiteFooter / AdminLayout
│  ├─ ErrorBoundary.vue       # 统一错误边界：局部兜底、重试、诊断信息
│  ├─ AgentStatusBar.vue      # 顶栏「小谦 · 正在处理 N 个任务 · M 条待确认」/ 断线提示
│  ├─ TaskCard.vue            # 任务卡（状态徽章 / 预算-最好价-已省 / 进度 / 三路价格）
│  ├─ NegotiationLane.vue     # 单路议价直播卡（消息流 + 校验标记 + 自动滚动）
│  ├─ ModerationDrawer.vue    # 审查台抽屉（本次检查 / 规则集 / 快照比对）
│  ├─ ProductArt / ProductCard / ProfileSidebar
│  └─ Avatar / Stars / CategoryIcon / SectionHead / EmptyState / AppModal / ToastHost
└─ views/
   ├─ AssistantView / TaskDetailView / ArenaView        ★ Agent
   ├─ HomeView / MarketView / ProductDetailView / PublishView
   ├─ LoginView / VerifyView / SecurityView
   ├─ CheckoutView / OrdersView / OrderDetailView / ReviewView
   ├─ MessagesView / WantedView / WantedPublishView / PlazaView
   ├─ ProfileView / MyListingsView / FavoritesView / MyWantedView / CreditView
   ├─ NotFoundView
   └─ admin/ AdminDashboard / AdminUsers / AdminProducts / AdminOrders / AdminReports / AdminContent
```

---

## 9. 演示账号与数据

- 当前登录用户固定为 `ME_ID`（林知遥，信用 96，已实名），无需真实登录即可浏览全部页面。
- 演示商品 20 件（`p16–p18` 三台 27 寸显示器、`p19–p21` 三把 87 键键盘，其中 `p21` 描述含站外转账引导用于演示拦截）、用户 8 位、订单若干、会话 4 组。
- 演示环境不产生真实网络请求：上传、支付、OCR、议价等入口以状态反馈呈现；接后端时替换 `stores/agent.ts` 与 `stores/market.ts` 中对应 action（对照 [docs/backend-api.md](docs/backend-api.md) 第 8 节）。

---

## 10. 后端接口

Agent 相关接口已独立成文（含完整 JSON 示例、SSE 事件表、断线重连与错误契约）：

> **[docs/backend-api.md](docs/backend-api.md)**

端点速览：

| # | 方法 | 路径 | 用途 |
| --- | --- | --- | --- |
| 1 | POST | `/api/agent/tasks` | 一句话创建任务 |
| 2 | POST | `/api/agent/tasks/{id}/answers` | 提交澄清答案（≤2 问） |
| 3 | GET | `/api/agent/tasks` | 任务列表 |
| 4 | GET | `/api/agent/tasks/{id}` | 任务详情 |
| 5 | GET | `/api/agent/tasks/{id}/stream` | SSE 实时流（snapshot / lane.round / validator.verdict / task.settled…） |
| 6 | POST | `/api/agent/tasks/{id}/confirm` | 确认成交 → 生成订单 |
| 7 | POST | `/api/agent/tasks/{id}/abort` | 取消任务 |
| 8 | PATCH | `/api/agent/tasks/{id}` | 调预算/期限后重跑 |
| 9 | GET | `/api/agent/summary` | 顶栏「N 处理中 · M 待确认 · 省 ¥X」 |
| 10 | POST | `/api/moderation/publish-check` | 发布预检（PASS/SUGGEST/BLOCK） |
| 11 | POST | `/api/moderation/chat-check` | 聊天合规（不阻断） |
| 12 | GET | `/api/moderation/queue` | 审查台列表 |
| 13 | GET | `/api/moderation/snapshot/{productId}` | 快照 + 纠纷字段比对 |
| 14 | GET | `/api/monitor/tasks/{id}/health` | 健康度 / 异常 flags |

---

## 11. 可访问性与性能

- 图标按钮均带 `aria-label`；开关使用 `role="switch"`；表单控件均有关联 `label`。
- 焦点态统一 2px 电蓝描边（`#0B63F6`）；商品图为内联 SVG，不依赖外部图床。
- 路由级代码分割：基础包（Vue + Pinia + Router）132 KB（gzip 50 KB），首页 chunk 14.1 KB（gzip 5.8 KB），Agent 三页各自独立（`AssistantView` 16.7 KB / `TaskDetailView` 15.0 KB / `ArenaView` 11.0 KB）。
- 错误边界按路由重建（`:key="route.path"`），单页异常不影响导航与页头页脚。
- 议价消息流使用 `scrollTop` 跟随，不触发整页重排；列表入场为一次性 CSS 动画。

---

## 12. 后续可扩展

- 接入真实 API 与鉴权（JWT / 校园 CAS），按第 10 节替换 store 中的同步模拟。
- 审查台升级为独立工作台（仅管理员），补操作审计与申诉工单。
- 监控 Agent 增加平台级看板（异常议价率、纠纷率、卖家响应分位）。
- 议价策略可配置：目标折扣、让步曲线、最大轮次、是否允许「加价换配件」。
- 图片上传改为对象存储直传 + 压缩，商品图接入 CDN。
