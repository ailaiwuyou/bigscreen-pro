/**
 * 仪表盘相关类型定义
 */

/** 组件类型枚举 */
export enum ComponentType {
  TEXT = 'text',
  CHART = 'chart',
  METRIC = 'metric',
  IMAGE = 'image'
}

/** 文本组件子类型 */
export enum TextSubType {
  TITLE = 'title',
  PARAGRAPH = 'paragraph'
}

/** 图表类型 */
export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter'
}

/** 图表颜色主题 */
export enum ColorTheme {
  DEFAULT = 'default',
  DARK = 'dark',
  VINTAGE = 'vintage',
  MACARONS = 'macarons',
  SHINE = 'shine'
}

/** 边框样式 */
export interface BorderStyle {
  width: number
  color: string
  style: 'solid' | 'dashed' | 'dotted'
}

/** 阴影样式 */
export interface ShadowStyle {
  x: number
  y: number
  blur: number
  color: string
}

/** 组件基础样式 */
export interface ComponentStyle {
  /** 背景颜色 */
  backgroundColor: string
  /** 背景图片 */
  backgroundImage?: string
  /** 边框 */
  border?: BorderStyle
  /** 圆角 */
  borderRadius: number
  /** 阴影 */
  boxShadow?: ShadowStyle
  /** 内边距 */
  padding: number
  /** 透明度 */
  opacity: number
}

/** 图表配置 */
export interface ChartConfig {
  /** 图表类型 */
  chartType: ChartType
  /** 颜色主题 */
  colorTheme: ColorTheme
  /** 是否显示图例 */
  showLegend: boolean
  /** 是否显示提示框 */
  showTooltip: boolean
  /** 是否显示标签 */
  showLabel: boolean
  /** 网格线配置 */
  showGrid: boolean
  /** X轴配置 */
  xAxis?: {
    name?: string
    show: boolean
  }
  /** Y轴配置 */
  yAxis?: {
    name?: string
    show: boolean
  }
}

/** 数据源配置 */
export interface DataSource {
  /** 数据源类型: static | api | database */
  type: 'static' | 'api' | 'database'
  /** 静态数据 */
  staticData?: any
  /** API配置 */
  apiConfig?: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    params?: Record<string, any>
  }
  /** 数据库配置 */
  databaseConfig?: {
    connectionId: string
    query: string
  }
  /** 刷新间隔(秒), 0表示不自动刷新 */
  refreshInterval: number
  /** 数据转换脚本 */
  transformScript?: string
}

/** 文本组件配置 */
export interface TextConfig {
  /** 文本类型 */
  textType: TextSubType
  /** 文本内容 */
  content: string
  /** 字体大小 */
  fontSize: number
  /** 字体粗细 */
  fontWeight: 'normal' | 'bold' | 'lighter' | number
  /** 字体颜色 */
  color: string
  /** 行高 */
  lineHeight: number
  /** 文本对齐 */
  textAlign: 'left' | 'center' | 'right' | 'justify'
  /** 装饰线 */
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline'
}

/** 指标组件配置 */
export interface MetricConfig {
  /** 指标标题 */
  title: string
  /** 指标值 */
  value: string | number
  /** 单位 */
  unit?: string
  /** 数值字体大小 */
  valueFontSize: number
  /** 数值颜色 */
  valueColor: string
  /** 前缀图标 */
  prefixIcon?: string
  /** 后缀图标 */
  suffixIcon?: string
  /** 趋势值 */
  trend?: number
  /** 趋势标签 */
  trendLabel?: string
}

/** 图片组件配置 */
export interface ImageConfig {
  /** 图片URL */
  src: string
  /** 替代文本 */
  alt: string
  /** 填充模式 */
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  /** 点击动作 */
  clickAction?: 'none' | 'link' | 'fullscreen'
  /** 链接地址 */
  linkUrl?: string
}

/** 组件配置联合类型 */
export type ComponentConfig = TextConfig | ChartConfig | MetricConfig | ImageConfig

