import request from './request'
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  RefreshTokenRequest,
} from './types'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   * @param data 登录信息
   */
  login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return request({
      url: '/auth/login',
      method: 'POST',
      data,
    })
  },

  /**
   * 用户注册
   * @param data 注册信息
   */
  register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return request({
      url: '/auth/register',
      method: 'POST',
      data,
    })
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<ApiResponse<User>> {
    return request({
      url: '/auth/me',
      method: 'GET',
    })
  },

  /**
   * 刷新访问令牌
   * @param data 刷新令牌请求
   */
  refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return request({
      url: '/auth/refresh',
      method: 'POST',
      data,
    })
  },

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse<void>> {
    return request({
      url: '/auth/logout',
      method: 'POST',
    })
  },

  /**
   * 修改密码
   * @param data 密码信息
   */
  changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return request({
      url: '/auth/change-password',
      method: 'POST',
      data,
    })
  },

  /**
   * 更新用户信息
   * @param data 用户信息
   */
  updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return request({
      url: '/auth/profile',
      method: 'PUT',
      data,
    })
  },

  /**
   * 上传头像
   * @param file 头像文件
   */
  uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)
    return request({
      url: '/auth/avatar',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default authApi