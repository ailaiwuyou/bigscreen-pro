/**
 * 权限服务
 * 
 * 功能：
 * - 角色权限管理
 * - 资源访问控制
 * - 权限验证
 */

import { 
  Role, 
  PermissionAction, 
  ResourceType, 
  Permission, 
  UserPermissions, 
  ResourcePermission,
  AccessDecision,
  ROLE_PERMISSIONS 
} from './types.js'

export class PermissionService {
  // 用户权限缓存
  private userPermissions: Map<string, UserPermissions> = new Map()
  
  // 资源权限配置
  private resourcePermissions: Map<string, ResourcePermission> = new Map()
  
  /**
   * 获取用户权限
   */
  getUserPermissions(userId: string): UserPermissions | undefined {
    return this.userPermissions.get(userId)
  }
  
  /**
   * 设置用户权限
   */
  setUserPermissions(permissions: UserPermissions): void {
    this.userPermissions.set(permissions.userId, permissions)
  }
  
  /**
   * 移除用户权限
   */
  removeUserPermissions(userId: string): void {
    this.userPermissions.delete(userId)
  }
  
  /**
   * 获取用户角色
   */
  getUserRole(userId: string): Role | undefined {
    const permissions = this.userPermissions.get(userId)
    return permissions?.role
  }
  
  /**
   * 检查用户是否有权限
   */
  hasPermission(
    userId: string, 
    resource: ResourceType, 
    action: PermissionAction
  ): boolean {
    const decision = this.checkAccess(userId, resource, action)
    return decision.allowed
  }
  
  /**
   * 检查访问权限
   */
  checkAccess(
    userId: string, 
    resource: ResourceType, 
    action: PermissionAction
  ): AccessDecision {
    // 获取用户权限
    const userPerms = this.userPermissions.get(userId)
    
    if (!userPerms) {
      return { allowed: false, reason: '用户权限未配置' }
    }
    
    // 获取角色权限
    const rolePerms = ROLE_PERMISSIONS.find(r => r.role === userPerms.role)
    
    if (!rolePerms) {
      return { allowed: false, reason: '角色权限未定义' }
    }
    
    // 检查角色权限
    const hasRolePermission = rolePerms.permissions.some(
      p => p.resource === resource && p.actions.includes(action)
    )
    
    if (!hasRolePermission) {
      return { allowed: false, reason: `角色 ${userPerms.role} 缺少权限 ${resource}:${action}` }
    }
    
    // 检查资源级别权限
    const resourceKey = `${resource}`
    const resourcePerm = this.resourcePermissions.get(resourceKey)
    
    if (resourcePerm) {
      // 检查是否在拒绝列表中
      if (resourcePerm.deniedUsers.includes(userId)) {
        return { allowed: false, reason: '用户已被拒绝访问' }
      }
      
      if (resourcePerm.deniedRoles.includes(userPerms.role)) {
        return { allowed: false, reason: '角色已被拒绝访问' }
      }
      
      // 检查是否在允许列表中（非空时）
      if (resourcePerm.allowedUsers.length > 0 && !resourcePerm.allowedUsers.includes(userId)) {
        return { allowed: false, reason: '用户不在允许列表中' }
      }
      
      if (resourcePerm.allowedRoles.length > 0 && !resourcePerm.allowedRoles.includes(userPerms.role)) {
        return { allowed: false, reason: '角色不在允许列表中' }
      }
    }
    
    return { allowed: true }
  }
  
  /**
   * 设置资源权限
   */
  setResourcePermission(permission: ResourcePermission): void {
    const key = `${permission.resourceType}:${permission.resourceId}`
    this.resourcePermissions.set(key, permission)
  }
  
  /**
   * 获取资源权限
   */
  getResourcePermission(resourceType: ResourceType, resourceId: string): ResourcePermission | undefined {
    const key = `${resourceType}:${resourceId}`
    return this.resourcePermissions.get(key)
  }
  
  /**
   * 删除资源权限
   */
  removeResourcePermission(resourceType: ResourceType, resourceId: string): void {
    const key = `${resourceType}:${resourceId}`
    this.resourcePermissions.delete(key)
  }
  
  /**
   * 获取角色权限定义
   */
  getRolePermissions(role: Role): Permission[] {
    const rolePerms = ROLE_PERMISSIONS.find(r => r.role === role)
    return rolePerms?.permissions || []
  }
  
  /**
   * 获取所有可用角色
   */
  getAllRoles(): { role: Role; description: string }[] {
    return ROLE_PERMISSIONS.map(r => ({
      role: r.role,
      description: r.description
    }))
  }
  
  /**
   * 检查用户是否为管理员
   */
  isAdmin(userId: string): boolean {
    return this.getUserRole(userId) === 'admin'
  }
  
  /**
   * 检查用户是否可以管理用户
   */
  canManageUsers(userId: string): boolean {
    return this.hasPermission(userId, 'user', 'manage')
  }
  
  /**
   * 检查用户是否可以管理告警
   */
  canManageAlerts(userId: string): boolean {
    return this.hasPermission(userId, 'alert', 'manage')
  }
  
  /**
   * 检查用户是否可以管理数据源
   */
  canManageDataSources(userId: string): boolean {
    return this.hasPermission(userId, 'datasource', 'manage')
  }
}

// 导出单例
export const permissionService = new PermissionService()

export default PermissionService
