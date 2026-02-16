/**
 * 核心引擎类型定义
 */

import type {
  UUID,
  Point,
  Size,
  Rect,
  ComponentInstance,
  CanvasState,
  GridConfig,
  GuideConfig,
} from '@bigscreen/types'

// ============================================================
// 画布引擎选项
// ============================================================

export interface CanvasEngineOptions {
  /** 容器元素 */
  container: HTMLElement
  /** 画布宽度 */
  width: number
  /** 画布高度 */
  height: number
  /** 初始缩放比例 */
  initialScale?: number
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** 网格配置 */
  grid?: Partial<GridConfig>
  /** 辅助线配置 */
  guide?: Partial<GuideConfig>
  /** 是否启用多选 */
  multiSelect?: boolean
  /** 是否启用键盘快捷键 */
  keyboardShortcuts?: boolean
  /** 自定义主题 */
  theme?: string
}

// ============================================================
// 画布视口
// ============================================================

export interface CanvasViewport {
  /** X轴偏移量 */
  x: number
  /** Y轴偏移量 */
  y: number
  /** 缩放比例 */
  scale: number
  /** 旋转角度 */
  rotation: number
  /** 视口宽度 */
  width: number
  /** 视口高度 */
  height: number
}

// ============================================================
// 画布变换
// ============================================================

export interface CanvasTransform {
  /** 平移X */
  translateX: number
  /** 平移Y */
  translateY: number
  /** 缩放X */
  scaleX: number
  /** 缩放Y */
  scaleY: number
  /** 旋转角度 */
  rotation: number
  /** 倾斜X */
  skewX: number
  /** 倾斜Y */
  skewY: number
}

// ============================================================
// 交互选项
// ============================================================

export interface InteractionOptions {
  /** 是否启用拖拽 */
  draggable?: boolean
  /** 是否启用缩放 */
  resizable?: boolean
  /** 是否启用旋转 */
  rotatable?: boolean
  /** 拖拽约束 */
  dragConstraint?: 'x' | 'y' | 'both'
  /** 缩放约束 */
  resizeConstraint?: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number }
  /** 保持宽高比 */
  maintainAspectRatio?: boolean
  /** 吸附配置 */
  snap?: SnapOptions
}

// ============================================================
// 吸附选项
// ============================================================

export interface SnapOptions {
  /** 是否启用吸附 */
  enabled: boolean
  /** 网格大小 */
  gridSize?: number
  /** 吸附到其他组件 */
  snapToComponents?: boolean
  /** 吸附到辅助线 */
  snapToGuides?: boolean
  /** 吸附到画布边缘 */
  snapToCanvasEdges?: boolean
  /** 吸附阈值 */
  threshold?: number
}

// ============================================================
// 辅助线
// ============================================================

export interface GuideLine {
  /** 辅助线ID */
  id: string
  /** 方向：水平或垂直 */
  orientation: 'horizontal' | 'vertical'
  /** 位置 */
  position: number
  /** 是否锁定 */
  locked?: boolean
  /** 颜色 */
  color?: string
}

// ============================================================
// 历史记录选项
// ============================================================

export interface HistoryOptions {
  /** 最大历史记录数 */
  maxSize?: number
  /** 是否启用压缩 */
  compress?: boolean
  /** 忽略的属性变更 */
  ignoreProps?: string[]
  /** 批量操作的延迟时间(ms) */
  batchDelay?: number
}

// ============================================================
// 画布引擎事件
// ============================================================

export interface CanvasEngineEvents {
  /** 画布就绪 */
  'ready': () => void
  /** 视口变化 */
  'viewportChange': (viewport: CanvasViewport) => void
  /** 组件选中 */
  'select': (componentIds: string[]) => void
  /** 组件取消选中 */
  'deselect': (componentIds: string[]) => void
  /** 组件拖拽开始 */
  'dragStart': (componentId: string, position: Point) => void
  /** 组件拖拽中 */
  'dragMove': (componentId: string, position: Point) => void
  /** 组件拖拽结束 */
  'dragEnd': (componentId: string, position: Point) => void
  /** 组件缩放开始 */
  'resizeStart': (componentId: string, size: Size) => void
  /** 组件缩放中 */
  'resizeMove': (componentId: string, size: Size) => void
  /** 组件缩放结束 */
  'resizeEnd': (componentId: string, size: Size) => void
  /** 组件旋转开始 */
  'rotateStart': (componentId: string, angle: number) => void
  /** 组件旋转中 */
  'rotateMove': (componentId: string, angle: number) => void
  /** 组件旋转结束