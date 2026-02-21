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
import type { HeatmapChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface Props {
  data: any[]
  xCategories?: string[]
  yCategories?: string[]
  config?: Partial<HeatmapChartConfig>
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

const defaultConfig: HeatmapChartConfig = {
  showTitle: false,
  showLegend: false,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  showLabel: false,
  min: 0,
  max: 100,
  visualMap: true,
  visualMapPosition: 'right'
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value

  // 处理数据
  let heatmapData: any[] = []
  let xCategories = props.xCategories || []
  let yCategories = props.yCategories || []

  if (props.data.length > 0) {
    if (Array.isArray(props.data[0])) {
      // 格式: [[x, y, value], ...]
      heatmapData = props.data
      if (xCategories.length === 0) {
        const maxX = Math.max(...props.data.map(d => d[0]))
        xCategories = Array.from({ length: maxX + 1 }, (_, i) => String(i))
      }
      if (yCategories.length === 0) {
        const maxY = Math.max(...props.data.map(d => d[1]))
        yCategories = Array.from({ length: maxY + 1 }, (_, i) => String(i))
      }
    } else {
      // 格式: [{x, y, value}, ...]
      heatmapData = props.data.map((d: any, index: number) => [
        d.x ?? index % (xCategories.length || 7),
        d.y ?? Math.floor(index / (xCategories.length || 7)),
        d.value ?? d
      ])
    }
  }

  // 计算min/max
  const values = heatmapData.map(d => d[2])
  const minValue = config.min ?? Math.min(...values, 0)
  const maxValue = config.max ?? Math.max(...values, 100)

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center'
    } : undefined,
    tooltip: config.showTooltip ? {
      position: 'top',
      formatter: (params: any) => {
        return `${xCategories[params.data[0]] || params.data[0]} - ${yCategories[params.data[1]] || params.data[1]}<br/>数值: ${params.data[2]}`
      }
    } : undefined,
    visualMap: config.visualMap ? {
      min: minValue,
      max: maxValue,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']
      }
    } : undefined,
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: xCategories,
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: yCategories,
      splitArea: { show: true }
    },
    series: [{
      name: '热力图',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: config.showLabel
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
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
