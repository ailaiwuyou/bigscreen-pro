import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils/storage'

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const REQUEST_TIMEOUT = 30000

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求队列（用于处理并发刷新 token）
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

// 订阅刷新 token
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

// 通知所有订阅者新的 token
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 获取 token
    const token = storage.get('accessToken')
    
    // 添加请求日志
    if (import.meta.env.DEV) {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data)
    }
    
    // 设置 Authorization 头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 响应日志
    if (import.meta.env.DEV) {
      console.log(`[Response] ${response.config.url}`, response.data)
    }
    
    // 直接返回数据
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // 网络错误处理
    if (!error.response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }
    
    const { status, data } = error.response as AxiosResponse
    const message = (data as any)?.message || '请求失败'
    
    // 开发环境错误日志
    if (import.meta.env.DEV) {
      console.error(`[Response Error] ${status}:`, data)
    }
    
    // 401 Unauthorized - Token 过期
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 等待刷新 token
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            resolve(request(originalRequest))
          })
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const refreshToken = storage.get('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }
        
        // 调用刷新 token API
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        
        const { token, refreshToken: newRefreshToken } = response.data.data
        
        // 更新存储
        storage.set('accessToken', token)
        storage.set('refreshToken', newRefreshToken)
        
        // 更新 UserStore
        const userStore = useUserStore()
        userStore.token = token
        
        // 通知所有等待的请求
        onTokenRefreshed(token)
        
        // 重试原始请求
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
        }
        return request(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清除登录状态并跳转
        const userStore = useUserStore()
        userStore.logout()
        
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // 403 Forbidden
    if (status === 403) {
      ElMessage.error('没有权限执行此操作')
    }
    // 404 Not Found
    else if (status === 404) {
      ElMessage.error('请求的资源不存在')
    }
    // 500 Server Error
    else if (status >= 500) {
      ElMessage.error('服务器错误，请稍后重试')
    }
    // 其他错误
    else {
      ElMessage.error(message)
    }
    
    return Promise.reject(error)
  }
)

export default request