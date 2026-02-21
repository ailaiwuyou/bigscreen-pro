<template>
  <div class="grid-background" :style="gridStyle">
    <svg :width="width" :height="height" xmlns="http://www.w3.org/2000/svg">
      <!-- 主网格 -->
      <defs>
        <pattern
          :id="patternId"
          :width="gridSize"
          :height="gridSize"
          patternUnits="userSpaceOnUse"
        >
          <path
            :d="`M ${gridSize} 0 L 0 0 0 ${gridSize}`"
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            stroke-width="0.5"
          />
        </pattern>
        
        <!-- 大网格 -->
        <pattern
          :id="bigPatternId"
          :width="bigGridSize"
          :height="bigGridSize"
          patternUnits="userSpaceOnUse"
        >
          <path
            :d="`M ${bigGridSize} 0 L 0 0 0 ${bigGridSize}`"
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            stroke-width="1"
          />
        </pattern>
      </defs>
      
      <!-- 渲染大网格 -->
      <rect width="100%" height="100%" :fill="`url(#${bigPatternId})`" />
      <!-- 渲染小网格 -->
      <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { generateShortId } from '@/utils/editor'

interface Props {
  width: number
  height: number
  gridSize: number
}

const props = defineProps<Props>()

// 大网格尺寸
const bigGridSize = computed(() => props.gridSize * 10)

// 生成唯一pattern ID
const patternId = computed(() => `grid-${generateShortId()}`)
const bigPatternId = computed(() => `big-grid-${generateShortId()}`)

// 网格样式
const gridStyle = computed(() => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0
}))
</script>

<style scoped lang="scss">
.grid-background {
  svg {
    display: block;
  }
}
</style>
