/**
 * 仪表盘控制器
 * 处理仪表盘相关的HTTP请求
 */

import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService';
import { AuthenticatedRequest, CreateDashboardRequest, UpdateDashboardRequest, PaginationParams } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import * as response from '../utils/response';

/**
 * 仪表盘控制器类
 */
export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  /**
   * 获取仪表盘列表
   * GET /api/dashboards
   */
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user!.id;
    
    const params: PaginationParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const filters = {
      status: req.query.status as any,
      isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : undefined,
      search: req.query.search as string,
    };

    const result = await this.dashboardService.findAll(userId, params, filters);

    response.paginated(
      res,
      result.dashboards,
      result.page,
      result.pageSize,
      result.total,
      'Dashboards retrieved successfully'
    );
  });

  /**
   * 获取单个仪表盘
   * GET /api/dashboards/:id
   */
  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;
    const includeComponents = req.query.includeComponents === 'true';

    const dashboard = await this.dashboardService.findById(id, userId, includeComponents);

    response.success(res, dashboard, 'Dashboard retrieved successfully');
  });

  /**
   * 创建仪表盘
   * POST /api/dashboards
   */
  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user!.id;
    const data: CreateDashboardRequest = req.body;

    const dashboard = await this.dashboardService.create(userId, data);

    response.created(res, dashboard, 'Dashboard created successfully');
  });

  /**
   * 更新仪表盘
   * PUT /api/dashboards/:id
   */
  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;
    const data: UpdateDashboardRequest = req.body;

    const dashboard = await this.dashboardService.update(id, userId, data);

    response.updated(res, dashboard, 'Dashboard updated successfully');
  });

  /**
   * 删除仪表盘
   * DELETE /api/dashboards/:id
   */
  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;

    await this.dashboardService.delete(id, userId);

    response.deleted(res, 'Dashboard deleted successfully');
  });

  /**
   * 发布仪表盘
   * POST /api/dashboards/:id/publish
   */
  publish = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;

    const dashboard = await this.dashboardService.update(id, userId, {
      status: 'PUBLISHED',
    });

    response.success(res, dashboard, 'Dashboard published successfully');
  });

  /**
   * 取消发布仪表盘
   * POST /api/dashboards/:id/unpublish
   */
  unpublish = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user!.id;

    const dashboard = await this.dashboardService.update(id, userId, {
      status: 'DRAFT',
    });

    response.success(res, dashboard, 'Dashboard unpublished successfully');
  });
}

export default DashboardController;
