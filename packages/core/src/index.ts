/**
 * BigScreen Pro - 核心引擎
 * 
 * 提供画布引擎、交互管理、状态管理等核心功能
 */

// 画布引擎
export * from './canvas'

// 交互管理
export * from './interaction'

// 状态管理
export * from './state'

// 组件管理
export * from './component'

// 历史记录管理
export * from './history'

// 辅助线管理
export * from './guide'

// 导出类型
export type {
  CanvasEngineOptions,
  CanvasViewport,
  CanvasTransform,
  InteractionOptions,
  SnapOptions,
  GuideLine,
  HistoryOptions,
} from './types'
