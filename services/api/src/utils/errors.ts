/**
 * 错误处理工具
 * 定义应用级错误类和错误处理工具
 */

import { Response } from 'express';
import { logger } from './logger';

/**
 * 应用基础错误类
 * 所有自定义错误都应继承此类
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // 确保原型链正确
    Object.setPrototypeOf(this, AppError.prototype);
    
    // 捕获堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 转换为JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * 400 Bad Request - 请求参数错误
 */
export class BadRequestError extends AppError {
  constructor(
    message: string = 'Bad Request',
    code: string = 'BAD_REQUEST',
    details?: Record<string, unknown>
  ) {
    super(message, code, 400, true, details);
  }
}

/**
 * 401 Unauthorized - 未授权
 */
export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized',
    code: string = 'UNAUTHORIZED'
  ) {
    super(message, code, 401, true);
  }
}

/**
 * 403 Forbidden - 禁止访问
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = 'Forbidden',
    code: string = 'FORBIDDEN'
  ) {
    super(message, code, 403, true);
  }
}

/**
 * 404 Not Found - 资源不存在
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    resource?: string,
    resourceId?: string
  ) {
    super(
      message,
      code,
      404,
      true,
      resource ? { resource, resourceId } : undefined
    );
  }
}

/**
 * 409 Conflict - 资源冲突
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'Resource conflict',
    code: string = 'CONFLICT'
  ) {
    super(message, code, 409, true);
  }
}

/**
 * 422 Unprocessable Entity - 验证错误
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    code: string = 'VALIDATION_ERROR',
    public readonly errors: Array<{
      field: string;
      message: string;
      value?: unknown;
    }> = []
  ) {
    super(message, code, 422, true, { errors });
  }
}

/**
 * 429 Too Many Requests - 请求过于频繁
 */
export class TooManyRequestsError extends AppError {
  constructor(
    message: string = 'Too many requests',
    code: string = 'TOO_MANY_REQUESTS',
    public readonly retryAfter?: number
  ) {
    super(message, code, 429, true, retryAfter ? { retryAfter } : undefined);
  }
}

/**
 * 500 Internal Server Error - 服务器内部错误
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = 'Internal server error',
    code: string = 'INTERNAL_ERROR'
  ) {
    super(message, code, 500, false);
  }
}

/**
 * 503 Service Unavailable - 服务不可用
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = 'Service unavailable',
    code: string = 'SERVICE_UNAVAILABLE'
  ) {
    super(message, code, 503, true);
  }
}

// ============================================
// 错误处理工具函数
// ============================================

/**
 * 错误代码到HTTP状态码的映射
 */
export const errorCodeToStatusCode: Record<string, number> = {
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * 判断错误是否为操作错误
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * 安全地序列化错误
 */
export const serializeError = (error: Error): Record<string, unknown> => {
  const serialized: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (error instanceof AppError) {
    serialized.code = error.code;
    serialized.statusCode = error.statusCode;
    serialized.isOperational = error.isOperational;
    if (error.details) {
      serialized.details = error.details;
    }
  }

  return serialized;
};

/**
 * 处理未捕获的错误
 */
export const handleUncaughtErrors = (): void => {
  // 处理未捕获的Promise拒绝
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? serializeError(reason) : reason,
    });
    
    // 如果是操作错误，可以忽略；否则，考虑重启应用
    if (reason instanceof AppError && !reason.isOperational) {
      logger.error('Critical non-operational error, shutting down...');
      process.exit(1);
    }
  });

  // 处理未捕获的异常
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: serializeError(error),
    });
    
    // 所有未捕获的异常都是严重的，应该关闭应用
    logger.error('Uncaught exception, shutting down...');
    process.exit(1);
  });
};

export default AppError;
