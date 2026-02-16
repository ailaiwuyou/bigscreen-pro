/**
 * 仪表盘服务
 * 处理仪表盘的CRUD操作和业务逻辑
 */

import { PrismaClient, Dashboard, DashboardStatus, Prisma } from '@prisma/client';
import {
  CreateDashboardRequest,
  UpdateDashboardRequest,
  PaginationParams,
  DashboardConfig,
} from '../types';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../utils/errors';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

/**
 * 仪表盘服务类
 */
export class DashboardService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
  }

  // ============================================
  // 查询操作
  // ============================================

  /**
   * 获取仪表盘列表
   * @param userId 用户ID
   * @param params 分页参数
   * @param filters 过滤条件
   */
  async findAll(
    userId: string,
    params: PaginationParams = {},
    filters: { status?: DashboardStatus; isPublic?: boolean; search?: string } = {}
  ): Promise<{ dashboards: Dashboard[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.DashboardWhereInput = {
      OR: [
        { authorId: userId }, // 用户自己的仪表盘
        { isPublic: true }, // 公开的仪表盘
      ],
    };

    // 添加状态过滤
    if (filters.status) {
      where.status = filters.status;
    }

    // 添加公开状态过滤
    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    // 添加搜索条件
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // 构建排序
    const orderBy: Prisma.DashboardOrderByWithRelationInput = {};
    if (params.sortBy) {
      orderBy[params.sortBy as keyof Prisma.DashboardOrderByWithRelationInput] =
        params.sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // 执行查询
    const [dashboards, total] = await Promise.all([
      this.prisma.dashboard.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          theme: true,
          _count: {
            select: {
              components: true,
            },
          },
        },
      }),
      this.prisma.dashboard.count({ where }),
    ]);

    return {
      dashboards,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 根据ID获取仪表盘
   * @param id 仪表盘ID
   * @param userId 当前用户ID
   * @param includeComponents 是否包含组件
   */
  async findById(
    id: string,
    userId: string,
    includeComponents: boolean = false
  ): Promise<Dashboard> {
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        theme: true,
        components: includeComponents
          ? {
              orderBy: { sortOrder: 'asc' },
              include: {
                datasource: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                  },
                },
              },
            }
          : false,
      },
    });

    if (!dashboard) {
      throw new NotFoundError('Dashboard', id);
    }

    // 检查访问权限
    if (!dashboard.isPublic && dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to access this dashboard');
    }

    // 更新浏览次数
    if (dashboard.authorId !== userId) {
      await this.prisma.dashboard.update({
        where: { id },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
      });
    }

    return dashboard;
  }

  // ============================================
  // 创建和修改
  // ============================================

  /**
   * 创建仪表盘
   * @param userId 用户ID
   * @param data 创建数据
   */
  async create(userId: string, data: CreateDashboardRequest): Promise<Dashboard> {
    // 验证主题
    if (data.themeId) {
      const theme = await this.prisma.theme.findUnique({
        where: { id: data.themeId },
      });

      if (!theme) {
        throw new NotFoundError('Theme', data.themeId);
      }
    }

    // 创建仪表盘
    const dashboard = await this.prisma.dashboard.create({
      data: {
        name: data.name,
        description: data.description,
        config: data.config || {},
        status: 'DRAFT',
        isPublic: false,
        authorId: userId,
        themeId: data.themeId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        theme: true,
      },
    });

    logger.info(`Dashboard created: ${dashboard.id}`, {
      userId,
      dashboardId: dashboard.id,
      name: dashboard.name,
    });

    return dashboard;
  }

  /**
   * 更新仪表盘
   * @param id 仪表盘ID
   * @param userId 用户ID
   * @param data 更新数据
   */
  async update(
    id: string,
    userId: string,
    data: UpdateDashboardRequest
  ): Promise<Dashboard> {
    // 检查仪表盘是否存在
    const existing = await this.prisma.dashboard.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Dashboard', id);
    }

    // 检查权限
    if (existing.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to update this dashboard');
    }

    // 验证主题
    if (data.themeId) {
      const theme = await this.prisma.theme.findUnique({
        where: { id: data.themeId },
      });

      if (!theme) {
        throw new NotFoundError('Theme', data.themeId);
      }
    }

    // 处理发布操作
    let publishedAt = existing.publishedAt;
    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      publishedAt = new Date();
    }

    // 更新仪表盘
    const dashboard = await this.prisma.dashboard.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.config !== undefined && { config: data.config }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.themeId !== undefined && { themeId: data.themeId }),
        publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        theme: true,
      },
    });

    logger.info(`Dashboard updated: ${id}`, {
      userId,
      dashboardId: id,
      updates: Object.keys(data),
    });

    return dashboard;
  }

  /**
   * 删除仪表盘
   * @param id 仪表盘ID
   * @param userId 用户ID
   */
  async delete(id: string, userId: string): Promise<void> {
    // 检查仪表盘是否存在
    const existing = await this.prisma.dashboard.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Dashboard', id);
    }

    // 检查权限
    if (existing.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this dashboard');
    }

    // 删除仪表盘（级联删除组件）
    await this.prisma.dashboard.delete({
      where: { id },
    });

    logger.info(`Dashboard deleted: ${id}`, {
      userId,
      dashboardId: id,
    });
  }

  // ============================================
  // 辅助方法
  // ============================================

  /**
   * 构建AuthUser对象
   */
  private buildAuthUser(
    user: User & { role?: { name: string; permissions: unknown } | null }
  ): AuthUser {
    let permissions: string[] = [];

    if (user.role && user.role.permissions) {
      try {
        const perms = user.role.permissions as Array<{
          resource: string;
          actions: string[];
        }>;
        permissions = perms.flatMap((p) =>
          p.actions.map((action) => `${p.resource}:${action}`)
        );
      } catch {
        // 忽略权限解析错误
      }
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      roleId: user.roleId,
      permissions,
      status: user.status,
    };
  }
}

export default DashboardService;
