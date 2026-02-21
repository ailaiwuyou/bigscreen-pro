// 用户相关类型定义

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export type UserRole = 'ADMIN' | 'USER' | 'GUEST'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    expiresIn: number
  }
}

export interface UpdateProfileData {
  username?: string
  avatar?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserListResponse {
  success: boolean
  message: string
  data?: {
    list: User[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}