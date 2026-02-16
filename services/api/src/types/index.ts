/**
 * 全局类型定义
 * 集中定义项目中使用的所有TypeScript类型
 */

import { Request } from 'express';

// ============================================
// 基础类型
// ============================================

/**
 * API统一响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  meta?: ResponseMeta;
}

/**
 * 响应元数据（分页等）
 */
export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 查询过滤器
 */
export interface QueryFilters {
  [key: string]: string | number | boolean | string[] | undefined;
}

// ============================================
// 用户相关类型
// ============================================

/**
 * JWT载荷
 */
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  roleId?: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * 认证用户信息
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  roleId?: string | null;
  permissions: string[];
  status: string;
}

/**
 * 扩展Express请求类型
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

/**
 * 令牌响应
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// ============================================
// 仪表盘相关类型
// ============================================

/**
 * 仪表盘状态
 */
export enum DashboardStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * 仪表盘配置
 */
export interface DashboardConfig {
  width: number;
  height: number;
  bgColor?: string;
  bgImage?: string;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
}

/**
 * 创建仪表盘请求
 */
export interface CreateDashboardRequest {
  name: string;
  description?: string;
  config?: DashboardConfig;
  themeId?: string;
}

/**
 * 更新仪表盘请求
 */
export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  config?: DashboardConfig;
  status?: DashboardStatus;
  themeId?: string;
  isPublic?: boolean;
}

// ============================================
// 组件相关类型
// ============================================

/**
 * 组件类型
 */
export enum ComponentType {
  CHART_LINE = 'CHART_LINE',
  CHART_BAR = 'CHART_BAR',
  CHART_PIE = 'CHART_PIE',
  CHART_SCATTER = 'CHART_SCATTER',
  CHART_RADAR = 'CHART_RADAR',
  CHART_FUNNEL = 'CHART_FUNNEL',
  CHART_GAUGE = 'CHART_GAUGE',
  CHART_HEATMAP = 'CHART_HEATMAP',
  CHART_TREEMAP = 'CHART_TREEMAP',
  CHART_SANKEY = 'CHART_SANKEY',
  CHART_GRAPH = 'CHART_GRAPH',
  TABLE = 'TABLE',
  STATISTIC = 'STATISTIC',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  IFRAME = 'IFRAME',
  CUSTOM = 'CUSTOM',
}

/**
 * 组件配置
 */
export interface ComponentConfig {
  dataSource?: string;
  style?: {
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    fontSize?: number;
    fontFamily?: string;
    [key: string]: unknown;
  };
  options?: {
    animation?: boolean;
    legend?: boolean;
    tooltip?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * 创建组件请求
 */
export interface CreateComponentRequest {
  name: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  config?: ComponentConfig;
  data?: Record<string, unknown>;
  datasourceId?: string;
  sortOrder?: number;
}

/**
 * 更新组件请求
 */
export interface UpdateComponentRequest {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  config?: ComponentConfig;
  data?: Record<string, unknown>;
  datasourceId?: string;
  sortOrder?: number;
}

// ============================================
// 数据源相关类型
// ============================================

/**
 * 数据源类型
 */
export enum DatasourceType {
  MYSQL = 'MYSQL',
  POSTGRESQL = 'POSTGRESQL',
  MSSQL = 'MSSQL',
  ORACLE = 'ORACLE',
  MONGODB = 'MONGODB',
  REDIS = 'REDIS',
  ELASTICSEARCH = 'ELASTICSEARCH',
  REST_API = 'REST_API',
  GRAPHQL = 'GRAPHQL',
  WEBSOCKET = 'WEBSOCKET',
  KAFKA = 'KAFKA',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  CUSTOM = 'CUSTOM',
}

/**
 * 数据源状态
 */
export enum DatasourceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  CONNECTING = 'CONNECTING',
}

/**
 * 数据库连接配置
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  options?: Record<string, unknown>;
}

/**
 * REST API连接配置
 */
export interface RestApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  auth?: {
    type: 'basic' | 'bearer' | 'apiKey';
    credentials?: Record<string, string>;
  };
  timeout?: number;
}

/**
 * 数据源连接配置联合类型
 */
export type DatasourceConnectionConfig = 
  | DatabaseConfig 
  | RestApiConfig 
  | Record<string, unknown>;

/**
 * 创建数据源请求
 */
export interface CreateDatasourceRequest {
  name: string;
  type: DatasourceType;
  description?: string;
  config: DatasourceConnectionConfig;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

/**
 * 更新数据源请求
 */
export interface UpdateDatasourceRequest {
  name?: string;
  description?: string;
  config?: DatasourceConnectionConfig;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  status?: DatasourceStatus;
}

/**
 * 数据源测试响应
 */
export interface DatasourceTestResponse {
  success: boolean;
  message: string;
  latency?: number;
  error?: string;
}

// ============================================
// 主题相关类型
// ============================================

/**
 * 主题分类
 */
export enum ThemeCategory {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
  TECH = 'TECH',
  BUSINESS = 'BUSINESS',
  CUSTOM = 'CUSTOM',
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  colors: string[];
  fonts?: {
    family?: string;
    size?: number;
    color?: string;
  };
  bgColor?: string;
  bgImage?: string;
  componentDefaults?: Record<string, unknown>;
}

/**
 * 创建主题请求
 */
export interface CreateThemeRequest {
  name: string;
  description?: string;
  config: ThemeConfig;
  category?: ThemeCategory;
}

/**
 * 更新主题请求
 */
export interface UpdateThemeRequest {
  name?: string;
  description?: string;
  config?: ThemeConfig;
  category?: ThemeCategory;
}

// ============================================
// 分享相关类型
// ============================================

/**
 * 分享类型
 */
export enum ShareType {
  PUBLIC_LINK = 'PUBLIC_LINK',
  PRIVATE_LINK = 'PRIVATE_LINK',
  PASSWORD = 'PASSWORD',
  EMBED = 'EMBED',
}

/**
 * 分享状态
 */
export enum ShareStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
  REVOKED = 'REVOKED',
}

