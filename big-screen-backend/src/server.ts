import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import userRoutes from './routes/user.js'
import dataSourceRoutes from './routes/dataSource.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'  // 监听所有网络接口
const NODE_ENV = process.env.NODE_ENV || 'development'

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// CORS 配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: NODE_ENV === 'production' ? 100 : 1000, // 生产环境 100 次，开发环境 1000 次
  message: { success: false, error: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// 日志中间件
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'))

// 解析请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    }
  })
})

// API 路由注册
app.use('/api/auth', authRoutes)
app.use('/api/dashboards', dashboardRoutes)
app.use('/api/users', userRoutes)
app.use('/api/data-sources', dataSourceRoutes)

// 404 处理
app.use(notFound)

// 错误处理
app.use(errorHandler)

// 启动服务器 - 绑定到 0.0.0.0 以支持IPv4
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 服务器运行在 ${NODE_ENV} 模式`)
  console.log(`📡 监听地址: http://${HOST}:${PORT}`)
  console.log(`🔗 健康检查: http://localhost:${PORT}/health`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('👋 收到 SIGTERM 信号，正在关闭服务器...')
  server.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('👋 收到 SIGINT 信号，正在关闭服务器...')
  server.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})

export default app
