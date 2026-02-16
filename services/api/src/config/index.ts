/**
 * 全局配置管理
 * 集中管理所有环境变量和配置项
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 服务器配置
 */
export const serverConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * 数据库配置
 */
export const databaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bigscreen_pro?schema=public',
};

/**
 * Redis配置
 */
export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
};

/**
 * JWT配置
 */
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

/**
 * OpenAI配置
 */
export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4',
  enabled: process.env.ENABLE_AI_FEATURES === 'true',
};

/**
 * 速率限制配置
 */
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

/**
 * CORS配置
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
};

/**
 * 日志配置
 */
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || 'logs/app.log',
};

/**
 * 安全配置
 */
export const securityConfig = {
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
};

/**
 * 功能开关
 */
export const featureFlags = {
  enableAI: process.env.ENABLE_AI_FEATURES === 'true',
  enableRealtimeData: process.env.ENABLE_REALTIME_DATA !== 'false',
  enableWebSocket: process.env.ENABLE_WEBSOCKET !== 'false',
};

/**
 * 导出所有配置
 */
export default {
  server: serverConfig,
  database: databaseConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  openai: openaiConfig,
  rateLimit: rateLimitConfig,
  cors: corsConfig,
  logging: loggingConfig,
  security: securityConfig,
  features: featureFlags,
};
