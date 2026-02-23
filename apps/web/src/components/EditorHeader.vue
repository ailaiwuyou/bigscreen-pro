<template>
  <header class="editor-header">
    <div class="header-left">
      <div class="logo">
        <img src="/logo.svg" alt="BigScreen Pro" />
        <span>BigScreen Pro</span>
      </div>
      <div class="project-info">
        <h1 class="project-name">{{ projectName }}</h1>
        <span class="page-name">{{ pageName }}</span>
        <span v-if="!isSaved" class="unsaved-indicator">*</span>
      </div>
    </div>

    <div class="header-center">
      <div class="toolbar">
        <button
          v-for="tool in toolbarTools"
          :key="tool.id"
          class="toolbar-btn"
          :class="{ active: activeTool === tool.id }"
          :title="tool.label"
          @click="handleToolClick(tool.id)"
        >
          <i :class="tool.icon" />
        </button>
      </div>
    </div>

    <div class="header-right">
      <div class="actions">
        <button class="action-btn" @click="$emit('preview')">
          <i class="icon-preview" />
          <span>预览</span>
        </button>
        <button class="action-btn primary" @click="$emit('save')">
          <i class="icon-save" />
          <span>保存</span>
        </button>
        <button class="action-btn success" @click="$emit('publish')">
          <i class="icon-publish" />
          <span>发布</span>
        </button>
      </div>

      <div class="user-menu">
        <button class="user-btn">
          <div class="user-avatar">U</div>
          <i class="icon-dropdown" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  projectName: string;
  pageName: string;
  isSaved: boolean;
}

defineProps<Props>();

defineEmits<{
  save: [];
  preview: [];
  publish: [];
}>();

// 工具栏
const activeTool = ref("select");

const toolbarTools = [
  { id: "select", icon: "icon-cursor", label: "选择工具 (V)" },
  { id: "hand", icon: "icon-hand", label: "抓手工具 (H)" },
  { id: "rectangle", icon: "icon-rectangle", label: "矩形 (R)" },
  { id: "text", icon: "icon-text", label: "文字 (T)" },
  { id: "image", icon: "icon-image", label: "图片 (I)" },
];

function handleToolClick(toolId: string) {
  activeTool.value = toolId;
}
</script>

<style lang="scss" scoped>
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  background-color: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 32px;
    height: 32px;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.project-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .project-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .page-name {
    font-size: 12px;
    color: var(--color-text-secondary);
    padding: 2px 8px;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
  }

  .unsaved-indicator {
    font-size: 14px;
    color: var(--color-warning);
  }
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);

  &:hover {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  &.active {
    background-color: var(--color-primary);
    color: white;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--duration-fast);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &.primary {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: white;

    &:hover {
      background-color: var(--color-primary-dark);
      border-color: var(--color-primary-dark);
    }
  }

  &.success {
    background-color: var(--color-success);
    border-color: var(--color-success);
    color: white;

    &:hover {
      background-color: #389e0d;
      border-color: #389e0d;
    }
  }
}

.user-menu {
  .user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    border: none;
    border-radius: var(--radius-md);
    background-color: transparent;
    cursor: pointer;
    transition: background-color var(--duration-fast);

    &:hover {
      background-color: var(--color-bg-secondary);
    }

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
  }
}
</style>
