<template>
  <div class="editor-toolbar">
    <!-- 左侧：返回和标题 -->
    <div class="toolbar-left">
      <el-button :icon="ArrowLeft" text @click="$emit('back')">
        返回
      </el-button>
      <el-divider direction="vertical" />
      <div class="dashboard-info">
        <el-input
          v-model="localName"
          class="name-input"
          placeholder="仪表盘名称"
          @blur="handleNameChange"
        />
        <span class="resolution">{{ dashboard.width }} × {{ dashboard.height }}</span>
      </div>
    </div>

    <!-- 中间：操作按钮 -->
    <div class="toolbar-center">
      <el-button-group>
        <el-button
          :icon="RefreshLeft"
          :disabled="!canUndo"
          title="撤销 (Ctrl+Z)"
          @click="$emit('undo')"
        />
        <el-button
          :icon="RefreshRight"
          :disabled="!canRedo"
          title="重做 (Ctrl+Shift+Z)"
          @click="$emit('redo')"
        />
      </el-button-group>

      <el-divider direction="vertical" />

      <el-button-group>
        <el-button :icon="Grid" title="网格" @click="toggleGrid" />
        <el-button :icon="FullScreen" title="全屏" @click="handleFullscreen" />
      </el-button-group>
    </div>

    <!-- 右侧：预览和保存 -->
    <div class="toolbar-right">
      <el-button
        :icon="View"
        :type="isPreview ? 'primary' : 'default'"
        @click="$emit('toggle-preview')"
      >
        预览
      </el-button>
      <el-button type="primary" :icon="Save" :loading="isSaving" @click="handleSave">
        保存
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ArrowLeft,
  RefreshLeft,
  RefreshRight,
  Grid,
  FullScreen,
  View,
  Document
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Dashboard } from '@/types/dashboard'

interface Props {
  dashboard: Dashboard
  canUndo: boolean
  canRedo: boolean
  zoom: number
  isPreview?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: []
  undo: []
  redo: []
  'zoom-change': [zoom: number]
  'toggle-preview': []
  back: []
}>()

// ============ 状态 ============
const localName = ref(props.dashboard.name)
const isSaving = ref(false)
const showGrid = ref(true)

// ============ Watch ============
watch(() => props.dashboard.name, (newName) => {
  localName.value = newName
})

// ============ 方法 ============
function handleNameChange() {
  if (localName.value.trim()) {
    props.dashboard.name = localName.value.trim()
  } else {
    localName.value = props.dashboard.name
  }
}

async function handleSave() {
  isSaving.value = true
  try {
    await emit('save')
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

function toggleGrid() {
  showGrid.value = !showGrid.value
  // 触发事件通知父组件
}

function handleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--box-shadow-sm);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.dashboard-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .name-input {
    width: 200px;

    :deep(.el-input__inner) {
      padding: 0;
      border: none;
      font-size: 16px;
      font-weight: 600;
      background: transparent;

      &:hover,
      &:focus {
        background: var(--color-fill-base);
        padding: 0 8px;
      }
    }
  }

  .resolution {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.toolbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
}
</style>
