import request from './request'
import type {
  ApiResponse,
  Dashboard,
  DashboardListResponse,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  DashboardFilter,
  DashboardStats,
  DashboardCharts,
  RealtimeData,
  ActivityLog,
  Notification,
  PaginatedResponse,
} from './types'

/**
 * 仪表盘管理 API
 */
export const dashboardApi = {
  /**
   * 获取仪表盘列表
   * @param filter 筛选条件
   */
  getDashboards(filter?: DashboardFilter): Promise<ApiResponse<DashboardListResponse>> {
    return request({
      url: '/dashboards',
      method: 'GET',
      params: filter,
    })
  },

  /**
   * 获取单个仪表盘
   * @param id 仪表盘ID
   */
  getDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return request({
      url: `/dashboards/${id}`,
      method: 'GET',
    })
  },

  /**
   * 创建仪表盘
   * @param data 仪表盘数据
   */
  createDashboard(data: CreateDashboardRequest): Promise<ApiResponse<Dashboard>> {
    return request({
      url: '/dashboards',
      method: 'POST',
      data,
    })
  },

  /**
   * 更新仪表盘
   * @param id 仪表盘ID
   * @param data 更新数据
   */
  updateDashboard(id: string, data: UpdateDashboardRequest): Promise<ApiResponse<Dashboard>> {
    return request({
      url: `/dashboards/${id}`,
      method: 'PUT',
      data,
    })
  },

  /**
   * 删除仪表盘
   * @param id 仪表盘ID
   */
  deleteDashboard(id: string): Promise<ApiResponse<void>> {
    return request({
      url: `/dashboards/${id}`,
      method: 'DELETE',
    })
  },

  /**
   * 复制仪表盘
   * @param id 仪表盘ID
   */
  duplicateDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return request({
      url: `/dashboards/${id}/duplicate`,
      method: 'POST',
    })
  },

  /**
   * 发布仪表盘
   * @param id 仪表盘ID
   */
  publishDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return request({
      url: `/dashboards/${id}/publish`,
      method: 'POST',
    })
  },

  /**
   * 归档仪表盘
   * @param id 仪表盘ID
   */
  archiveDashboard(id: string): Promise<ApiResponse<Dashboard>> {
    return request({
      url: `/dashboards/${id}/archive`,
      method: 'POST',
    })
  },

  // ============ 统计数据相关 ============

  /**
   * 获取仪表盘统计数据
   */
  getStats(): Promise<ApiResponse<DashboardStats>> {
    return request({
      url: '/dashboard/stats',
      method: 'GET',
    })
  },

  /**
   * 获取仪表盘图表数据
   */
  getCharts(): Promise<ApiResponse<DashboardCharts>> {
    return request({
      url: '/dashboard/charts',
      method: 'GET',
    })
  },

  /**
   * 获取实时数据
   */
  getRealtimeData(): Promise<ApiResponse<RealtimeData>> {
    return request({
      url: '/dashboard/realtime',
      method: 'GET',
    })
  },

  // ============ 活动日志相关 ============

  /**
   * 获取活动日志
   * @param page 页码
   * @param pageSize 每页数量
   */
  getActivityLogs(page = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<ActivityLog>>> {
    return request({
      url: '/dashboard/activity-logs',
      method: 'GET',
      params: { page, pageSize },
    })
  },

  // ============ 通知相关 ============

  /**
   * 获取通知列表
   * @param page 页码
   * @param pageSize 每页数量
   */
  getNotifications(page = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    return request({
      url: '/dashboard/notifications',
      method: 'GET',
      params: { page, pageSize },
    })
  },

  /**
   * 标记通知为已读
   * @param id 通知ID
   */
  markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    return request({
      url: `/dashboard/notifications/${id}/read`,
      method: 'PUT',
    })
  },

  /**
   * 标记所有通知为已读
   */
  markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return request({
      url: '/dashboard/notifications/read-all',
      method: 'PUT',
    })
  },

  /**
   * 删除通知
   * @param id 通知ID
   */
  deleteNotification(id: string): Promise<ApiResponse<void>> {
    return request({
      url: `/dashboard/notifications/${id}`,
      method: 'DELETE',
    })
  },

  /**
   * 获取未读通知数量
   */
  getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {
    return request({
      url: '/dashboard/notifications/unread-count',
      method: 'GET',
    })
  },
}

export default dashboardApi