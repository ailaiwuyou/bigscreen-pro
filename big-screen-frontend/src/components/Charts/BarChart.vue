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
import type { BarChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge, formatNumber } from './utils'

interface Props {
  /** 数据 */
  data: any[]
  /** X轴数据 */
  xData?: string[]
  /** 系列名称 */
  seriesNames?: string[]
  /** 图表配置 */
  config?: Partial<BarChartConfig>
  /** 主题 */
  theme?: ChartTheme
  /** 宽度 */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 自动调整大小 */
  autoResize?: boolean
  /** 加载状态 */
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

// 默认配置
const defaultConfig: BarChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  stack: false,
  group: true,
  barWidth: '60%',
  horizontal: false,
  borderRadius: 0
}

// 合并配置
const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))

// 主题颜色
const colors = computed(() => getThemeColors(props.theme))

// 图表配置
const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const data = props.data
  const xData = props.xData || data.map((item: any) => item.name || item.x || '')

  // 处理系列数据
  let series: any[] = []

  if (props.seriesNames && props.seriesNames.length > 0) {
    // 多系列数据
    series = props.seriesNames.map((name, index) => {
      const seriesData = data.map((item: any) => {
        if (Array.isArray(item)) {
          return item[index]
        }
        return item[name] || item.value || 0
      })

      return {
        name,
        type: 'bar',
        stack: config.stack ? 'total' : undefined,
        barWidth: config.barWidth,
        data: seriesData,
        itemStyle: {
          borderRadius: config.borderRadius
        },
        emphasis: {
          focus: 'series'
        },
        label: {
          show: config.showLabel,
          position: config.horizontal ? 'right' : 'top'
        }
      }
    })
  } else {
    // 单系列数据
    series = [{
      type: 'bar',
      barWidth: config.barWidth,
      data: data.map((item: any) => ({
        name: item.name || item.x,
        value: item.value || item.y || item
      })),
      itemStyle: {
        borderRadius: config.borderRadius,
        color: (params: any) => {
          return colors.value[params.dataIndex % colors.value.length]
        }
      },
      emphasis: {
        focus: 'series'
      },
      label: {
        show: config.showLabel,
        position: config.horizontal ? 'right' : 'top',
        formatter: '{c}'
      }
    }]
  }

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    } : undefined,
    tooltip: config.showTooltip ? {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
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
      [config.legendPosition || 'top']: 10,
      type: 'scroll'
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      show: config.showGrid
    },
    xAxis: config.horizontal ? {
      type: 'value',
      axisLine: { show: true },
      axisLabel: { formatter: (value: number) => formatNumber(value) }
    } : {
      type: 'category',
      data: xData,
      axisLine: { show: true },
      axisLabel: { interval: 0, rotate: xData.length > 10 ? 45 : 0 }
    },
    yAxis: config.horizontal ? {
      type: 'category',
      data: xData,
      axisLine: { show: true }
    } : {
      type: 'value',
      axisLine: { show: true },
      axisLabel: { formatter: (value: number) => formatNumber(value) }
    },
    series,
    animation: config.animation?.enabled ?? true,
    animationDuration: config.animation?.duration ?? 1000,
    animationEasing: config.animation?.easing ?? 'cubicOut'
  }
})

// 事件处理
function handleClick(params: any) {
  emit('click', params)
}

function handleDblClick(params: any) {
  emit('dblclick', params)
}

// 暴露方法
defineExpose({
  getInstance: () => chartRef.value?.getInstance(),
  resize: () => chartRef.value?.resize(),
  setOption: (option: any, notMerge?: boolean, lazyUpdate?: boolean) => {
    chartRef.value?.setOption(option, notMerge, lazyUpdate)
  }
})
</script>
