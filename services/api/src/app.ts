/**
 * BigScreen Pro Backend
 * 企业级数据可视化平台后端
 */

import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { createServer, Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// 配置
import { serverConfig, corsConfig } from './config';

// 中间件
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { standardLimiter } from './middleware/rateLimiter';

// 工具
import { logger } from './utils/logger';
import { connectDatabase, disconnectDatabase } from './utils/database';
import { closeRedisConnection } from './utils/redis';

// 路由
import routes from './routes';

/**
 * 应用类
 */
class App {
  public app: Express;
  public server: Server;
  public io: SocketIOServer | null = null;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   */
  private initializeMiddlewares(): void {
    // 安全头部
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS
    this.app.use(cors({
      origin: corsConfig.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }));

    // 压缩响应
    this.app.use(compression());

    // HTTP请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    // 自定义请求日志（包含请求ID）
    this.app.use(requestLogger);

    // 速率限制
    this.app.use(standardLimiter);

    // 解析JSON请求体
    this.app.use(express.json({ limit: '10mb' }));
    
    // 解析URL编码请求体
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // 健康检查
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // API路由
    this.app.use('/api', routes);

    // 根路径
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'BigScreen Pro API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api/docs',
      });
    });
  }

  /**
   * 初始化Swagger文档
   */
  private initializeSwagger(): void {
    // 这里可以添加Swagger配置
    // this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  /**
   * 初始化错误处理
   */
  private initializeErrorHandling(): void {
    // 404处理
    this.app.use(notFoundHandler);
    
    // 全局错误处理
    this.app.use(errorHandler);
  }

  /**
   * 初始化WebSocket
   */
  private initializeWebSocket(): void {
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: corsConfig.origin,
        credentials: true,
      },
    });

    // WebSocket连接处理
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });

      // 加入房间
      socket.on('join', (room: string) => {
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      });

      // 离开房间
      socket.on('leave', (room: string) => {
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room: ${room}`);
      });
    });
  }

  /**
   * 启动服务器
   */
  public async start(): Promise<void> {
    try {
      // 连接数据库
      await connectDatabase();

      // 初始化WebSocket
      this.initializeWebSocket();

      // 启动HTTP服务器
      this.server.listen(serverConfig.port, () => {
        logger.info('='.repeat(60));
        logger.info('🚀 BigScreen Pro Backend Server Started');
        logger.info('='.repeat(60));
        logger.info(`📡 Environment: ${serverConfig.env}`);
        logger.info(`🌐 Port: ${serverConfig.port}`);
        logger.info(`🔗 API URL: http://localhost:${serverConfig.port}/api`);
        logger.info(`📚 Health Check: http://localhost:${serverConfig.port}/health`);
        logger.info('='.repeat(60));
      });

      // 优雅关闭
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // 停止接收新连接
      this.server.close(async () => {
        logger.info('HTTP server closed');

        // 关闭WebSocket连接
        if (this.io) {
          this.io.close();
          logger.info('WebSocket server closed');
        }

        // 关闭数据库连接
        await disconnectDatabase();

        // 关闭Redis连接
        await closeRedisConnection();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      });

      // 超时强制退出
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// 创建应用实例并启动
const app = new App();
app.start();

export default app;
