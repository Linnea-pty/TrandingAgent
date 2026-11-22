/**
 * 小谦实时流传输层。
 *
 * 生产环境走 SSE（`VITE_AGENT_STREAM_URL`），演示环境走本地 Mock：
 * 两者对外暴露同一套 `openAgentStream` 接口，上层状态机不感知差异。
 * 断线语义统一为 `lost → reconnecting → open`，UI 据此先提示「连接丢失」再提示「正在重连」。
 */

/** 连接状态：idle 未启动；lost 刚断开；reconnecting 退避重连中；closed 主动关闭 */
export type ConnectionState = 'idle' | 'connecting' | 'open' | 'lost' | 'reconnecting' | 'closed'

/** 流事件：type 与后端 SSE event 名一致，data 为已解析的负载 */
export interface StreamEvent {
  type: string
  data?: unknown
}

export interface AgentStreamHandlers {
  /** 连接状态变化，attempt 为第几次重连尝试 */
  onStatus: (status: ConnectionState, attempt: number) => void
  /** 收到一条流事件 */
  onEvent: (event: StreamEvent) => void
}

export interface AgentStream {
  /** 主动关闭，不再重连 */
  close: () => void
  /** 模拟/触发断线，用于演示 UI 的断线提示 */
  drop: () => void
}

/** 后端事件名清单，SSE 与 Mock 共用 */
const STREAM_EVENTS = [
  'snapshot',
  'task.status',
  'lane.opened',
  'lane.round',
  'lane.status',
  'validator.verdict',
  'task.settled',
  'task.failed',
  'task.done',
] as const

/**
 * 打开小谦实时流。
 * 配置了 `VITE_AGENT_STREAM_URL` 走真实 SSE，否则走 Mock（3.2s 一轮议价）。
 */
export function openAgentStream(taskId: string | undefined, handlers: AgentStreamHandlers): AgentStream {
  const base = import.meta.env.VITE_AGENT_STREAM_URL as string | undefined
  if (base) {
    const url = new URL(base, window.location.origin)
    if (taskId) url.searchParams.set('taskId', taskId)
    return openSse(url.toString(), handlers)
  }
  return openMockStream(handlers)
}

/* ------------------------------------------------------------------ SSE */

/** 真实 SSE：断线由浏览器自动重连，这里接管状态与退避，保证 UI 能区分 lost / reconnecting */
function openSse(url: string, { onStatus, onEvent }: AgentStreamHandlers): AgentStream {
  let source: EventSource | undefined
  let retryTimer: number | undefined
  let attempt = 0
  let closed = false

  const teardown = () => {
    source?.close()
    source = undefined
    window.clearTimeout(retryTimer)
  }

  const scheduleReconnect = () => {
    if (closed) return
    attempt += 1
    const delay = Math.min(8000, 800 * 2 ** (attempt - 1))
    onStatus('reconnecting', attempt)
    retryTimer = window.setTimeout(connect, delay)
  }

  const connect = () => {
    if (closed) return
    onStatus('connecting', attempt)
    source = new EventSource(url)

    source.onopen = () => {
      attempt = 0
      onStatus('open', attempt)
    }

    source.onerror = () => {
      teardown()
      onStatus('lost', attempt)
      scheduleReconnect()
    }

    for (const type of STREAM_EVENTS) {
      source.addEventListener(type, (event) => {
        const message = event as MessageEvent<string>
        try {
          onEvent({ type, data: JSON.parse(message.data) as unknown })
        } catch {
          /* 单条脏报文不打断整条流 */
        }
      })
    }
  }

  connect()

  return {
    close() {
      closed = true
      teardown()
      onStatus('closed', attempt)
    },
    drop() {
      teardown()
      onStatus('lost', attempt)
      scheduleReconnect()
    },
  }
}

/* ------------------------------------------------------------------ Mock */

/** 演示流：每 3.2s 推一轮议价；drop() 后先 lost，再 reconnecting，最后自动恢复 */
function openMockStream({ onStatus, onEvent }: AgentStreamHandlers): AgentStream {
  const interval = 3200
  let attempt = 0
  let closed = false
  let tickTimer: number | undefined
  let retryTimer: number | undefined

  const stopTicks = () => {
    window.clearInterval(tickTimer)
    tickTimer = undefined
  }

  const emitTicks = () => {
    tickTimer = window.setInterval(() => {
      if (!closed) onEvent({ type: 'round' })
    }, interval)
  }

  const open = () => {
    if (closed) return
    onStatus('connecting', attempt)
    window.setTimeout(() => {
      if (closed) return
      attempt = 0
      onStatus('open', attempt)
      emitTicks()
    }, 300)
  }

  const reconnect = () => {
    if (closed) return
    attempt += 1
    onStatus('reconnecting', attempt)
    retryTimer = window.setTimeout(open, Math.min(4000, 1000 * attempt))
  }

  open()

  return {
    close() {
      closed = true
      stopTicks()
      window.clearTimeout(retryTimer)
      onStatus('closed', attempt)
    },
    drop() {
      if (closed) return
      stopTicks()
      window.clearTimeout(retryTimer)
      // 先让 UI 看到「连接丢失」，再进入重连倒计时，避免瞬间跳回已连接
      onStatus('lost', 0)
      retryTimer = window.setTimeout(reconnect, 800)
    },
  }
}
