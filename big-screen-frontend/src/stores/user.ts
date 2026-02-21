import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api'
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/api/types'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // ============ State ============
  
  /** 当前用户信息 */
  const user = ref<User | null>(null)
  
  /** 访问令牌 */
  const token = ref<string>('')
  
  /** 刷新令牌 */
  const refreshToken = ref<string>('')
  
  /** 加载状态 */
  const loading = ref(false)
  
  // ============ Getters ============
  
  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  
  /** 用户名 */
  const username = computed(() => user.value?.username || '')
  
  /** 用户邮箱 */
  const email = computed(() => user.value?.email || '')
  
  /** 用户头像 */
  const avatar = computed(() => user.value?.avatar || '')
  
  /** 用户角色 */
  const role = computed(() => user.value?.role || 'user')
  
  /** 是否为管理员 */
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  
  // ============ Actions ============
  
  /**
   * 初始化用户状态（从存储中恢复）
   */
  function initUserState() {
    const storedToken = storage.get<string>('accessToken')
    const storedRefreshToken = storage.get<string>('refreshToken')
    const storedUser = storage.get<User>('user')
    
    if (storedToken) {
      token.value = storedToken
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
    if (storedUser) {
      user.value = storedUser
    }
  }
  
  /**
   * 设置用户认证信息
   */
  function setAuthInfo(authData: AuthResponse) {
    user.value = authData.user
    token.value = authData.token
    refreshToken.value = authData.refreshToken
    
    // 持久化存储
    storage.set('accessToken', authData.token)
    storage.set('refreshToken', authData.refreshToken)
    storage.set('user', authData.user)
  }
  
  /**
   * 更新用户信息
   */
  function updateUserInfo(userInfo: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
      storage.set('user', user.value)
    }
  }
  
  /**
   * 更新 Token
   */
  function updateToken(newToken: string, newRefreshToken?: string) {
    token.value = newToken
    storage.set('accessToken', newToken)
    
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      storage.set('refreshToken', newRefreshToken)
    }
  }
  
  /**
   * 用户登录
   */
  async function login(credentials: LoginRequest) {
    loading.value = true
    try {
      const response = await authApi.login(credentials)
      
      if (response.success && response.data) {
        setAuthInfo(response.data)
        ElMessage.success('登录成功')
        return true
      } else {
        ElMessage.error(response.message || '登录失败')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '登录失败，请检查网络连接'
      ElMessage.error(message)
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 用户注册
   */
  async function register(data: RegisterRequest) {
    loading.value = true
    try {
      const response = await authApi.register(data)
      
      if (response.success && response.data) {
        setAuthInfo(response.data)
        ElMessage.success('注册成功')
        return true
      } else {
        ElMessage.error(response.message || '注册失败')
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '注册失败，请检查网络连接'
      ElMessage.error(message)
      return false
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 获取当前用户信息
   */
  async function fetchCurrentUser() {
    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        user.value = response.data
        storage.set('user', response.data)
        return true
      }
      return false
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return false
    }
  }
  
  /**
   * 用户登出
   */
  async function logout() {
    try {
      // 调用登出 API
      await authApi.logout()
    } catch (error) {
      console.error('登出 API 调用失败:', error)
    } finally {
      // 清除本地状态
      user.value = null
      token.value = ''
      refreshToken.value = ''
      
      // 清除存储
      storage.remove('accessToken')
      storage.remove('refreshToken')
      storage.remove('user')
      
      ElMessage.success('已退出登录')
    }
  }
  
  /**
   * 更新用户头像
   */
  async function updateAvatar(file: File) {
    try {
      const response = await authApi.uploadAvatar(file)
      if (response.success && response.data) {
        updateUserInfo({ avatar: response.data.url })
        ElMessage.success('头像更新成功')
        return true
      }
      return false
    } catch (error) {
      ElMessage.error('头像上传失败')
      return false
    }
  }
  
  /**
   * 修改密码
   */
  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      const response = await authApi.changePassword({ oldPassword, newPassword })
      if (response.success) {
        ElMessage.success('密码修改成功')
        return true
      }
      ElMessage.error(response.message || '密码修改失败')
      return false
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '密码修改失败')
      return false
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    loading,
    
    // Getters
    isLoggedIn,
    username,
    email,
    avatar,
    role,
    isAdmin,
    
    // Actions
    initUserState,
    setAuthInfo,
    updateUserInfo,
    updateToken,
    login,
    register,
    fetchCurrentUser,
    logout,
    updateAvatar,
    changePassword,
  }
})