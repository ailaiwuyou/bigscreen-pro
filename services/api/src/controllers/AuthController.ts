/**
 * 认证控制器
 * 处理用户认证相关的HTTP请求
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { LoginRequest, RegisterRequest, AuthenticatedRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import * as response from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 认证控制器类
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * 用户注册
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: RegisterRequest = req.body;
    const user = await this.authService.register(data);
    response.created(res, user, 'User registered successfully');
  });

  /**
   * 用户登录
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: LoginRequest = req.body;
    const result = await this.authService.login(data);
    response.success(res, result, 'Login successful');
  });

  /**
   * 刷新令牌
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      response.badRequest(res, 'Refresh token is required');
      return;
    }

    const tokens = await this.authService.refreshAccessToken(refreshToken);
    response.success(res, tokens, 'Token refreshed successfully');
  });

  /**
   * 用户登出
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    logger.info('User logged out', {
      userId: (req as AuthenticatedRequest).user?.id,
    });

    response.success(res, null, 'Logout successful');
  });

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      response.unauthorized(res, 'User not authenticated');
      return;
    }

    // 重新获取用户信息以获取最新数据
    const freshUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: true,
      },
    });

    if (!freshUser) {
      response.notFound(res, 'User');
      return;
    }

    const authUser = this.buildAuthUser(freshUser);
    response.success(res, authUser, 'User retrieved successfully');
  });

  // Helper method to build AuthUser
  private buildAuthUser(user: any): any {
    let permissions: string[] = [];
    
    if (user.role?.permissions) {
      try {
        const perms = user.role.permissions as Array<{
          resource: string;
          actions: string[];
        }>;
        permissions = perms.flatMap((p) =>
          p.actions.map((action) => `${p.resource}:${action}`)
        );
      } catch {
        // ignore
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
      createdAt: user.createdAt,
    };
  }

  // Access to prisma for the controller
  private get prisma() {
    return prisma;
  }
}

export default AuthController;
