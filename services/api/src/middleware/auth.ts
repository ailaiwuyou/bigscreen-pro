/**
 * 认证中间件
 * 处理JWT认证和权限检查
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthUser, JwtPayload } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { jwtConfig } from '../config';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';

/**
 * 从请求头中提取JWT令牌
 * @param req Express请求对象
 * @returns JWT令牌或null
 */
export const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};

/**
 * 从请求中提取令牌（支持Cookie和Header）
 * @param req Express请求对象
 * @returns JWT令牌或null
 */
export const extractToken = (req: Request): string | null => {
  // 先从Header中提取
  let token = extractTokenFromHeader(req);

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  return token;
};

/**
 * 验证JWT令牌
 * @param token JWT令牌
 * @returns 解码后的载荷
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, jwtConfig.secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token', 'TOKEN_INVALID');
    }
    throw new UnauthorizedError('Token verification failed');
  }
};

/**
 * 从数据库加载用户权限
 * @param userId 用户ID
 * @returns 权限列表
 */
export const loadUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user || !user.role) {
      return [];
    }

    const permissions = user.role.permissions as Array<{ resource: string; actions: string[] }>;
    return permissions.flatMap((p) =>
      p.actions.map((action) => `${p.resource}:${action}`)
    );
  } catch (error) {
    logger.error('Failed to load user permissions', { userId, error });
    return [];
  }
};

/**
 * 构建AuthUser对象
 * @param payload JWT载荷
 * @returns AuthUser对象
 */
export const buildAuthUser = async (payload: JwtPayload): Promise<AuthUser> => {
  // 如果JWT中没有权限，从数据库加载
  let permissions = payload.permissions || [];
  if (permissions.length === 0 && payload.userId) {
    permissions = await loadUserPermissions(payload.userId);
  }

  return {
    id: payload.userId,
    email: payload.email,
    username: payload.username,
    roleId: payload.roleId || null,
    permissions,
    status: 'ACTIVE',
  };
};

// ============================================
// Express中间件
// ============================================

/**
 * 认证中间件
 * 验证JWT令牌并将用户信息附加到请求对象
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 提取令牌
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHORIZED');
    }

    // 验证令牌
    const payload = verifyToken(token);

    // 构建AuthUser
    const authUser = await buildAuthUser(payload);

    // 检查用户状态
    if (authUser.status === 'SUSPENDED') {
      throw new ForbiddenError('Account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    if (authUser.status === 'INACTIVE') {
      throw new ForbiddenError('Account is not activated', 'ACCOUNT_INACTIVE');
    }

    // 附加用户信息到请求对象
    (req as AuthenticatedRequest).user = authUser;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 可选认证中间件
 * 如果存在令牌则验证，不存在也允许通过
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyToken(token);
      const authUser = await buildAuthUser(payload);
      (req as AuthenticatedRequest).user = authUser;
    }

    next();
  } catch (error) {
    // 可选认证失败不阻止请求
    logger.debug('Optional auth failed', { error });
    next();
  }
};

/**
 * 权限检查中间件
 * 检查用户是否具有指定权限
 * @param permissions 需要的权限列表
 */
export const requirePermissions = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      // 检查是否具有任意一个权限
      const hasPermission = permissions.some((permission) =>
        user.permissions.includes(permission)
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Insufficient permissions. Required: ${permissions.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 角色检查中间件
 * 检查用户是否具有指定角色
 * @param roles 需要的角色列表
 */
export const requireRoles = (...roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;

      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!user.roleId) {
        throw new ForbiddenError('User has no role assigned');
      }

      // 从数据库加载用户角色
      const userWithRole = await prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });

      if (!userWithRole?.role) {
        throw new ForbiddenError('Role not found');
      }

      // 检查角色
      const hasRole = roles.includes(userWithRole.role.name);

      if (!hasRole) {
        throw new ForbiddenError(
          `Insufficient role. Required one of: ${roles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// 导出默认对象
export default {
  authenticate,
  optionalAuth,
  requirePermissions,
  requireRoles,
  extractToken,
  extractTokenFromHeader,
  verifyToken,
  buildAuthUser,
  loadUserPermissions,
};

// 导入prisma用于角色检查中间件
import { prisma } from '../utils/database';
