<template>
  <BaseChart
    :option="chartOption"
    :width="width"
    :height="height"
    :theme="theme"
    :loading="loading"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'
import type { EChartsOption } from 'echarts'

interface WordData {
  name: string
  value: number
  textStyle?: any
  emphasis?: any
}

interface Props {
  data: WordData[]
  width?: string
  height?: string
  theme?: string
  loading?: boolean
  title?: string
  shape?: 'circle' | 'cardioid' | 'diamond' | 'triangle-forward' | 'triangle' | 'pentagon' | 'star'
  sizeRange?: [number, number]
  rotationRange?: [number, number]
  rotationStep?: number
  gridSize?: number
  drawOutOfBound?: boolean
  shrinkToFit?: boolean
  layoutAnimation?: boolean
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  theme: 'default',
  loading: false,
  shape: 'circle',
  sizeRange: () => [12, 60],
  rotationRange: () => [-90, 90],
  rotationStep: 45,
  gridSize: 8,
  drawOutOfBound: false,
  shrinkToFit: false,
  layoutAnimation: true
})

const chartOption = computed<EChartsOption>(() => {
  const { data, title, shape, sizeRange, rotationRange, rotationStep, gridSize, drawOutOfBound, shrinkToFit, layoutAnimation, colors } = props

  const defaultColors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666',
    '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
  ]
  const colorArray = colors || defaultColors

  return {
    title: title ? {
      text: title,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    } : undefined,
    tooltip: {
      show: true,
      formatter: (params: any) => {
        return `${params.name}: ${params.value}`
      }
    },
    series: [{
      type: 'wordCloud',
      shape,
      sizeRange,
      rotationRange,
      rotationStep,
      gridSize,
      drawOutOfBound,
      shrinkToFit,
      layoutAnimation,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          return colorArray[Math.floor(Math.random() * colorArray.length)]
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          textShadowBlur: 10,
          textShadowColor: '#333'
        }
      },
      data: data.map(item => ({
        name: item.name,
        value: item.value,
        textStyle: item.textStyle,
        emphasis: item.emphasis
      }))
    }]
  }
})
</script>

<style scoped lang="scss">
// 词云图特定样式如果需要
</style>
