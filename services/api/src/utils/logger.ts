/**
 * 日志工具
 * 使用Winston实现结构化日志记录
 */

import winston, { format, transports } from 'winston';
import path from 'path';
import { loggingConfig, serverConfig } from '../config';

// 日志级别颜色配置
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// 添加颜色支持
winston.addColors(colors);

/**
 * 自定义日志格式
 */
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({ all: true }),
  format.printf((info) => {
    const { timestamp, level, message, ...metadata } = info;
    let msg = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

/**
 * 文件日志格式（JSON格式，便于分析）
 */
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.json()
);

/**
 * 日志传输配置
 */
const transportConfigs: winston.transport[] = [
  // 控制台输出
  new transports.Console({
    format: consoleFormat,
    level: serverConfig.isDevelopment ? 'debug' : 'info',
  }),
];

// 生产环境添加文件日志
if (serverConfig.isProduction) {
  const logDir = path.dirname(loggingConfig.file);
  
  transportConfigs.push(
    // 错误日志
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 所有日志
    new transports.File({
      filename: loggingConfig.file,
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Winston Logger实例
 */
export const logger = winston.createLogger({
  level: loggingConfig.level,
  defaultMeta: {
    service: 'bigscreen-backend',
    environment: serverConfig.env,
  },
  transports: transportConfigs,
  exitOnError: false,
});

/**
 * 请求上下文日志
 * 用于记录请求相关的上下文信息
 */
export class RequestLogger {
  private requestId: string;
  private startTime: number;

  constructor(requestId: string) {
    this.requestId = requestId;
    this.startTime = Date.now();
  }

  log(level: string, message: string, meta?: Record<string, unknown>): void {
    logger.log(level, message, {
      requestId: this.requestId,
      duration: Date.now() - this.startTime,
      ...meta,
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }
}

/**
 * 流式日志
 * 用于记录长耗时操作的进度
 */
export const streamLogger = {
  write: (message: string): void => {
    logger.info(message.trim());
  },
};

export default logger;
