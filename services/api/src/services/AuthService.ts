/**
 * 认证服务
 * 处理用户认证、授权、令牌管理等业务逻辑
 */

import jwt from 'jsonwebtoken';
import { PrismaClient, User, RefreshToken, Prisma } from '@prisma/client';
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  JwtPayload,
  AuthUser,
} from '../types';
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  InternalServerError,
} from '../utils/errors';
import { hashPassword, verifyPassword } from '../utils/security';
import { jwtConfig } from '../config';
import { logger } from '../utils/logger';
import { prisma } from '../utils/database';

/**
 * 认证服务类
 */
export class AuthService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prisma = prismaClient;
  }

  // ============================================
  // 用户注册
  // ============================================

  /**
   * 用户注册
   * @param data 注册请求数据
   */
  async register(data: RegisterRequest): Promise<AuthUser> {
    const { email, username, password, displayName } = data;

    // 检查邮箱是否已存在
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // 检查用户名是否已存在
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 获取默认角色（普通用户）
    const defaultRole = await this.prisma.role.findFirst({
      where: { name: 'user' },
    });

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: displayName || username,
        roleId: defaultRole?.id || null,
        status: 'ACTIVE',
      },
      include: {
        role: true,
      },
    });

    logger.info(`User registered successfully: ${user.email}`, {
      userId: user.id,
      email: user.email,
    });

    return this.buildAuthUser(user);
  }

  // ============================================
  // 用户登录
  // ============================================

  /**
   * 用户登录
   * @param data 登录请求数据
   */
  async login(data: LoginRequest): Promise<{ user: AuthUser; tokens: TokenResponse }> {
    const { email, password } = data;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    // 用户不存在或密码错误（使用相同的时间比较防止时序攻击）
    if (!user) {
      await verifyPassword(password, '$2a$12$dummy.hash.to.prevent.timing.attacks');
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // 检查用户状态
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedError('Account is not activated', 'ACCOUNT_INACTIVE');
    }

    // 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(user);

    logger.info(`User logged in successfully: ${user.email}`, {
      userId: user.id,
      email: user.email,
    });

    return {
      user: this.buildAuthUser(user),
      tokens,
    };
  }

  // ============================================
  // 令牌管理
  // ============================================

  /**
   * 生成访问令牌和刷新令牌
   * @param user 用户对象
   */
  async generateTokens(user: User & { role?: { name: string; permissions: unknown } | null }): Promise<TokenResponse> {
    // 构建权限列表
    const permissions = this.extractPermissions(user);

    // 构建JWT载荷
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId || undefined,
      permissions,
    };

    // 生成访问令牌
    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // 生成刷新令牌
    const refreshToken = await this.createRefreshToken(user.id);

    // 计算过期时间
    const expiresIn = this.parseExpiresIn(jwtConfig.expiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * 刷新访问令牌
   * @param refreshTokenString 刷新令牌字符串
   */
  async refreshAccessToken(refreshTokenString: string): Promise<TokenResponse> {
    // 查找刷新令牌
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    // 令牌不存在
    if (!refreshToken) {
      throw new UnauthorizedError('Invalid refresh token', 'TOKEN_INVALID');
    }

    // 令牌已过期
    if (new Date() > refreshToken.expiresAt) {
      // 删除过期令牌
      await this.prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });

      throw new UnauthorizedError('Refresh token has expired', 'TOKEN_EXPIRED');
    }

    // 检查用户状态
    const user = refreshToken.user;

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account has been suspended', 'ACCOUNT_SUSPENDED');
    }

    // 生成新的令牌对
    const tokens = await this.generateTokens(user);

    // 删除旧的刷新令牌
    await this.prisma.refreshToken.delete({
      where: { id: refreshToken.id },
    });

    logger.info(`Access token refreshed for user: ${user.email}`, {
      userId: user.id,
    });

    return tokens;
  }

  /**
   * 撤销刷新令牌（登出）
   * @param refreshTokenString 刷新令牌字符串
   */
  async revokeRefreshToken(refreshTokenString: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshTokenString },
      });

      logger.info('Refresh token revoked');
    } catch {
      // 令牌不存在或已删除，忽略错误
      logger.debug('Refresh token already revoked or not found');
    }
  }

  // ============================================
  // 辅助方法
  // ============================================

  /**
   * 创建刷新令牌
   * @param userId 用户ID
   */
  private async createRefreshToken(userId: string): Promise<string> {
    const token = require('crypto').randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天过期

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * 从用户对象提取权限
   * @param user 用户对象
   */
  private extractPermissions(
    user: User & { role?: { name: string; permissions: unknown } | null }
  ): string[] {
    if (!user.role || !user.role.permissions) {
      return [];
    }

    try {
      const permissions = user.role.permissions as Array<{
        resource: string;
        actions: string[];
      }>;

      return permissions.flatMap((p) =>
        p.actions.map((action) => `${p.resource}:${action}`)
      );
    } catch {
      return [];
    }
  }

  /**
   * 解析过期时间字符串为秒数
   * @param expiresIn 过期时间字符串（如 "1h", "7d"）
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // 默认1小时
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 3600);
  }

  /**
   * 构建AuthUser对象
   * @param user 数据库用户对象
   */
  private buildAuthUser(
    user: User & { role?: { name: string; permissions: unknown } | null }
  ): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      roleId: user.roleId,
      permissions: this.extractPermissions(user),
      status: user.status,
    };
  }
}

export default AuthService;
