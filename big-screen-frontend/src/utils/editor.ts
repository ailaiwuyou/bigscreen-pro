/**
 * 编辑器工具函数
 * 提供仪表盘编辑器的各类辅助功能
 */

import { v4 as uuidv4 } from 'uuid'
import type { 
  DashboardComponent, 
  Dashboard,
  DragInfo,
  HistoryState
} from '@/types/dashboard'

/** 网格配置 */
export interface GridConfig {
  size: number
  enabled: boolean
}

/** 位置信息 */
export interface Position {
  x: number
  y: number
}

/** 尺寸信息 */
export interface Size {
  width: number
  height: number
}

/** 边界框 */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 生成唯一ID
 * @returns 唯一标识符(UUID v4)
 */
export function generateId(): string {
  return uuidv4()
}

/**
 * 生成短ID(8位)
 * 用于需要较短标识符的场景
 * @returns 短唯一标识符
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 网格对齐
 * 将数值对齐到最近的网格点
 * @param value 原始值
 * @param gridSize 网格大小
 * @returns 对齐后的值
 */
export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value
  return Math.round(value / gridSize) * gridSize
}

/**
 * 位置网格对齐
 * @param position 原始位置
 * @param gridConfig 网格配置
 * @returns 对齐后的位置
 */
export function snapPositionToGrid(
  position: Position,
  gridConfig: GridConfig
): Position {
  if (!gridConfig.enabled || gridConfig.size <= 0) {
    return position
  }
  return {
    x: snapToGrid(position.x, gridConfig.size),
    y: snapToGrid(position.y, gridConfig.size)
  }
}

/**
 * 尺寸网格对齐
 * @param size 原始尺寸
 * @param gridConfig 网格配置
 * @returns 对齐后的尺寸
 */
export function snapSizeToGrid(
  size: Size,
  gridConfig: GridConfig
): Size {
  if (!gridConfig.enabled || gridConfig.size <= 0) {
    return size
  }
  return {
    width: snapToGrid(size.width, gridConfig.size),
    height: snapToGrid(size.height, gridConfig.size)
  }
}

/**
 * 计算拖拽后的位置
 * @param dragInfo 拖拽信息
 * @param currentX 当前鼠标X
 * @param currentY 当前鼠标Y
 * @param gridConfig 网格配置
 * @returns 新位置
 */
export function calculateDragPosition(
  dragInfo: DragInfo,
  currentX: number,
  currentY: number,
  gridConfig?: GridConfig
): Position {
  const deltaX = currentX - dragInfo.startX
  const deltaY = currentY - dragInfo.startY
  
  const newPosition = {
    x: deltaX,
    y: deltaY
  }
  
  if (gridConfig) {
    return snapPositionToGrid(newPosition, gridConfig)
  }
  
  return newPosition
}

/**
 * 计算缩放比例
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param contentWidth 内容宽度
 * @param contentHeight 内容高度
 * @param fitMode 适配模式: contain | cover | fill
 * @returns 缩放比例
 */
export function calculateScale(
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  fitMode: 'contain' | 'cover' | 'fill' | 'none' = 'contain'
): number {
  if (fitMode === 'none') return 1
  
  const scaleX = containerWidth / contentWidth
  const scaleY = containerHeight / contentHeight
  
  switch (fitMode) {
    case 'contain':
      return Math.min(scaleX, scaleY)
    case 'cover':
      return Math.max(scaleX, scaleY)
    case 'fill':
      return Math.min(scaleX, scaleY) // 保持比例
    default:
      return 1
  }
}

/**
 * 计算最佳缩放级别
 * @param containerWidth 容器宽度
 * @param contentWidth 内容宽度
 * @param minZoom 最小缩放
 * @param maxZoom 最大缩放
 * @returns 最佳缩放比例
 */
export function calculateOptimalZoom(
  containerWidth: number,
  contentWidth: number,
  minZoom: number = 0.5,
  maxZoom: number = 2
): number {
  const zoom = containerWidth / contentWidth
  return Math.max(minZoom, Math.min(maxZoom, zoom))
}

/**
 * 获取组件边界框
 * @param components 组件列表
 * @returns 边界框
 */
