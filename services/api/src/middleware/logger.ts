/**
 * HTTP请求日志中间件
 * 记录所有HTTP请求的详细信息和性能指标
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * 请求上下文扩展
 */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * HTTP请求日志中间件
 * 为每个请求生成唯一ID并记录详细日志
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 生成唯一请求ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // 记录请求开始时间
  const startTime = Date.now();
  
  // 将信息附加到请求对象
  req.requestId = requestId;
  req.startTime = startTime;
  
  // 设置响应头
  res.setHeader('X-Request-Id', requestId);
  
  // 记录请求开始日志
  logger.info(`Request started: ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length'],
  });
  
  // 响应完成时的处理
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const contentLength = res.get('content-length');
    
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      contentLength: contentLength ? parseInt(contentLength, 10) : 0,
      ip: req.ip,
    };
    
    // 根据状态码选择日志级别
    if (res.statusCode >= 500) {
      logger.error(`Request failed: ${req.method} ${req.path}`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`Request error: ${req.method} ${req.path}`, logData);
    } else {
      logger.info(`Request completed: ${req.method} ${req.path}`, logData);
    }
  });
  
  // 响应关闭时的处理（异常情况）
  res.on('close', () => {
    if (!res.writableEnded) {
      const duration = Date.now() - startTime;
      logger.warn(`Request closed unexpectedly: ${req.method} ${req.path}`, {
        requestId,
        method: req.method,
        path: req.path,
        duration,
        ip: req.ip,
      });
    }
  });
  
  next();
};

/**
 * 性能监控中间件
 * 记录慢请求和性能指标
 */
export const performanceMonitor = (
  slowThreshold: number = 1000
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // 记录慢请求
      if (duration > slowThreshold) {
        logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          duration,
          threshold: slowThreshold,
          ip: req.ip,
        });
      }
      
      // 记录性能指标（可用于Prometheus等监控系统）
      // 这里可以集成metrics收集
    });
    
    next();
  };
};

export default {
  requestLogger,
  performanceMonitor,
};
