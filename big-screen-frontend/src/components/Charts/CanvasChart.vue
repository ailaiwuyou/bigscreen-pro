<template>
  <div 
    class="canvas-chart" 
    ref="containerRef"
    :style="containerStyle"
    @click="handleCanvasClick"
  >
    <!-- 背景网格 -->
    <div v-if="showGrid" class="canvas-grid">
      <div 
        v-for="i in (height / gridSize)" 
        :key="'row-' + i" 
        class="grid-row"
      />
      <div 
        v-for="i in (width / gridSize)" 
        :key="'col-' + i" 
        class="grid-col"
      />
    </div>
    
    <!-- 自由元素 -->
    <div
      v-for="element in elements"
      :key="element.id"
      class="canvas-element"
      :class="{ selected: selectedElement?.id === element.id }"
      :style="getElementStyle(element)"
      @click.stop="selectElement(element)"
      @mousedown="startDrag($event, element)"
    >
      <!-- 文本元素 -->
      <div v-if="element.type === 'text'" class="element-text">
        {{ element.content }}
      </div>
      
      <!-- 图片元素 -->
      <img 
        v-else-if="element.type === 'image'" 
        :src="element.src" 
        class="element-image"
        :style="getImageStyle(element)"
      />
      
      <!-- 形状元素 -->
      <div 
        v-else-if="element.type === 'shape'" 
        class="element-shape"
        :style="getShapeStyle(element)"
      />
      
      <!-- 图表元素 -->
      <div v-else-if="element.type === 'chart'" class="element-chart">
        <!-- 嵌入mini图表 -->
        <slot :name="element.chartType" :data="element.data" />
      </div>
      
      <!-- 调整大小手柄 -->
      <template v-if="selectedElement?.id === element.id && editable">
        <div 
          v-for="handle in resizeHandles" 
          :key="handle"
          class="resize-handle"
          :class="'handle-' + handle"
          @mousedown.stop="startResize($event, element, handle)"
        />
      </template>
    </div>
    
    <!-- 辅助线 -->
    <svg v-if="showGuides" class="canvas-guides">
      <line 
        v-for="guide in horizontalGuides" 
        :key="'h-' + guide.y"
        :x1="0" :y1="guide.y" :x2="width" :y2="guide.y"
        class="guide-line"
      />
      <line 
        v-for="guide in verticalGuides" 
        :key="'v-' + guide.x"
        :x1="guide.x" :y1="0" :x2="guide.x" :y2="height"
        class="guide-line"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'chart'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  // 文本属性
  content?: string
  fontSize?: number
  fontColor?: string
  fontFamily?: string
  // 图片属性
  src?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  // 形状属性
  shapeType?: 'rect' | 'circle' | 'triangle'
  fill?: string
  stroke?: string
  strokeWidth?: number
  // 图表属性
  chartType?: string
  data?: any
}

interface Props {
  width?: number
  height?: number
  backgroundColor?: string
  backgroundImage?: string
  showGrid?: boolean
  gridSize?: number
  gridColor?: string
  showGuides?: boolean
  editable?: boolean
  snapToGrid?: boolean
  elements?: CanvasElement[]
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  backgroundImage: '',
  showGrid: false,
  gridSize: 20,
  gridColor: '#e0e0e0',
  showGuides: false,
  editable: false,
  snapToGrid: false,
  elements: () => []
})

const emit = defineEmits<{
  (e: 'update:elements', elements: CanvasElement[]): void
  (e: 'select', element: CanvasElement): void
  (e: 'change', element: CanvasElement): void
  (e: 'click', event: MouseEvent): void
}>()

const containerRef = ref<HTMLElement>()
const selectedElement = ref<CanvasElement | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const elementStart = ref({ x: 0, y: 0, width: 0, height: 0 })
const resizeHandle = ref('')

const horizontalGuides = ref<{ y: number }[]>([])
const verticalGuides = ref<{ x: number }[]>([])

const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

const containerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  backgroundColor: props.backgroundColor,
  backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
  backgroundSize: 'cover',
  position: 'relative' as const,
  overflow: 'hidden'
}))

const getElementStyle = (element: CanvasElement) => ({
  position: 'absolute' as const,
  left: `${element.x}px`,
  top: `${element.y}px`,
  width: `${element.width}px`,
  height: `${element.height}px`,
  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  cursor: props.editable ? 'move' : 'default'
})

const getImageStyle = (element: CanvasElement) => ({
  objectFit: element.objectFit || 'cover'
})

const getShapeStyle = (element: CanvasElement) => {
  const style: Record<string, any> = {
    width: '100%',
    height: '100%',
    backgroundColor: element.fill || 'transparent',
    borderColor: element.stroke || 'transparent',
    borderWidth: `${element.strokeWidth || 0}px`
  }
  
  if (element.shapeType === 'circle') {
    style.borderRadius = '50%'
  } else if (element.shapeType === 'triangle') {
    style.width = 0
    style.height = 0
    style.backgroundColor = 'transparent'
    style.borderLeft = `${element.width / 2}px solid transparent`
    style.borderRight = `${element.width / 2}px solid transparent`
    style.borderBottom = `${element.height}px solid ${element.fill || '#5470c6'}`
  }
  
  return style
}

