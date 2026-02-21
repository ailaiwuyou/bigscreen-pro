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
import type { BoxplotChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge, formatNumber } from './utils'

interface Props {
  data: any[]
  categories?: string[]
  config?: Partial<BoxplotChartConfig>
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

const defaultConfig: BoxplotChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  legendPosition: 'top',
  layout: 'vertical',
  showOutliers: true,
  outlierSymbolSize: 8,
  showMeanLine: false,
  showMeanMark: false
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

// 处理箱线图数据
function processBoxplotData(data: any[]) {
  const categories = props.categories || data.map((_, i) => `类别${i + 1}`)
  
  const boxData = data.map(item => {
    if (Array.isArray(item)) {
      // [min, Q1, median, Q3, max]
      return item
    }
    return item.boxData || item.value || [0, 0, 0, 0, 0]
  })

  const outliers: any[] = []
  data.forEach((item, index) => {
    if (item.outliers) {
      item.outliers.forEach((outlier: any) => {
        outliers.push([index, outlier])
      })
    }
  })

  return { categories, boxData, outliers }
}

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const { categories, boxData, outliers } = processBoxplotData(props.data)

  const isHorizontal = config.layout === 'horizontal'

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center'
    } : undefined,
    tooltip: config.showTooltip ? {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        if (params.seriesName === '箱线图') {
          const data = params.data
          return `${params.name}<br/>
                  最大值: ${data[5]}<br/>
                  上四分位数: ${data[4]}<br/>
                  中位数: ${data[3]}<br/>
                  下四分位数: ${data[2]}<br/>
                  最小值: ${data[1]}`
        }
        return `${params.name}: ${params.data[1]}`
      }
    } : undefined,
    legend: config.showLegend ? {
      data: ['箱线图', '异常值'],
      [config.legendPosition || 'top']: 10
    } : undefined,
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: isHorizontal ? 'value' : 'category',
      data: isHorizontal ? undefined : categories,
      boundaryGap: !isHorizontal,
      splitLine: { show: isHorizontal }
    },
    yAxis: {
      type: isHorizontal ? 'category' : 'value',
      data: isHorizontal ? categories : undefined,
      boundaryGap: isHorizontal,
      splitLine: { show: !isHorizontal }
    },
    series: [
      {
        name: '箱线图',
        type: 'boxplot',
        data: boxData,
        itemStyle: {
          color: colors.value[0],
          borderColor: '#333'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      },
      ...(config.showOutliers && outliers.length > 0 ? [{
        name: '异常值',
        type: 'scatter',
        data: outliers,
        symbolSize: config.outlierSymbolSize,
        itemStyle: {
          color: '#ff4d4f'
        }
      }] : [])
    ],
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
