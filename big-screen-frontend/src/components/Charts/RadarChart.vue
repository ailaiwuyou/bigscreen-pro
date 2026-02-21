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
import type { RadarChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface Props {
  data: any[]
  indicators?: Array<{ name: string; max: number; min?: number }>
  seriesNames?: string[]
  config?: Partial<RadarChartConfig>
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

const defaultConfig: RadarChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  shape: 'polygon',
  showArea: true,
  showSymbol: true
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const radarIndicators = computed(() => {
  if (props.indicators && props.indicators.length > 0) {
    return props.indicators
  }
  // 从数据自动提取
  if (props.data.length > 0) {
    const firstItem = props.data[0]
    if (Array.isArray(firstItem.value)) {
      return firstItem.value.map((_: number, index: number) => ({
        name: `指标${index + 1}`,
        max: Math.max(...props.data.map((d: any) => Array.isArray(d.value) ? d.value[index] : 0)) * 1.2
      }))
    }
  }
  return []
})

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const indicators = radarIndicators.value

  let series: any[] = []

  if (props.seriesNames && props.seriesNames.length > 0) {
    series = props.seriesNames.map((name, index) => ({
      name,
      type: 'radar',
      symbol: config.showSymbol ? 'circle' : 'none',
      symbolSize: 6,
      areaStyle: config.showArea ? { opacity: 0.3 } : undefined,
      data: props.data
        .filter((d: any) => d.seriesName === name)
        .map((d: any) => ({
          name: d.name,
          value: Array.isArray(d.value) ? d.value : indicators.map(ind => d.value)
        }))
    }))
  } else {
    series = [{
      type: 'radar',
      symbol: config.showSymbol ? 'circle' : 'none',
      symbolSize: 6,
      areaStyle: config.showArea ? { opacity: 0.3 } : undefined,
      data: props.data.map((d: any) => ({
        name: d.name || d.seriesName,
        value: Array.isArray(d.value) ? d.value : indicators.map(() => d.value)
      }))
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
      trigger: 'item'
    } : undefined,
    legend: config.showLegend ? {
      show: true,
      [config.legendPosition || 'top']: 10,
      data: props.seriesNames || props.data.map((d: any) => d.name)
    } : undefined,
    radar: {
      indicator: indicators,
      shape: config.shape,
      splitNumber: 5,
      axisName: {
        color: '#333'
      },
      splitLine: {
        lineStyle: {
          color: ['#eee']
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
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
