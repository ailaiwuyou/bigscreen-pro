<template>
  <div class="editor-page" :class="{ 'is-preview': isPreview }">
    <!-- 顶部工具栏 -->
    <EditorToolbar
      v-if="!isPreview"
      :dashboard="dashboard"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :zoom="zoom"
      @save="handleSave"
      @undo="handleUndo"
      @redo="handleRedo"
      @zoom-change="handleZoomChange"
      @toggle-preview="handleTogglePreview"
      @back="handleBack"
    />

    <!-- 编辑器主体 -->
    <div class="editor-body">
      <!-- 左侧组件库 -->
      <ComponentLibrary
        v-if="!isPreview"
        @drag-start="handleLibraryDragStart"
      />

      <!-- 中间画布区域 -->
      <div class="canvas-wrapper" ref="canvasWrapperRef">
        <EditorCanvas
          ref="canvasRef"
          :dashboard="dashboard"
          :zoom="zoom"
          :show-grid="showGrid"
          :grid-size="gridSize"
          :selected-id="selectedId"
          :is-preview="isPreview"
          @component-select="handleComponentSelect"
          @component-move="handleComponentMove"
          @component-resize="handleComponentResize"
          @canvas-drop="handleCanvasDrop"
          @canvas-click="handleCanvasClick"
        />

        <!-- 缩放控制 -->
        <div class="zoom-controls" v-if="!isPreview">
          <el-button-group>
            <el-button :icon="ZoomOut" @click="handleZoomOut" />
            <el-button class="zoom-text">{{ Math.round(zoom * 100) }}%</el-button>
            <el-button :icon="ZoomIn" @click="handleZoomIn" />
          </el-button-group>
          <el-button :icon="FullScreen" @click="handleFitToScreen" title="自适应" />
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <PropertyPanel
        v-if="!isPreview"
        :component="selectedComponent"
        :dashboard="dashboard"
        @update="handleComponentUpdate"
        @delete="handleComponentDelete"
        @copy="handleComponentCopy"
        @lock="handleComponentLock"
        @layer-change="handleLayerChange"
      />
    </div>

    <!-- 预览模式退出按钮 -->
    <div v-if="isPreview" class="preview-exit" @click="handleTogglePreview">
      <el-icon><Close /></el-icon>
      <span>退出预览</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ZoomIn, ZoomOut, FullScreen, Close } from '@element-plus/icons-vue'

import EditorToolbar from './components/EditorToolbar.vue'
import ComponentLibrary from './components/ComponentLibrary.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import PropertyPanel from './components/PropertyPanel.vue'

import { useDashboardStore } from '@/stores/dashboard'
import type { 
  Dashboard, 
  DashboardComponent, 
  ComponentType,
  DragInfo 
} from '@/types/dashboard'
import {
  generateId,
  createDefaultComponent,
  cloneComponent,
  calculateOptimalZoom,
  deepCloneDashboard,
  createHistoryState,
  addHistoryState
} from '@/utils/editor'

// ============ 路由和Store ============
const route = useRoute()
const router = useRouter()
const dashboardStore = useDashboardStore()

// ============ Refs ============
const canvasWrapperRef = ref<HTMLElement>()
const canvasRef = ref<InstanceType<typeof EditorCanvas>>()

// ============ 状态 ============
const dashboard = ref<Dashboard>({
  id: '',
  name: '新建仪表盘',
  description: '',
  width: 1920,
  height: 1080,
  backgroundColor: '#f0f2f5',
  backgroundImage: '',
  components: [],
  status: 'draft'
})

const selectedId = ref<string | null>(null)
const zoom = ref(1)
const showGrid = ref(true)
const gridSize = ref(10)
const isPreview = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)

// 历史记录
const history = ref<{ name: string; timestamp: number; dashboard: Dashboard }[]>([])
const historyIndex = ref(-1)
const maxHistory = 50

