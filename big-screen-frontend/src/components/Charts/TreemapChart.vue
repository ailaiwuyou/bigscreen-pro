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
import type { TreemapChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge, formatNumber } from './utils'

interface Props {
  data: any[]
  config?: Partial<TreemapChartConfig>
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

const defaultConfig: TreemapChartConfig = {
  showTitle: false,
  showLegend: false,
  showTooltip: true,
  showGrid: false,
  legendPosition: 'top',
  nodeGap: 4,
  visibleMinLevel: 0,
  breadcrumb: {
    show: true,
    top: 'top',
    left: 'center'
  },
  labelPosition: 'inside'
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

// 转换数据为树形结构
function convertToTreemapData(data: any[]): any[] {
  return data.map((item: any) => ({
    name: item.name || item.label || '未命名',
    value: item.value || 0,
    children: item.children ? convertToTreemapData(item.children) : undefined,
    itemStyle: item.color ? { color: item.color } : undefined
  }))
}

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const data = convertToTreemapData(props.data)

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center'
    } : undefined,
    tooltip: config.showTooltip ? {
      formatter: (params: any) => {
        return `${params.marker} ${params.name}<br/>数值: ${formatNumber(params.value)}${params.treePathInfo ? ` (${(params.value / params.treePathInfo[0].value * 100).toFixed(1)}%)` : ''}`
      }
    } : undefined,
    series: [{
      type: 'treemap',
      data,
      width: '95%',
      height: '90%',
      top: 'center',
      left: 'center',
      roam: false,
      nodeClick: 'zoomToNode',
      breadcrumb: config.breadcrumb?.show ? {
        show: true,
        top: config.breadcrumb.top,
        left: config.breadcrumb.left,
        itemStyle: {
          color: '#eee',
          borderColor: '#ddd',
          borderWidth: 1
        }
      } : { show: false },
      label: {
        show: true,
        position: config.labelPosition,
        formatter: '{b}\n{c}',
        fontSize: 12
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: config.nodeGap || 2,
        gapWidth: config.nodeGap || 2
      },
      levels: [
        {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 0,
            gapWidth: 4
          }
        },
        {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 2
          },
          upperLabel: {
            show: false
          }
        },
        {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            gapWidth: 1
          }
        }
      ]
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
