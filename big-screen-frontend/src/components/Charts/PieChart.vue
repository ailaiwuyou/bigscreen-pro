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
import type { PieChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge, formatNumber } from './utils'

interface Props {
  data: any[]
  config?: Partial<PieChartConfig>
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

const defaultConfig: PieChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showLabel: true,
  legendPosition: 'top',
  donut: false,
  innerRadius: 0,
  outerRadius: '75%',
  rose: false,
  roseType: false,
  selectedOffset: 10,
  labelPosition: 'outside'
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const data = props.data.map((item: any) => ({
    name: item.name || item.label || '',
    value: item.value || 0
  }))

  // 计算内半径
  let innerRadius: string | number = config.innerRadius
  if (config.donut) {
    innerRadius = config.innerRadius || '40%'
  }

  // 玫瑰图半径
  let roseType: 'area' | 'radius' | false = false
  if (config.rose) {
    roseType = config.roseType || 'area'
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

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
        const percent = formatPercent(params.value / total)
        return `${params.marker} ${params.name}<br/>数值: ${formatNumber(params.value)}<br/>占比: ${percent}`
      }
    } : undefined,
    legend: config.showLegend ? {
      show: true,
      [config.legendPosition || 'top']: 10,
      type: 'scroll'
    } : undefined,
    series: [{
      type: 'pie',
      radius: [innerRadius, config.outerRadius || '75%'],
      roseType: roseType,
      selectedMode: 'single',
      selectedOffset: config.selectedOffset,
      data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: config.showLabel,
        position: config.labelPosition || 'outside',
        formatter: '{b}: {c} ({d}%)'
      },
      labelLine: {
        show: config.labelPosition === 'outside',
        length: 15,
        length2: 10
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
