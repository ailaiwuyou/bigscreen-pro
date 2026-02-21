import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// 加载环境变量
dotenv.config()

const app = express()
const NODE_ENV = process.env.NODE_ENV || 'development'

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

// CORS 配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: NODE_ENV === 'production' ? 100 : 1000,
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
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import userRoutes from './routes/user.js'
import dataSourceRoutes from './routes/dataSource.js'

app.use('/api/auth', authRoutes)
app.use('/api/dashboards', dashboardRoutes)
app.use('/api/users', userRoutes)
app.use('/api/data-sources', dataSourceRoutes)

// 404 处理
app.use(notFound)

// 错误处理
app.use(errorHandler)

export default app