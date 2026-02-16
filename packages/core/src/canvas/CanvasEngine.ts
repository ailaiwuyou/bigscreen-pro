/"use client"

/**
 * CanvasEngine - 画布引擎
 * 
 * 核心画布管理器，负责：
 * - 画布渲染和变换
 * - 视口管理（缩放、平移、旋转）
 * - 事件处理（鼠标、触摸、键盘）
 * - 组件选择和管理
 */

import { ref, computed, watch, type Ref } from 'vue'
import type {
  UUID,
  Point,
  Size,
  Rect,
  ComponentInstance,
  CanvasState,
  CanvasMode,
  GridConfig,
  GuideConfig,
} from '@bigscreen/types'
import { generateUUID, debounce, throttle } from '@bigscreen/utils'
import type { 
  CanvasEngineOptions, 
  CanvasViewport,
  CanvasEngineEvents 
} from '../types'
import { ViewportManager } from './ViewportManager'
import { RenderManager } from './RenderManager'
import { EventManager } from './EventManager'

/**
 * 画布引擎类
 */
export class CanvasEngine {
  // ============ 配置和状态 ============
  private options: Required<CanvasEngineOptions>
  private container: HTMLElement
  private canvasElement: HTMLDivElement
  
  // ============ 管理器实例 ============
  private viewportManager: ViewportManager
  private renderManager: RenderManager
  private eventManager: EventManager
  
  // ============ Vue响应式状态 ============
  /** 画布状态 */
  public state: Ref<CanvasState>
  
  /** 视口信息 */
  public viewport: Ref<CanvasViewport>
  
  /** 组件实例映射 */
  public components: Ref<Map<UUID, ComponentInstance>>
  
  /** 选中组件ID列表 */
  public selectedIds: Ref<UUID[]>
  
  /** 当前激活组件ID */
  public activeId: Ref<UUID | null>
  
  /** 是否正在拖拽 */
  public isDragging: Ref<boolean>
  
  /** 是否正在框选 */
  public isBoxSelecting: Ref<boolean>
  
  /** 框选区域 */
  public boxSelectRect: Ref<Rect | null>
  
  // ============ 计算属性 ============
  /** 当前缩放比例 */
  public scale = computed(() => this.viewport.value.scale)
  
  /** 当前偏移量 */
  public offset = computed(() => ({ 
    x: this.viewport.value.x, 
    y: this.viewport.value.y 
  }))
  
  /** 选中组件列表 */
  public selectedComponents = computed(() => {
    return this.selectedIds.value
      .map(id => this.components.value.get(id))
      .filter((c): c is ComponentInstance => c !== undefined)
  })
  
  /** 当前激活组件 */
  public activeComponent = computed(() => {
    if (!this.activeId.value) return null
    return this.components.value.get(this.activeId.value) || null
  })
  
  /** 是否可以撤销 */
  public canUndo = computed(() => false) // TODO: 集成历史记录
  
  /** 是否可以重做 */
  public canRedo = computed(() => false) // TODO: 集成历史记录

  // ============ 事件监听器 ============
  private eventListeners: Map<keyof CanvasEngineEvents, Set<Function>> = new Map()

