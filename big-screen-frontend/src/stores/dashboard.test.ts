import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'

// Mock the API
vi.mock('@/api', () => ({
  dashboardApi: {
    getDashboards: vi.fn(),
    getDashboard: vi.fn(),
    createDashboard: vi.fn(),
    updateDashboard: vi.fn(),
    deleteDashboard: vi.fn(),
    duplicateDashboard: vi.fn(),
    publishDashboard: vi.fn(),
    archiveDashboard: vi.fn(),
  },
}))

import { dashboardApi } from '@/api'

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty dashboards array', () => {
      const store = useDashboardStore()
      expect(store.dashboards).toEqual([])
      expect(store.currentDashboard).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.total).toBe(0)
    })
  })

  describe('getters', () => {
    it('dashboardCount should return 0 for empty array', () => {
      const store = useDashboardStore()
      expect(store.dashboardCount).toBe(0)
    })

    it('dashboardCount should return correct count', () => {
      const store = useDashboardStore()
      // @ts-ignore - testing getter
      store.dashboards = [
        { id: '1', name: 'Dashboard 1' },
        { id: '2', name: 'Dashboard 2' },
      ]
      expect(store.dashboardCount).toBe(2)
    })

    it('hasDashboards should return false for empty array', () => {
      const store = useDashboardStore()
      expect(store.hasDashboards).toBe(false)
    })

    it('hasDashboards should return true when dashboards exist', () => {
      const store = useDashboardStore()
      // @ts-ignore
      store.dashboards = [{ id: '1', name: 'Test' }]
      expect(store.hasDashboards).toBe(true)
    })

    it('currentDashboardId should return empty string when null', () => {
      const store = useDashboardStore()
      expect(store.currentDashboardId).toBe('')
    })

    it('currentDashboardId should return id when set', () => {
      const store = useDashboardStore()
      // @ts-ignore
      store.currentDashboard = { id: 'dashboard-123', name: 'Test' }
      expect(store.currentDashboardId).toBe('dashboard-123')
    })

    it('isLoading should return loading state', () => {
      const store = useDashboardStore()
      expect(store.isLoading).toBe(false)
      // @ts-ignore
      store.loading = true
      expect(store.isLoading).toBe(true)
    })

    it('hasError should return error state', () => {
      const store = useDashboardStore()
      expect(store.hasError).toBe(false)
      // @ts-ignore
      store.error = 'Some error'
      expect(store.hasError).toBe(true)
    })

    it('publishedDashboards should filter by published status', () => {
      const store = useDashboardStore()
      // @ts-ignore
      store.dashboards = [
        { id: '1', status: 'published' },
        { id: '2', status: 'draft' },
        { id: '3', status: 'published' },
      ]
      expect(store.publishedDashboards).toHaveLength(2)
    })

    it('draftDashboards should filter by draft status', () => {
      const store = useDashboardStore()
      // @ts-ignore
      store.dashboards = [
        { id: '1', status: 'published' },
        { id: '2', status: 'draft' },
        { id: '3', status: 'draft' },
      ]
      expect(store.draftDashboards).toHaveLength(2)
    })

    it('archivedDashboards should filter by archived status', () => {
      const store = useDashboardStore()
      // @ts-ignore
      store.dashboards = [
        { id: '1', status: 'archived' },
        { id: '2', status: 'draft' },
        { id: '3', status: 'archived' },
      ]
      expect(store.archivedDashboards).toHaveLength(2)
    })
  })

  describe('actions', () => {
    describe('setCurrentDashboard', () => {
      it('should set current dashboard', () => {
        const store = useDashboardStore()
        const dashboard = { id: '1', name: 'Test' }
        store.setCurrentDashboard(dashboard as any)
        expect(store.currentDashboard).toEqual(dashboard)
      })

      it('should set to null', () => {
        const store = useDashboardStore()
        store.setCurrentDashboard(null)
        expect(store.currentDashboard).toBeNull()
      })
    })

    describe('clearError', () => {
      it('should clear error', () => {
        const store = useDashboardStore()
        // @ts-ignore
        store.error = 'Some error'
        store.clearError()
        expect(store.error).toBeNull()
      })
    })

    describe('fetchDashboards', () => {
      it('should fetch dashboards successfully', async () => {
        const store = useDashboardStore()
        const mockResponse = {
          success: true,
          data: {
            list: [
              { id: '1', name: 'Dashboard 1' },
              { id: '2', name: 'Dashboard 2' },
            ],
            total: 2,
          },
        }
        vi.mocked(dashboardApi.getDashboards).mockResolvedValue(mockResponse)

        const result = await store.fetchDashboards()

        expect(result).toBe(true)
        expect(store.dashboards).toHaveLength(2)
        expect(store.total).toBe(2)
        expect(store.loading).toBe(false)
      })

      it('should handle fetch failure', async () => {
        const store = useDashboardStore()
        const mockResponse = {
          success: false,
          message: 'Failed to fetch',
        }
        vi.mocked(dashboardApi.getDashboards).mockResolvedValue(mockResponse)

        const result = await store.fetchDashboards()

        expect(result).toBe(false)
        expect(store.error).toBe('Failed to fetch')
      })

      it('should handle exception', async () => {
        const store = useDashboardStore()
        vi.mocked(dashboardApi.getDashboards).mockRejectedValue(new Error('Network error'))

        const result = await store.fetchDashboards()

        expect(result).toBe(false)
        expect(store.error).toBe('获取仪表盘列表失败')
      })
    })

    describe('fetchDashboard', () => {
      it('should fetch single dashboard successfully', async () => {
        const store = useDashboardStore()
        const mockDashboard = { id: '1', name: 'Dashboard 1' }
        const mockResponse = {
          success: true,
          data: { dashboard: mockDashboard },
        }
        vi.mocked(dashboardApi.getDashboard).mockResolvedValue(mockResponse)

        const result = await store.fetchDashboard('1')

        expect(result).toEqual(mockDashboard)
        expect(store.currentDashboard).toEqual(mockDashboard)
      })

      it('should handle fetch failure', async () => {
        const store = useDashboardStore()
        const mockResponse = {
          success: false,
          message: 'Not found',
        }
        vi.mocked(dashboardApi.getDashboard).mockResolvedValue(mockResponse)

        const result = await store.fetchDashboard('1')

        expect(result).toBeNull()
      })
    })

    describe('createDashboard', () => {
      it('should create dashboard successfully', async () => {
        const store = useDashboardStore()
        const newDashboard = { id: '1', name: 'New Dashboard' }
        const mockResponse = {
          success: true,
          data: { dashboard: newDashboard },
        }
        vi.mocked(dashboardApi.createDashboard).mockResolvedValue(mockResponse)

        const result = await store.createDashboard({ name: 'New Dashboard' } as any)

        expect(result).toEqual(newDashboard)
        expect(store.dashboards).toHaveLength(1)
        expect(store.total).toBe(1)
      })

      it('should handle creation failure', async () => {
        const store = useDashboardStore()
        const mockResponse = {
          success: false,
          message: 'Creation failed',
        }
        vi.mocked(dashboardApi.createDashboard).mockResolvedValue(mockResponse)

        const result = await store.createDashboard({ name: 'Test' } as any)

        expect(result).toBeNull()
        expect(store.error).toBe('Creation failed')
      })
    })

    describe('updateDashboard', () => {
      it('should update dashboard successfully', async () => {
        const store = useDashboardStore()
        // @ts-ignore
        store.dashboards = [{ id: '1', name: 'Old Name' }]
        const updatedDashboard = { id: '1', name: 'New Name' }
        const mockResponse = {
          success: true,
          data: { dashboard: updatedDashboard },
        }
        vi.mocked(dashboardApi.updateDashboard).mockResolvedValue(mockResponse)

        const result = await store.updateDashboard('1', { name: 'New Name' } as any)

        expect(result).toEqual(updatedDashboard)
        expect(store.dashboards[0].name).toBe('New Name')
      })
    })

    describe('deleteDashboard', () => {
      it('should delete dashboard successfully', async () => {
        const store = useDashboardStore()
        // @ts-ignore
        store.dashboards = [
          { id: '1', name: 'Dashboard 1' },
          { id: '2', name: 'Dashboard 2' },
        ]
        store.total = 2
        const mockResponse = { success: true }
        vi.mocked(dashboardApi.deleteDashboard).mockResolvedValue(mockResponse)

        const result = await store.deleteDashboard('1')

        expect(result).toBe(true)
        expect(store.dashboards).toHaveLength(1)
        expect(store.dashboards[0].id).toBe('2')
        expect(store.total).toBe(1)
      })

      it('should clear current dashboard if deleted', async () => {
        const store = useDashboardStore()
        // @ts-ignore
        store.dashboards = [{ id: '1', name: 'Dashboard 1' }]
        store.total = 1
        // @ts-ignore
        store.currentDashboard = { id: '1', name: 'Dashboard 1' }
        const mockResponse = { success: true }
        vi.mocked(dashboardApi.deleteDashboard).mockResolvedValue(mockResponse)

        await store.deleteDashboard('1')

        expect(store.currentDashboard).toBeNull()
      })
    })

    describe('duplicateDashboard', () => {
      it('should duplicate dashboard successfully', async () => {
        const store = useDashboardStore()
        const duplicatedDashboard = { id: '2', name: 'Copy of Dashboard 1' }
        const mockResponse = {
          success: true,
          data: { dashboard: duplicatedDashboard },
        }
        vi.mocked(dashboardApi.duplicateDashboard).mockResolvedValue(mockResponse)

        const result = await store.duplicateDashboard('1')

        expect(result).toEqual(duplicatedDashboard)
        expect(store.dashboards).toHaveLength(1)
        expect(store.total).toBe(1)
      })
    })

    describe('publishDashboard', () => {
      it('should publish dashboard successfully', async () => {
        const store = useDashboardStore()
        // @ts-ignore
        store.dashboards = [{ id: '1', name: 'Dashboard', status: 'draft' }]
        const publishedDashboard = { id: '1', name: 'Dashboard', status: 'published' }
        const mockResponse = {
          success: true,
          data: { dashboard: publishedDashboard },
        }
        vi.mocked(dashboardApi.publishDashboard).mockResolvedValue(mockResponse)

        const result = await store.publishDashboard('1')

        expect(result).toEqual(publishedDashboard)
        expect(store.dashboards[0].status).toBe('published')
      })
    })

    describe('archiveDashboard', () => {
      it('should archive dashboard successfully', async () => {
        const store = useDashboardStore()
        // @ts-ignore
        store.dashboards = [{ id: '1', name: 'Dashboard', status: 'published' }]
        const archivedDashboard = { id: '1', name: 'Dashboard', status: 'archived' }
        const mockResponse = {
          success: true,
          data: { dashboard: archivedDashboard },
        }
        vi.mocked(dashboardApi.archiveDashboard).mockResolvedValue(mockResponse)

        const result = await store.archiveDashboard('1')

        expect(result).toEqual(archivedDashboard)
        expect(store.dashboards[0].status).toBe('archived')
      })
    })
  })
})
