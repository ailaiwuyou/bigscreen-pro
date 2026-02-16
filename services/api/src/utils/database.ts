/**
 * 数据库客户端
 * Prisma ORM 单例模式管理
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';
import { serverConfig } from '../config';

/**
 * 扩展PrismaClient类型以包含日志记录
 */
const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log: serverConfig.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  });

  // 添加中间件记录慢查询
  client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    // 记录慢查询（超过1秒）
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        model: params.model,
        action: params.action,
        duration,
        args: params.args,
      });
    }

    return result;
  });

  return client;
};

/**
 * Prisma Client 单例
 */
let prismaInstance: PrismaClient | undefined;

/**
 * 获取Prisma Client实例
 * 使用单例模式确保只有一个数据库连接
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
};

/**
 * 直接导出的Prisma Client实例
 * 推荐使用此导出
 */
export const prisma = getPrismaClient();

/**
 * 连接数据库
 * 在应用启动时调用
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
};

/**
 * 断开数据库连接
 * 在应用关闭时调用
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database', { error });
    throw error;
  }
};

/**
 * 执行数据库健康检查
 */
export const healthCheck = async (): Promise<{ healthy: boolean; latency: number }> => {
  const start = Date.now();
  try {
    // 执行简单查询检查连接
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
    };
  }
};

/**
 * 清空数据库（仅用于测试）
 */
export const clearDatabase = async (): Promise<void> => {
  if (serverConfig.isProduction) {
    throw new Error('Cannot clear database in production');
  }

  const tables = Prisma.dmmf.datamodel.models.map((model) => model.dbName || model.name);

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (error) {
      logger.warn(`Failed to truncate table ${table}`, { error });
    }
  }

  logger.info('Database cleared successfully');
};

export default prisma;
