import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '@/api'
import type {
  Dashboard,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  DashboardFilter,
} from '@/api/types'

export const useDashboardStore = defineStore('dashboard', () => {
  // ============ State ============

  /** 仪表盘列表 */
  const dashboards = ref<Dashboard[]>([])

  /** 当前选中的仪表盘 */
  const currentDashboard = ref<Dashboard | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const error = ref<string | null>(null)

  /** 总数量（用于分页） */
  const total = ref(0)

  // ============ Getters ============

  /** 仪表盘数量 */
  const dashboardCount = computed(() => dashboards.value.length)

  /** 是否有仪表盘 */
  const hasDashboards = computed(() => dashboards.value.length > 0)

  /** 当前仪表盘ID */
  const currentDashboardId = computed(() => currentDashboard.value?.id || '')

  /** 是否正在加载 */
  const isLoading = computed(() => loading.value)

  /** 是否发生错误 */
  const hasError = computed(() => !!error.value)

  /** 已发布的仪表盘 */
  const publishedDashboards = computed(() =>
    dashboards.value.filter(d => d.status === 'published')
  )

  /** 草稿状态的仪表盘 */
  const draftDashboards = computed(() =>
    dashboards.value.filter(d => d.status === 'draft')
  )

  /** 已归档的仪表盘 */
  const archivedDashboards = computed(() =>
    dashboards.value.filter(d => d.status === 'archived')
  )

  // ============ Actions ============

  /**
   * 设置当前仪表盘
   */
  function setCurrentDashboard(dashboard: Dashboard | null) {
    currentDashboard.value = dashboard
  }

  /**
   * 清除错误信息
   */
  function clearError() {
    error.value = null
  }

  /**
   * 获取仪表盘列表
   */
  async function fetchDashboards(filter?: DashboardFilter) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.getDashboards(filter)

      if (response.success && response.data) {
        dashboards.value = response.data.list || []
        total.value = response.data.total || 0
        return true
      } else {
        error.value = response.message || '获取仪表盘列表失败'
        ElMessage.error(error.value || '获取仪表盘列表失败')
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取仪表盘列表失败'
      ElMessage.error(error.value || '获取仪表盘列表失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单个仪表盘
   */
  async function fetchDashboard(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.getDashboard(id)

      if (response.success && response.data) {
        // 后端返回 { dashboard: {...} }，需要取 dashboard 字段
        const dashboard = (response.data as any).dashboard || response.data
        currentDashboard.value = dashboard
        return dashboard
      } else {
        error.value = response.message || '获取仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建仪表盘
   */
  async function createDashboard(data: CreateDashboardRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.createDashboard(data)

      if (response.success && response.data) {
        // 后端返回 { dashboard: {...} }
        const dashboard = (response.data as any).dashboard || response.data
        dashboards.value.unshift(dashboard)
        total.value += 1
        ElMessage.success('仪表盘创建成功')
        return dashboard
      } else {
        error.value = response.message || '创建仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新仪表盘
   */
  async function updateDashboard(id: string, data: UpdateDashboardRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.updateDashboard(id, data)

      if (response.success && response.data) {
        // 后端返回 { dashboard: {...} }
        const dashboard = (response.data as any).dashboard || response.data
        const index = dashboards.value.findIndex(d => d.id === id)
        if (index !== -1) {
          dashboards.value[index] = dashboard
        }
        if (currentDashboard.value?.id === id) {
          currentDashboard.value = dashboard
        }
        ElMessage.success('仪表盘更新成功')
        return dashboard
      } else {
        error.value = response.message || '更新仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除仪表盘
   */
  async function deleteDashboard(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.deleteDashboard(id)

      if (response.success) {
        dashboards.value = dashboards.value.filter(d => d.id !== id)
        total.value = Math.max(0, total.value - 1)
        if (currentDashboard.value?.id === id) {
          currentDashboard.value = null
        }
        ElMessage.success('仪表盘删除成功')
        return true
      } else {
        error.value = response.message || '删除仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return false
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '删除仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 复制仪表盘
   */
  async function duplicateDashboard(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.duplicateDashboard(id)

      if (response.success && response.data) {
        // 后端返回 { dashboard: {...} }
        const dashboard = (response.data as any).dashboard || response.data
        dashboards.value.unshift(dashboard)
        total.value += 1
        ElMessage.success('仪表盘复制成功')
        return dashboard
      } else {
        error.value = response.message || '复制仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '复制仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 发布仪表盘
   */
  async function publishDashboard(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.publishDashboard(id)

      if (response.success && response.data) {
        // 后端返回 { dashboard: {...} }
        const dashboard = (response.data as any).dashboard || response.data
        const index = dashboards.value.findIndex(d => d.id === id)
        if (index !== -1) {
          dashboards.value[index] = dashboard
        }
        if (currentDashboard.value?.id === id) {
          currentDashboard.value = dashboard
        }
        ElMessage.success('仪表盘发布成功')
        return dashboard
      } else {
        error.value = response.message || '发布仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '发布仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 归档仪表盘
   */
  async function archiveDashboard(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await dashboardApi.archiveDashboard(id)

      if (response.success && response.data) {
        // 后端返回 { dashboard: {...} }
        const dashboard = (response.data as any).dashboard || response.data
        const index = dashboards.value.findIndex(d => d.id === id)
        if (index !== -1) {
          dashboards.value[index] = dashboard
        }
        if (currentDashboard.value?.id === id) {
          currentDashboard.value = dashboard
        }
        ElMessage.success('仪表盘归档成功')
        return dashboard
      } else {
        error.value = response.message || '归档仪表盘失败'
        ElMessage.error(error.value || "操作失败")
        return null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '归档仪表盘失败'
      ElMessage.error(error.value || "操作失败")
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    dashboards,
    currentDashboard,
    loading,
    error,
    total,
    // Getters
    dashboardCount,
    hasDashboards,
    currentDashboardId,
    isLoading,
    hasError,
    publishedDashboards,
    draftDashboards,
    archivedDashboards,
    // Actions
    setCurrentDashboard,
    clearError,
    fetchDashboards,
    fetchDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    duplicateDashboard,
    publishDashboard,
    archiveDashboard,
  }
})
