/**
 * 组件控制器
 * 处理可视化组件相关的HTTP请求
 */

import { Request, Response } from 'express';
import { ComponentService } from '../services/ComponentService';
import { AuthenticatedRequest, CreateComponentRequest, UpdateComponentRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import * as response from '../utils/response';

/**
 * 组件控制器类
 */
export class ComponentController {
  private componentService: ComponentService;

  constructor() {
    this.componentService = new ComponentService();
  }

  /**
   * 获取仪表盘的所有组件
   * GET /api/components?dashboardId=
   */
  getByDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const dashboardId = req.query.dashboardId as string;

    if (!dashboardId) {
      response.badRequest(res, 'dashboardId is required');
      return;
    }

    const components = await this.componentService.findByDashboard(dashboardId, userId);
    response.success(res, components, 'Components retrieved successfully');
  });

  /**
   * 获取单个组件
   * GET /api/components/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;

    const component = await this.componentService.findById(id, userId);
    response.success(res, component, 'Component retrieved successfully');
  });

  /**
   * 创建组件
   * POST /api/components?dashboardId=
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const dashboardId = req.query.dashboardId as string;
    const data: CreateComponentRequest = req.body;

    if (!dashboardId) {
      response.badRequest(res, 'dashboardId is required');
      return;
    }

    const component = await this.componentService.create(dashboardId, userId, data);
    response.created(res, component, 'Component created successfully');
  });

  /**
   * 更新组件
   * PUT /api/components/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;
    const data: UpdateComponentRequest = req.body;

    const component = await this.componentService.update(id, userId, data);
    response.updated(res, component, 'Component updated successfully');
  });

  /**
   * 删除组件
   * DELETE /api/components/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;

    await this.componentService.delete(id, userId);
    response.deleted(res, 'Component deleted successfully');
  });

  /**
   * 批量更新组件位置
   * PUT /api/components/batch/positions
   */
  batchUpdatePositions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const dashboardId = req.query.dashboardId as string;
    const updates = req.body as Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;

    if (!dashboardId) {
      response.badRequest(res, 'dashboardId is required');
      return;
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      response.badRequest(res, 'updates array is required');
      return;
    }

    await this.componentService.batchUpdatePositions(dashboardId, userId, updates);
    response.success(res, null, 'Component positions updated successfully');
  });
}

export default ComponentController;
