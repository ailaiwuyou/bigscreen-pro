<template>
  <div ref="chartRef" class="base-chart" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import type { ECharts, EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  width?: string
  height?: string
  theme?: string
  autoResize?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300px',
  theme: 'default',
  autoResize: true,
  loading: false
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 销毁已有实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartRef.value, props.theme)
  
  // 设置配置
  if (props.option) {
    chartInstance.setOption(props.option, true)
  }
  
  // 自动调整大小
  if (props.autoResize) {
    setupResizeObserver()
  }
}

// 设置 ResizeObserver
const setupResizeObserver = () => {
  if (!chartRef.value || !window.ResizeObserver) return
  
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  
  resizeObserver.observe(chartRef.value)
}

// 监听配置变化
watch(() => props.option, (newOption) => {
  if (chartInstance && newOption) {
    chartInstance.setOption(newOption, true)
  }
}, { deep: true })

// 监听主题变化
watch(() => props.theme, () => {
  nextTick(() => {
    initChart()
  })
})

// 监听加载状态
watch(() => props.loading, (isLoading) => {
  if (chartInstance) {
    if (isLoading) {
      chartInstance.showLoading({
        text: '加载中...',
        color: '#409EFF',
        textColor: '#409EFF',
        maskColor: 'rgba(255, 255, 255, 0.8)'
      })
    } else {
      chartInstance.hideLoading()
    }
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露方法给父组件
defineExpose({
  getInstance: () => chartInstance,
  resize: () => chartInstance?.resize(),
  setOption: (option: EChartsOption, notMerge?: boolean) => {
    chartInstance?.setOption(option, notMerge)
  },
  clear: () => chartInstance?.clear(),
  getDataURL: (options?: any) => chartInstance?.getDataURL(options),
  getConnectedDataURL: (options?: any) => chartInstance?.getConnectedDataURL(options)
})
</script>

<style scoped lang="scss">
.base-chart {
  width: 100%;
  height: 100%;
}
</style>
