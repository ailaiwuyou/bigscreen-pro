import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { AppError } from './errorHandler.js'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}

// JWT 认证中间件
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 获取 Authorization Header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, '未提供访问令牌', 'NO_TOKEN')
    }

    // 提取 Token
    const token = authHeader.substring(7)

    if (!token) {
      throw new AppError(401, '访问令牌格式无效', 'INVALID_TOKEN_FORMAT')
    }

    try {
      // 验证 Token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string
        email: string
        role: string
      }

      // 检查用户是否存在且状态正常
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true
        }
      })

      if (!user) {
        throw new AppError(401, '用户不存在', 'USER_NOT_FOUND')
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError(403, '账号已被禁用', 'ACCOUNT_DISABLED')
      }

      // 将用户信息附加到请求对象
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role
      }

      next()
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError(401, '访问令牌已过期', 'TOKEN_EXPIRED')
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, '无效的访问令牌', 'INVALID_TOKEN')
      }
      throw jwtError
    }
  } catch (error) {
    next(error)
  }
}

// 可选认证中间件（不强制要求登录，但如果提供了 Token 会解析用户信息）
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 没有 Token，继续执行但不设置用户信息
      return next()
    }

    const token = authHeader.substring(7)

    if (!token) {
      return next()
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string
        email: string
        role: string
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true
        }
      })

      if (user && user.status === 'ACTIVE') {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role
        }
      }
    } catch {
      // Token 验证失败，忽略错误继续执行
    }

    next()
  } catch (error) {
    next(error)
  }
}

// 角色权限检查中间件
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, '请先登录', 'UNAUTHORIZED'))
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, '权限不足', 'FORBIDDEN')
      )
    }

    next()
  }
}