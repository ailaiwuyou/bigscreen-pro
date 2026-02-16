<template>
  <div class="editor-view">
    <!-- 顶部工具栏 -->
    <EditorHeader 
      :project-name="projectStore.projectName"
      :page-name="projectStore.pageName"
      :is-saved="projectStore.isSaved"
      @save="handleSave"
      @preview="handlePreview"
      @publish="handlePublish"
    />
    
    <!-- 主体区域 -->
    <div class="editor-body">
      <!-- 左侧组件面板 -->
      <ComponentPanel 
        v-model:collapsed="uiState.componentPanelCollapsed"
        @drag-start="handleComponentDragStart"
      />
      
      <!-- 中间画布区域 -->
      <div class="canvas-area">
        <CanvasToolbar 
          :zoom="canvasZoom"
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @zoom-reset="handleZoomReset"
          @zoom-fit="handleZoomFit"
        />
        
        <div ref="canvasContainer" class="canvas-container">
          <!-- 画布引擎挂载点 -->
          <div ref="canvasMount" class="canvas-mount" />
        </div>
      </div>
      
      <!-- 右侧属性面板 -->
      <PropertyPanel 
        v-model:collapsed="uiState.propertyPanelCollapsed"
        :selected-components="selectedComponents"
        @property-change="handlePropertyChange"
      />
    </div>
    
    <!-- 底部状态栏 -->
    <EditorFooter 
      :component-count="projectStore.componentCount"
      :selected-count="selectedComponentIds.length"
      :canvas-size="canvasSize"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 编辑器主视图
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { ComponentInstance, Size } from '@bigscreen/types'
import { CanvasEngine } from '@bigscreen/core'

import { useProjectStore } from '../stores/project'

// 组件导入
import EditorHeader from '../components/EditorHeader.vue'
import EditorFooter from '../components/EditorFooter.vue'
import ComponentPanel from '../components/ComponentPanel.vue'
import PropertyPanel from '../components/PropertyPanel.vue'
import CanvasToolbar from '../components/CanvasToolbar.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

// 从store中解构响应式引用
const { currentPage, canvasState } = storeToRefs(projectStore)

// ============ UI状态 ============
const uiState = ref({
  componentPanelCollapsed: false,
  propertyPanelCollapsed: false,
})

// ============ 画布相关 ============
const canvasContainer = ref<HTMLDivElement>()
const canvasMount = ref<HTMLDivElement>()
const canvasEngine = ref<CanvasEngine>()
const canvasZoom = ref(100)
const canvasSize = ref<Size>({ width: 1920, height: 1080 })

// ============ 计算属性 ============
const selectedComponentIds = computed(() => {
  return canvasState.value?.selectedIds ?? []
})

const selectedComponents = computed<ComponentInstance[]>(() => {
  if (!currentPage.value) return []
  return selectedComponentIds.value
    .map(id => currentPage.value?.components.get(id))
    .filter((c): c is ComponentInstance => c !== undefined)
})

// ============ 方法 ============

/**
 * 初始化画布引擎
 */
function initCanvasEngine() {
  if (!canvasMount.value || !currentPage.value) return
  
  // 销毁旧引擎
  if (canvasEngine.value) {
    canvasEngine.value.destroy()
  }
  
  // 创建新引擎
  canvasEngine.value = new CanvasEngine({
    container: canvasMount.value,
    width: currentPage.value.size.width,
    height: currentPage.value.size.height,
    initialScale: 0.8,
    minScale: 0.1,
    maxScale: 3,
    grid: currentPage.value.grid,
    guide: currentPage.value.guide,
    multiSelect: true,
    keyboardShortcuts: true,
  })
  
  // 更新画布状态
  updateCanvasZoom()
  
  // 监听引擎事件
  canvasEngine.value.on('viewportChange', () => {
    updateCanvasZoom()
  })
  
  canvasEngine.value.on('select', (ids) => {
    projectStore.updateCanvasState({ selectedIds: ids })
  })
  
  canvasEngine.value.on('deselect', (ids) => {
    const currentIds = canvasState.value?.selectedIds ?? []
    projectStore.updateCanvasState({ 
      selectedIds: currentIds.filter(id => !ids.includes(id))
    })
  })
}

/**
 * 更新画布缩放显示
 */
function updateCanvasZoom() {
  if (!canvasEngine.value) return
  const scale = canvasEngine.value.scale.value
  canvasZoom.value = Math.round(scale * 100)
}

/**
 * 处理保存
 */
async function handleSave() {
  try {
    await projectStore.saveProject()
    // TODO: 显示保存成功提示
  } catch (error) {
    console.error('保存失败:', error)
    // TODO: 显示保存失败提示
  }
}

/**
 * 处理预览
 */
function handlePreview() {
  if (!currentProject.value) return
  const { href } = router.resolve({
    name: 'Preview',
    params: { id: currentProject.value.id }
  })
  window.open(href, '_blank')
}

/**
 * 处理发布
 */
async function handlePublish() {
  // TODO: 实现发布逻辑
  console.log('发布项目')
}

/**
 * 处理组件拖拽开始
 */
function handleComponentDragStart(componentType: string) {
  console.log('开始拖拽组件:', componentType)
  // TODO: 实现组件拖拽逻辑
}

/**
 * 处理属性变更
 */
function handlePropertyChange(key: string, value: unknown) {
  console.log('属性变更:', key, value)
  // TODO: 实现属性更新逻辑
  projectStore.markUnsaved()
}

/**
 * 处理缩放
 */
function handleZoomIn() {
  canvasEngine.value?.getViewportManager().zoomIn()
}

function handleZoomOut() {
  canvasEngine.value?.getViewportManager().zoomOut()
}

function handleZoomReset() {
  canvasEngine.value?.getViewportManager().reset()
}

function handleZoomFit() {
  canvasEngine.value?.getViewportManager().fitToContainer()
}

// ============ 生命周期 ============

onMounted(async () => {
  const projectId = route.params.id as string
  
  if (projectId) {
    try {
      await projectStore.loadProject(projectId)
      
      // 等待DOM更新后初始化画布
      setTimeout(() => {
        initCanvasEngine()
      }, 0)
    } catch (error) {
      console.error('加载项目失败:', error)
      // TODO: 显示错误提示，跳转到首页
      router.push({ name: 'Home' })
    }
  } else {
    // 创建新项目
    await projectStore.createProject('新项目')
    
    setTimeout(() => {
      initCanvasEngine()
    }, 0)
  }
})

onUnmounted(() => {
  // 销毁画布引擎
  if (canvasEngine.value) {
    canvasEngine.value.destroy()
    canvasEngine.value = undefined
  }
})

// 监听页面变化，重新初始化画布
watch(currentPage, (newPage) => {
  if (newPage) {
    setTimeout(() => {
      initCanvasEngine()
    }, 0)
  }
})
</script>

<style lang="scss" scoped>
.editor-view {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background-color: var(--color-bg-secondary);
}

.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 20px;
}

.canvas-mount {
  position: relative;
  box-shadow: var(--shadow-xl);
}
</style>
