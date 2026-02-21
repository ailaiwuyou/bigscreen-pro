import type { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'

// 自定义错误类
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// 错误响应格式
interface ErrorResponse {
  success: false
  error: string
  code?: string
  message?: string
  details?: Record<string, unknown>
  stack?: string
}

// 错误处理中间件
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | Prisma.PrismaClientKnownRequestError,
  req,
  res,
  next
) => {
  const isDev = process.env.NODE_ENV === 'development'
  
  let statusCode = 500
  let errorResponse: ErrorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: isDev ? err.message : '服务器内部错误'
  }

  // 处理自定义错误
  if (err instanceof AppError) {
    statusCode = err.statusCode
    errorResponse = {
      success: false,
      error: err.message,
      code: err.code,
      message: err.message,
      details: err.details
    }
  }
  // 处理 Prisma 错误
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400
    
    switch (err.code) {
      case 'P2002':
        errorResponse = {
          success: false,
          error: 'Duplicate Entry',
          code: err.code,
          message: '该记录已存在'
        }
        break
      case 'P2025':
        statusCode = 404
        errorResponse = {
          success: false,
          error: 'Not Found',
          code: err.code,
          message: '记录不存在'
        }
        break
      case 'P2003':
        errorResponse = {
          success: false,
          error: 'Foreign Key Constraint',
          code: err.code,
          message: '外键约束失败'
        }
        break
      default:
        errorResponse = {
          success: false,
          error: 'Database Error',
          code: err.code,
          message: isDev ? err.message : '数据库操作失败'
        }
    }
  }
  // 处理 Prisma 验证错误
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    errorResponse = {
      success: false,
      error: 'Validation Error',
      message: '数据验证失败',
      details: isDev ? { message: err.message } : undefined
    }
  }
  // 处理其他已知错误类型
  else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    errorResponse = {
      success: false,
      error: 'Unauthorized',
      message: '未授权，请先登录'
    }
  }
  else if (err.name === 'ForbiddenError') {
    statusCode = 403
    errorResponse = {
      success: false,
      error: 'Forbidden',
      message: '禁止访问'
    }
  }
  else if (err.name === 'NotFoundError') {
    statusCode = 404
    errorResponse = {
      success: false,
      error: 'Not Found',
      message: '请求的资源不存在'
    }
  }

  // 开发环境添加堆栈信息
  if (isDev && err.stack) {
    errorResponse.stack = err.stack
  }

  // 记录错误日志
  console.error('[Error]', {
    statusCode,
    path: req.path,
    method: req.method,
    error: errorResponse,
    stack: isDev ? err.stack : undefined
  })

  res.status(statusCode).json(errorResponse)
}