/**
 * 分享配置
 */
export interface ShareConfig {
  password?: string;
  expiresAt?: string;
  allowedIPs?: string[];
  allowDownload?: boolean;
  showToolbar?: boolean;
}

/**
 * 创建分享请求
 */
export interface CreateShareRequest {
  type: ShareType;
  config?: ShareConfig;
  expiresAt?: string;
}

/**
 * 更新分享请求
 */
export interface UpdateShareRequest {
  type?: ShareType;
  config?: ShareConfig;
  status?: ShareStatus;
  expiresAt?: string;
}

/**
 * 分享访问验证请求
 */
export interface ShareAccessRequest {
  password?: string;
}

// ============================================
// 操作日志相关类型
// ============================================

/**
 * 操作动作类型
 */
export type LogAction = 
  | 'CREATE' 
  | 'READ' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'EXPORT' 
  | 'IMPORT' 
  | 'SHARE'
  | 'PUBLISH'
  | 'ARCHIVE';

/**
 * 资源类型
 */
export type LogResource = 
  | 'User' 
  | 'Dashboard' 
  | 'Component' 
  | 'Datasource' 
  | 'Theme' 
  | 'Share' 
  | 'Role' 
  | 'System';

/**
 * 操作日志详情
 */
export interface OperationLogDetails {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: string[];
  [key: string]: unknown;
}

/**
 * 创建操作日志请求
 */
export interface CreateOperationLogRequest {
  action: LogAction;
  resource: LogResource;
  resourceId?: string;
  details?: OperationLogDetails;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  success?: boolean;
  errorMsg?: string;
  userId?: string;
}

// ============================================
// WebSocket相关类型
// ============================================

/**
 * WebSocket事件类型
 */
export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  DATA_UPDATE = 'data_update',
  DASHBOARD_UPDATE = 'dashboard_update',
  COMPONENT_UPDATE = 'component_update',
  ERROR = 'error',
}

/**
 * WebSocket消息
 */
export interface WebSocketMessage<T = unknown> {
  event: WebSocketEvent;
  room?: string;
  data?: T;
  timestamp: number;
  error?: string;
}

/**
 * 数据更新消息
 */
export interface DataUpdateMessage {
  datasourceId: string;
  componentIds: string[];
  data: Record<string, unknown>;
  timestamp: number;
}

// ============================================
// AI相关类型
// ============================================

/**
 * AI推荐类型
 */
export enum AIRecommendationType {
  CHART = 'CHART',
  LAYOUT = 'LAYOUT',
  COLOR = 'COLOR',
  DATA = 'DATA',
  INSIGHT = 'INSIGHT',
}

/**
 * AI推荐请求
 */
export interface AIRecommendationRequest {
  type: AIRecommendationType;
  context: {
    dashboardId?: string;
    data?: Record<string, unknown>;
    currentLayout?: Record<string, unknown>;
    userPreferences?: Record<string, unknown>;
  };
  requirements?: string;
}

/**
 * AI推荐响应
 */
export interface AIRecommendationResponse {
  type: AIRecommendationType;
  recommendations: Array<{
    id: string;
    title: string;
    description?: string;
    confidence: number;
    data: Record<string, unknown>;
  }>;
  explanation?: string;
}

/**
 * AI智能分析请求
 */
export interface AIAnalysisRequest {
  data: Record<string, unknown> | Record<string, unknown>[];
  analysisType: 'trend' | 'anomaly' | 'correlation' | 'summary' | 'forecast';
  options?: {
    language?: string;
    detailLevel?: 'brief' | 'detailed' | 'comprehensive';
  };
}

/**
 * AI智能分析响应
 */
export interface AIAnalysisResponse {
  analysis: string;
  insights: string[];
  recommendations?: string[];
  metadata?: {
    confidence: number;
    dataPoints: number;
    processingTime: number;
  };
}

// ============================================
// 错误相关类型
// ============================================

/**
 * 应用错误
 */
export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 通用错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 认证相关
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  
  // 资源相关
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',
  
  // 数据源相关
  DATASOURCE_CONNECTION_FAILED = 'DATASOURCE_CONNECTION_FAILED',
  DATASOURCE_QUERY_FAILED = 'DATASOURCE_QUERY_FAILED',
  
  // AI相关
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_PROCESSING_FAILED = 'AI_PROCESSING_FAILED',
}
