/**
 * 错误处理中间件
 * 统一处理应用中的所有错误
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { serverConfig } from '../config';

/**
 * 全局错误处理中间件
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 构建错误上下文
  const errorContext = {
    requestId: req.headers['x-request-id'] || 'unknown',
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: (req as Record<string, unknown>).user?.id,
  };

  // 处理已知错误
  if (err instanceof AppError) {
    const { code, message, statusCode, isOperational, details } = err;

    // 记录错误日志
    if (statusCode >= 500) {
      logger.error(`[${code}] ${message}`, {
        ...errorContext,
        stack: err.stack,
        details,
      });
    } else {
      logger.warn(`[${code}] ${message}`, {
        ...errorContext,
        details,
      });
    }

    // 发送响应
    res.status(statusCode).json({
      success: false,
      code,
      message,
      data: null,
      ...(details && { meta: { details } }),
      ...(!isOperational && serverConfig.isDevelopment && {
        stack: err.stack,
      }),
    });

    return;
  }

  // 处理语法错误（如JSON解析错误）
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn('Syntax error', { ...errorContext, error: err.message });

    res.status(400).json({
      success: false,
      code: 'BAD_REQUEST',
      message: 'Invalid JSON format',
      data: null,
    });

    return;
  }

  // 处理未知错误
  logger.error('Unexpected error', {
    ...errorContext,
    error: err.message,
    stack: err.stack,
  });

  // 发送通用错误响应
  const response: Record<string, unknown> = {
    success: false,
    code: 'INTERNAL_ERROR',
    message: serverConfig.isProduction
      ? 'An unexpected error occurred'
      : err.message,
    data: null,
  };

  // 开发环境显示错误详情
  if (!serverConfig.isProduction) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

/**
 * 404错误处理中间件
 * 处理未找到的路由
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    requestId: req.headers['x-request-id'],
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    data: null,
  });
};

/**
 * 异步错误捕获包装器
 * 用于自动捕获异步路由处理函数中的错误
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
