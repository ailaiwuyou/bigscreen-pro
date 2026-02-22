/**
 * WebSocket 服务 - 后端实时数据推送
 * 
 * 功能：
 * - WebSocket 连接管理
 * - 心跳检测
 * - 消息广播
 * - 数据流订阅
 */

import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import jwt from 'jsonwebtoken'

// 消息类型
interface WSMessage {
  type: string
  payload: any
  timestamp?: number
}

// 客户端信息
interface WSClient {
  id: string
  ws: WebSocket
  userId?: string
  subscriptions: Set<string>
  connectedAt: number
  lastHeartbeat: number
}

// 数据流
interface DataStream {
  id: string
  name: string
  dataSourceId?: string
  subscribers: Set<WSClient>
  data?: any[]
}

// WebSocket 服务配置
interface WSServiceConfig {
  port?: number
  path?: string
  heartbeatInterval?: number
  maxClients?: number
  authRequired?: boolean
  jwtSecret?: string
}

const DEFAULT_CONFIG = {
  port: 3001,
  path: '/ws',
  heartbeatInterval: 30000,
  maxClients: 1000,
  authRequired: true,
  jwtSecret: process.env.JWT_SECRET || 'bigscreen-secret-key'
}

class WebSocketService {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WSClient> = new Map()
  private streams: Map<string, DataStream> = new Map()
  private config: Required<WSServiceConfig>
  private heartbeatTimer: number | null = null
  
  constructor(config: WSServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<WSServiceConfig>
  }
  
  /**
   * 初始化 WebSocket 服务
   */
  init(server: Server): void {
    this.wss = new WebSocketServer({
      server,
      path: this.config.path
    })
    
    this.wss.on('connection', this.handleConnection.bind(this))
    
    // 启动心跳检测
    this.startHeartbeat()
    
    console.log(`[WebSocket] 服务已启动: ${this.config.path}`)
  }
  
