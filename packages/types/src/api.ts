/**
 * API 类型定义
 */

import type { ID, PaginatedResult } from './basic';

/** API 响应状态 */
export type ApiStatus = 'success' | 'error' | 'warning' | 'info';

/** API 响应基础结构 */
export interface ApiResponseBase {
  /** 响应状态 */
  status: ApiStatus;
  /** 响应代码 */
  code: string;
  /** 响应消息 */
  message: string;
  /** 响应时间戳 */
  timestamp: number;
  /** 请求ID */
  requestId: string;
}

/** 成功响应 */
export interface ApiSuccessResponse<T> extends ApiResponseBase {
  status: 'success';
  data: T;
}

/** 错误响应 */
export interface ApiErrorResponse extends ApiResponseBase {
  status: 'error';
  /** 错误详情 */
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
    value?: unknown;
  }>;
  /** 堆栈跟踪 (开发环境) */
  stack?: string;
}

/** 警告响应 */
export interface ApiWarningResponse<T> extends ApiResponseBase {
  status: 'warning';
  data: T;
  warnings: string[];
}

/** 信息响应 */
export interface ApiInfoResponse extends ApiResponseBase {
  status: 'info';
  info: Record<string, unknown>;
}

/** 统一 API 响应类型 */
export type ApiResponse<T = unknown> = 
  | ApiSuccessResponse<T> 
  | ApiErrorResponse 
  | ApiWarningResponse<T> 
  | ApiInfoResponse;

/** 分页响应 */
export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<PaginatedResult<T>> {
  data: PaginatedResult<T>;
}

/** 列表响应 */
export interface ApiListResponse<T> extends ApiSuccessResponse<T[]> {
  data: T[];
}

/** 文件响应 */
export interface ApiFileResponse {
  /** 文件名称 */
  filename: string;
  /** 文件类型 */
  contentType: string;
  /** 文件大小 */
  size: number;
  /** 下载链接 */
  url: string;
  /** 过期时间 */
  expiresAt?: string;
}

/** API 错误代码 */
export enum ApiErrorCode {
  // 通用错误 (1000-1999)
  UNKNOWN_ERROR = '1000',
  INVALID_REQUEST = '1001',
  INVALID_PARAMS = '1002',
  RESOURCE_NOT_FOUND = '1003',
  RESOURCE_EXISTS = '1004',
  RESOURCE_CONFLICT = '1005',
  OPERATION_FAILED = '1006',
  
  // 认证授权错误 (2000-2999)
  UNAUTHORIZED = '2000',
  FORBIDDEN = '2001',
  TOKEN_EXPIRED = '2002',
  TOKEN_INVALID = '2003',
  INSUFFICIENT_PERMISSIONS = '2004',
  
  // 数据错误 (3000-3999)
  DATA_VALIDATION_FAILED = '3000',
  DATA_INTEGRITY_ERROR = '3001',
  DATA_CONFLICT = '3002',
  DATA_NOT_FOUND = '3003',
  
  // 文件错误 (4000-4999)
  FILE_UPLOAD_FAILED = '4000',
  FILE_DOWNLOAD_FAILED = '4001',
  FILE_NOT_FOUND = '4002',
  FILE_TOO_LARGE = '4003',
  FILE_TYPE_NOT_SUPPORTED = '4004',
  
  // 服务错误 (5000-5999)
  SERVICE_UNAVAILABLE = '5000',
  SERVICE_TIMEOUT = '5001',
  SERVICE_BUSY = '5002',
  EXTERNAL_SERVICE_ERROR = '5003',
  
  // 限流错误 (6000-6999)
  RATE_LIMIT_EXCEEDED = '6000',
  QUOTA_EXCEEDED = '6001',
  CONCURRENT_LIMIT_EXCEEDED = '6002',
}

/** API 请求方法 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/** API 请求配置 */
export interface ApiRequestConfig {
  /** 请求URL */
  url: string;
  /** 请求方法 */
  method: ApiMethod;
  /** 请求参数 */
  params?: Record<string, unknown>;
  /** 请求体 */
  data?: unknown;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 超时时间 */
  timeout?: number;
  /** 是否携带凭证 */
  withCredentials?: boolean;
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  /** 取消令牌 */
  cancelToken?: string;
}

/** API 请求拦截器 */
export interface ApiInterceptor {
  /** 请求拦截 */
  request?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  /** 响应拦截 */
  response?: (response: ApiResponse<unknown>) => ApiResponse<unknown> | Promise<ApiResponse<unknown>>;
  /** 错误拦截 */
  error?: (error: ApiErrorResponse) => ApiErrorResponse | Promise<ApiErrorResponse>;
}

/** API 客户端配置 */
export interface ApiClientConfig {
  /** 基础URL */
  baseURL: string;
  /** 默认超时 */
  timeout: number;
  /** 默认请求头 */
  headers: Record<string, string>;
  /** 拦截器 */
  interceptors: ApiInterceptor[];
  /** 重试配置 */
  retry: {
    count: number;
    delay: number;
  };
}

/** API 客户端 */
export interface ApiClient {
  /** 发送请求 */
  request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>>;
  /** GET 请求 */
  get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>>;
  /** POST 请求 */
  post<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  /** PUT 请求 */
  put<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  /** DELETE 请求 */
  delete<T>(url: string): Promise<ApiResponse<T>>;
  /** PATCH 请求 */
  patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  /** 添加拦截器 */
  addInterceptor(interceptor: ApiInterceptor): void;
  /** 移除拦截器 */
  removeInterceptor(interceptor: ApiInterceptor): void;
  /** 取消请求 */
  cancel(requestId: string): void;
  /** 取消所有请求 */
  cancelAll(): void;
}