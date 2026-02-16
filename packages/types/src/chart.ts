/**
 * 图表类型定义
 * 
 * BigScreen Pro大屏可视化平台 - 图表组件专用类型
 */

import type { UUID, ComponentInstance, ComponentData } from './index'

// ============================================================
// 图表类型枚举
// ============================================================

/** ECharts图表类型 */
export enum EChartsType {
  // 基础图表
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  SCATTER = 'scatter',
  RADAR = 'radar',
  
  // 高级图表
  TREEMAP = 'treemap',
  SUNBURST = 'sunburst',
  SANKEY = 'sankey',
  FUNNEL = 'funnel',
  GAUGE = 'gauge',
  
  // 地理图表
  MAP = 'map',
  LINES = 'lines',
  EFFECT_SCATTER = 'effectScatter',
  
  // 关系图表
  GRAPH = 'graph',
  
  // 自定义系列
  CUSTOM = 'custom',
  
  // 组合图表
  PICTORIAL_BAR = 'pictorialBar',
  THEME_RIVER = 'themeRiver',
  
  // 3D图表
  BAR_3D = 'bar3D',
  LINE_3D = 'line3D',
  SCATTER_3D = 'scatter3D',
  SURFACE_3D = 'surface3D',
  MAP_3D = 'map3D',
}

// ============================================================
// 图表数据类型
// ============================================================

/** 图表数据点 */
export interface ChartDataPoint {
  /** X轴值 */
  x?: string | number | Date
  /** Y轴值 */
  y?: string | number | Date
  /** 数值 */
  value: number
  /** 名称 */
  name?: string
  /** 系列名称 */
  series?: string
  /** 额外数据 */
  extra?: Record<string, unknown>
}

/** 图表数据系列 */
export interface ChartDataSeries {
  /** 系列ID */
  id: string
  /** 系列名称 */
  name: string
  /** 系列类型 */
  type?: EChartsType
  /** 数据点列表 */
  data: ChartDataPoint[]
  /** 系列样式 */
  style?: Record<string, unknown>
  /** 是否可见 */
  visible?: boolean
}

/** 图表数据集 */
export interface ChartDataset {
  /** 数据集ID */
  id: string
  /** 数据集名称 */
  name: string
  /** 维度定义 */
  dimensions: string[]
  /** 数据 */
  source: unknown[][]
  /** 系列列表 */
  series?: ChartDataSeries[]
}

// ============================================================
// ECharts配置类型
// ============================================================

/** ECharts主题配置 */
export interface EChartsTheme {
  /** 主题名称 */
  name: string
  /** 主色调 */
  color: string[]
  /** 背景色 */
  backgroundColor?: string
  /** 文本样式 */
  textStyle?: Record<string, unknown>
  /** 标题样式 */
  title?: Record<string, unknown>
  /** 图例样式 */
  legend?: Record<string, unknown>
  /** 提示框样式 */
  tooltip?: Record<string, unknown>
  /** 坐标轴样式 */
  axis?: Record<string, unknown>
  /** 系列默认样式 */
  series?: Record<string, unknown>
}

/** ECharts实例配置 */
export interface EChartsOption {
  /** 标题 */
  title?: EChartsTitleOption
  /** 图例 */
  legend?: EChartsLegendOption
  /** 提示框 */
  tooltip?: EChartsTooltipOption
  /** 工具栏 */
  toolbox?: EChartsToolboxOption
  /** 数据缩放 */
  dataZoom?: EChartsDataZoomOption[]
  /** 视觉映射 */
  visualMap?: EChartsVisualMapOption[]
  /** 坐标系网格 */
  grid?: EChartsGridOption[]
  /** X轴 */
  xAxis?: EChartsAxisOption | EChartsAxisOption[]
  /** Y轴 */
  yAxis?: EChartsAxisOption | EChartsAxisOption[]
  /** 极坐标系 */
  polar?: EChartsPolarOption[]
  /** 角度轴 */
  angleAxis?: EChartsAxisOption
  /** 径向轴 */
  radiusAxis?: EChartsAxisOption
  /** 地理坐标系 */
  geo?: EChartsGeoOption[]
  /** 关系图 */
  series?: EChartsSeriesOption[]
  /** 数据集 */
  dataset?: EChartsDatasetOption[]
  /** 动画配置 */
  animation?: boolean | EChartsAnimationOption
  /** 背景色 */
  backgroundColor?: string
  /** 文本样式 */
  textStyle?: EChartsTextStyleOption
  /** 媒体查询 */
  media?: EChartsMediaOption[]
}

