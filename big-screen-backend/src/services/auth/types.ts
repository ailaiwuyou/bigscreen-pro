/**
 * 权限系统类型定义
 */

// 角色类型
export type Role = 'admin' | 'editor' | 'viewer'

// 权限操作
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage'

// 资源类型
export type ResourceType = 
  | 'dashboard' 
  | 'datasource' 
  | 'alert' 
  | 'user' 
  | 'team' 
  | 'settings'

// 权限定义
export interface Permission {
  resource: ResourceType
  actions: PermissionAction[]
}

// 角色权限配置
export interface RolePermissions {
  role: Role
  permissions: Permission[]
  description: string
}

// 用户权限
export interface UserPermissions {
  userId: string
  role: Role
  permissions: Permission[]
  teamIds?: string[]
}

// 资源权限
export interface ResourcePermission {
  resourceType: ResourceType
  resourceId: string
  allowedUsers: string[]
  allowedRoles: Role[]
  deniedUsers: string[]
  deniedRoles: Role[]
}

// 访问控制决策
export interface AccessDecision {
  allowed: boolean
  reason?: string
}

// 角色权限预设
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'admin',
    description: '管理员 - 拥有所有权限',
    permissions: [
      { resource: 'dashboard', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'datasource', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'alert', actions: ['create', 'read', 'update', 'delete', 'manage', 'execute'] },
      { resource: 'user', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'team', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'settings', actions: ['read', 'update', 'manage'] }
    ]
  },
  {
    role: 'editor',
    description: '编辑者 - 可以创建和编辑资源',
    permissions: [
      { resource: 'dashboard', actions: ['create', 'read', 'update'] },
      { resource: 'datasource', actions: ['create', 'read', 'update'] },
      { resource: 'alert', actions: ['create', 'read', 'update'] },
      { resource: 'user', actions: ['read'] },
      { resource: 'team', actions: ['read'] },
      { resource: 'settings', actions: ['read'] }
    ]
  },
  {
    role: 'viewer',
    description: '查看者 - 只读访问',
    permissions: [
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'datasource', actions: ['read'] },
      { resource: 'alert', actions: ['read'] },
      { resource: 'user', actions: ['read'] },
      { resource: 'team', actions: ['read'] },
      { resource: 'settings', actions: ['read'] }
    ]
  }
]