/** 仪表盘组件 */
export interface DashboardComponent {
  /** 唯一ID */
  id: string
  /** 组件类型 */
  type: ComponentType
  /** 组件名称 */
  name: string
  /** 位置X */
  x: number
  /** 位置Y */
  y: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 层级 */
  zIndex: number
  /** 是否锁定 */
  locked: boolean
  /** 是否可见 */
  visible: boolean
  /** 基础样式 */
  style: ComponentStyle
  /** 数据源配置 */
  dataSource?: DataSource
  /** 组件特有配置 */
  config: ComponentConfig
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/** 仪表盘 */
export interface Dashboard {
  /** 唯一ID */
  id: string
  /** 仪表盘名称 */
  name: string
  /** 描述 */
  description?: string
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 背景颜色 */
  backgroundColor: string
  /** 背景图片 */
  backgroundImage?: string
  /** 组件列表 */
  components: DashboardComponent[]
  /** 状态: draft | published | archived */
  status: 'draft' | 'published' | 'archived'
  /** 创建者ID */
  createdBy?: string
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/** 编辑器状态 */
export interface EditorState {
  /** 当前仪表盘 */
  dashboard: Dashboard | null
  /** 选中的组件ID */
  selectedId: string | null
  /** 是否预览模式 */
  isPreview: boolean
  /** 缩放比例 */
  zoom: number
  /** 是否显示网格 */
  showGrid: boolean
  /** 网格大小 */
  gridSize: number
  /** 是否锁定画布 */
  canvasLocked: boolean
  /** 历史记录 */
  history: HistoryState[]
  /** 当前历史索引 */
  historyIndex: number
}

/** 历史状态 */
export interface HistoryState {
  /** 操作名称 */
  name: string
  /** 操作时间 */
  timestamp: number
  /** 仪表盘数据 */
  dashboard: Dashboard
}

/** 拖拽信息 */
export interface DragInfo {
  /** 拖拽类型: new | move | resize */
  type: 'new' | 'move' | 'resize'
  /** 组件类型(新建时) */
  componentType?: ComponentType
  /** 组件ID(移动/缩放时) */
  componentId?: string
  /** 开始位置 */
  startX: number
  startY: number
  /** 调整大小的方向 */
  resizeDirection?: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
}

/** 工具栏配置 */
export interface ToolbarConfig {
  /** 是否启用撤销 */
  enableUndo: boolean
  /** 是否启用重做 */
  enableRedo: boolean
  /** 缩放级别列表 */
  zoomLevels: number[]
  /** 是否启用预览 */
  enablePreview: boolean
  /** 是否启用保存 */
  enableSave: boolean
}

/** 编辑器配置 */
export interface EditorConfig {
  /** 画布默认宽度 */
  defaultWidth: number
  /** 画布默认高度 */
  defaultHeight: number
  /** 默认网格大小 */
  defaultGridSize: number
  /** 最小组件尺寸 */
  minComponentSize: number
  /** 工具栏配置 */
  toolbar: ToolbarConfig
}

/** 历史状态 */
export interface HistoryState {
  /** 操作名称 */
  name: string
  /** 操作时间 */
  timestamp: number
  /** 仪表盘数据 */
  dashboard: Dashboard
}

/** 拖拽信息 */
export interface DragInfo {
  /** 拖拽类型: new | move | resize */
  type: 'new' | 'move' | 'resize'
  /** 组件类型(新建时) */
  componentType?: ComponentType
  /** 组件ID(移动/缩放时) */
  componentId?: string
  /** 开始位置 */
  startX: number
  startY: number
  /** 调整大小的方向 */
  resizeDirection?: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
}

/** 编辑器状态 */
export interface EditorState {
  /** 当前仪表盘 */
  dashboard: Dashboard | null
  /** 选中的组件ID */
  selectedId: string | null
  /** 是否预览模式 */
  isPreview: boolean
  /** 缩放比例 */
  zoom: number
  /** 是否显示网格 */
  showGrid: boolean
  /** 网格大小 */
  gridSize: number
  /** 是否锁定画布 */
  canvasLocked: boolean
  /** 历史记录 */
  history: HistoryState[]
  /** 当前历史索引 */
  historyIndex: number
}
