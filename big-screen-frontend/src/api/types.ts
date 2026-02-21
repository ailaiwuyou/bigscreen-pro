// API 类型定义

// 通用响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 仪表盘类型
export type DashboardStatus = 'draft' | 'published' | 'archived'

export interface Dashboard {
  id: string
  name: string
  description?: string
  status: DashboardStatus
  config?: Record<string, unknown>
  thumbnail?: string
  isPublic?: boolean
  ownerId?: string
  owner?: { id: string; username: string; avatar?: string }
  createdBy?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  archivedAt?: string
}

// 仪表盘列表响应
export interface DashboardListResponse {
  list: Dashboard[]
  total: number
  page: number
  pageSize: number
}

// 创建仪表盘请求
export interface CreateDashboardRequest {
  name: string
  description?: string
  config?: Record<string, unknown>
  thumbnail?: string
}

// 更新仪表盘请求
export interface UpdateDashboardRequest {
  name?: string
  description?: string
  config?: Record<string, unknown>
  thumbnail?: string
  status?: DashboardStatus
}

// 仪表盘筛选条件
export interface DashboardFilter {
  status?: DashboardStatus
  keyword?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 用户类型
export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: 'ADMIN' | 'USER' | 'GUEST'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// ============ 数据源相关类型 ============

// 数据源类型
export type DataSourceType = 'MYSQL' | 'POSTGRESQL' | 'REST_API' | 'JSON' | 'EXCEL' | 'CSV'

// 数据源状态
export type DataSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR'

// 数据源基础配置
export interface DataSourceBaseConfig {
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  ssl?: boolean
  url?: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
  content?: string
  filePath?: string
  timeout?: number
}

// 数据源
export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  config: DataSourceBaseConfig
  status: DataSourceStatus
  lastTestedAt?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// 创建数据源请求
export interface CreateDataSourceRequest {
  name: string
  type: DataSourceType
  config: DataSourceBaseConfig
}

// 更新数据源请求
export interface UpdateDataSourceRequest {
  name?: string
  config?: Partial<DataSourceBaseConfig>
  status?: DataSourceStatus
}

// 数据源列表响应
export interface DataSourceListResponse {
  list: DataSource[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 数据源查询请求
export interface ExecuteQueryRequest {
  query: string
  params?: unknown[]
}

// 查询结果
export interface QueryResult {
  columns: string[]
  rows: unknown[][]
  total: number
}

// 连接测试结果
export interface TestConnectionResult {
  success: boolean
  message: string
  data?: {
    latency?: number
    lastTestedAt?: string
  }
}

// 数据源筛选条件
export interface DataSourceFilter {
  type?: DataSourceType
  status?: DataSourceStatus
  keyword?: string
  page?: number
  pageSize?: number
}

// ============ 认证相关类型 ============

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 注册请求
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refreshToken: string
}

// 认证响应
export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

// ============ 仪表盘统计类型 ============

// 仪表盘统计
export interface DashboardStats {
  totalDashboards: number
  publishedDashboards: number
  draftDashboards: number
  recentViews: number
}

// 仪表盘图表数据
export interface DashboardCharts {
  viewsOverTime: { date: string; views: number }[]
  dashboardsByStatus: { status: string; count: number }[]
  popularDashboards: { id: string; title: string; views: number }[]
}

// 实时数据
export interface RealtimeData {
  onlineUsers: number
  pageViews: number
  activeDashboards: number
  lastUpdated: string
}

// 活动日志
export interface ActivityLog {
  id: string
  userId: string
  action: string
  target: string
  details?: Record<string, any>
  createdAt: string
}

// 通知
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}