// ============ Computed ============
const selectedComponent = computed<DashboardComponent | null>(() => {
  if (!selectedId.value) return null
  return dashboard.value.components.find(c => c.id === selectedId.value) || null
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// ============ 生命周期 ============
onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    await loadDashboard(id)
  } else {
    // 创建新仪表盘
    initNewDashboard()
  }
  
  // 初始化历史记录
  addToHistory('初始化')
  
  // 计算初始缩放
  calculateZoom()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeydown)
})

// ============ 方法 ============

/** 加载仪表盘 */
async function loadDashboard(id: string) {
  isLoading.value = true
  try {
    const data = await dashboardStore.fetchDashboard(id)
    if (data) {
      dashboard.value = deepCloneDashboard(data)
    } else {
      ElMessage.error('仪表盘不存在')
      router.push('/dashboard')
    }
  } finally {
    isLoading.value = false
  }
}

/** 初始化新仪表盘 */
function initNewDashboard() {
  dashboard.value = {
    id: generateId(),
    name: '新建仪表盘',
    description: '',
    width: 1920,
    height: 1080,
    backgroundColor: '#0A1120',
    backgroundImage: '',
    components: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/** 计算缩放 */
function calculateZoom() {
  if (!canvasWrapperRef.value) return
  
  const containerWidth = canvasWrapperRef.value.clientWidth - 48
  const containerHeight = canvasWrapperRef.value.clientHeight - 48
  
  zoom.value = calculateOptimalZoom(
    containerWidth,
    dashboard.value.width,
    0.3,
    1.5
  )
}

/** 添加到历史记录 */
function addToHistory(name: string) {
  const state = createHistoryState(name, dashboard.value)
  const result = addHistoryState(history.value, historyIndex.value, state, maxHistory)
  history.value = result.history
  historyIndex.value = result.index
}

// ============ 事件处理器 ============

/** 保存 */
async function handleSave() {
  if (isSaving.value) return
  
  isSaving.value = true
  try {
    const id = route.params.id as string
    if (id) {
      await dashboardStore.updateDashboard(id, dashboard.value)
    } else {
      const result = await dashboardStore.createDashboard({
        name: dashboard.value.name,
        description: dashboard.value.description,
        width: dashboard.value.width,
        height: dashboard.value.height,
        backgroundColor: dashboard.value.backgroundColor,
        backgroundImage: dashboard.value.backgroundImage,
        components: dashboard.value.components
      })
      if (result) {
        router.replace(`/dashboard/editor/${result.id}`)
      }
    }
    addToHistory('保存')
  } finally {
    isSaving.value = false
  }
}

/** 撤销 */
function handleUndo() {
  if (!canUndo.value) return
  historyIndex.value--
  dashboard.value = deepCloneDashboard(history.value[historyIndex.value].dashboard)
}

/** 重做 */
function handleRedo() {
  if (!canRedo.value) return
  historyIndex.value++
  dashboard.value = deepCloneDashboard(history.value[historyIndex.value].dashboard)
}

/** 缩放变化 */
function handleZoomChange(newZoom: number) {
  zoom.value = newZoom
}

/** 放大 */
function handleZoomIn() {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

/** 缩小 */
function handleZoomOut() {
  zoom.value = Math.max(zoom.value - 0.1, 0.3)
}

/** 自适应 */
function handleFitToScreen() {
  calculateZoom()
}

/** 切换预览 */
function handleTogglePreview() {
  isPreview.value = !isPreview.value
  selectedId.value = null
}

/** 返回 */
function handleBack() {
  if (history.value.length > 1) {
    ElMessageBox.confirm(
      '确定要退出编辑器吗？未保存的更改将丢失。',
      '确认退出',
      {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.back()
    }).catch(() => {})
  } else {
    router.back()
  }
}

/** 组件库拖拽开始 */
function handleLibraryDragStart(type: ComponentType) {
  // 拖拽开始处理
}

/** 选中组件 */
function handleComponentSelect(id: string | null) {
  selectedId.value = id
}

/** 移动组件 */
function handleComponentMove(id: string, x: number, y: number) {
  const component = dashboard.value.components.find(c => c.id === id)
  if (component) {
    component.x = x
    component.y = y
    addToHistory('移动组件')
  }
}

/** 调整组件大小 */
function handleComponentResize(id: string, width: number, height: number) {
  const component = dashboard.value.components.find(c => c.id === id)
  if (component) {
    component.width = width
    component.height = height
    addToHistory('调整大小')
  }
}

/** 画布拖放 */
function handleCanvasDrop(event: DragEvent, x: number, y: number) {
  const type = event.dataTransfer?.getData('component-type') as ComponentType
  if (type) {
    const newComponent = createDefaultComponent(type, x, y)
    dashboard.value.components.push(newComponent)
    selectedId.value = newComponent.id
    addToHistory('添加组件')
  }
}

/** 画布点击 */
function handleCanvasClick() {
  selectedId.value = null
}

/** 组件更新 */
function handleComponentUpdate(id: string, updates: Partial<DashboardComponent>) {
  const component = dashboard.value.components.find(c => c.id === id)
  if (component) {
    Object.assign(component, updates)
    addToHistory('更新组件')
  }
}

/** 删除组件 */
function handleComponentDelete(id: string) {
  const index = dashboard.value.components.findIndex(c => c.id === id)
  if (index > -1) {
    dashboard.value.components.splice(index, 1)
    if (selectedId.value === id) {
      selectedId.value = null
    }
    addToHistory('删除组件')
  }
}

/** 复制组件 */
function handleComponentCopy(id: string) {
  const component = dashboard.value.components.find(c => c.id === id)
  if (component) {
    const cloned = cloneComponent(component)
    dashboard.value.components.push(cloned)
    selectedId.value = cloned.id
    addToHistory('复制组件')
  }
}

/** 锁定/解锁组件 */
function handleComponentLock(id: string, locked: boolean) {
  const component = dashboard.value.components.find(c => c.id === id)
  if (component) {
    component.locked = locked
    addToHistory(locked ? '锁定组件' : '解锁组件')
  }
}

/** 层级调整 */
function handleLayerChange(id: string, direction: 'up' | 'down' | 'top' | 'bottom') {
  const components = dashboard.value.components
  const index = components.findIndex(c => c.id === id)
  if (index === -1) return

  const component = components[index]
  
  switch (direction) {
    case 'up':
      if (index < components.length - 1) {
        component.zIndex = components[index + 1].zIndex + 1
      }
      break
    case 'down':
      if (index > 0) {
        component.zIndex = Math.max(1, components[index - 1].zIndex - 1)
      }
      break
    case 'top':
      component.zIndex = Math.max(...components.map(c => c.zIndex), 0) + 1
      break
    case 'bottom':
      component.zIndex = 1
      break
  }
  
  addToHistory('调整层级')
}

/** 窗口大小变化 */
function handleResize() {
  // 可添加自适应逻辑
}

/** 键盘事件 */
function handleKeydown(event: KeyboardEvent) {
  if (isPreview.value) return
  
  // 删除
  if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId.value) {
    handleComponentDelete(selectedId.value)
  }
  
  // 复制
  if ((event.ctrlKey || event.metaKey) && event.key === 'c' && selectedId.value) {
    event.preventDefault()
    handleComponentCopy(selectedId.value)
  }
  
  // 撤销
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    if (event.shiftKey) {
      handleRedo()
    } else {
      handleUndo()
    }
  }
}
</script>

<style scoped lang="scss">
.editor-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-color);

  &.is-preview {
    .editor-body {
      height: 100vh;
    }
  }
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--color-fill-base);
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: var(--box-shadow-md);

  .zoom-text {
    min-width: 60px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }
}

.preview-exit {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 9999;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }

  .el-icon {
    font-size: 18px;
  }
}
</style>
