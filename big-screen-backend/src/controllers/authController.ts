import type { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh'
const JWT_REFRESH_EXPIRES_IN = '30d'

// Token 生成函数
const generateTokens = (payload: { userId: string; email: string; role: string }) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  const refreshToken = jwt.sign({ userId: payload.userId }, JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  })
  
  return { accessToken, refreshToken }
}

// 注册
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username, password } = req.body

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existingUser) {
      throw new AppError(409, '邮箱或用户名已被注册', 'USER_EXISTS')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true
      }
    })

    // 生成 Token
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // 设置 Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 天
    })

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user,
        token: accessToken,
        expiresIn: 7 * 24 * 60 * 60 // 7 天（秒）
      }
    })
  } catch (error) {
    next(error)
  }
}

// 登录
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username, password } = req.body

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          username ? { username } : {}
        ].filter(Boolean)
      }
    })

    if (!user) {
      throw new AppError(401, '邮箱/用户名或密码错误', 'INVALID_CREDENTIALS')
    }

    // 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new AppError(403, '账号已被禁用，请联系管理员', 'ACCOUNT_DISABLED')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new AppError(401, '邮箱/用户名或密码错误', 'INVALID_CREDENTIALS')
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 生成 Token
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // 设置 Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    // 返回用户信息（不含密码）
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token: accessToken,
        expiresIn: 7 * 24 * 60 * 60
      }
    })
  } catch (error) {
    next(error)
  }
}

// 登出
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 清除 Refresh Token Cookie
    res.clearCookie('refreshToken')

    res.json({
      success: true,
      message: '登出成功'
    })
  } catch (error) {
    next(error)
  }
}

// 刷新 Token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      throw new AppError(401, '未提供刷新令牌', 'NO_REFRESH_TOKEN')
    }

    // 验证 Refresh Token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(401, '用户不存在或已被禁用', 'USER_INVALID')
    }

    // 生成新的 Token
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // 更新 Refresh Token Cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        token: tokens.accessToken,
        expiresIn: 7 * 24 * 60 * 60
      }
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, '无效的刷新令牌', 'INVALID_REFRESH_TOKEN'))
    } else {
      next(error)
    }
  }
}

// 获取当前用户信息
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      throw new AppError(401, '未授权', 'UNAUTHORIZED')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      throw new AppError(404, '用户不存在', 'USER_NOT_FOUND')
    }

    res.json({
      success: true,
      message: '获取用户信息成功',
      data: { user }
    })
  } catch (error) {
    next(error)
  }
}

// 更新个人资料
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId
    const { username, avatar } = req.body

    if (!userId) {
      throw new AppError(401, '未授权', 'UNAUTHORIZED')
    }

    // 检查用户名是否已被使用
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        throw new AppError(409, '用户名已被使用', 'USERNAME_EXISTS')
      }
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      message: '个人资料更新成功',
      data: { user: updatedUser }
    })
  } catch (error) {
    next(error)
  }
}

// 修改密码
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      throw new AppError(401, '未授权', 'UNAUTHORIZED')
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AppError(404, '用户不存在', 'USER_NOT_FOUND')
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      throw new AppError(401, '当前密码错误', 'INVALID_PASSWORD')
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    next(error)
  }
}