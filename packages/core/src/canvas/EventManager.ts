/**
 * 事件管理器
 * 
 * 负责画布的事件处理，包括：
 * - 鼠标事件（点击、拖拽、滚轮）
 * - 触摸事件（支持移动端）
 * - 键盘事件（快捷键）
 * - 拖拽交互
 */

import type { Point, UUID } from '@bigscreen/types'
import { throttle } from '@bigscreen/utils'
import type { CanvasEngine } from './CanvasEngine'

export interface DragState {
  isDragging: boolean
  componentId: UUID | null
  startPoint: Point
  startPosition: Point
  delta: Point
}

export interface WheelState {
  isZooming: boolean
  lastTime: number
}

export class EventManager {
  private engine: CanvasEngine
  private container: HTMLElement
  private canvasElement: HTMLDivElement
  
  // 拖拽状态
  private dragState: DragState = {
    isDragging: false,
    componentId: null,
    startPoint: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    delta: { x: 0, y: 0 },
  }
  
  // 滚轮状态
  private wheelState: WheelState = {
    isZooming: false,
    lastTime: 0,
  }
  
  // 框选状态
  private boxSelectState = {
    isSelecting: false,
    startPoint: { x: 0, y: 0 },
  }
  
  // 滚轮节流
  private throttledWheelHandler: (e: WheelEvent) => void

  constructor(engine: CanvasEngine) {
    this.engine = engine
    this.container = engine.getContainer()
    this.canvasElement = engine.getCanvasElement()
    
    // 创建节流的滚轮处理器
    this.throttledWheelHandler = throttle(this.handleWheel.bind(this), 16)
    
    // 绑定事件
    this.bindEvents()
  }

  /**
   * 绑定事件监听器
   */
  private bindEvents(): void {
    // 鼠标事件
    this.canvasElement.addEventListener('mousedown', this.handleMouseDown.bind(this))
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('mouseup', this.handleMouseUp.bind(this))
    
    // 滚轮事件
    this.container.addEventListener('wheel', this.throttledWheelHandler, { passive: false })
    
    // 键盘事件
    if (this.engine.options.keyboardShortcuts) {
      window.addEventListener('keydown', this.handleKeyDown.bind(this))
      window.addEventListener('keyup', this.handleKeyUp.bind(this))
    }
    
    // 触摸事件（移动端支持）
    this.canvasElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.canvasElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.canvasElement.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  /**
   * 获取鼠标相对于画布的坐标
   */
  private getCanvasPoint(clientX: number, clientY: number): Point {
    const rect = this.canvasElement.getBoundingClientRect()
    const viewport = this.engine.viewport.value
    
    return {
      x: (clientX - rect.left - viewport.x) / viewport.scale,
      y: (clientY - rect.top - viewport.y) / viewport.scale,
    }
  }

  // ============ 鼠标事件处理 ============

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault()
    
    const point = this.getCanvasPoint(e.clientX, e.clientY)
    
    // 中键或空格+左键拖拽画布
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      this.startPan(e.clientX, e.clientY)
      return
    }
    
    // 左键点击
    if (e.button === 0) {
      // 检查是否点击了组件
      const componentId = this.hitTest(point.x, point.y)
      
      if (componentId) {
        // 点击了组件，开始拖拽组件
        this.startComponentDrag(componentId, point, e.shiftKey)
      } else {
        // 点击了空白区域，开始框选
        this.startBoxSelect(point)
      }
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(e: MouseEvent): void {
    // 处理平移
    if (this.engine.state.value.isPanning) {
      this.handlePanMove(e.clientX, e.clientY)
      return
    }
    
    // 处理组件拖拽
    if (this.dragState.isDragging && this.dragState.componentId) {
      this.handleComponentDragMove(e)
      return
    }
    
    // 处理框选
    if (this.boxSelectState.isSelecting) {
      this.handleBoxSelectMove(e)
    }
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(e: MouseEvent): void {
    // 结束平移
    if (this.engine.state.value.isPanning) {
      this.endPan()
      return
    }
    
    // 结束组件拖拽
    if (this.dragState.isDragging) {
      this.endComponentDrag()
      return
    }
    
    // 结束框选
    if (this.boxSelectState.isSelecting) {
      this.endBoxSelect()
    }
  }

  // ============ 滚轮事件处理 ============

  /**
   * 处理滚轮事件（缩放）
   */
  private handleWheel(e: WheelEvent): void {
    e.preventDefault()
    
    const delta = e.deltaY
    const zoomFactor = delta > 0 ? 0.9 : 1.1
    const point = this.getCanvasPoint(e.clientX, e.clientY)
    
    this.engine.getViewportManager().zoomAt(point.x, point.y, 
      this.engine.viewport.value.scale * zoomFactor)
  }

  // ============ 键盘事件处理 ============

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // 空格键按住时切换到平移模式
    if (e.code === 'Space') {
      this.engine.state.value.mode = 'pan' as any
    }
    
    // Delete键删除选中组件
    if (e.code === 'Delete' || e.code === 'Backspace') {
      // TODO: 删除选中组件
    }
    
    // Ctrl+Z 撤销
    if (e.ctrlKey && e.code === 'KeyZ') {
      e.preventDefault()
      this.engine.getViewportManager().undo()
    }
    
    // Ctrl+Y 或 Ctrl+Shift+Z 重做
    if ((e.ctrlKey && e.code === 'KeyY') || (e.ctrlKey && e.shiftKey && e.code === 'KeyZ')) {
      e.preventDefault()
      this.engine.getViewportManager().redo()
    }
    
    // Ctrl+A 全选
    if (e.ctrlKey && e.code === 'KeyA') {
      e.preventDefault()
      // TODO: 全选组件
    }
    
    // Ctrl+G 组合
    if (e.ctrlKey && e.code === 'KeyG') {
      e.preventDefault()
      // TODO: 组合选中组件
    }
    
    // Ctrl+Shift+G 取消组合
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyG') {
      e.preventDefault()
      // TODO: 取消组合
    }
  }

