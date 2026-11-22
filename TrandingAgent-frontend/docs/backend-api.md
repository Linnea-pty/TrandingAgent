# 谦价 · 后端接口文档（Agent 部分）

> 适用版本：前端 `feat/pinia-error-boundary`
> 目标：把前端 `src/stores/agent.ts` 的模拟逻辑替换为真实调用，页面与交互零改动。
> 所有 Agent 决策在服务端；前端只负责「输入一句话 / 渲染任务 / 接收推送 / 确认成交」。

## 目录

1. [通用约定](#1-通用约定)
2. [数据模型](#2-数据模型)
3. [端点总览](#3-端点总览)
4. [自主交易接口](#4-自主交易接口)
5. [实时流（SSE）](#5-实时流sse)
6. [审核 Agent 接口](#6-审核-agent-接口)
7. [监控 Agent 接口](#7-监控-agent-接口)
8. [前端对接与连接契约](#8-前端对接与连接契约)

---

## 1. 通用约定

| 项 | 约定 |
| --- | --- |
| Base URL | `/api` |
| 鉴权 | `Authorization: Bearer <access_token>` |
| 请求体 | `application/json; charset=utf-8` |
| 响应包 | `{ "code": 0, "message": "ok", "data": … }`，`code != 0` 即失败 |
| 时间 | ISO 8601 带时区，如 `2026-11-22T18:04:00+08:00` |
| 金额 | 整数，单位「元」 |
| 幂等 | 创建任务、确认下单、发送议价轮次支持 `Idempotency-Key`，服务端按 key 去重 24h |
| 分页 | `?page=1&size=20`，返回 `{ items, total, page, size }` |
| 追踪 | 建议响应头返回 `X-Request-Id`，与前端错误诊断信息对齐 |

错误码：

| code | HTTP | 含义 | 前端表现 |
| --- | --- | --- | --- |
| `0` | 200/201 | 成功 | — |
| `40001` | 400 | 参数缺失或格式错误 | 表单内联提示 |
| `40101` | 401 | 未登录 / token 失效 | 跳登录 |
| `40301` | 403 | 非任务归属人 | 403 提示 |
| `40401` | 404 | 任务 / 商品 / 会话不存在 | 空态页 |
| `40901` | 409 | 状态冲突（任务已结束、该路已关闭） | toast + 刷新任务 |
| `40902` | 409 | 商品已下架/售出 | 提示并回到 `negotiating` |
| `42201` | 422 | 预算过低、无可用候选 | 进入 `failed`，给建议价 |
| `42901` | 429 | 频率限制 | 按钮禁用 + 倒计时 |
| `50001` | 500 | 模型或内部错误（可重试） | 记录到错误商店 |

> 约定：业务态失败（议价全败、候选不足）**不用 4xx/5xx**，而是 `200 + task.status = failed`，避免前端把「没谈成」当成系统故障。

---

## 2. 数据模型

### 2.1 AgentTask

```json
{
  "id": "task-8f2a",
  "rawInput": "收一台 27 寸显示器，预算 900，这周就要",
  "title": "27 寸显示器 · 预算 900",
  "status": "negotiating",
  "createdAt": "2026-11-22T18:02:00+08:00",
  "budget": 900,
  "deadline": "本周五前",
  "category": "数码",
  "needs": [
    { "key": "item", "label": "物品", "value": "27 寸显示器（2K 优先）", "source": "user", "confidence": 0.98 },
    { "key": "condition", "label": "成色", "value": "九成新以上", "source": "inferred", "confidence": 0.72 }
  ],
  "questions": [
    { "id": "q-place", "text": "希望在哪个校区面交？", "options": ["东校区", "西校区", "南苑宿舍", "都可以"], "answer": "东校区" }
  ],
  "lanes": [],
  "recommendedLaneId": "lane-a",
  "orderId": null,
  "savings": 65,
  "progress": 72,
  "health": [{ "sellerId": "u3", "label": "该卖家响应偏慢", "tone": "warn" }],
  "pickup": [
    { "id": "k1", "label": "东校区图书馆一层大厅", "detail": "公共区域，有插座可现场验机", "minutes": 6, "state": "now" }
  ],
  "events": [{ "id": "e1", "at": "18:02", "text": "一句话识别 5 项需求", "kind": "info" }],
  "moderation": []
}
```

枚举：

- `status`：`clarifying | searching | negotiating | awaiting | done | failed`
- `lane.status`：`queued | running | won | backup | lost | blocked`
- `needs[].source`：`user | inferred`
- `events[].kind`：`info | ok | warn`
- `pickup[].state`：`todo | now | done`
- `health[].tone`：`ok | warn`

### 2.2 NegotiationLane

```json
{
  "id": "lane-a",
  "productId": "p16",
  "sellerId": "u1",
  "status": "running",
  "startPrice": 880,
  "target": 780,
  "price": 835,
  "rounds": 5,
  "maxRounds": 8,
  "health": ["历史成交 42 单", "响应 2 分钟"],
  "messages": [
    {
      "id": "a3",
      "from": "agent",
      "text": "预算 900 要留出验机时间，830 我现在就能定，今晚图书馆一层见。",
      "price": 830,
      "at": "2026-11-22T18:09:00+08:00",
      "verdict": "pass",
      "checkNote": "让步幅度 3.5%，处于健康区间"
    }
  ]
}
```

`from`：`agent | seller`；`verdict`：`pass | suggest | block`（`block` 的轮次不落库、不推送，直接置 `lane.status = blocked`）。

### 2.3 ModerationFinding

```json
{
  "id": "f-2",
  "verdict": "block",
  "scene": "publish",
  "rule": "R-102 站外交易",
  "target": "27 寸显示器",
  "message": "描述中出现站外联系方式或私下转账引导。",
  "fix": "删除联系方式，改用平台内「私聊」与「立即购买」。"
}
```

`scene`：`publish | chat | snapshot`。

### 2.4 Order

```json
{
  "id": "o1763800000000",
  "productId": "p16",
  "buyerId": "u-me",
  "sellerId": "u1",
  "price": 835,
  "status": "待确认",
  "createdAt": "2026-11-22T18:40:00+08:00",
  "method": "校内面交",
  "location": "东校区图书馆一层大厅",
  "note": "小谦议价成交 · 挂牌价 ¥880，省 ¥45",
  "reviewed": false,
  "timeline": [
    { "label": "小谦议价成交", "time": "18:40", "done": true },
    { "label": "订单已创建", "time": "18:40", "done": true },
    { "label": "卖家确认", "time": "等待卖家确认", "done": false }
  ]
}
```

---

## 3. 端点总览

| # | 方法 | 路径 | 用途 |
| --- | --- | --- | --- |
| 1 | POST | `/api/agent/tasks` | 一句话创建任务 |
| 2 | POST | `/api/agent/tasks/{taskId}/answers` | 提交澄清答案（≤2 问） |
| 3 | GET | `/api/agent/tasks` | 任务列表 |
| 4 | GET | `/api/agent/tasks/{taskId}` | 任务详情 |
| 5 | GET | `/api/agent/tasks/{taskId}/stream` | SSE 实时流 |
| 6 | POST | `/api/agent/tasks/{taskId}/confirm` | 确认成交、生成订单 |
| 7 | POST | `/api/agent/tasks/{taskId}/abort` | 取消任务 |
| 8 | PATCH | `/api/agent/tasks/{taskId}` | 调整预算/期限并重跑 |
| 9 | GET | `/api/agent/summary` | 顶栏状态条汇总 |
| 10 | POST | `/api/moderation/publish-check` | 发布预检（同步） |
| 11 | POST | `/api/moderation/chat-check` | 聊天合规（同步，不阻断） |
| 12 | GET | `/api/moderation/queue` | 审查台列表 |
| 13 | GET | `/api/moderation/snapshot/{productId}` | 发布快照 + 差异比对 |
| 14 | GET | `/api/monitor/tasks/{taskId}/health` | 任务健康度 |

---

## 4. 自主交易接口

### ① 创建任务

`POST /api/agent/tasks`

```json
{ "rawInput": "收一台 27 寸显示器，预算 900，这周就要" }
```

服务端职责：解析需求 → 生成 `needs` → 判断缺失字段 → 最多 2 个 `questions` → 无追问则直接 `searching`。

```json
{
  "code": 0,
  "data": {
    "task": {
      "id": "task-8f2a",
      "status": "clarifying",
      "budget": 900,
      "deadline": "本周五前",
      "category": "数码",
      "needs": [
        { "key": "item", "label": "物品", "value": "27 寸显示器", "source": "user", "confidence": 0.98 }
      ],
      "questions": [
        { "id": "q-condition", "text": "成色可以接受到什么程度？", "options": ["几乎全新", "九成新即可", "能正常用就行"] },
        { "id": "q-place", "text": "希望在哪个校区面交？", "options": ["东校区", "西校区", "南苑宿舍", "都可以"] }
      ],
      "lanes": [],
      "progress": 8
    }
  }
}
```

约束：`questions.length ≤ 2`；为空时 `status = searching`，客户端应立即订阅 SSE。限流 10 次/分钟 → `42901`。

### ② 提交澄清答案

`POST /api/agent/tasks/{taskId}/answers`

```json
{ "answers": [{ "questionId": "q-condition", "answer": "九成新即可" }, { "questionId": "q-place", "answer": "东校区" }] }
```

返回 `data.task` 全量。全部答完服务端自行进入 `searching`，无需额外调用。

### ③ 任务列表

`GET /api/agent/tasks?status=awaiting,negotiating&page=1&size=20`

```json
{ "code": 0, "data": { "items": [ { "id": "task-8f2a", "title": "27 寸显示器 · 预算 900", "status": "negotiating", "progress": 72, "savings": 65 } ], "total": 2, "page": 1, "size": 20 } }
```

列表项可精简（不含 `messages`），详情页再取全量。

### ④ 任务详情

`GET /api/agent/tasks/{taskId}` → `data.task`（含 `lanes[].messages`、`events`、`moderation`、`pickup`、`health`）。

### ⑤ 实时流

见[第 5 节](#5-实时流sse)。

### ⑥ 确认成交

`POST /api/agent/tasks/{taskId}/confirm`

```json
{ "laneId": "lane-a", "method": "校内面交", "location": "东校区图书馆一层大厅" }
```

- `laneId` 省略时取 `recommendedLaneId`；仅 `won` / `backup` 可确认，否则 `40901`。
- 商品已下架返回 `40902`，前端提示后把任务退回 `negotiating` 重新检索。
- 幂等：同一 `Idempotency-Key` 重复提交返回同一订单，不重复扣减库存。

```json
{ "code": 0, "data": { "order": { "id": "o1763800000000", "price": 835, "status": "待确认" } } }
```

### ⑦ 取消任务

`POST /api/agent/tasks/{taskId}/abort` → `data.task`（`status: failed`）。服务端需停止该任务全部议价协程并释放卖家会话。

### ⑧ 调整并重跑

`PATCH /api/agent/tasks/{taskId}`

```json
{ "budget": 1200, "deadline": "月底前" }
```

仅 `failed` 可调用；返回任务回到 `searching`，用于「建议价」后的重试。

### ⑨ 顶栏汇总

`GET /api/agent/summary`

```json
{ "code": 0, "data": { "active": 2, "pending": 1, "savedToday": 127 } }
```

`active` = `clarifying|searching|negotiating` 数量；`pending` = `awaiting`；`savedToday` = 当日已确认任务的 `savings` 之和。

---

## 5. 实时流（SSE）

`GET /api/agent/tasks/{taskId}/stream`

| 项 | 约定 |
| --- | --- |
| Header | `Accept: text/event-stream` |
| 心跳 | `event: ping`，15s 一次 |
| 重连 | 服务端 `retry: 3000`；每条消息写 `id:`，客户端带 `Last-Event-ID` 续传 |
| 缓存 | 服务端保留最近 200 条事件，用于断线补发 |
| 压缩 | 关闭该响应的 gzip/buffer，避免事件被攒批 |
| CORS | 允许 `Authorization` 与 `Last-Event-ID` 请求头 |

事件枚举：

| event | data 关键字段 | 说明 |
| --- | --- | --- |
| `snapshot` | `task` | 连接建立时全量快照，用于断线追平 |
| `task.status` | `status, progress, savings` | 状态机变更 |
| `lane.opened` | `lane` | 新开一路议价（含首条消息） |
| `lane.round` | `laneId, round, price, rounds` | 新增一轮消息 |
| `lane.status` | `laneId, status, reason` | `won/backup/lost/blocked` |
| `validator.verdict` | `laneId, roundId, verdict, rule, note` | 硬校验结果（前端渲染 `PASS`） |
| `moderation.finding` | `finding` | 议价/聊天中的违规拦截 |
| `health.update` | `health` | 监控 Agent 健康度 |
| `task.event` | `event` | 追加事件流条目 |
| `task.settled` | `recommendedLaneId, price, savings` | 一路成交，其余降级 |
| `task.failed` | `reason, suggestedPrice` | 三路全败 / 候选不足 |
| `task.done` | `orderId` | 已生成订单 |

示例：

```text
id: 1723-12
event: lane.round
data: {"laneId":"lane-a","price":835,"rounds":5,"round":{"id":"a5","from":"agent","text":"835 接受，先锁定这一路","price":835,"verdict":"pass"}}

id: 1723-13
event: task.settled
data: {"recommendedLaneId":"lane-a","price":835,"savings":65}
```

**断线语义（前端已实现，后端需配合）**：

1. 连接异常时前端先显示「连接丢失」，不展示旧价格为新价格。
2. 前端 800ms 后进入 `reconnecting`，按 0.8s×2ⁿ 退避（上限 8s）重连。
3. 重连成功必须**先发 `snapshot`**，再补 `Last-Event-ID` 之后的事件，避免 UI 停在半旧状态。
4. 若任务已结束，直接发 `snapshot`（`status` 终态）后由服务端关闭连接。

---

## 6. 审核 Agent 接口

### ⑩ 发布预检（同步）

`POST /api/moderation/publish-check`

```json
{
  "title": "27 寸 2K 显示器",
  "desc": "九成新，加微信私下转账便宜 20",
  "condition": "九成新",
  "category": "数码",
  "price": 880,
  "images": [{ "url": "https://cdn.example.com/1.jpg", "width": 1200, "height": 900, "hash": "sha256:..." }]
}
```

```json
{
  "code": 0,
  "data": {
    "verdict": "block",
    "findings": [
      {
        "id": "f-2",
        "verdict": "block",
        "scene": "publish",
        "rule": "R-102 站外交易",
        "target": "27 寸 2K 显示器",
        "message": "描述中出现站外联系方式或私下转账引导。",
        "fix": "删除联系方式，改用平台内「私聊」与「立即购买」。"
      }
    ],
    "snapshotId": null,
    "latencyMs": 38
  }
}
```

约定：

- `block` → 前端拦截提交；`suggest` → 允许提交但展示建议；`pass` → 通过。
- 通过时服务端落快照（`snapshotId` 非空），供纠纷比对。
- 频控 30 次/分钟；模型不可用时降级为规则引擎并返回 `degraded: true`，不阻塞发布。
- 目标延迟：规则 ≤50ms，模型补充异步回写。

### ⑪ 聊天合规（同步，不阻断）

`POST /api/moderation/chat-check`

```json
{ "conversationId": "c1", "text": "加我微信转账吧，便宜 20" }
```

```json
{
  "code": 0,
  "data": {
    "verdict": "suggest",
    "finding": {
      "id": "chat-1",
      "verdict": "suggest",
      "scene": "chat",
      "rule": "R-204 交易沟通",
      "target": "当前输入",
      "message": "平台内沟通可保留议价与交易凭证，建议不要引导到站外。",
      "fix": "「加微信转账」→「我们在平台内确认，约在图书馆面交」。"
    }
  }
}
```

- 永远返回 200：`suggest` 允许「仍然发送」；`block` 由前端阻止进入聊天记录，服务端在发送接口二次拦截。
- 单次 < 100ms（规则优先），避免阻塞输入。

### ⑫ 审查台列表

`GET /api/moderation/queue?scene=publish&limit=20`

```json
{ "code": 0, "data": { "items": [ { "id": "mq1", "verdict": "suggest", "rule": "R-201 绝对化用语", "target": "「全网最低价 iPad」" } ], "total": 3 } }
```

### ⑬ 发布快照与差异

`GET /api/moderation/snapshot/{productId}`

```json
{
  "code": 0,
  "data": {
    "productId": "p16",
    "snapshotId": "snap-9f21",
    "capturedAt": "2026-11-20T10:12:00+08:00",
    "difference": [
      { "field": "成色", "listed": "几乎全新", "actual": "背板 3cm 划痕（买家实拍）", "verdict": "suggest" },
      { "field": "配件", "listed": "含原装电源 + DP 线", "actual": "仅第三方电源", "verdict": "block" },
      { "field": "价格", "listed": "¥960", "actual": "议价成交 ¥900", "verdict": "pass" }
    ]
  }
}
```

---

## 7. 监控 Agent 接口

### ⑭ 任务健康度

`GET /api/monitor/tasks/{taskId}/health`

```json
{
  "code": 0,
  "data": {
    "taskId": "task-8f2a",
    "updatedAt": "2026-11-22T18:31:00+08:00",
    "lanes": [
      { "laneId": "lane-b", "status": "running", "flags": [{ "code": "SLOW_SELLER", "level": "warn", "message": "卖家 7 分钟未回复" }] }
    ],
    "sellers": [{ "sellerId": "u3", "responseMinutes": 7, "deals30d": 2, "warning": true }],
    "dispute": { "risk": "low", "reasons": [] }
  }
}
```

`flags[].code`：`SLOW_SELLER`、`ROUND_LIMIT`、`LARGE_CONCESSION`、`PRICE_REBOUND`、`SNAPSHOT_MISMATCH`、`SUPPLY_TIGHT`。

该接口只在任务详情轮询（30s）或随 SSE 的 `health.update` 推送，不做全局弹窗。

---

## 8. 前端对接与连接契约

### 8.1 替换清单

| 前端（Pinia action） | 接口 |
| --- | --- |
| `agent.createTask(rawInput)` | `POST /api/agent/tasks` |
| `agent.answerQuestion(...)` | `POST /api/agent/tasks/{id}/answers` |
| `agent.ensureAgentLoop()` | 内部已封装 `openAgentStream()`；配 `VITE_AGENT_STREAM_URL` 即切真实 SSE |
| `agent.stepNegotiation(task)` | 由 SSE `lane.round` 驱动（真实环境改为事件增量更新） |
| `agent.confirmTask(taskId)` | `POST /api/agent/tasks/{id}/confirm` → 跳 `/order/{orderId}` |
| `agent.abortTask(taskId)` | `POST /api/agent/tasks/{id}/abort` |
| `agent.agentStats` | `GET /api/agent/summary`（60s 轮询或 SSE 推送） |
| `agent.checkPublish(...)` | `POST /api/moderation/publish-check`（输入防抖 400ms） |
| `agent.checkChat(text)` | `POST /api/moderation/chat-check`（防抖 300ms） |
| `market.state.*` | 商品/订单/会话等常规 REST 接口（另行提供） |

### 8.2 连接状态契约

前端把连接状态映射为三种可见文案，后端只需保证 `EventSource` 的打开/关闭语义正确：

| 前端状态 | 触发 | UI |
| --- | --- | --- |
| `lost` | `EventSource.onerror` | 顶栏「连接丢失」+ 议价大厅告警条「实时价格可能已过期」 |
| `reconnecting` | 退避等待中 | 「连接丢失 · 正在重连（第 N 次）」 |
| `open` | 连接成功 | 状态条恢复「正在处理 N 个任务」，并提示「连接已恢复」 |

要求：

1. 断线期间服务端**继续推进**任务（议价不能因客户端离线而停），重连靠 `snapshot` 追平。
2. 不要用 4xx/5xx 关闭流；任务终态用 `snapshot` + 正常关闭。
3. 心跳缺失超过 30s 前端视为断线，服务端需保证 15s 内至少一条注释或 `ping`。

### 8.3 前端错误处理约定

- 前端已接入 `ErrorBoundary` + `app.config.errorHandler` + `unhandledrejection` / `window.error` / `router.onError`，异常会带 `context` 记录到 `useErrorStore`。
- 建议后端在错误响应中返回 `requestId`，前端展示在错误边界诊断信息里，便于对齐日志。
- 接口失败提示使用统一 `{ code, message }` 的 `message`，前端直接 toast，不再拼接技术细节。