  /**
   * 创建画布引擎实例
   * @param options - 引擎配置选项
   */
  constructor(options: CanvasEngineOptions) {
    // 保存配置
    this.options = {
      container: options.container,
      width: options.width,
      height: options.height,
      initialScale: options.initialScale ?? 1,
      minScale: options.minScale ?? 0.1,
      maxScale: options.maxScale ?? 5,
      grid: options.grid ?? { visible: true, size: 10, color: '#e0e0e0', snap: true },
      guide: options.guide ?? { visible: true, color: '#1890ff', threshold: 5 },
      multiSelect: options.multiSelect ?? true,
      keyboardShortcuts: options.keyboardShortcuts ?? true,
      theme: options.theme ?? 'light',
    }

    this.container = options.container

    // 初始化Vue响应式状态
    this.state = ref<CanvasState>({
      mode: 'select' as CanvasMode,
      scale: this.options.initialScale,
      offset: { x: 0, y: 0 },
      selectedIds: [],
      activeId: null,
      isPanning: false,
      isBoxSelecting: false,
      boxSelectRect: null,
    })

    this.viewport = ref<CanvasViewport>({
      x: 0,
      y: 0,
      scale: this.options.initialScale,
      rotation: 0,
      width: this.options.width,
      height: this.options.height,
    })

    this.components = ref(new Map<UUID, ComponentInstance>())
    this.selectedIds = ref<UUID[]>([])
    this.activeId = ref<UUID | null>(null)
    this.isDragging = ref(false)
    this.isBoxSelecting = ref(false)
    this.boxSelectRect = ref<Rect | null>(null)

    // 创建画布元素
    this.canvasElement = this.createCanvasElement()

    // 初始化管理器
    this.viewportManager = new ViewportManager(this)
    this.renderManager = new RenderManager(this)
    this.eventManager = new EventManager(this)

    // 绑定状态监听
    this.bindStateWatchers()

    // 触发就绪事件
    this.emit('ready')
  }

  /**
   * 创建画布DOM元素
   */
  private createCanvasElement(): HTMLDivElement {
    const canvas = document.createElement('div')
    canvas.className = 'bs-canvas'
    canvas.style.cssText = `
      position: relative;
      width: ${this.options.width}px;
      height: ${this.options.height}px;
      background: #fff;
      transform-origin: 0 0;
      overflow: hidden;
    `
    
    this.container.style.cssText = `
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
    `
    
    // 创建视口容器
    const viewport = document.createElement('div')
    viewport.className = 'bs-viewport'
    viewport.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
    `
    
    viewport.appendChild(canvas)
    this.container.appendChild(viewport)
    
    return canvas
  }

  /**
   * 绑定状态监听器
   */
  private bindStateWatchers(): void {
    // 监听视口变化
    watch(
      () => this.viewport.value,
      (newViewport) => {
        this.state.value.scale = newViewport.scale
        this.state.value.offset = { x: newViewport.x, y: newViewport.y }
        this.emit('viewportChange', newViewport)
      },
      { deep: true }
    )

    // 监听选中组件变化
    watch(
      () => this.selectedIds.value,
      (newIds, oldIds) => {
        const added = newIds.filter(id => !oldIds.includes(id))
        const removed = oldIds.filter(id => !newIds.includes(id))
        
        if (added.length > 0) {
          this.emit('select', added)
        }
        if (removed.length > 0) {
          this.emit('deselect', removed)
        }
      }
    )
  }

  // ============ 事件系统 ============

  /**
   * 添加事件监听器
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  public on<K extends keyof CanvasEngineEvents>(
    event: K,
    handler: CanvasEngineEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(handler as Function)
  }

  /**
   * 移除事件监听器
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  public off<K extends keyof CanvasEngineEvents>(
    event: K,
    handler: CanvasEngineEvents[K]
  ): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.delete(handler as Function)
    }
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param args - 事件参数
   */
  private emit<K extends keyof CanvasEngineEvents>(
    event: K,
    ...args: Parameters<CanvasEngineEvents[K]>
  ): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as Function)(...args)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  // ============ 公共方法 ============

  /**
   * 获取画布容器元素
   */
  public getContainer(): HTMLElement {
    return this.container
  }

  /**
   * 获取画布元素
   */
  public getCanvasElement(): HTMLDivElement {
    return this.canvasElement
  }

  /**
   * 获取视口管理器
   */
  public getViewportManager(): ViewportManager {
    return this.viewportManager
  }

  /**
   * 获取渲染管理器
   */
  public getRenderManager(): RenderManager {
    return this.renderManager
  }

  /**
   * 获取事件管理器
   */
  public getEventManager(): EventManager {
    return this.eventManager
  }

  /**
   * 销毁画布引擎
   */
  public destroy(): void {
    // 清理事件监听
    this.eventListeners.clear()
    
    // 销毁管理器
    this.eventManager.destroy()
    this.renderManager.destroy()
    
    // 移除DOM元素
    this.container.innerHTML = ''
  }
}
