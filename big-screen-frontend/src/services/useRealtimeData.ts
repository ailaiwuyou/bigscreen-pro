/**
 * 实时数据 Hook
 * 
 * 功能：
 * - 订阅实时数据流
 * - 数据缓存与增量更新
 * - 自动刷新管理
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useWebSocket, type ConnectionStatus } from './websocket'

// 数据项
export interface RealtimeDataItem {
  timestamp: number
  value: any
}

// 数据配置
export interface RealtimeDataConfig {
  // 数据源标识
  streamId: string
  // WebSocket URL
  wsUrl?: string
  // 初始数据
  initialData?: RealtimeDataItem[]
  // 最大缓存条数
  maxCacheSize?: number
  // 自动刷新间隔 (毫秒)
  refreshInterval?: number
  // 数据转换函数
  transform?: (data: any) => any
  // 是否自动连接
  autoConnect?: boolean
}

const DEFAULT_CONFIG = {
  maxCacheSize: 1000,
  refreshInterval: 0, // 0 表示不自动刷新
  autoConnect: true
}

// 响应式数据缓存
class DataCache {
  private data: RealtimeDataItem[] = []
  private maxSize: number
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
  }
  
  // 添加数据
  push(item: RealtimeDataItem): void {
    this.data.push(item)
    
    // 超过最大限制，移除旧数据
    if (this.data.length > this.maxSize) {
      this.data = this.data.slice(-this.maxSize)
    }
  }
  
  // 批量添加
  pushBatch(items: RealtimeDataItem[]): void {
    this.data.push(...items)
    
    if (this.data.length > this.maxSize) {
      this.data = this.data.slice(-this.maxSize)
    }
  }
  
  // 获取所有数据
  getAll(): RealtimeDataItem[] {
    return [...this.data]
  }
  
  // 获取最新数据
  getLatest(count: number = 1): RealtimeDataItem[] {
    return this.data.slice(-count)
  }
  
  // 获取时间范围内的数据
  getByTimeRange(from: number, to: number): RealtimeDataItem[] {
    return this.data.filter(item => item.timestamp >= from && item.timestamp <= to)
  }
  
  // 清空
  clear(): void {
    this.data = []
  }
  
  // 大小
  get size(): number {
    return this.data.length
  }
}

export function useRealtimeData(config: RealtimeDataConfig) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  // 数据缓存
  const cache = new DataCache(finalConfig.maxCacheSize!)
  
  // WebSocket 连接
  const ws = useWebSocket()
  
  // 响应式状态
  const data = ref<RealtimeDataItem[]>([])
  const latest = ref<RealtimeDataItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const connectionStatus = ref<ConnectionStatus>('disconnected')
  
  // 统计
  const messageCount = ref(0)
  const lastUpdateTime = ref<number | null>(null)
  
  // 刷新定时器
  private refreshTimer: number | null = null
  
  // 数据处理函数
  const transform = finalConfig.transform || ((data: any) => data)
  
  // 计算属性
  const isConnected = computed(() => ws.isConnected.value)
  const hasData = computed(() => data.value.length > 0)
  
  // 初始化数据
  if (finalConfig.initialData && finalConfig.initialData.length > 0) {
    cache.pushBatch(finalConfig.initialData)
    data.value = cache.getAll()
    if (data.value.length > 0) {
      latest.value = data.value[data.value.length - 1]
    }
  }
  
  // 处理接收到的数据
  const handleMessage = (payload: any): void => {
    try {
      const transformed = transform(payload)
      
      const item: RealtimeDataItem = {
        timestamp: payload.timestamp || Date.now(),
        value: transformed
      }
      
      cache.push(item)
      data.value = cache.getAll()
      latest.value = item
      messageCount.value++
      lastUpdateTime.value = Date.now()
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '数据处理失败'
    }
  }
  
  // 连接
  const connect = (url?: string): void => {
    const wsUrl = url || finalConfig.wsUrl
    if (!wsUrl) {
      error.value = 'WebSocket URL 未配置'
      return
    }
    
    loading.value = true
    ws.connect(wsUrl)
    
    // 订阅数据流
    ws.subscribe(finalConfig.streamId, handleMessage)
    
    // 监听连接状态
    watch(ws.status, (status) => {
      connectionStatus.value = status
      if (status === 'connected') {
        loading.value = false
      } else if (status === 'error') {
        loading.value = false
        error.value = '连接失败'
      }
    })
  }
  
  // 断开连接
  const disconnect = (): void => {
    ws.disconnect()
    stopAutoRefresh()
  }
  
  // 发送消息
  const send = (type: string, payload?: any): boolean => {
    return ws.send(type, payload)
  }
  
  // 订阅其他消息
  const subscribe = (type: string, handler: (data: any) => void): (() => void) => {
    return ws.subscribe(type, handler)
  }
  
  // 手动刷新
  const refresh = async (): Promise<void> => {
    if (!isConnected.value) {
      error.value = '未连接'
      return
    }
    
    loading.value = true
    
    try {
      // 发送刷新请求
      ws.send('refresh', { streamId: finalConfig.streamId })
    } catch (err) {
      error.value = err instanceof Error ? err.message : '刷新失败'
    } finally {
      loading.value = false
    }
  }
  
  // 自动刷新
  const startAutoRefresh = (interval?: number): void => {
    const refreshInterval = interval || finalConfig.refreshInterval
    
    if (!refreshInterval || refreshInterval <= 0) {
      return
    }
    
    stopAutoRefresh()
    
    refreshTimer = window.setInterval(() => {
      refresh()
    }, refreshInterval)
  }
  
  // 停止自动刷新
  const stopAutoRefresh = (): void => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
  
  // 清空数据
  const clear = (): void => {
    cache.clear()
    data.value = []
    latest.value = null
    messageCount.value = 0
  }
  
  // 获取最新 N 条数据
  const getLatestData = (count: number): RealtimeDataItem[] => {
    return cache.getLatest(count)
  }
  
  // 获取时间范围内的数据
  const getDataByTimeRange = (from: number, to: number): RealtimeDataItem[] => {
    return cache.getByTimeRange(from, to)
  }
  
  // 自动连接
  onMounted(() => {
    if (finalConfig.autoConnect && finalConfig.wsUrl) {
      connect()
    }
  })
  
  // 清理
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    // 状态
    data,
    latest,
    loading,
    error,
    connectionStatus,
    messageCount,
    lastUpdateTime,
    isConnected,
    hasData,
    // 方法
    connect,
    disconnect,
    send,
    subscribe,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    clear,
    getLatestData,
    getDataByTimeRange
  }
}

// 批量实时数据 Hook
export function useRealtimeDataGroup(configs: RealtimeDataConfig[]) {
  const dataStreams = configs.map(config => ({
    streamId: config.streamId,
    ...useRealtimeData(config)
  }))
  
  return {
    streams: dataStreams,
    // 批量连接
    connectAll: () => {
      dataStreams.forEach(stream => {
        if (config.wsUrl) {
          stream.connect(config.wsUrl)
        }
      })
    },
    // 批量断开
    disconnectAll: () => {
      dataStreams.forEach(stream => stream.disconnect())
    }
  }
}

export default useRealtimeData
