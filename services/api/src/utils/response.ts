/**
 * API响应工具
 * 统一API响应格式
 */

import { Response } from 'express';
import { ApiResponse, ResponseMeta } from '../types';

/**
 * HTTP状态码
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * 成功响应代码
 */
export enum SuccessCode {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  ACCEPTED = 'ACCEPTED',
}

/**
 * 错误响应代码
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
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 认证相关
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // 资源相关
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',

  // 数据源相关
  DATASOURCE_CONNECTION_FAILED = 'DATASOURCE_CONNECTION_FAILED',
  DATASOURCE_QUERY_FAILED = 'DATASOURCE_QUERY_FAILED',
  DATASOURCE_TIMEOUT = 'DATASOURCE_TIMEOUT',

  // AI相关
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_PROCESSING_FAILED = 'AI_PROCESSING_FAILED',
  AI_RATE_LIMIT = 'AI_RATE_LIMIT',
}

/**
 * 发送成功响应
 */
export const success = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  code: string = SuccessCode.SUCCESS,
  statusCode: number = HttpStatus.OK,
  meta?: ResponseMeta
): void => {
  const response: ApiResponse<T> = {
    success: true,
    code,
    message,
    data,
    ...(meta && { meta }),
  };

  res.status(statusCode).json(response);
};

/**
 * 发送创建成功响应
 */
export const created = <T>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): void => {
  success(res, data, message, SuccessCode.CREATED, HttpStatus.CREATED);
};

/**
 * 发送更新成功响应
 */
export const updated = <T>(
  res: Response,
  data: T,
  message: string = 'Updated successfully'
): void => {
  success(res, data, message, SuccessCode.UPDATED, HttpStatus.OK);
};

/**
 * 发送删除成功响应
 */
export const deleted = (res: Response, message: string = 'Deleted successfully'): void => {
  success(res, null, message, SuccessCode.DELETED, HttpStatus.OK);
};

/**
 * 发送无内容响应
 */
export const noContent = (res: Response): void => {
  res.status(HttpStatus.NO_CONTENT).send();
};

/**
 * 发送错误响应
 */
export const error = (
  res: Response,
  message: string,
  code: string = ErrorCode.INTERNAL_ERROR,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
): void => {
  const response: ApiResponse<null> = {
    success: false,
    code,
    message,
    data: null,
    ...(details && { meta: { details } }),
  };

  res.status(statusCode).json(response);
};

/**
 * 发送参数错误响应
 */
export const badRequest = (
  res: Response,
  message: string = 'Bad request',
  details?: Record<string, unknown>
): void => {
  error(res, message, ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, details);
};

/**
 * 发送未授权响应
 */
export const unauthorized = (res: Response, message: string = 'Unauthorized'): void => {
  error(res, message, ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
};

/**
 * 发送禁止访问响应
 */
export const forbidden = (res: Response, message: string = 'Forbidden'): void => {
  error(res, message, ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
};

/**
 * 发送资源不存在响应
 */
export const notFound = (
  res: Response,
  resource: string = 'Resource',
  resourceId?: string
): void => {
  const details = resourceId ? { resource, resourceId } : { resource };
  error(
    res,
    `${resource} not found`,
    ErrorCode.RESOURCE_NOT_FOUND,
    HttpStatus.NOT_FOUND,
    details
  );
};

/**
 * 发送资源冲突响应
 */
export const conflict = (res: Response, message: string = 'Resource already exists'): void => {
  error(res, message, ErrorCode.RESOURCE_ALREADY_EXISTS, HttpStatus.CONFLICT);
};

/**
 * 发送验证错误响应
 */
export const validationError = (
  res: Response,
  errors: Array<{ field: string; message: string; value?: unknown }>
): void => {
  error(res, 'Validation failed', ErrorCode.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY, {
    errors,
  });
};

/**
 * 发送请求过于频繁响应
 */
export const tooManyRequests = (
  res: Response,
  retryAfter?: number,
  message: string = 'Too many requests'
): void => {
  const details = retryAfter ? { retryAfter } : undefined;
  error(
    res,
    message,
    ErrorCode.TOO_MANY_REQUESTS,
    HttpStatus.TOO_MANY_REQUESTS,
    details
  );
};

/**
 * 分页响应辅助函数
 */
export const paginated = <T>(
  res: Response,
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  message: string = 'Success'
): void => {
  const totalPages = Math.ceil(total / pageSize);
  const meta: ResponseMeta = {
    page,
    pageSize,
    total,
    totalPages,
  };

  success(res, data, message, 'SUCCESS', 200, meta);
};

// 导出所有响应函数
export default {
  // 成功响应
  success,
  created,
  updated,
  deleted,
  noContent,
  paginated,

  // 错误响应
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  tooManyRequests,

  // HTTP状态码
  HttpStatus,

  // 成功代码
  SuccessCode,

  // 错误代码
  ErrorCode,
};
