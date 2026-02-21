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
import type { TreeChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge } from './utils'

interface Props {
  data: any
  config?: Partial<TreeChartConfig>
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

const defaultConfig: TreeChartConfig = {
  showTitle: false,
  showLegend: false,
  showTooltip: true,
  showGrid: false,
  legendPosition: 'top',
  orient: 'TB',
  showLabel: true,
  symbolSize: 12,
  symbol: 'emptyCircle',
  layerPadding: 150,
  nodePadding: 20,
  roam: true
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

// 转换数据为树形结构
function convertToTreeData(data: any): any {
  if (!data) return {}
  
  if (Array.isArray(data)) {
    return {
      name: '根节点',
      children: data.map(item => convertToTreeData(item))
    }
  }
  
  return {
    name: data.name || data.label || '节点',
    value: data.value,
    children: data.children ? data.children.map((child: any) => convertToTreeData(child)) : undefined
  }
}

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const treeData = convertToTreeData(props.data)

  return {
    color: colors.value,
    backgroundColor: config.backgroundColor || 'transparent',
    title: config.showTitle ? {
      text: config.title,
      left: 'center'
    } : undefined,
    tooltip: config.showTooltip ? {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        return `${params.name}${params.value ? ': ' + params.value : ''}`
      }
    } : undefined,
    series: [{
      type: 'tree',
      data: [treeData],
      top: '5%',
      left: '10%',
      bottom: '5%',
      right: '10%',
      symbol: config.symbol,
      symbolSize: config.symbolSize,
      orient: config.orient,
      label: {
        show: config.showLabel,
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 12
      },
      leaves: {
        label: {
          show: config.showLabel,
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      emphasis: {
        focus: 'descendant'
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
      roam: config.roam,
      itemStyle: {
        color: colors.value[0]
      },
      lineStyle: {
        color: '#ccc',
        curveness: 0.5
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
