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
import type { SunburstChartConfig, ChartTheme } from './types'
import { getThemeColors } from './utils/theme'
import { deepMerge, formatNumber } from './utils'

interface Props {
  data: any[]
  config?: Partial<SunburstChartConfig>
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

const defaultConfig: SunburstChartConfig = {
  showTitle: false,
  showLegend: false,
  showTooltip: true,
  showGrid: false,
  legendPosition: 'top',
  innerRadius: 0,
  outerRadius: '100%',
  levels: undefined,
  showLabel: true,
  emphasis: {
    focus: 'ancestor'
  }
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))
const colors = computed(() => getThemeColors(props.theme))

// 转换数据
function processSunburstData(data: any[]): any[] {
  return data.map(item => ({
    name: item.name || item.label || '未命名',
    value: item.value || 0,
    itemStyle: item.color ? { color: item.color } : undefined,
    children: item.children ? processSunburstData(item.children) : undefined
  }))
}

const chartOption = computed<EChartsCoreOption>(() => {
  const config = mergedConfig.value
  const data = processSunburstData(props.data)

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
        const path = params.treePathInfo?.map((p: any) => p.name).join(' > ') || params.name
        return `${path}<br/>数值: ${formatNumber(params.value)}`
      }
    } : undefined,
    series: [{
      type: 'sunburst',
      data,
      radius: [config.innerRadius, config.outerRadius],
      label: {
        show: config.showLabel,
        rotate: 'radial',
        formatter: '{b}\n{c}'
      },
      emphasis: {
        focus: config.emphasis?.focus || 'ancestor'
      },
      levels: config.levels || [
        {},
        {
          r0: '0%',
          r: '35%',
          itemStyle: {
            borderWidth: 2
          },
          label: {
            rotate: 'tangential'
          }
        },
        {
          r0: '35%',
          r: '70%',
          label: {
            align: 'right'
          }
        },
        {
          r0: '70%',
          r: '72%',
          label: {
            position: 'outside',
            padding: 3,
            silent: false
          },
          itemStyle: {
            borderWidth: 3
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