const snapValue = (value: number) => {
  if (!props.snapToGrid) return value
  return Math.round(value / props.gridSize) * props.gridSize
}

const selectElement = (element: CanvasElement) => {
  selectedElement.value = element
  emit('select', element)
}

const handleCanvasClick = (event: MouseEvent) => {
  if (!isDragging.value && !isResizing.value) {
    selectedElement.value = null
    emit('click', event)
  }
}

const startDrag = (event: MouseEvent, element: CanvasElement) => {
  if (!props.editable) return
  
  isDragging.value = true
  dragStart.value = { x: event.clientX, y: event.clientY }
  elementStart.value = { 
    x: element.x, 
    y: element.y, 
    width: element.width, 
    height: element.height 
  }
  selectedElement.value = element
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (event: MouseEvent) => {
  if (!isDragging.value || !selectedElement.value) return
  
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  
  const newX = snapValue(elementStart.value.x + dx)
  const newY = snapValue(elementStart.value.y + dy)
  
  selectedElement.value.x = Math.max(0, Math.min(props.width - selectedElement.value.width, newX))
  selectedElement.value.y = Math.max(0, Math.min(props.height - selectedElement.value.height, newY))
  
  emit('change', selectedElement.value)
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const startResize = (event: MouseEvent, element: CanvasElement, handle: string) => {
  if (!props.editable) return
  
  isResizing.value = true
  resizeHandle.value = handle
  dragStart.value = { x: event.clientX, y: event.clientY }
  elementStart.value = { 
    x: element.x, 
    y: element.y, 
    width: element.width, 
    height: element.height 
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value || !selectedElement.value) return
  
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  
  const el = selectedElement.value
  const minSize = 20
  
  switch (resizeHandle.value) {
    case 'e':
      el.width = Math.max(minSize, elementStart.value.width + dx)
      break
    case 'w':
      el.width = Math.max(minSize, elementStart.value.width - dx)
      el.x = elementStart.value.x + (elementStart.value.width - el.width)
      break
    case 's':
      el.height = Math.max(minSize, elementStart.value.height + dy)
      break
    case 'n':
      el.height = Math.max(minSize, elementStart.value.height - dy)
      el.y = elementStart.value.y + (elementStart.value.height - el.height)
      break
    case 'se':
      el.width = Math.max(minSize, elementStart.value.width + dx)
      el.height = Math.max(minSize, elementStart.value.height + dy)
      break
    case 'sw':
      el.width = Math.max(minSize, elementStart.value.width - dx)
      el.height = Math.max(minSize, elementStart.value.height + dy)
      el.x = elementStart.value.x + (elementStart.value.width - el.width)
      break
    case 'ne':
      el.width = Math.max(minSize, elementStart.value.width + dx)
      el.height = Math.max(minSize, elementStart.value.height - dy)
      el.y = elementStart.value.y + (elementStart.value.height - el.height)
      break
    case 'nw':
      el.width = Math.max(minSize, elementStart.value.width - dx)
      el.height = Math.max(minSize, elementStart.value.height - dy)
      el.x = elementStart.value.x + (elementStart.value.width - el.width)
      el.y = elementStart.value.y + (elementStart.value.height - el.height)
      break
  }
  
  emit('change', el)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="scss">
.canvas-chart {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.canvas-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  
  .grid-row {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 19px,
      #e0e0e0 19px,
      #e0e0e0 20px
    );
  }
  
  .grid-col {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: repeating-linear-gradient(
      180deg,
      transparent,
      transparent 19px,
      #e0e0e0 19px,
      #e0e0e0 20px
    );
  }
}

.canvas-element {
  position: absolute;
  user-select: none;
  
  &.selected {
    outline: 2px solid #409eff;
    outline-offset: -1px;
  }
}

.element-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-all;
  padding: 4px;
  box-sizing: border-box;
}

.element-image {
  width: 100%;
  height: 100%;
}

.element-shape {
  box-sizing: border-box;
}

.element-chart {
  width: 100%;
  height: 100%;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #409eff;
  border: 1px solid #fff;
  border-radius: 2px;
  
  &.handle-n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
  &.handle-s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
  &.handle-e { right: -5px; top: 50%; transform: translateY(-50%); cursor: e-resize; }
  &.handle-w { left: -5px; top: 50%; transform: translateY(-50%); cursor: w-resize; }
  &.handle-nw { top: -5px; left: -5px; cursor: nw-resize; }
  &.handle-ne { top: -5px; right: -5px; cursor: ne-resize; }
  &.handle-sw { bottom: -5px; left: -5px; cursor: sw-resize; }
  &.handle-se { bottom: -5px; right: -5px; cursor: se-resize; }
}

.canvas-guides {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .guide-line {
    stroke: #ff6b6b;
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }
}
</style>
