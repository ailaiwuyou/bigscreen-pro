/**
 * 组件服务
 * 处理可视化组件的CRUD操作和业务逻辑
 */

import { PrismaClient, Component, Prisma } from '@prisma/client';
import {
  CreateComponentRequest,
  UpdateComponentRequest,
  ComponentType,
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
 * 组件服务类
 */
export class ComponentService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
  }

  // ============================================
  // 查询操作
  // ============================================

  /**
   * 获取仪表盘的所有组件
   * @param dashboardId 仪表盘ID
   * @param userId 当前用户ID
   */
  async findByDashboard(
    dashboardId: string,
    userId: string
  ): Promise<Component[]> {
    // 检查仪表盘是否存在且用户有权限访问
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard) {
      throw new NotFoundError('Dashboard', dashboardId);
    }

    if (!dashboard.isPublic && dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to access this dashboard');
    }

    // 获取组件列表
    const components = await this.prisma.component.findMany({
      where: { dashboardId },
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
    });

    return components;
  }

  /**
   * 根据ID获取组件
   * @param id 组件ID
   * @param userId 当前用户ID
   */
  async findById(id: string, userId: string): Promise<Component> {
    const component = await this.prisma.component.findUnique({
      where: { id },
      include: {
        dashboard: {
          select: {
            authorId: true,
            isPublic: true,
          },
        },
        datasource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!component) {
      throw new NotFoundError('Component', id);
    }

    // 检查访问权限
    if (!component.dashboard.isPublic && component.dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to access this component');
    }

    return component;
  }

  // ============================================
  // 创建和修改
  // ============================================

  /**
   * 创建组件
   * @param dashboardId 仪表盘ID
   * @param userId 用户ID
   * @param data 创建数据
   */
  async create(
    dashboardId: string,
    userId: string,
    data: CreateComponentRequest
  ): Promise<Component> {
    // 检查仪表盘是否存在且属于当前用户
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard) {
      throw new NotFoundError('Dashboard', dashboardId);
    }

    if (dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this dashboard');
    }

    // 验证数据源
    if (data.datasourceId) {
      const datasource = await this.prisma.datasource.findUnique({
        where: { id: data.datasourceId },
      });

      if (!datasource) {
        throw new NotFoundError('Datasource', data.datasourceId);
      }

      if (datasource.ownerId !== userId) {
        throw new ForbiddenError('You do not have permission to use this datasource');
      }
    }

    // 获取当前最大的sortOrder
    const maxSortOrder = await this.prisma.component.aggregate({
      where: { dashboardId },
      _max: { sortOrder: true },
    });

    const sortOrder = data.sortOrder ?? (maxSortOrder._max.sortOrder || 0) + 1;

    // 创建组件
    const component = await this.prisma.component.create({
      data: {
        name: data.name,
        type: data.type,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        config: data.config || {},
        data: data.data || null,
        dashboardId,
        datasourceId: data.datasourceId || null,
        sortOrder,
      },
      include: {
        datasource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    logger.info(`Component created: ${component.id}`, {
      userId,
      dashboardId,
      componentId: component.id,
      type: component.type,
    });

    return component;
  }

  /**
   * 更新组件
   * @param id 组件ID
   * @param userId 用户ID
   * @param data 更新数据
   */
  async update(
    id: string,
    userId: string,
    data: UpdateComponentRequest
  ): Promise<Component> {
    // 检查组件是否存在
    const existing = await this.prisma.component.findUnique({
      where: { id },
      include: {
        dashboard: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Component', id);
    }

    // 检查权限
    if (existing.dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to update this component');
    }

    // 验证数据源
    if (data.datasourceId !== undefined) {
      if (data.datasourceId) {
        const datasource = await this.prisma.datasource.findUnique({
          where: { id: data.datasourceId },
        });

        if (!datasource) {
          throw new NotFoundError('Datasource', data.datasourceId);
        }

        if (datasource.ownerId !== userId) {
          throw new ForbiddenError('You do not have permission to use this datasource');
        }
      }
    }

    // 更新组件
    const component = await this.prisma.component.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.x !== undefined && { x: data.x }),
        ...(data.y !== undefined && { y: data.y }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.config !== undefined && { config: data.config }),
        ...(data.data !== undefined && { data: data.data }),
        ...(data.datasourceId !== undefined && { datasourceId: data.datasourceId || null }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        datasource: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    logger.info(`Component updated: ${id}`, {
      userId,
      componentId: id,
      updates: Object.keys(data),
    });

    return component;
  }

  /**
   * 删除组件
   * @param id 组件ID
   * @param userId 用户ID
   */
  async delete(id: string, userId: string): Promise<void> {
    // 检查组件是否存在
    const existing = await this.prisma.component.findUnique({
      where: { id },
      include: {
        dashboard: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Component', id);
    }

    // 检查权限
    if (existing.dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this component');
    }

    // 删除组件
    await this.prisma.component.delete({
      where: { id },
    });

    logger.info(`Component deleted: ${id}`, {
      userId,
      componentId: id,
    });
  }

  /**
   * 批量更新组件位置
   * @param dashboardId 仪表盘ID
   * @param userId 用户ID
   * @param updates 位置更新列表
   */
  async batchUpdatePositions(
    dashboardId: string,
    userId: string,
    updates: Array<{ id: string; x: number; y: number; width: number; height: number }>
  ): Promise<void> {
    // 检查仪表盘是否存在且有权限
    const dashboard = await this.prisma.dashboard.findUnique({
      where: { id: dashboardId },
    });

    if (!dashboard) {
      throw new NotFoundError('Dashboard', dashboardId);
    }

    if (dashboard.authorId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this dashboard');
    }

    // 批量更新
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.component.update({
          where: { id: update.id },
          data: {
            x: update.x,
            y: update.y,
            width: update.width,
            height: update.height,
          },
        })
      )
    );

    logger.info(`Batch updated ${updates.length} component positions`, {
      userId,
      dashboardId,
    });
  }
}

export default ComponentService;
