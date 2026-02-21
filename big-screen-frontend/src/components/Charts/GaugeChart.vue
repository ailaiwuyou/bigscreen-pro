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
import type { GaugeChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface Props {
  value: number
  config?: Partial<GaugeChartConfig>
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

const defaultConfig: GaugeChartConfig = {
  showTitle: false,
  showLegend: false,
  showTooltip: true,
  showGrid: false,
  legendPosition: 'top',
  min: 0,
  max: 100,
  splitNumber: 10,
  radius: '75%',
  startAngle: 225,
  endAngle: -45,
  showPointer: true,
  showAxisTick: true,
  showSplitLine: true,
  progress: {
    show: true,
    width: 12
  }
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const percentage = (props.value - config.min!) / (config.max! - config.min!) * 100

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center'
    } : undefined,
    tooltip: config.showTooltip ? {
      formatter: `{a} <br/>{b} : {c}${config.max === 100 ? '%' : ''}`
    } : undefined,
    series: [{
      type: 'gauge',
      name: config.title || '指标',
      min: config.min,
      max: config.max,
      splitNumber: config.splitNumber,
      radius: config.radius,
      startAngle: config.startAngle,
      endAngle: config.endAngle,
      pointer: {
        show: config.showPointer,
        itemStyle: {
          color: colors.value[0]
        }
      },
      progress: {
        show: config.progress?.show,
        width: config.progress?.width,
        itemStyle: {
          color: colors.value[0]
        }
      },
      axisLine: {
        lineStyle: {
          width: config.progress?.width
        }
      },
      axisTick: {
        show: config.showAxisTick,
        distance: -config.progress?.width!
      },
      splitLine: {
        show: config.showSplitLine,
        distance: -config.progress?.width!,
        length: config.progress?.width
      },
      axisLabel: {
        distance: 14,
        fontSize: 12,
        formatter: (value: number) => {
          return config.max === 100 ? value + '%' : value
        }
      },
      title: {
        show: true,
        offsetCenter: [0, '70%'],
        fontSize: 14
      },
      detail: {
        show: true,
        fontSize: 30,
        offsetCenter: [0, '40%'],
        formatter: (value: number) => {
          return config.max === 100 ? value + '%' : value.toFixed(1)
        },
        color: colors.value[0]
      },
      data: [{
        value: props.value,
        name: config.title || '完成率'
      }]
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
