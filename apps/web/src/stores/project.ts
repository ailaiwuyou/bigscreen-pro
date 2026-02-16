/**
 * 项目状态管理
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { 
  Project, 
  Page, 
  ComponentInstance, 
  UUID,
  CanvasState 
} from '@bigscreen/types'
import { generateUUID } from '@bigscreen/utils'

export interface ProjectState {
  /** 当前项目 */
  currentProject: Project | null
  /** 当前页面 */
  currentPage: Page | null
  /** 画布状态 */
  canvasState: CanvasState | null
  /** 是否已保存 */
  isSaved: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
}

export const useProjectStore = defineStore('project', () => {
  // ============ State ============
  const currentProject = ref<Project | null>(null)
  const currentPage = ref<Page | null>(null)
  const canvasState = ref<CanvasState | null>(null)
  const isSaved = ref(true)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============ Getters ============
  const hasProject = computed(() => currentProject.value !== null)
  const hasPage = computed(() => currentPage.value !== null)
  
  const projectName = computed(() => currentProject.value?.name ?? '未命名项目')
  const pageName = computed(() => currentPage.value?.name ?? '未命名页面')
  
  const componentCount = computed(() => {
    return currentPage.value?.components.size ?? 0
  })
  
  const selectedComponentIds = computed(() => {
    return canvasState.value?.selectedIds ?? []
  })
  
  const hasSelection = computed(() => selectedComponentIds.value.length > 0)

  // ============ Actions ============
  
  /**
   * 创建新项目
   */
  async function createProject(name: string, options?: Partial<Project>): Promise<Project> {
    isLoading.value = true
    error.value = null
    
    try {
      const now = Date.now()
      const project: Project = {
        id: generateUUID(),
        name,
        description: '',
        status: 'draft',
        pages: [],
        currentPageId: null,
        assets: [],
        dataSources: [],
        variables: [],
        config: {
          defaultCanvasSize: { width: 1920, height: 1080 },
          autoSaveInterval: 30000,
          versionControl: true,
          theme: 'light',
          language: 'zh-CN',
        },
        creatorId: 'current-user',
        createdAt: now,
        updatedAt: now,
        ...options,
      }
      
      currentProject.value = project
      isSaved.value = true
      
      // 自动创建第一个页面
      await createPage('页面1')
      
      return project
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建项目失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载项目
   */
  async function loadProject(projectId: string): Promise<Project> {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: 从API加载项目
      // const response = await api.getProject(projectId)
      // currentProject.value = response.data
      
      // 临时：创建示例项目
      const project = await createProject('示例项目', { id: projectId })
      return project
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载项目失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存项目
   */
  async function saveProject(): Promise<void> {
    if (!currentProject.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: 调用API保存项目
      // await api.saveProject(currentProject.value)
      
      currentProject.value.updatedAt = Date.now()
      isSaved.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存项目失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建新页面
   */
  async function createPage(name: string, options?: Partial<Page>): Promise<Page> {
    if (!currentProject.value) {
      throw new Error('没有活动的项目')
    }
    
    const now = Date.now()
    const page: Page = {
      id: generateUUID(),
      name,
      title: name,
      description: '',
      size: currentProject.value.config.defaultCanvasSize,
      background: {
        type: 'color',
        color: '#ffffff',
      },
      grid: {
        visible: true,
        size: 10,
        color: '#e0e0e0',
        snap: true,
      },
      guide: {
        visible: true,
        color: '#1890ff',
        threshold: 5,
      },
      rootComponentIds: [],
      components: new Map(),
      globalState: {},
      globalStyle: {},
      scripts: '',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      ...options,
    }
    
    currentProject.value.pages.push(page)
    currentProject.value.currentPageId = page.id
    currentPage.value = page
    isSaved.value = false
    
    return page
  }

  /**
   * 切换页面
   */
  function switchPage(pageId: string): void {
    if (!currentProject.value) return
    
    const page = currentProject.value.pages.find(p => p.id === pageId)
    if (page) {
      currentProject.value.currentPageId = pageId
      currentPage.value = page
    }
  }

  /**
   * 删除页面
   */
  function deletePage(pageId: string): void {
    if (!currentProject.value) return
    
    const index = currentProject.value.pages.findIndex(p => p.id === pageId)
    if (index > -1) {
      currentProject.value.pages.splice(index, 1)
      
      // 如果删除的是当前页面，切换到第一个页面
      if (currentProject.value.currentPageId === pageId) {
        const firstPage = currentProject.value.pages[0]
        if (firstPage) {
          currentProject.value.currentPageId = firstPage.id
          currentPage.value = firstPage
        } else {
          currentProject.value.currentPageId = null
          currentPage.value = null
        }
      }
      
      isSaved.value = false
    }
  }

  /**
   * 更新画布状态
   */
  function updateCanvasState(state: Partial<CanvasState>): void {
    if (canvasState.value) {
      canvasState.value = { ...canvasState.value, ...state }
    } else {
      canvasState.value = state as CanvasState
    }
  }

  /**
   * 设置未保存状态
   */
  function markUnsaved(): void {
    isSaved.value = false
  }

  /**
   * 清空当前项目
   */
  function clearProject(): void {
    currentProject.value = null
    currentPage.value = null
    canvasState.value = null
    isSaved.value = true
    error.value = null
  }

  return {
    // State
    currentProject,
    currentPage,
    canvasState,
    isSaved,
    isLoading,
    error,
    
    // Getters
    hasProject,
    hasPage,
    projectName,
    pageName,
    componentCount,
    selectedComponentIds,
    hasSelection,
    
    // Actions
    createProject,
    loadProject,
    saveProject,
    createPage,
    switchPage,
    deletePage,
    updateCanvasState,
    markUnsaved,
    clearProject,
  }
})
