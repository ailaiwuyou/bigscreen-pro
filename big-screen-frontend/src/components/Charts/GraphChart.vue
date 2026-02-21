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
import type { GraphChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface GraphNode {
  id?: string
  name?: string
  label?: string
  size?: number
  symbolSize?: number
  symbol?: string
  category?: number
  value?: number
  color?: string
  x?: number
  y?: number
  itemStyle?: any
}

interface GraphLink {
  source: string
  target: string
  value?: number
  width?: number
  label?: string
  lineStyle?: any
}

interface Category {
  name: string
  itemStyle?: any
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  categories?: Category[]
  config?: Partial<GraphChartConfig>
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

const defaultConfig: GraphChartConfig = {
  showTitle: false,
  showLegend: true,
  showTooltip: true,
  showGrid: false,
  legendPosition: 'top',
  layout: 'force',
  draggable: true,
  roam: true,
  nodeSize: 30,
  symbol: 'circle',
  edgeCurveness: 0.2,
  force: {
    repulsion: 1000,
    gravity: 0.1,
    edgeLength: 150
  }
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

// 处理节点数据
const processedNodes = computed(() => {
  return props.nodes.map((node, index) => ({
    id: node.id || String(index),
    name: node.name || node.label || `节点${index}`,
    symbolSize: node.size || node.symbolSize || mergedConfig.value.nodeSize,
    symbol: node.symbol || mergedConfig.value.symbol,
    category: node.category || 0,
    value: node.value,
    itemStyle: node.color ? { color: node.color } : undefined,
    x: node.x,
    y: node.y,
    ...node.itemStyle
  }))
})

// 处理边数据
const processedLinks = computed(() => {
  return props.links.map((link) => ({
    source: link.source,
    target: link.target,
    value: link.value || 1,
    lineStyle: {
      width: link.width || Math.sqrt(link.value || 1),
      curveness: mergedConfig.value.edgeCurveness,
      ...link.lineStyle
    },
    label: link.label ? {
      show: true,
      formatter: link.label
    } : undefined
  }))
})

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value

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
        if (params.dataType === 'node') {
          return `${params.marker} ${params.name}<br/>类别: ${params.data.category}`
        }
        return `${params.marker} 连接<br/>${params.data.source} → ${params.data.target}`
      }
    } : undefined,
    legend: config.showLegend && props.categories ? {
      show: true,
      [config.legendPosition || 'top']: 10,
      data: props.categories?.map((c) => c.name)
    } : undefined,
    series: [{
      type: 'graph',
      layout: config.layout,
      data: processedNodes.value,
      links: processedLinks.value,
      categories: props.categories,
      roam: config.roam,
      draggable: config.draggable,
      focusNodeAdjacency: true,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.3)'
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      lineStyle: {
        color: 'source',
        curveness: config.edgeCurveness
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        }
      },
      force: config.layout === 'force' ? {
        repulsion: config.force?.repulsion || 1000,
        gravity: config.force?.gravity || 0.1,
        edgeLength: config.force?.edgeLength || 150,
        layoutAnimation: true
      } : undefined
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

<style scoped lang="scss">
// 关系图特定样式
</style>
