/**
 * 视口管理器
 * 
 * 负责画布视口的变换管理，包括：
 * - 缩放 (zoom)
 * - 平移 (pan)
 * - 旋转 (rotate)
 * - 适配 (fit)
 */

import type { Ref } from 'vue'
import type { Point, Rect } from '@bigscreen/types'
import { throttle } from '@bigscreen/utils'
import type { CanvasViewport } from '../types'
import type { CanvasEngine } from './CanvasEngine'

export interface ViewportTransform {
  x: number
  y: number
  scale: number
  rotation: number
}

export class ViewportManager {
  private engine: CanvasEngine
  private viewport: Ref<CanvasViewport>
  private container: HTMLElement
  
  // 动画ID
  private animationId: number | null = null
  
  // 变换历史
  private transformHistory: ViewportTransform[] = []
  private historyIndex = -1
  private readonly maxHistorySize = 50

  constructor(engine: CanvasEngine) {
    this.engine = engine
    this.viewport = engine.viewport
    this.container = engine.getContainer()
    
    // 初始化视口容器
    this.initViewportContainer()
  }

  /**
   * 初始化视口容器
   */
  private initViewportContainer(): void {
    const viewportEl = this.container.querySelector('.bs-viewport') as HTMLElement
    if (viewportEl) {
      viewportEl.style.willChange = 'transform'
      this.updateTransform()
    }
  }

  /**
   * 更新变换样式
   */
  private updateTransform(): void {
    const viewportEl = this.container.querySelector('.bs-viewport') as HTMLElement
    if (!viewportEl) return

    const { x, y, scale, rotation } = this.viewport.value
    const transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`
    
    viewportEl.style.transform = transform
  }

  /**
   * 保存变换历史
   */
  private saveTransform(): void {
    const { x, y, scale, rotation } = this.viewport.value
    const transform = { x, y, scale, rotation }

    // 移除当前索引之后的历史
    if (this.historyIndex < this.transformHistory.length - 1) {
      this.transformHistory = this.transformHistory.slice(0, this.historyIndex + 1)
    }

    // 添加新历史
    this.transformHistory.push(transform)

    // 限制历史大小
    if (this.transformHistory.length > this.maxHistorySize) {
      this.transformHistory.shift()
    } else {
      this.historyIndex++
    }
  }

  // ============ 公共方法 ============

  /**
   * 设置视口位置和缩放
   */
  public setViewport(x: number, y: number, scale: number, rotation = 0): void {
    this.saveTransform()
    
    this.viewport.value = {
      ...this.viewport.value,
      x,
      y,
      scale,
      rotation,
    }
    
    this.updateTransform()
  }

  /**
   * 平移视口
   */
  public pan(deltaX: number, deltaY: number): void {
    const { x, y } = this.viewport.value
    this.setViewport(x + deltaX, y + deltaY, this.viewport.value.scale)
  }

  /**
   * 缩放视口
   * @param scale - 目标缩放比例
   * @param center - 缩放中心点（相对于视口）
   */
  public zoom(scale: number, center?: Point): void {
    const { minScale, maxScale } = this.engine.options
    const clampedScale = Math.max(minScale, Math.min(maxScale, scale))
    
    if (!center) {
      this.setViewport(
        this.viewport.value.x,
        this.viewport.value.y,
        clampedScale
      )
      return
    }

    // 以指定点为中心缩放
    const { x, y, scale: currentScale } = this.viewport.value
    const scaleRatio = clampedScale / currentScale
    
    const newX = center.x - (center.x - x) * scaleRatio
    const newY = center.y - (center.y - y) * scaleRatio
    
    this.setViewport(newX, newY, clampedScale)
  }

  /**
   * 以指定位置为中心缩放
   */
  public zoomAt(x: number, y: number, scale: number): void {
    this.zoom(scale, { x, y })
  }

  /**
   * 放大
   */
  public zoomIn(factor = 1.2): void {
    this.zoom(this.viewport.value.scale * factor)
  }

  /**
   * 缩小
   */
  public zoomOut(factor = 1.2): void {
    this.zoom(this.viewport.value.scale / factor)
  }

  /**
   * 适应画布到容器
   */
  public fitToContainer(padding = 20): void {
    const containerRect = this.container.getBoundingClientRect()
    const canvasWidth = this.engine.options.width
    const canvasHeight = this.engine.options.height
    
    const availableWidth = containerRect.width - padding * 2
    const availableHeight = containerRect.height - padding * 2
    
    const scaleX = availableWidth / canvasWidth
    const scaleY = availableHeight / canvasHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = canvasWidth * scale
    const scaledHeight = canvasHeight * scale
    
    const x = (containerRect.width - scaledWidth) / 2
    const y = (containerRect.height - scaledHeight) / 2
    
    this.setViewport(x, y, scale, 0)
  }

  /**
   * 适应画布宽度
   */
  public fitToWidth(): void {
    const containerRect = this.container.getBoundingClientRect()
    const canvasWidth = this.engine.options.width
    const scale = containerRect.width / canvasWidth
    
    const scaledHeight = this.engine.options.height * scale
    const y = (containerRect.height - scaledHeight) / 2
    
    this.setViewport(0, y, scale, 0)
  }

  /**
   * 重置视口
   */
  public reset(): void {
    const containerRect = this.container.getBoundingClientRect()
    const x = (containerRect.width - this.engine.options.width) / 2
    const y = (containerRect.height - this.engine.options.height) / 2
    
    this.setViewport(x, y, 1, 0)
  }

  /**
   * 撤销视口变换
   */
  public undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--
      const transform = this.transformHistory[this.historyIndex]
      this.setViewport(transform.x, transform.y, transform.scale, transform.rotation)
    }
  }

  /**
   * 重做视口变换
   */
  public redo(): void {
    if (this.historyIndex < this.transformHistory.length - 1) {
      this.historyIndex++
      const transform = this.transformHistory[this.historyIndex]
      this.setViewport(transform.x, transform.y, transform.scale, transform.rotation)
    }
  }

  /**
   * 获取当前视口信息
   */
  public getViewport(): CanvasViewport {
    return { ...this.viewport.value }
  }

  /**
   * 销毁视口管理器
   */
  public destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
    }
    this.transformHistory = []
    this.historyIndex = -1
  }
}