// 基础选项类型
export interface EChartsTitleOption {
  text?: string
  subtext?: string
  left?: string | number
  top?: string | number
  right?: string | number
  bottom?: string | number
  textStyle?: EChartsTextStyleOption
  subtextStyle?: EChartsTextStyleOption
  [key: string]: unknown
}

export interface EChartsLegendOption {
  type?: 'plain' | 'scroll'
  data?: string[]
  left?: string | number
  top?: string | number
  orient?: 'horizontal' | 'vertical'
  textStyle?: EChartsTextStyleOption
  [key: string]: unknown
}

export interface EChartsTooltipOption {
  trigger?: 'item' | 'axis' | 'none'
  axisPointer?: {
    type?: 'line' | 'cross' | 'shadow' | 'none'
  }
  formatter?: string | Function
  textStyle?: EChartsTextStyleOption
  [key: string]: unknown
}

export interface EChartsToolboxOption {
  feature?: Record<string, unknown>
  [key: string]: unknown
}

export interface EChartsDataZoomOption {
  type?: 'inside' | 'slider'
  xAxisIndex?: number | number[]
  yAxisIndex?: number | number[]
  start?: number
  end?: number
  [key: string]: unknown
}

export interface EChartsVisualMapOption {
  type?: 'continuous' | 'piecewise'
  min?: number
  max?: number
  inRange?: Record<string, unknown>
  [key: string]: unknown
}

export interface EChartsGridOption {
  left?: string | number
  top?: string | number
  right?: string | number
  bottom?: string | number
  containLabel?: boolean
  [key: string]: unknown
}

export interface EChartsAxisOption {
  type?: 'value' | 'category' | 'time' | 'log'
  name?: string
  data?: string[]
  axisLine?: Record<string, unknown>
  axisLabel?: Record<string, unknown>
  splitLine?: Record<string, unknown>
  [key: string]: unknown
}

export interface EChartsPolarOption {
  center?: (string | number)[]
  radius?: string | number | (string | number)[]
  [key: string]: unknown
}

export interface EChartsGeoOption {
  map?: string
  roam?: boolean
  zoom?: number
  center?: number[]
  [key: string]: unknown
}

export interface EChartsSeriesOption {
  type?: string
  name?: string
  data?: unknown[]
  [key: string]: unknown
}

export interface EChartsDatasetOption {
  source?: unknown[][]
  dimensions?: string[]
  [key: string]: unknown
}

export interface EChartsTextStyleOption {
  color?: string
  fontSize?: number
  fontWeight?: string | number
  fontFamily?: string
  [key: string]: unknown
}

export interface EChartsAnimationOption {
  duration?: number
  easing?: string
  delay?: number
  [key: string]: unknown
}

export interface EChartsMediaOption {
  query?: {
    maxWidth?: number
    minWidth?: number
    [key: string]: unknown
  }
  option?: EChartsOption
}

// ============================================================
// 图表组件实例类型
// ============================================================

/** 图表组件实例（继承自ComponentInstance） */
export interface ChartComponentInstance extends ComponentInstance {
  /** 组件类型 - 图表 */
  type: ComponentType.CHART
  /** 图表类型 */
  chartType: EChartsType
  /** ECharts配置 */
  option: EChartsOption
  /** ECharts主题 */
  theme?: string | EChartsTheme
  /** 图表数据 */
  data: ChartDataSeries[]
  /** 数据配置 */
  dataConfig: ComponentData
}
