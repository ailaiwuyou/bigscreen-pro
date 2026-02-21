import type { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

// 获取用户列表（管理员）
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      keyword = '',
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as {
      page?: string
      pageSize?: string
      keyword?: string
      role?: string
      status?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }

    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    // 构建查询条件
    const where: any = {
      ...(keyword && {
        OR: [
          { email: { contains: keyword, mode: 'insensitive' } },
          { username: { contains: keyword, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role }),
      ...(status && { status })
    }

    // 构建排序
    const orderBy: any = {
      [sortBy]: sortOrder
    }

    // 并行查询总数和列表
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
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
    ])

    const totalPages = Math.ceil(total / take)

    res.json({
      success: true,
      message: '获取用户列表成功',
      data: {
        list: users,
        total,
        page: Number(page),
        pageSize: take,
        totalPages
      }
    })
  } catch (error) {
    next(error)
  }
}

// 获取单个用户
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            dashboards: true,
            datasources: true
          }
        }
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

// 更新用户（管理员）
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { username, avatar, role, status } = req.body

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      throw new AppError(404, '用户不存在', 'USER_NOT_FOUND')
    }

    // 检查用户名是否已被使用
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id }
        }
      })

      if (usernameExists) {
        throw new AppError(409, '用户名已被使用', 'USERNAME_EXISTS')
      }
    }

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(avatar && { avatar }),
        ...(role && { role }),
        ...(status && { status })
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
      message: '用户信息更新成功',
      data: { user: updatedUser }
    })
  } catch (error) {
    next(error)
  }
}

// 删除用户（管理员）
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const currentUserId = req.user!.userId

    // 防止删除自己
    if (id === currentUserId) {
      throw new AppError(400, '不能删除自己的账号', 'CANNOT_DELETE_SELF')
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      throw new AppError(404, '用户不存在', 'USER_NOT_FOUND')
    }

    // 删除用户（级联删除相关数据）
    await prisma.user.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '用户删除成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}