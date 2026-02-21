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

interface Props {
  geoJson: any
  data: any[]
  config?: any
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

const chartOption = computed<EChartsCoreOption>(() => {
  if (!props.geoJson) return {}

  return {
    color: colors.value,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value || 0}`
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...props.data.map(d => d.value || 0)),
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
      }
    },
    series: [{
      name: '地图',
      type: 'map',
      map: 'custom',
      roam: true,
      emphasis: {
        label: {
          show: true
        },
        itemStyle: {
          areaColor: '#ffd700'
        }
      },
      data: props.data
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
