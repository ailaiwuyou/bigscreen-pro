/**
 * 权限验证中间件
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { permissionService } from './permission.js'
import { ResourceType, PermissionAction } from './types.js'

// 扩展 Request 类型
interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

/**
 * 权限验证中间件工厂
 */
export function requirePermission(
  resource: ResourceType, 
  action: PermissionAction
) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权'
      })
    }
    
    const decision = permissionService.checkAccess(userId, resource, action)
    
    if (!decision.allowed) {
      return res.status(403).json({
        success: false,
        message: decision.reason || '权限不足'
      })
    }
    
    next()
  }
}

/**
 * 验证管理员角色
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: '未授权'
    })
  }
  
  if (!permissionService.isAdmin(userId)) {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    })
  }
  
  next()
}

/**
 * 验证编辑角色及以上
 */
export function requireEditor(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: '未授权'
    })
  }
  
  const role = permissionService.getUserRole(userId)
  
  if (role !== 'admin' && role !== 'editor') {
    return res.status(403).json({
      success: false,
      message: '需要编辑权限'
    })
  }
  
  next()
}

/**
 * 可选认证 - 不强制但如果存在 token 则验证
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'bigscreen-secret-key'
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    } catch (error) {
      // Token 无效，忽略
      console.warn('[Auth] Token 验证失败')
    }
  }
  
  next()
}

export default {
  requirePermission,
  requireAdmin,
  requireEditor,
  optionalAuth
}
