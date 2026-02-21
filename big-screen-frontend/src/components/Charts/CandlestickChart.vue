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
import type { CandlestickChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface Props {
  data: any[]
  dates?: string[]
  volumes?: number[]
  config?: Partial<CandlestickChartConfig>
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

const defaultConfig: CandlestickChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  showMA: true,
  MAperiods: [5, 10, 20, 30],
  upColor: '#ef232a',
  downColor: '#14b143'
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const dates = props.dates || props.data.map((_, i) => String(i))
  
  // 处理K线数据 [open, close, low, high]
  const candlestickData = props.data.map(item => {
    if (Array.isArray(item)) {
      return item.slice(0, 4)
    }
    return [item.open, item.close, item.low, item.high]
  })

  // 计算MA线
  const calculateMA = (dayCount: number) => {
    const result = []
    for (let i = 0; i < candlestickData.length; i++) {
      if (i < dayCount - 1) {
        result.push('-')
        continue
      }
      let sum = 0
      for (let j = 0; j < dayCount; j++) {
        sum += candlestickData[i - j][1] // 收盘价
      }
      result.push((sum / dayCount).toFixed(2))
    }
    return result
  }

  const series: any[] = [
    {
      name: '日K',
      type: 'candlestick',
      data: candlestickData,
      itemStyle: {
        color: config.upColor,
        color0: config.downColor,
        borderColor: config.upColor,
        borderColor0: config.downColor
      }
    }
  ]

  // 添加MA线
  if (config.showMA && config.MAperiods) {
    config.MAperiods.forEach((period, index) => {
      series.push({
        name: `MA${period}`,
        type: 'line',
        data: calculateMA(period),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          opacity: 0.8,
          width: 1
        }
      })
    })
  }

  // 添加成交量
  if (props.volumes && props.volumes.length > 0) {
    series.push({
      name: '成交量',
      type: 'bar',
      xAxisIndex: 0,
      yAxisIndex: 1,
      data: props.volumes,
      itemStyle: {
        color: (params: any) => {
          const close = candlestickData[params.dataIndex][1]
          const open = candlestickData[params.dataIndex][0]
          return close > open ? config.upColor : config.downColor
        }
      }
    })
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
        params.forEach((param: any) => {
          if (param.seriesType === 'candlestick') {
            result += `开盘: ${param.data[0]}<br/>`
            result += `收盘: ${param.data[1]}<br/>`
            result += `最低: ${param.data[2]}<br/>`
            result += `最高: ${param.data[3]}<br/>`
          } else {
            result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`
          }
        })
        return result
      }
    } : undefined,
    legend: config.showLegend ? {
      data: series.map(s => s.name),
      [config.legendPosition || 'top']: 10
    } : undefined,
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      scale: true,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      axisLabel: { rotate: 45 }
    },
    yAxis: [
      {
        type: 'value',
        scale: true,
        splitLine: { show: true }
      },
      ...(props.volumes ? [{
        type: 'value',
        scale: true,
        splitLine: { show: false },
        show: false
      }] : [])
    ],
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
