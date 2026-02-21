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
import type { ChartTheme } from './types'
import { getThemeColors } from './utils/theme'

interface SankeyNode {
  name: string
  itemStyle?: any
  depth?: number
}

interface SankeyLink {
  source: string
  target: string
  value: number
  lineStyle?: any
}

interface SankeyConfig {
  orient?: 'horizontal' | 'vertical'
  nodeAlign?: 'left' | 'right' | 'center'
  nodeGap?: number
  nodeWidth?: number
  layoutIterations?: number
  draggable?: boolean
  emphasis?: any
}

interface Props {
  data: SankeyNode[]
  links: SankeyLink[]
  config?: SankeyConfig
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
const colors = computed(() => getThemeColors(props.theme))

const defaultConfig: SankeyConfig = {
  orient: 'horizontal',
  nodeAlign: 'left',
  nodeGap: 8,
  nodeWidth: 15,
  layoutIterations: 32,
  draggable: true
}

const mergedConfig = computed(() => ({ ...defaultConfig, ...props.config }))

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value

  return {
    color: colors.value,
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          return `${params.marker} ${params.name}`
        }
        return `${params.marker} ${params.data.source} → ${params.data.target}<br/>值: ${params.data.value}`
      }
    },
    series: [{
      type: 'sankey',
      orient: config.orient,
      align: config.nodeAlign,
      nodeGap: config.nodeGap,
      nodeWidth: config.nodeWidth,
      layoutIterations: config.layoutIterations,
      draggable: config.draggable,
      data: props.data,
      links: props.links,
      emphasis: config.emphasis || {
        focus: 'adjacency'
      },
      lineStyle: {
        color: 'gradient',
        curveness: 0.5
      },
      label: {
        color: 'rgba(0,0,0,0.7)',
        fontSize: 12
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#aaa'
      }
    }]
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
// 桑基图特定样式
</style>
