<template>
  <div class="trend-chart" ref="chartRef">
    <div v-if="!data || data.length === 0" class="no-data">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface TrendData {
  time: string
  value: number
  trend?: 'up' | 'down' | 'stable'
}

interface Props {
  data?: TrendData[]
  width?: number | string
  height?: number | string
  title?: string
  theme?: 'light' | 'dark'
  showArea?: boolean
  showSymbol?: boolean
  smooth?: boolean
  lineColor?: string
  areaColor?: string
  showTrendLine?: boolean
  showValue?: boolean
  valuePosition?: 'start' | 'middle' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  width: '100%',
  height: 300,
  title: '',
  theme: 'light',
  showArea: true,
  showSymbol: false,
  smooth: true,
  lineColor: '#5470c6',
  areaColor: undefined,
  showTrendLine: true,
  showValue: true,
  valuePosition: 'end'
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 计算趋势线
const calculateTrendLine = (data: number[]): number[] => {
  const n = data.length
  if (n < 2) return []
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += data[i]
    sumXX += i * i
    sumXY += i * data[i]
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return data.map((_, i) => slope * i + intercept)
}

const chartOptions = computed<EChartsOption>(() => {
  const isDark = props.theme === 'dark'
  const textColor = isDark ? '#ccc' : '#666'
  const bgColor = isDark ? '#1a1a1a' : '#fff'
  
  const values = props.data.map(d => d.value)
  const trendLine = props.showTrendLine && values.length >= 2 
    ? calculateTrendLine(values) 
    : []
  
  const defaultAreaColor = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: props.lineColor || '#5470c6' },
    { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
  ])
  
  const series: echarts.Series[] = [
    {
      name: '数值',
      type: 'line',
      data: values,
      smooth: props.smooth,
      symbol: props.showSymbol ? 'circle' : 'none',
      symbolSize: 8,
      lineStyle: {
        width: 2,
        color: props.lineColor
      },
      itemStyle: {
        color: props.lineColor
      },
      areaStyle: props.showArea ? {
        color: props.areaColor || defaultAreaColor
      } : undefined,
      endLabel: props.showValue ? {
        show: true,
        formatter: '{c}',
        position: props.valuePosition,
        color: textColor
      } : undefined
    }
  ]
  
  if (trendLine.length > 0) {
    series.push({
      name: '趋势',
      type: 'line',
      data: trendLine,
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 1,
        type: 'dashed',
        color: isDark ? '#666' : '#999'
      }
    })
  }
  
  return {
    backgroundColor: bgColor,
    title: props.title ? {
      text: props.title,
      left: 'center',
      textStyle: {
        color: textColor,
        fontSize: 14
      }
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.data.map(d => d.time),
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: textColor }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: '#eee' } }
    },
    series
  }
})

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(chartOptions.value)
}

const updateChart = () => {
  if (chartInstance) {
    chartInstance.setOption(chartOptions.value, true)
  }
}

const resizeChart = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})

watch(() => props.data, updateChart, { deep: true })
watch(() => props.theme, updateChart)
</script>

<style scoped lang="scss">
.trend-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}
</style>
