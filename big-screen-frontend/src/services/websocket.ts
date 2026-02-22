/**
 * WebSocket 服务 - 实时数据推送
 * 
 * 功能：
 * - WebSocket 连接管理
 * - 心跳检测
 * - 断线重连
 * - 消息订阅/发布
 * - 数据流处理
 */

import { ref, reactive, computed } from 'vue'

// 连接状态
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

// 消息类型
export interface WSMessage {
  type: string
  payload: any
  timestamp?: number
}

// 订阅回调
type MessageHandler = (data: any) => void

// 配置
interface WSConfig {
  url: string
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  heartbeatMessage?: string
}

const DEFAULT_CONFIG: Required<WSConfig> = {
  url: '',
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
  heartbeatMessage: JSON.stringify({ type: 'ping' })
}

class WebSocketService {
  private ws: WebSocket | null = null
  private config: Required<WSConfig> = { ...DEFAULT_CONFIG }
  private reconnectAttempts = 0
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = private reconnectTimer: number | null = null
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map()
  private pendingMessages: WSMessage[] = []
  
  // 响应式状态
  public status = ref<ConnectionStatus>('disconnected')
  public lastMessage = ref<WSMessage | null>(null)
  public error = ref<string | null>(null)
  
  // 连接信息
  public connectedAt = ref<number | null>(null)
  public messageCount = ref(0)
  
  // 获取连接 URL
  public getUrl = computed(() => this.config.url)
  
  // 是否已连接
  public isConnected = computed(() => this.status.value === 'connected')
  
  /**
   * 初始化连接
   */
  connect(url: string, config?: Partial<WSConfig>): void {
    this.disconnect()
    
    this.config = { ...DEFAULT_CONFIG, ...config, url }
    this.reconnectAttempts = 0
    this.error.value = null
    
    this.doConnect()
  }
  
  /**
   * 执行连接
   */
  private doConnect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }
    
    this.status.value = 'connecting'
    this.error.value = null
    
    try {
      this.ws = new WebSocket(this.config.url)
      
      this.ws.onopen = this.handleOpen
      this.ws.onclose = this.handleClose
      this.ws.onerror = this.handleError
      this.ws.onmessage = this.handleMessage
    } catch (err) {
      this.error.value = err instanceof Error ? err.message : '连接失败'
      this.status.value = 'error'
      this.scheduleReconnect()
    }
  }
  
  /**
   * 处理连接打开
   */
  private handleOpen = (): void => {
    this.status.value = 'connected'
    this.connectedAt.value = Date.now()
    this.reconnectAttempts = 0
    this.error.value = null
    
    // 发送待发送的消息
    this.flushPendingMessages()
    
    // 启动心跳
    this.startHeartbeat()
    
    console.log('[WebSocket] 连接已建立')
  }
  
  /**
   * 处理连接关闭
   */
  private handleClose = (): void => {
    this.status.value = 'disconnected'
    this.stopHeartbeat()
    
    if (this.config.reconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }
  
  /**
   * 处理错误
   */
  private handleError = (event: Event): void => {
    this.error.value = 'WebSocket 错误'
    console.error('[WebSocket] 错误:', event)
  }
  
  /**
   * 处理消息
   */
  private handleMessage = (event: MessageEvent): void => {
    try {
      const message: WSMessage = JSON.parse(event.data)
      this.lastMessage.value = message
      this.messageCount.value++
      
      // 处理心跳响应
      if (message.type === 'pong' || message.type === 'heartbeat') {
        return
      }
      
      // 触发对应的处理器
      const handlers = this.messageHandlers.get(message.type)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.payload)
          } catch (err) {
WebSocket]             console.error('[消息处理错误:', err)
          }
        })
      }
      
      // 触发通配符处理器
      const wildcardHandlers = this.messageHandlers.get('*')
      if (wildcardHandlers) {
        wildcardHandlers.forEach(handler => {
          try {
            handler(message)
          } catch (err) {
            console.error('[WebSocket] 通配符处理错误:', err)
          }
        })
      }
    } catch (err) {
      console.warn('[WebSocket] 消息解析失败:', event.data)
    }
  }
  
  /**
   * 发送消息
   */
  send(type: string, payload?: any): boolean {
    const message: WSMessage = {
      type,
      payload,
      timestamp: Date.now()
    }
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    }
    
    // 加入待发送队列
    this.pendingMessages.push(message)
    return false
  }
  
  /**
   * 发送原始消息
   */
  sendRaw(data: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    return false
  }
  
  /**
   * 刷新待发送消息
   */
  private flushPendingMessages(): void {
    while (this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift()
      if (message) {
        this.ws?.send(JSON.stringify(message))
      }
    }
  }
  
  /**
   * 订阅消息
   */
  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set())
    }
    
    this.messageHandlers.get(type)!.add(handler)
    
    // 返回取消订阅函数
    return () => {
      const handlers = this.messageHandlers.get(type)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.messageHandlers.delete(type)
        }
      }
    }
  }
  
  /**
   * 订阅一次
   */
  subscribeOnce(type: string, handler: MessageHandler): () => void {
    const wrapper = (data: any) => {
      handler(data)
      unsubscribe()
    }
    
    const unsubscribe = this.subscribe(type, wrapper)
    return unsubscribe
  }
  
  /**
   * 断开连接
   */
  disconnect(): void {
    this.stopHeartbeat()
    this.stopReconnect()
    
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close()
      }
      this.ws = null
    }
    
    this.status.value = 'disconnected'
    this.connectedAt.value = null
    this.pendingMessages = []
    this.messageHandlers.clear()
  }
  
  /**
   * 手动重连
   */
  reconnect(): void {
    this.reconnectAttempts = 0
    this.doConnect()
  }
  
  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return
    }
    
    this.status.value = 'reconnecting'
    this.reconnectAttempts++
    
    console.log(`[WebSocket] 正在重连 (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`)
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.doConnect()
    }, this.config.reconnectInterval)
  }
  
  /**
   * 停止重连
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
  
  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(this.config.heartbeatMessage)
      }
    }, this.config.heartbeatInterval)
  }
  
  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

// 导出单例
export const websocketService = new WebSocketService()

// Vue Composable
export function useWebSocket(config?: Partial<WSConfig>) {
  // 连接
  const connect = (url: string) => {
    websocketService.connect(url, config)
  }
  
  // 断开
  const disconnect = () => {
    websocketService.disconnect()
  }
  
  // 发送消息
  const send = (type: string, payload?: any) => {
    return websocketService.send(type, payload)
  }
  
  // 订阅消息
  const subscribe = (type: string, handler: MessageHandler) => {
    return websocketService.subscribe(type, handler)
  }
  
  // 订阅一次
  const subscribeOnce = (type: string, handler: MessageHandler) => {
    return websocketService.subscribeOnce(type, handler)
  }
  
  return {
    // 状态
    status: websocketService.status,
    isConnected: websocketService.isConnected,
    lastMessage: websocketService.lastMessage,
    error: websocketService.error,
    connectedAt: websocketService.connectedAt,
    messageCount: websocketService.messageCount,
    url: websocketService.getUrl,
    // 方法
    connect,
    disconnect,
    send,
    subscribe,
    subscribeOnce,
    reconnect: () => websocketService.reconnect()
  }
}

export default websocketService
