<template>
  <div class="liquid-fill-chart" :style="containerStyle">
    <div ref="liquidRef" class="liquid-container"></div>
    <div class="liquid-text" :style="textStyle">
      <div class="liquid-value">{{ displayValue }}</div>
      <div v-if="title" class="liquid-title">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { LiquidFillChartConfig, ChartTheme } from './types'
import { deepMerge } from './utils'

interface Props {
  value: number
  title?: string
  config?: Partial<LiquidFillChartConfig>
  theme?: ChartTheme
  width?: string | number
  height?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'default',
  width: '100%',
  height: '100%',
  value: 0
})

const emit = defineEmits<{
  change: [value: number]
}>()

const liquidRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

const defaultConfig: LiquidFillChartConfig = {
  showTitle: false,
  showLegend: false,
  showTooltip: false,
  showGrid: false,
  legendPosition: 'top',
  value: 0,
  radius: '80%',
  amplitude: 8,
  period: 4000,
  waveDirection: 'left',
  showLabel: true,
  labelPosition: 'inside',
  showOutline: true,
  waveColor: '#409eff',
  backgroundColor: '#e6f7ff'
}

const mergedConfig = computed(() => deepMerge(defaultConfig, props.config || {}))

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  position: 'relative' as const
}))

const textStyle = computed(() => ({
  color: mergedConfig.value.waveColor
}))

const displayValue = computed(() => {
  const value = props.value
  if (mergedConfig.value.showLabel) {
    return `${(value * 100).toFixed(1)}%`
  }
  return value.toFixed(2)
})

function initChart() {
  if (!liquidRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(liquidRef.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance) return

  const config = mergedConfig.value
  const option = {
    backgroundColor: 'transparent',
    series: [{
      type: 'liquidFill',
      data: [props.value],
      radius: config.radius,
      amplitude: config.amplitude,
      period: config.period,
      direction: config.waveDirection,
      shape: 'circle',
      outline: {
        show: config.showOutline,
        borderDistance: 8,
        itemStyle: {
          color: 'none',
          borderColor: config.waveColor,
          borderWidth: 4
        }
      },
      backgroundStyle: {
        color: config.backgroundColor
      },
      itemStyle: {
        color: config.waveColor,
        opacity: 0.8
      },
      label: {
        show: config.showLabel,
        position: ['50%', '50%'],
        formatter: () => `${(props.value * 100).toFixed(0)}%`,
        fontSize: 40,
        fontWeight: 'bold',
        color: config.waveColor
      },
      emphasis: {
        itemStyle: {
          opacity: 1
        }
      }
    }]
  }

  chartInstance.setOption(option)
}

// 监听变化
watch(() => props.value, updateChart)
watch(() => props.config, updateChart, { deep: true })

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

defineExpose({
  getInstance: () => chartInstance,
  resize: () => chartInstance?.resize()
})
</script>

<style scoped lang="scss">
.liquid-fill-chart {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .liquid-container {
    width: 100%;
    height: 100%;
  }

  .liquid-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;

    .liquid-value {
      font-size: 36px;
      font-weight: bold;
      line-height: 1.2;
    }

    .liquid-title {
      font-size: 14px;
      margin-top: 8px;
      opacity: 0.7;
    }
  }
}
</style>
