import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

export interface DataSourceConfig {
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  url?: string
  apiKey?: string
}

export interface DataSource {
  id: string
  name: string
  type: 'MYSQL' | 'POSTGRESQL' | 'MONGODB' | 'REST_API' | 'GRAPHQL'
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'PENDING_CLAIM'
  config: DataSourceConfig
  ownerId: string
  createdAt: string
  updatedAt: string
  lastTestedAt?: string
}

export interface DataSourceListResponse {
  list: DataSource[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const useDataSourceStore = defineStore('dataSource', () => {
  // State
  const dataSources = ref<DataSource[]>([])
  const currentDataSource = ref<DataSource | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)

  // Getters
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  // Actions
  const fetchDataSources = async (options?: {
    type?: string
    status?: string
    page?: number
    pageSize?: number
  }) => {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (options?.type) params.append('type', options.type)
      if (options?.status) params.append('status', options.status)
      if (options?.page) params.append('page', String(options.page))
      if (options?.pageSize) params.append('pageSize', String(options.pageSize))

      const response = await axios.get(`${API_BASE}/api/datasources?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = response.data as { success: boolean; data: DataSourceListResponse }
      if (data.success) {
        dataSources.value = data.data.list
        total.value = data.data.total
        page.value = data.data.page
        pageSize.value = data.data.pageSize
      }
      return dataSources.value
    } catch (error) {
      console.error('获取数据源列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchDataSourceById = async (id: string) => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE}/api/datasources/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = response.data as { success: boolean; data: DataSource }
      if (data.success) {
        currentDataSource.value = data.data
      }
      return currentDataSource.value
    } catch (error) {
      console.error('获取数据源详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createDataSource = async (dataSource: {
    name: string
    type: DataSource['type']
    config: DataSourceConfig
  }) => {
    loading.value = true
    try {
      const response = await axios.post(
        `${API_BASE}/api/datasources`,
        dataSource,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = response.data as { success: boolean; data: DataSource }
      if (data.success) {
        dataSources.value.unshift(data.data)
        total.value++
      }
      return data.data
    } catch (error) {
      console.error('创建数据源失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateDataSource = async (id: string, updates: {
    name?: string
    config?: DataSourceConfig
    status?: DataSource['status']
  }) => {
    loading.value = true
    try {
      const response = await axios.put(
        `${API_BASE}/api/datasources/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = response.data as { success: boolean; data: DataSource }
      if (data.success) {
        const index = dataSources.value.findIndex(ds => ds.id === id)
        if (index !== -1) {
          dataSources.value[index] = data.data
        }
        if (currentDataSource.value?.id === id) {
          currentDataSource.value = data.data
        }
      }
      return data.data
    } catch (error) {
      console.error('更新数据源失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteDataSource = async (id: string) => {
    loading.value = true
    try {
      const response = await axios.delete(`${API_BASE}/api/datasources/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = response.data as { success: boolean }
      if (data.success) {
        dataSources.value = dataSources.value.filter(ds => ds.id !== id)
        total.value--
        if (currentDataSource.value?.id === id) {
          currentDataSource.value = null
        }
      }
      return true
    } catch (error) {
      console.error('删除数据源失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const testConnection = async (id: string) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/datasources/${id}/test`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = response.data as { success: boolean; message: string; data?: { latency: number } }
      return {
        success: data.success,
        message: data.message,
        latency: data.data?.latency
      }
    } catch (error) {
      console.error('测试连接失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : '测试连接失败'
      }
    }
  }

  const executeQuery = async (id: string, query: string, params?: unknown[]) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/datasources/${id}/query`,
        { query, params },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = response.data as { success: boolean; data: unknown }
      return data.data
    } catch (error) {
      console.error('执行查询失败:', error)
      throw error
    }
  }

  return {
    // State
    dataSources,
    currentDataSource,
    loading,
    total,
    page,
    pageSize,
    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,
    // Actions
    fetchDataSources,
    fetchDataSourceById,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testConnection,
    executeQuery
  }
})
