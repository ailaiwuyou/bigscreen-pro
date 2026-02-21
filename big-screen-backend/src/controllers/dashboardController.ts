import type { Request, Response, NextFunction } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import { AppError } from '../middleware/errorHandler.js'

const prisma = new PrismaClient()

// 创建仪表盘
export const createDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId
    const { name, description, config, isPublic = false } = req.body

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        description,
        config: config || {},
        isPublic,
        status: 'DRAFT',
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: '仪表盘创建成功',
      data: { dashboard }
    })
  } catch (error) {
    next(error)
  }
}

// 获取仪表盘列表
export const getDashboards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId
    const {
      page = 1,
      pageSize = 12,
      keyword = '',
      status,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query as {
      page?: string
      pageSize?: string
      keyword?: string
      status?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }

    const skip = (Number(page) - 1) * Number(pageSize)
    const take = Number(pageSize)

    // 构建查询条件
    const where: Prisma.DashboardWhereInput = {
      OR: [
        { ownerId: userId },
        { isPublic: true }
      ],
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status: status as any })
    }

    // 构建排序
    const orderBy: Prisma.DashboardOrderByWithRelationInput = {
      [sortBy]: sortOrder
    }

    // 并行查询总数和列表
    const [total, dashboards] = await Promise.all([
      prisma.dashboard.count({ where }),
      prisma.dashboard.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      })
    ])

    const totalPages = Math.ceil(total / take)

    res.json({
      success: true,
      message: '获取仪表盘列表成功',
      data: {
        list: dashboards,
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

// 获取单个仪表盘
export const getDashboardById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { isPublic: true }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    if (!dashboard) {
      throw new AppError(404, '仪表盘不存在', 'DASHBOARD_NOT_FOUND')
    }

    res.json({
      success: true,
      message: '获取仪表盘成功',
      data: { dashboard }
    })
  } catch (error) {
    next(error)
  }
}

// 更新仪表盘
export const updateDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const { name, description, config, isPublic, thumbnail } = req.body

    // 检查仪表盘是否存在且属于当前用户
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        ownerId: userId
      }
    })

    if (!existingDashboard) {
      throw new AppError(404, '仪表盘不存在或无权限修改', 'DASHBOARD_NOT_FOUND')
    }

    // 更新仪表盘
    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(config && { config }),
        ...(isPublic !== undefined && { isPublic }),
        ...(thumbnail && { thumbnail })
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: '仪表盘更新成功',
      data: { dashboard }
    })
  } catch (error) {
    next(error)
  }
}

// 删除仪表盘
export const deleteDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    // 检查仪表盘是否存在且属于当前用户
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        ownerId: userId
      }
    })

    if (!existingDashboard) {
      throw new AppError(404, '仪表盘不存在或无权限删除', 'DASHBOARD_NOT_FOUND')
    }

    // 删除仪表盘
    await prisma.dashboard.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '仪表盘删除成功',
      data: null
    })
  } catch (error) {
    next(error)
  }
}

// 复制仪表盘
export const duplicateDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    // 查找原仪表盘
    const originalDashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { isPublic: true }
        ]
      }
    })

    if (!originalDashboard) {
      throw new AppError(404, '仪表盘不存在', 'DASHBOARD_NOT_FOUND')
    }

    // 创建副本
    const duplicatedDashboard = await prisma.dashboard.create({
      data: {
        name: `${originalDashboard.name} (副本)`,
        description: originalDashboard.description,
        config: originalDashboard.config,
        isPublic: false,
        status: 'DRAFT',
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: '仪表盘复制成功',
      data: { dashboard: duplicatedDashboard }
    })
  } catch (error) {
    next(error)
  }
}

// 发布仪表盘
export const publishDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    // 检查仪表盘是否存在且属于当前用户
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        ownerId: userId
      }
    })

    if (!existingDashboard) {
      throw new AppError(404, '仪表盘不存在或无权限修改', 'DASHBOARD_NOT_FOUND')
    }

    // 更新为发布状态
    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: '仪表盘发布成功',
      data: { dashboard }
    })
  } catch (error) {
    next(error)
  }
}

// 归档仪表盘
export const archiveDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    // 检查仪表盘是否存在且属于当前用户
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id,
        ownerId: userId
      }
    })

    if (!existingDashboard) {
      throw new AppError(404, '仪表盘不存在或无权限修改', 'DASHBOARD_NOT_FOUND')
    }

    // 更新为归档状态
    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: '仪表盘归档成功',
      data: { dashboard }
    })
  } catch (error) {
    next(error)
  }
}