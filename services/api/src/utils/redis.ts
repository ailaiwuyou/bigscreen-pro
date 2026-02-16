/**
 * Redis客户端工具
 * 提供缓存操作和分布式锁功能
 */

import Redis from 'ioredis';
import { redisConfig } from '../config';
import { logger } from './logger';

/**
 * Redis客户端单例
 */
let redisClient: Redis | null = null;

/**
 * 获取Redis客户端实例
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig.url, {
      password: redisConfig.password || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry ${times}, delay ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting...');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
    });
  }

  return redisClient;
};

/**
 * 关闭Redis连接
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// ============================================
// 缓存操作
// ============================================

/**
 * 设置缓存
 */
export const setCache = async (
  key: string,
  value: unknown,
  ttl?: number
): Promise<void> => {
  const client = getRedisClient();
  const serializedValue = JSON.stringify(value);

  if (ttl && ttl > 0) {
    await client.setex(key, ttl, serializedValue);
  } else {
    await client.set(key, serializedValue);
  }
};

/**
 * 获取缓存
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  const value = await client.get(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
};

/**
 * 删除缓存
 */
export const deleteCache = async (key: string): Promise<void> => {
  const client = getRedisClient();
  await client.del(key);
};

/**
 * 批量删除缓存
 */
export const deleteCachePattern = async (pattern: string): Promise<number> => {
  const client = getRedisClient();
  const keys = await client.keys(pattern);

  if (keys.length === 0) {
    return 0;
  }

  await client.del(...keys);
  return keys.length;
};

/**
 * 检查缓存是否存在
 */
export const existsCache = async (key: string): Promise<boolean> => {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result === 1;
};

// ============================================
// 分布式锁
// ============================================

/**
 * 获取分布式锁
 */
export const acquireLock = async (
  lockKey: string,
  lockValue: string,
  ttl: number = 30
): Promise<boolean> => {
  const client = getRedisClient();
  const result = await client.set(lockKey, lockValue, 'EX', ttl, 'NX');
  return result === 'OK';
};

/**
 * 释放分布式锁
 */
export const releaseLock = async (
  lockKey: string,
  lockValue: string
): Promise<boolean> => {
  const client = getRedisClient();
  const currentValue = await client.get(lockKey);

  if (currentValue === lockValue) {
    await client.del(lockKey);
    return true;
  }

  return false;
};

/**
 * 延长锁的过期时间
 */
export const extendLock = async (
  lockKey: string,
  lockValue: string,
  ttl: number = 30
): Promise<boolean> => {
  const client = getRedisClient();
  const currentValue = await client.get(lockKey);

  if (currentValue === lockValue) {
    await client.expire(lockKey, ttl);
    return true;
  }

  return false;
};

// ============================================
// 速率限制
// ============================================

/**
 * 增加计数器
 */
export const incrementCounter = async (
  key: string,
  window: number
): Promise<number> => {
  const client = getRedisClient();
  const multi = client.multi();

  multi.incr(key);
  multi.expire(key, window);

  const results = await multi.exec();
  return (results?.[0]?.[1] as number) || 0;
};

/**
 * 获取计数器值
 */
export const getCounter = async (key: string): Promise<number> => {
  const client = getRedisClient();
  const value = await client.get(key);
  return parseInt(value || '0', 10);
};

/**
 * 重置计数器
 */
export const resetCounter = async (key: string): Promise<void> => {
  const client = getRedisClient();
  await client.del(key);
};
