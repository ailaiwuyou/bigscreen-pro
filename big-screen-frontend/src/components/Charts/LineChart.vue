<template>
  <BaseChart
    ref="chartRef"
    :option="chartOption"
    :theme="theme"
    :auto-resize="autoResize"
    :width="width"
    :height="height"
    :loading="loading"
    @click="handleClick"
    @dblclick="handleDblClick"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseChart from './BaseChart.vue'
import type { EChartsCoreOption } from 'echarts'
import type { LineChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge, formatNumber } from './utils'

interface Props {
  data: any[]
  xData?: string[]
  seriesNames?: string[]
  config?: Partial<LineChartConfig>
  theme?: ChartTheme
  width?: string | number
  height?: string | number
  autoResize?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  width: '100%',
  height: '100%',
  autoResize: true,
  loading: false
})

const emit = defineEmits<{
  click: [params: any]
  dblclick: [params: any]
}>()

const chartRef = ref<InstanceType<typeof BaseChart>>()

const defaultConfig: LineChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  smooth: false,
  area: false,
  stack: false,
  lineWidth: 2,
  showSymbol: true,
  connectNulls: false
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const data = props.data
  const xData = props.xData || data.map((item: any) => item.name || item.x || '')

  let series: any[] = []

  if (props.seriesNames && props.seriesNames.length > 0) {
    series = props.seriesNames.map((name, index) => {
      const seriesData = data.map((item: any) => {
        if (Array.isArray(item)) return item[index]
        return item[name] || item.value || 0
      })

      const baseColor = colors.value[index % colors.value.length]

      return {
        name,
        type: 'line',
        smooth: config.smooth,
        stack: config.stack ? 'total' : undefined,
        symbol: config.showSymbol ? 'circle' : 'none',
        symbolSize: 8,
        lineStyle: {
          width: config.lineWidth
        },
        areaStyle: config.area ? {
          opacity: 0.3,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: baseColor },
              { offset: 1, color: 'transparent' }
            ]
          }
        } : undefined,
        data: seriesData,
        connectNulls: config.connectNulls
      }
    })
  } else {
    const baseColor = colors.value[0]
    series = [{
      type: 'line',
      smooth: config.smooth,
      symbol: config.showSymbol ? 'circle' : 'none',
      symbolSize: 8,
      lineStyle: {
        width: config.lineWidth
      },
      areaStyle: config.area ? {
        opacity: 0.3,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: baseColor },
            { offset: 1, color: 'transparent' }
          ]
        }
      } : undefined,
      data: data.map((item: any) => item.value || item.y || item),
      connectNulls: config.connectNulls
    }]
  }

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center'
    } : undefined,
    tooltip: config.showTooltip ? {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params: any) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach((item: any) => {
          result += `${item.marker} ${item.seriesName}: ${formatNumber(item.value)}<br/>`
        })
        return result
      }
    } : undefined,
    legend: config.showLegend ? {
      show: true,
      [config.legendPosition || 'top']: 10
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      show: config.showGrid
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: { show: true },
      axisLabel: { interval: 0, rotate: xData.length > 10 ? 45 : 0 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true },
      axisLabel: { formatter: (value: number) => formatNumber(value) }
    },
    series,
    animation: config.animation?.enabled ?? true,
    animationDuration: config.animation?.duration ?? 1000
  }
})

function handleClick(params: any) {
  emit('click', params)
}

function handleDblClick(params: any) {
  emit('dblclick', params)
}

defineExpose({
  getInstance: () => chartRef.value?.getInstance(),
  resize: () => chartRef.value?.resize()
})
</script>