  /**
   * 处理键盘释放事件
   */
  private handleKeyUp(e: KeyboardEvent): void {
    // 空格键释放时恢复到选择模式
    if (e.code === 'Space') {
      this.engine.state.value.mode = 'select' as any
    }
  }

  // ============ 触摸事件处理 ============

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault()
    
    if (e.touches.length === 1) {
      // 单指触摸，模拟鼠标按下
      const touch = e.touches[0]
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
      })
      this.handleMouseDown(mouseEvent)
    } else if (e.touches.length === 2) {
      // 双指触摸，准备缩放
      // TODO: 实现双指缩放
    }
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault()
    
    if (e.touches.length === 1) {
      // 单指移动，模拟鼠标移动
      const touch = e.touches[0]
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
      this.handleMouseMove(mouseEvent)
    } else if (e.touches.length === 2) {
      // 双指移动，处理缩放
      // TODO: 实现双指缩放
    }
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(e: TouchEvent): void {
    // 模拟鼠标释放
    const mouseEvent = new MouseEvent('mouseup', {
      button: 0,
    })
    this.handleMouseUp(mouseEvent)
  }

  // ============ 私有辅助方法 ============

  /**
   * 命中测试
   */
  private hitTest(x: number, y: number): UUID | null {
    // TODO: 实现组件命中测试
    return null
  }

  /**
   * 开始平移
   */
  private startPan(clientX: number, clientY: number): void {
    this.engine.state.value.isPanning = true
    // TODO: 保存平移起始位置
  }

  /**
   * 处理平移移动
   */
  private handlePanMove(clientX: number, clientY: number): void {
    // TODO: 处理平移
  }

  /**
   * 结束平移
   */
  private endPan(): void {
    this.engine.state.value.isPanning = false
  }

  /**
   * 开始组件拖拽
   */
  private startComponentDrag(componentId: UUID, point: Point, multiSelect: boolean): void {
    this.dragState = {
      isDragging: true,
      componentId,
      startPoint: point,
      startPosition: { x: 0, y: 0 }, // TODO: 获取组件实际位置
      delta: { x: 0, y: 0 },
    }
  }

  /**
   * 处理组件拖拽移动
   */
  private handleComponentDragMove(e: MouseEvent): void {
    // TODO: 处理组件拖拽移动
  }

  /**
   * 结束组件拖拽
   */
  private endComponentDrag(): void {
    this.dragState = {
      isDragging: false,
      componentId: null,
      startPoint: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    }
  }

  /**
   * 开始框选
   */
  private startBoxSelect(point: Point): void {
    this.boxSelectState = {
      isSelecting: true,
      startPoint: point,
    }
    this.engine.state.value.isBoxSelecting = true
  }

  /**
   * 处理框选移动
   */
  private handleBoxSelectMove(e: MouseEvent): void {
    // TODO: 处理框选移动
  }

  /**
   * 结束框选
   */
  private endBoxSelect(): void {
    this.boxSelectState = {
      isSelecting: false,
      startPoint: { x: 0, y: 0 },
    }
    this.engine.state.value.isBoxSelecting = false
    this.engine.state.value.boxSelectRect = null
  }

  /**
   * 销毁事件管理器
   */
  public destroy(): void {
    // 清理事件监听器
    // 已经在window上绑定的事件会在页面卸载时自动清理
  }
}
