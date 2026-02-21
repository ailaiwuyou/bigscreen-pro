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
import type { ScatterChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface Props {
  data: any[]
  xData?: string[]
  seriesNames?: string[]
  config?: Partial<ScatterChartConfig>
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

const defaultConfig: ScatterChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  symbolSize: 15,
  symbol: 'circle',
  showLabel: false,
  labelPosition: 'top'
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const data = props.data

  let series: any[] = []

  if (props.seriesNames && props.seriesNames.length > 0) {
    series = props.seriesNames.map((name, index) => ({
      name,
      type: 'scatter',
      symbolSize: config.symbolSize,
      symbol: config.symbol,
      data: data.map((item: any) => {
        if (Array.isArray(item)) {
          return [item[0], item[index + 1]]
        }
        return [item.x, item[name]]
      }),
      emphasis: {
        focus: 'series'
      }
    }))
  } else {
    series = [{
      type: 'scatter',
      symbolSize: config.symbolSize,
      symbol: config.symbol,
      data: data.map((item: any) => {
        if (Array.isArray(item)) return item
        return [item.x || item[0], item.y || item[1] || item.value]
      }),
      label: {
        show: config.showLabel,
        position: config.labelPosition,
        formatter: (params: any) => params.data[2] || ''
      }
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
      trigger: 'item',
      formatter: (params: any) => {
        return `X: ${params.data[0]}<br/>Y: ${params.data[1]}`
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
      type: 'value',
      scale: true,
      axisLine: { show: true },
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLine: { show: true },
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
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
