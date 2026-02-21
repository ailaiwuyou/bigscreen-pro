// BigScreen Pro 图表组件库
// 
// 提供 20+ 种常用图表组件，基于 ECharts 5 封装
// 
// 使用示例:
// import { BarChart, LineChart, PieChart } from '@/components/Charts'
// 
// <BarChart :data="chartData" title="月度销售" />

// 基础图表组件
export { default as BaseChart } from './BaseChart.vue'

// 基础图表
export { default as BarChart } from './BarChart.vue'
export { default as LineChart } from './LineChart.vue'
export { default as PieChart } from './PieChart.vue'
export { default as ScatterChart } from './ScatterChart.vue'
export { default as RadarChart } from './RadarChart.vue'

// 高级图表
export { default as FunnelChart } from './FunnelChart.vue'
export { default as GaugeChart } from './GaugeChart.vue'
export { default as HeatmapChart } from './HeatmapChart.vue'
export { default as TreeChart } from './TreeChart.vue'
export { default as TreemapChart } from './TreemapChart.vue'
export { default as SunburstChart } from './SunburstChart.vue'
export { default as GraphChart } from './GraphChart.vue'
export { default as SankeyChart } from './SankeyChart.vue'
export { default as BoxplotChart } from './BoxplotChart.vue'
export { default as WordCloudChart } from './WordCloudChart.vue'

// 业务组件
export { default as MetricCard } from './MetricCard.vue'

// 类型导出
export type { EChartsOption } from 'echarts'
