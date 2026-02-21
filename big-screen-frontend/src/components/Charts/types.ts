/**
 * 图表组件类型定义
 */

/** 图表主题 */
export type ChartTheme = 'default' | 'dark' | 'vintage' | 'macarons' | 'shine' | 'roma' | 'walden'

/** 图表基础数据项 */
export interface ChartDataItem {
  name: string
  value: number | number[]
  [key: string]: any
}

/** 图表系列数据 */
export interface ChartSeries {
  name: string
  type: string
  data: ChartDataItem[] | number[] | number[][]
  [key: string]: any
}

/** 图表基础配置 */
export interface ChartBaseConfig {
  /** 图表主题 */
  theme?: ChartTheme
  /** 是否显示标题 */
  showTitle?: boolean
  /** 标题文本 */
  title?: string
  /** 是否显示图例 */
  showLegend?: boolean
  /** 图例位置 */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否显示提示框 */
  showTooltip?: boolean
  /** 是否显示工具箱 */
  showToolbox?: boolean
  /** 是否显示数据缩放 */
  showDataZoom?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 颜色列表 */
  colors?: string[]
  /** 动画配置 */
  animation?: {
    enabled?: boolean
    duration?: number
    easing?: string
  }
}

/** 柱状图配置 */
export interface BarChartConfig extends ChartBaseConfig {
  /** 是否堆叠 */
  stack?: boolean
  /** 是否分组 */
  group?: boolean
  /** 柱条宽度 */
  barWidth?: number | string
  /** 是否横向 */
  horizontal?: boolean
  /** 圆角 */
  borderRadius?: number | number[]
}

/** 折线图配置 */
export interface LineChartConfig extends ChartBaseConfig {
  /** 是否平滑 */
  smooth?: boolean
  /** 是否显示面积 */
  area?: boolean
  /** 是否堆叠 */
  stack?: boolean
  /** 线条宽度 */
  lineWidth?: number
  /** 是否显示点 */
  showSymbol?: boolean
  /** 是否连接空数据 */
  connectNulls?: boolean
}

/** 饼图配置 */
export interface PieChartConfig extends ChartBaseConfig {
  /** 是否为环形 */
  donut?: boolean
  /** 内半径 */
  innerRadius?: number | string
  /** 外半径 */
  outerRadius?: number | string
  /** 是否为玫瑰图 */
  rose?: boolean
  /** 玫瑰图模式 */
  roseType?: 'area' | 'radius' | false
  /** 选中扇区偏移 */
  selectedOffset?: number
  /** 标签位置 */
  labelPosition?: 'inside' | 'outside' | 'center'
}

/** 散点图配置 */
export interface ScatterChartConfig extends ChartBaseConfig {
  /** 符号大小 */
  symbolSize?: number | number[] | Function
  /** 符号类型 */
  symbol?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签位置 */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right'
}

/** 雷达图配置 */
export interface RadarChartConfig extends ChartBaseConfig {
  /** 雷达图形状 */
  shape?: 'polygon' | 'circle'
  /** 指示器配置 */
  indicators?: Array<{
    name: string
    max: number
    min?: number
  }>
  /** 是否显示区域 */
  showArea?: boolean
  /** 是否显示圆点 */
  showSymbol?: boolean
}

/** 漏斗图配置 */
export interface FunnelChartConfig extends ChartBaseConfig {
  /** 排序方式 */
  sort?: 'ascending' | 'descending' | 'none'
  /** 间隙 */
  gap?: number
  /** 标签位置 */
  labelPosition?: 'inside' | 'outside' | 'left' | 'right'
  /** 最小宽度 */
  minWidth?: number | string
  /** 最大宽度 */
  maxWidth?: number | string
}

/** 仪表盘配置 */
export interface GaugeChartConfig extends ChartBaseConfig {
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 刻度数 */
  splitNumber?: number
  /** 半径 */
  radius?: number | string
  /** 起始角度 */
  startAngle?: number
  /** 结束角度 */
  endAngle?: number
  /** 是否显示指针 */
  showPointer?: boolean
  /** 是否显示刻度 */
  showAxisTick?: boolean
  /** 是否显示分割线 */
  showSplitLine?: boolean
  /** 进度条配置 */
  progress?: {
    show?: boolean
    width?: number
  }
}

/** 热力图配置 */
export interface HeatmapChartConfig extends ChartBaseConfig {
  /** 是否显示标签 */
  showLabel?: boolean
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 是否启用视觉映射 */
  visualMap?: boolean
  /** 视觉映射位置 */
  visualMapPosition?: 'top' | 'bottom' | 'left' | 'right'
}

