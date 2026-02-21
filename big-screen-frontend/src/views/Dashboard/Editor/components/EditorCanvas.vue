<template>
  <div class="editor-canvas" ref="canvasContainerRef" @mousedown="handleContainerClick">
    <!-- 画布 -->
    <div
      class="canvas-stage"
      :style="stageStyle"
      @drop="handleDrop"
      @dragover.prevent
      @mousedown.stop
    >
      <!-- 网格背景 -->
      <GridBackground v-if="showGrid && !isPreview" :width="canvasWidth" :height="canvasHeight" :grid-size="gridSize" />
      
      <!-- 背景层 -->
      <div class="canvas-background" :style="backgroundStyle"></div>

      <!-- 组件层 -->
      <div class="components-layer">
        <CanvasComponent
          v-for="component in sortedComponents"
          :key="component.id"
          :component="component"
          :is-selected="component.id === selectedId"
          :is-preview="isPreview"
          :zoom="zoom"
          :grid-size="gridSize"
          @select="handleComponentSelect"
          @move="handleComponentMove"
          @resize="handleComponentResize"
          @copy="handleComponentCopy"
          @delete="handleComponentDelete"
        />
      </div>

      <!-- 选中框 -->
      <SelectionBox v-if="isSelecting" :box="selectionBox" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import GridBackground from './GridBackground.vue'
import CanvasComponent from './CanvasComponent.vue'
import SelectionBox from './SelectionBox.vue'
import type { Dashboard, DashboardComponent, ComponentType } from '@/types/dashboard'
import { snapToGrid } from '@/utils/editor'

interface Props {
  dashboard: Dashboard
  zoom: number
  showGrid: boolean
  gridSize: number
  selectedId: string | null
  isPreview?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'component-select': [id: string | null]
  'component-move': [id: string, x: number, y: number]
  'component-resize': [id: string, width: number, height: number]
  'canvas-drop': [event: DragEvent, x: number, y: number]
  'canvas-click': []
  'component-copy': [id: string]
  'component-delete': [id: string]
}>()

// ============ Refs ============
const canvasContainerRef = ref<HTMLElement>()
const isSelecting = ref(false)
const selectionBox = ref({ x: 0, y: 0, width: 0, height: 0 })

// ============ Computed ============
const canvasWidth = computed(() => props.dashboard.width)
const canvasHeight = computed(() => props.dashboard.height)

const stageStyle = computed(() => ({
  width: `${canvasWidth.value}px`,
  height: `${canvasHeight.value}px`,
  transform: `scale(${props.zoom})`,
  transformOrigin: 'center center'
}))

const backgroundStyle = computed(() => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: props.dashboard.backgroundColor,
  backgroundImage: props.dashboard.backgroundImage ? `url(${props.dashboard.backgroundImage})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  zIndex: 0
}))

const sortedComponents = computed(() => {
  return [...props.dashboard.components].sort((a, b) => a.zIndex - b.zIndex)
})

// ============ 方法 ============
function handleContainerClick(event: MouseEvent) {
  // 点击空白处取消选中
  if (event.target === canvasContainerRef.value) {
    emit('component-select', null)
    emit('canvas-click')
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const scale = props.zoom
  
  let x = (event.clientX - rect.left) / scale
  let y = (event.clientY - rect.top) / scale
  
  // 网格对齐
  if (props.showGrid) {
    x = snapToGrid(x, props.gridSize)
    y = snapToGrid(y, props.gridSize)
  }
  
  emit('canvas-drop', event, x, y)
}

function handleComponentSelect(id: string) {
  emit('component-select', id)
}

function handleComponentMove(id: string, x: number, y: number) {
  // 网格对齐
  let finalX = x
  let finalY = y
  if (props.showGrid) {
    finalX = snapToGrid(x, props.gridSize)
    finalY = snapToGrid(y, props.gridSize)
  }
  
  emit('component-move', id, finalX, finalY)
}

function handleComponentResize(id: string, width: number, height: number) {
  // 网格对齐
  let finalWidth = width
  let finalHeight = height
  if (props.showGrid) {
    finalWidth = snapToGrid(width, props.gridSize)
    finalHeight = snapToGrid(height, props.gridSize)
  }
  
  // 最小尺寸限制
  finalWidth = Math.max(finalWidth, 20)
  finalHeight = Math.max(finalHeight, 20)
  
  emit('component-resize', id, finalWidth, finalHeight)
}

function handleComponentCopy(id: string) {
  emit('component-copy', id)
}

function handleComponentDelete(id: string) {
  emit('component-delete', id)
}
</script>

<style scoped lang="scss">
.editor-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 24px;
  background: var(--color-fill-base);
}

.canvas-stage {
  position: relative;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.canvas-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.components-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}
</style>
