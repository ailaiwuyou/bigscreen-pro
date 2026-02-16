/**
 * 渲染管理器
 * 
 * 负责画布的渲染逻辑，包括：
 * - 网格渲染
 * - 组件渲染
 * - 辅助线渲染
 * - 选择框渲染
 */

import type { GridConfig, GuideConfig, Rect } from '@bigscreen/types'
import type { CanvasEngine } from './CanvasEngine'

export interface RenderOptions {
  /** 是否显示网格 */
  showGrid: boolean
  /** 是否显示辅助线 */
  showGuides: boolean
  /** 是否显示选择框 */
  showSelection: boolean
  /** 是否显示组件边界 */
  showBounds: boolean
}

export class RenderManager {
  private engine: CanvasEngine
  private gridCanvas: HTMLCanvasElement | null = null
  private gridContext: CanvasRenderingContext2D | null = null
  private options: RenderOptions

  constructor(engine: CanvasEngine) {
    this.engine = engine
    this.options = {
      showGrid: true,
      showGuides: true,
      showSelection: true,
      showBounds: false,
    }

    this.initGridCanvas()
  }

  /**
   * 初始化网格画布
   */
  private initGridCanvas(): void {
    this.gridCanvas = document.createElement('canvas')
    this.gridCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 0;
    `
    
    this.gridContext = this.gridCanvas.getContext('2d')
    
    // 添加到画布容器
    const canvasElement = this.engine.getCanvasElement()
    canvasElement.insertBefore(this.gridCanvas, canvasElement.firstChild)
    
    // 设置画布大小
    this.resizeGridCanvas()
  }

  /**
   * 调整网格画布大小
   */
  private resizeGridCanvas(): void {
    if (!this.gridCanvas) return
    
    const canvasElement = this.engine.getCanvasElement()
    const { width, height } = canvasElement.getBoundingClientRect()
    
    this.gridCanvas.width = width
    this.gridCanvas.height = height
  }

  /**
   * 渲染网格
   */
  public renderGrid(): void {
    if (!this.options.showGrid || !this.gridContext || !this.gridCanvas) return

    const ctx = this.gridContext
    const canvas = this.gridCanvas
    const { width, height } = canvas

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 获取视口信息
    const viewport = this.engine.viewport.value
    const scale = viewport.scale
    const offsetX = viewport.x
    const offsetY = viewport.y

    // 获取网格配置
    const gridConfig = this.engine.options.grid
    const gridSize = (gridConfig?.size || 10) * scale
    const gridColor = gridConfig?.color || '#e0e0e0'

    // 计算可见区域
    const visibleLeft = -offsetX / scale
    const visibleTop = -offsetY / scale
    const visibleRight = (width - offsetX) / scale
    const visibleBottom = (height - offsetY) / scale

    // 计算网格起始点
    const startX = Math.floor(visibleLeft / gridSize) * gridSize
    const startY = Math.floor(visibleTop / gridSize) * gridSize

    // 绘制网格
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1 / scale

    // 垂直线
    for (let x = startX; x < visibleRight; x += gridSize) {
      const screenX = offsetX + x * scale
      ctx.beginPath()
      ctx.moveTo(screenX, 0)
      ctx.lineTo(screenX, height)
      ctx.stroke()
    }

    // 水平线
    for (let y = startY; y < visibleBottom; y += gridSize) {
      const screenY = offsetY + y * scale
      ctx.beginPath()
      ctx.moveTo(0, screenY)
      ctx.lineTo(width, screenY)
      ctx.stroke()
    }
  }

  /**
   * 渲染辅助线
   */
  public renderGuides(): void {
    if (!this.options.showGuides) return

    // TODO: 实现辅助线渲染
  }

  /**
   * 渲染选择框
   */
  public renderSelection(): void {
    if (!this.options.showSelection) return

    // TODO: 实现选择框渲染
  }

  /**
   * 渲染所有内容
   */
  public render(): void {
    this.renderGrid()
    this.renderGuides()
    this.renderSelection()
  }

  /**
   * 设置渲染选项
   */
  public setOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options }
    this.render()
  }

  /**
   * 销毁渲染管理器
   */
  public destroy(): void {
    if (this.gridCanvas && this.gridCanvas.parentNode) {
      this.gridCanvas.parentNode.removeChild(this.gridCanvas)
    }
    this.gridCanvas = null
    this.gridContext = null
  }
}
