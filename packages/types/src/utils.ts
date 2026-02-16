/**
 * 工具类型定义
 * 
 * BigScreen Pro大屏可视化平台 - 工具函数类型定义
 */

// ============================================================
// 通用工具类型
// ============================================================

/** 可空类型 */
export type Nullable<T> = T | null | undefined

/** 非空类型 */
export type NonNullable<T> = T extends null | undefined ? never : T

/** 深度可选类型 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 深度只读类型 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/** 键值映射类型 */
export type KeyValueMap<T = unknown> = Record<string, T>

/** 构造函数类型 */
export type Constructor<T = unknown> = new (...args: unknown[]) => T

/** 函数类型 */
export type AnyFunction = (...args: unknown[]) => unknown

/** Promise类型 */
export type PromiseOrValue<T> = T | Promise<T>

// ============================================================
// 事件相关类型
// ============================================================

/** 事件处理器 */
export type EventHandler<T = unknown> = (event: T) => void | Promise<void>

/** 事件发射器 */
export interface EventEmitter<T = unknown> {
  on(event: string, handler: EventHandler<T>): void
  off(event: string, handler: EventHandler<T>): void
  emit(event: string, data: T): void
  once(event: string, handler: EventHandler<T>): void
}

/** 事件监听器选项 */
export interface EventListenerOptions {
  capture?: boolean
  passive?: boolean
  once?: boolean
}

// ============================================================
// 状态管理相关类型
// ============================================================

/** 状态变更监听器 */
export type StateChangeListener<S> = (
  newState: S,
  oldState: S,
  path: string
) => void

/** 状态选择器 */
export type StateSelector<S, R> = (state: S) => R

/** 状态操作 */
export interface StateAction<S = unknown, P = unknown> {
  type: string
  payload?: P
  meta?: Record<string, unknown>
}

/** 状态Reducer */
export type StateReducer<S> = (state: S, action: StateAction) => S

// ============================================================
// 拖拽相关类型
// ============================================================

/** 拖拽数据 */
export interface DragData {
  type: string
  id: string
  data: unknown
  source: string
}

/** 拖拽事件 */
export interface DragEvent {
  type: 'start' | 'move' | 'end'
  data: DragData
  position: { x: number; y: number }
  delta: { x: number; y: number }
  target: EventTarget | null
}

/** 拖拽选项 */
export interface DragOptions {
  axis?: 'x' | 'y' | 'both'
  snap?: number | { x: number; y: number }
  bounds?: { left: number; top: number; right: number; bottom: number }
  disabled?: boolean
}

// ============================================================
// 网络相关类型
// ============================================================

/** HTTP方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/** HTTP请求配置 */
export interface HttpRequestConfig {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, unknown>
  data?: unknown
  timeout?: number
  withCredentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

/** HTTP响应 */
export interface HttpResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: HttpRequestConfig
}

/** HTTP错误 */
export interface HttpError {
  message: string
  response?: HttpResponse
  request?: unknown
  config: HttpRequestConfig
}

// ============================================================
// 存储相关类型
// ============================================================

/** 存储适配器 */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
  clear(): void | Promise<void>
  keys(): string[] | Promise<string[]>
  length: number | Promise<number>
}

/** 存储选项 */
export interface StorageOptions {
  prefix?: string
  expires?: number
  serializer?: {
    stringify: (value: unknown) => string
    parse: (text: string) => unknown
  }
}

// ============================================================
// 验证相关类型
// ============================================================

/** 验证规则 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'min' | 'max' | 'length' | 'pattern' | 'email' | 'custom'
  /** 规则参数 */
  value?: unknown
  /** 错误消息 */
  message: string
  /** 自定义验证函数 */
  validator?: (value: unknown) => boolean | Promise<boolean>
}

/** 验证结果 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: string[]
  /** 字段错误映射 */
  fieldErrors: Record<string, string[]>
}

// ============================================================
// 导出所有类型
// ============================================================

export type {
  ValidationRule,
  ValidationResult,
}