/** 树图配置 */
export interface TreeChartConfig extends ChartBaseConfig {
  /** 布局方向 */
  orient?: 'LR' | 'RL' | 'TB' | 'BT'
  /** 是否显示标签 */
  showLabel?: boolean
  /** 符号大小 */
  symbolSize?: number | number[]
  /** 符号类型 */
  symbol?: string
  /** 层间距 */
  layerPadding?: number
  /** 节点间距 */
  nodePadding?: number
  /** 是否可展开收起 */
  roam?: boolean | 'scale' | 'move'
}

/** 矩形树图配置 */
export interface TreemapChartConfig extends ChartBaseConfig {
  /** 矩形间距 */
  nodeGap?: number
  /** 显示层级 */
  visibleMinLevel?: number
  /** 面包屑配置 */
  breadcrumb?: {
    show?: boolean
    top?: string
    left?: string
  }
  /** 标签位置 */
  labelPosition?: 'inside' | 'top' | 'left' | 'right' | 'bottom'
  /** 色块模式 */
  itemStyle?: {
    borderColor?: string
    borderWidth?: number
    gapWidth?: number
  }
}

/** 旭日图配置 */
export interface SunburstChartConfig extends ChartBaseConfig {
  /** 内半径 */
  innerRadius?: number | string
  /** 外半径 */
  outerRadius?: number | string
  /** 层级深度 */
  levels?: Array<{
    r0?: string
    r?: string
    itemStyle?: Record<string, any>
    label?: Record<string, any>
  }>
  /** 是否显示标签 */
  showLabel?: boolean
  /** 高亮配置 */
  emphasis?: {
    focus?: 'ancestor' | 'descendant' | 'self' | 'series' | 'none'
  }
}

/** 关系图配置 */
export interface GraphChartConfig extends ChartBaseConfig {
  /** 布局方式 */
  layout?: 'force' | 'circular' | 'none'
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可缩放漫游 */
  roam?: boolean | 'scale' | 'move'
  /** 节点大小 */
  nodeSize?: number | number[]
  /** 节点符号类型 */
  symbol?: string
  /** 边的曲率 */
  edgeCurveness?: number
  /** 力引导配置 */
  force?: {
    repulsion?: number
    gravity?: number
    edgeLength?: number | number[]
  }
}

/** 箱线图配置 */
export interface BoxplotChartConfig extends ChartBaseConfig {
  /** 布局方向 */
  layout?: 'horizontal' | 'vertical'
  /** 是否显示异常值 */
  showOutliers?: boolean
  /** 异常值符号大小 */
  outlierSymbolSize?: number
  /** 是否显示均值线 */
  showMeanLine?: boolean
  /** 是否显示均值标记 */
  showMeanMark?: boolean
}

/** K线图配置 */
export interface CandlestickChartConfig extends ChartBaseConfig {
  /** 是否显示MA线 */
  showMA?: boolean
  /** MA周期 */
  MAperiods?: number[]
  /** 上涨颜色 */
  upColor?: string
  /** 下跌颜色 */
  downColor?: string
  /** 数据映射 */
  dimensions?: string[]
}

/** 水球图配置 */
export interface LiquidFillChartConfig extends ChartBaseConfig {
  /** 数据值 0-1 */
  value: number
  /** 水球半径 */
  radius?: number | string
  /** 水波振幅 */
  amplitude?: number
  /** 水波周期 */
  period?: number
  /** 波动方向 */
  waveDirection?: 'left' | 'right'
  /** 是否显示标签 */
  showLabel?: boolean
  /** 标签位置 */
  labelPosition?: 'inside' | 'outside'
  /** 是否显示轮廓 */
  showOutline?: boolean
  /** 波峰填充色 */
  waveColor?: string
  /** 背景填充色 */
  backgroundColor?: string
}

/** 图表配置联合类型 */
export type AnyChartConfig =
  | BarChartConfig
  | LineChartConfig
  | PieChartConfig
  | ScatterChartConfig
  | RadarChartConfig
  | FunnelChartConfig
  | GaugeChartConfig
  | HeatmapChartConfig
  | TreeChartConfig
  | TreemapChartConfig
  | SunburstChartConfig
  | GraphChartConfig
  | BoxplotChartConfig
  | CandlestickChartConfig
  | LiquidFillChartConfig

/** 图表组件 Props 基础类型 */
export interface ChartBaseProps {
  /** 图表数据 */
  data: ChartDataItem[] | any
  /** 图表配置 */
  config?: Record<string, any>
  /** 图表主题 */
  theme?: ChartTheme
  /** 图表宽度 */
  width?: number | string
  /** 图表高度 */
  height?: number | string
  /** 是否自动调整大小 */
  autoResize?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
  /** 加载提示文本 */
  loadingText?: string
  /** 点击事件 */
  onClick?: (params: any) => void
  /** 双击事件 */
  onDblClick?: (params: any) => void
}