  /**
   * 处理新连接
   */
  private handleConnection(ws: WebSocket, req: any): void {
    const clientId = this.generateClientId()
    
    // 检查最大连接数
    if (this.clients.size >= this.config.maxClients) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: '连接数已达上限' }
      }))
      ws.close(1008, 'Max clients reached')
      return
    }
    
    const client: WSClient = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      connectedAt: Date.now(),
      lastHeartbeat: Date.now()
    }
    
    this.clients.set(clientId, client)
    
    console.log(`[WebSocket] 新连接: ${clientId} (当前: ${this.clients.size})`)
    
    // 发送欢迎消息
    this.sendToClient(client, {
      type: 'connected',
      payload: { clientId, message: '连接成功' }
    })
    
    // 处理消息
    ws.on('message', (data) => this.handleMessage(client, data))
    
    // 处理关闭
    ws.on('close', () => this.handleClose(clientId))
    
    // 处理错误
    ws.on('error', (err) => this.handleError(clientId, err))
  }
  
  /**
   * 处理客户端消息
   */
  private handleMessage(client: WSClient, data: any): void {
    try {
      const message: WSMessage = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'auth':
          this.handleAuth(client, message.payload)
          break
          
        case 'subscribe':
          this.handleSubscribe(client, message.payload)
          break
          
        case 'unsubscribe':
          this.handleUnsubscribe(client, message.payload)
          break
          
        case 'ping':
          this.handleHeartbeat(client)
          break
          
        case 'refresh':
          this.handleRefresh(client, message.payload)
          break
          
        case 'publish':
          this.handlePublish(message.payload)
          break
          
        default:
          console.log(`[WebSocket] 未知消息类型: ${message.type}`)
      }
    } catch (err) {
      console.error('[WebSocket] 消息解析失败:', err)
    }
  }
  
  /**
   * 处理认证
   */
  private handleAuth(client: WSClient, payload: any): void {
    const { token } = payload
    
    if (!this.config.authRequired) {
      this.sendToClient(client, {
        type: 'auth_success',
        payload: { message: '认证成功' }
      })
      return
    }
    
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any
      client.userId = decoded.userId
      
      this.sendToClient(client, {
        type: 'auth_success',
        payload: { userId: client.userId }
      })
    } catch (err) {
      this.sendToClient(client, {
        type: 'auth_error',
        payload: { message: '认证失败' }
      })
      client.ws.close(1008, 'Authentication failed')
    }
  }
  
  /**
   * 处理订阅
   */
  private handleSubscribe(client: WSClient, payload: any): void {
    const { streamId } = payload
    
    // 获取或创建数据流
    let stream = this.streams.get(streamId)
    if (!stream) {
      stream = {
        id: streamId,
        name: streamId,
        subscribers: new Set()
      }
      this.streams.set(streamId, stream)
    }
    
    // 添加订阅
    stream.subscribers.add(client)
    client.subscriptions.add(streamId)
    
    // 发送历史数据（如果有）
    if (stream.data && stream.data.length > 0) {
      this.sendToClient(client, {
        type: 'stream_data',
        payload: {
          streamId,
          data: stream.data,
          isHistory: true
        }
      })
    }
    
    console.log(`[WebSocket] 客户端 ${client.id} 订阅了 ${streamId}`)
  }
  
  /**
   * 处理取消订阅
   */
  private handleUnsubscribe(client: WSClient, payload: any): void {
    const { streamId } = payload
    
    const stream = this.streams.get(streamId)
    if (stream) {
      stream.subscribers.delete(client)
    }
    client.subscriptions.delete(streamId)
  }
  
  /**
   * 处理心跳
   */
  private handleHeartbeat(client: WSClient): void {
    client.lastHeartbeat = Date.now()
    this.sendToClient(client, { type: 'pong' })
  }
  
  /**
   * 处理刷新请求
   */
  private handleRefresh(client: WSClient, payload: any): void {
    const { streamId } = payload
    
    // TODO: 从数据源获取最新数据
    const stream = this.streams.get(streamId)
    if (stream) {
      this.sendToClient(client, {
        type: 'stream_data',
        payload: {
          streamId,
          data: stream.data || [],
          isHistory: false
        }
      })
    }
  }
  
  /**
   * 处理发布
   */
  private handlePublish(payload: any): void {
    const { streamId, data } = payload
    
    // 更新数据流
    let stream = this.streams.get(streamId)
    if (!stream) {
      stream = {
        id: streamId,
        name: streamId,
        subscribers: new Set()
      }
      this.streams.set(streamId, stream)
    }
    
    // 追加数据
    if (!stream.data) {
      stream.data = []
    }
    
    if (Array.isArray(data)) {
      stream.data.push(...data)
    } else {
      stream.data.push(data)
    }
    
    // 保留最新 1000 条
    if (stream.data.length > 1000) {
      stream.data = stream.data.slice(-1000)
    }
    
    // 广播给订阅者
    this.broadcastToStream(streamId, {
      type: 'stream_data',
      payload: {
        streamId,
        data: Array.isArray(data) ? data : [data],
        isHistory: false
      }
    })
  }
  
  /**
   * 处理连接关闭
   */
  private handleClose(clientId: string): void {
    const client = this.clients.get(clientId)
    
    if (client) {
      // 移除所有订阅
      client.subscriptions.forEach(streamId => {
        const stream = this.streams.get(streamId)
        if (stream) {
          stream.subscribers.delete(client)
        }
      })
      
      this.clients.delete(clientId)
      console.log(`[WebSocket] 断开连接: ${clientId} (当前: ${this.clients.size})`)
    }
  }
  
  /**
   * 处理错误
   */
  private handleError(clientId: string, err: Error): void {
    console.error(`[WebSocket] 客户端 ${clientId} 错误:`, err.message)
  }
  
  /**
   * 发送消息给客户端
   */
  private sendToClient(client: WSClient, message: WSMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }))
    }
  }
  
  /**
   * 广播给数据流订阅者
   */
  private broadcastToStream(streamId: string, message: WSMessage): void {
    const stream = this.streams.get(streamId)
    if (!stream) return
    
    stream.subscribers.forEach(client => {
      this.sendToClient(client, message)
    })
  }
  
  /**
   * 广播给所有客户端
   */
  broadcast(message: WSMessage): void {
    const data = JSON.stringify({
      ...message,
      timestamp: Date.now()
    })
    
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data)
      }
    })
  }
  
  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      const now = Date.now()
      const timeout = this.config.heartbeatInterval * 2
      
      this.clients.forEach((client, clientId) => {
        if (now - client.lastHeartbeat > timeout) {
          console.log(`[WebSocket] 心跳超时，关闭连接: ${clientId}`)
          client.ws.close(1008, 'Heartbeat timeout')
        } else {
          // 发送 ping
          this.sendToClient(client, { type: 'ping' })
        }
      })
    }, this.config.heartbeatInterval)
  }
  
  /**
   * 生成客户端 ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 获取服务状态
   */
  getStatus(): any {
    return {
      clients: this.clients.size,
      streams: this.streams.size,
      uptime: process.uptime()
    }
  }
  
  /**
   * 关闭服务
   */
  shutdown(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    
    this.clients.forEach(client => {
      client.ws.close(1001, 'Server shutting down')
    })
    
    this.wss?.close()
    console.log('[WebSocket] 服务已关闭')
  }
}

export default WebSocketService

// 导出创建函数
export function createWebSocketService(config?: WSServiceConfig): WebSocketService {
  return new WebSocketService(config)
}
