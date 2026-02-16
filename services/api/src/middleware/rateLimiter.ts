/**
 * 速率限制中间件
 * 防止API滥用和暴力攻击
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../utils/redis';
import { rateLimitConfig, serverConfig } from '../config';
import { logger } from '../utils/logger';

/**
 * 获取客户端标识
 * 用于识别请求来源
 */
const getClientIdentifier = (req: Request): string => {
  // 优先使用用户ID
  const userId = (req as Record<string, unknown>).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // 其次使用IP地址
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return `ip:${ip}`;
};

/**
 * 创建Redis存储
 */
const createRedisStore = (): RedisStore | undefined => {
  try {
    const client = getRedisClient();
    return new RedisStore({
      // @ts-expect-error - ioredis client is compatible
      sendCommand: (...args: string[]) => client.call(...args),
    });
  } catch (error) {
    logger.warn('Failed to create Redis store for rate limiting', { error });
    return undefined;
  }
};

/**
 * 跳过健康检查端点的限制
 */
const skipHealthCheck = (req: Request): boolean => {
  return req.path === '/health' || req.path === '/api/health';
};

/**
 * 标准速率限制器
 * 用于一般API端点
 */
export const standardLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),
  skip: skipHealthCheck,
  keyGenerator: getClientIdentifier,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      path: req.path,
      client: getClientIdentifier(req),
    });

    res.status(429).json({
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later',
      data: null,
      meta: {
        retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
      },
    });
  },
});

/**
 * 严格速率限制器
 * 用于敏感操作（如登录、注册）
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),
  keyGenerator: getClientIdentifier,
  handler: (req: Request, res: Response) => {
    logger.warn('Strict rate limit exceeded', {
      path: req.path,
      method: req.method,
      client: getClientIdentifier(req),
    });

    res.status(429).json({
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts, please try again later',
      data: null,
      meta: {
        retryAfter: 900, // 15分钟
      },
    });
  },
});

/**
 * API密钥速率限制器
 * 用于API密钥认证
 */
export const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 每分钟100次
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(),
  keyGenerator: (req: Request): string => {
    const apiKey = req.headers['x-api-key'] as string;
    return `apikey:${apiKey || 'unknown'}`;
  },
});

/**
 * 自定义速率限制中间件工厂
 * @param options 速率限制选项
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore(),
    keyGenerator: (req: Request): string => {
      const prefix = options.keyPrefix || 'custom';
      const identifier = getClientIdentifier(req);
      return `${prefix}:${identifier}`;
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        code: 'TOO_MANY_REQUESTS',
        message: options.message || 'Too many requests',
        data: null,
        meta: {
          retryAfter: Math.ceil(options.windowMs / 1000),
        },
      });
    },
  });
};

export default {
  standardLimiter,
  strictLimiter,
  apiKeyLimiter,
  createRateLimiter,
};