export function getComponentsBoundingBox(
  components: DashboardComponent[]
): BoundingBox | null {
  if (components.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const comp of components) {
    minX = Math.min(minX, comp.x)
    minY = Math.min(minY, comp.y)
    maxX = Math.max(maxX, comp.x + comp.width)
    maxY = Math.max(maxY, comp.y + comp.height)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * 检查组件是否重叠
 * @param comp1 组件1
 * @param comp2 组件2
 * @returns 是否重叠
 */
export function checkOverlap(
  comp1: { x: number; y: number; width: number; height: number },
  comp2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    comp1.x < comp2.x + comp2.width &&
    comp1.x + comp1.width > comp2.x &&
    comp1.y < comp2.y + comp2.height &&
    comp1.y + comp1.height > comp2.y
  )
}

/**
 * 查找重叠的组件
 * @param component 要检查的组件
 * @param components 所有组件列表
 * @param excludeId 要排除的组件ID
 * @returns 重叠的组件列表
 */
export function findOverlappingComponents(
  component: DashboardComponent,
  components: DashboardComponent[],
  excludeId?: string
): DashboardComponent[] {
  return components.filter(comp => {
    if (comp.id === excludeId || comp.id === component.id) return false
    return checkOverlap(component, comp)
  })
}

/**
 * 计算安全位置(避免重叠)
 * @param component 组件
 * @param components 现有组件列表
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @returns 安全位置
 */
export function calculateSafePosition(
  component: DashboardComponent,
  components: DashboardComponent[],
  canvasWidth: number,
  canvasHeight: number
): Position {
  let { x, y } = component
  const { width, height } = component
  
  // 边界检查
  x = Math.max(0, Math.min(x, canvasWidth - width))
  y = Math.max(0, Math.min(y, canvasHeight - height))
  
  // 检查重叠并尝试调整
  const tempComponent = { ...component, x, y }
  let attempts = 0
  const maxAttempts = 100
  
  while (
    findOverlappingComponents(tempComponent, components, component.id).length > 0 &&
    attempts < maxAttempts
  ) {
    // 尝试向右下方移动
    tempComponent.x += 20
    tempComponent.y += 20
    
    // 边界检查
    if (tempComponent.x + width > canvasWidth) {
      tempComponent.x = 0
      tempComponent.y += 20
    }
    if (tempComponent.y + height > canvasHeight) {
      // 无法找到安全位置，返回原始位置
      return { x: component.x, y: component.y }
    }
    
    attempts++
  }
  
  return { x: tempComponent.x, y: tempComponent.y }
}

/**
 * 深克隆组件
 * @param component 组件
 * @returns 克隆的组件
 */
export function deepCloneComponent(component: DashboardComponent): DashboardComponent {
  return JSON.parse(JSON.stringify(component))
}

/**
 * 深克隆仪表盘
 * @param dashboard 仪表盘
 * @returns 克隆的仪表盘
 */
export function deepCloneDashboard(dashboard: Dashboard): Dashboard {
  return JSON.parse(JSON.stringify(dashboard))
}

/**
 * 创建历史记录
 * @param name 操作名称
 * @param dashboard 仪表盘数据
 * @returns 历史状态
 */
export function createHistoryState(name: string, dashboard: Dashboard): HistoryState {
  return {
    name,
    timestamp: Date.now(),
    dashboard: deepCloneDashboard(dashboard)
  }
}

/**
 * 添加历史记录
 * @param history 历史记录列表
 * @param currentIndex 当前索引
 * @param state 新状态
 * @param maxHistory 最大历史记录数
 * @returns 新的历史状态和索引
 */
export function addHistoryState(
  history: HistoryState[],
  currentIndex: number,
  state: HistoryState,
  maxHistory: number = 50
): { history: HistoryState[]; index: number } {
  // 删除当前索引之后的历史
  const newHistory = history.slice(0, currentIndex + 1)
  
  // 添加新状态
  newHistory.push(state)
  
  // 限制历史记录数量
  if (newHistory.length > maxHistory) {
    newHistory.shift()
  }
  
  return {
    history: newHistory,
    index: newHistory.length - 1
  }
}

/**
 * 格式化数字为K/M/B格式
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 格式化百分比
 * @param value 值
 * @param decimals 小数位数
 * @returns 百分比字符串
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 创建默认组件
 * @param type 组件类型
 * @returns 默认组件配置
 */
export function createDefaultComponent(type: string): DashboardComponent {
  const defaults: Record<string, Partial<DashboardComponent>> = {
    text: {
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      props: {
        content: '文本内容',
        fontSize: 16,
        color: '#333333',
        fontWeight: 'normal'
      }
    },
    image: {
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      props: {
        src: '',
        fit: 'contain'
      }
    },
    'bar-chart': {
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      props: {
        title: '柱状图',
        data: [
          { name: 'A', value: 100 },
          { name: 'B', value: 200 },
          { name: 'C', value: 150 }
        ]
      }
    },
    'line-chart': {
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      props: {
        title: '折线图',
        data: [
          { name: 'A', value: 100 },
          { name: 'B', value: 200 },
          { name: 'C', value: 150 }
        ]
      }
    },
    'pie-chart': {
      x: 100,
      y: 100,
      width: 300,
      height: 300,
      props: {
        title: '饼图',
        data: [
          { name: 'A', value: 100 },
          { name: 'B', value: 200 },
          { name: 'C', value: 150 }
        ]
      }
    },
    'metric-card': {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      props: {
        title: '指标',
        value: 0,
        unit: '',
        trend: 'up'
      }
    }
  }

  const defaultConfig = defaults[type] || {
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    props: {}
  }

  return {
    id: generateId(),
    type,
    ...defaultConfig
  } as DashboardComponent
}

/**
 * 克隆组件
 * @param component 组件
 * @returns 克隆的组件
 */
export function cloneComponent(component: DashboardComponent): DashboardComponent {
  return {
    ...deepCloneComponent(component),
    id: generateId(),
    x: component.x + 20,
    y: component.y + 20
  }
}
