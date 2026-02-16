<template>
  <aside class="component-panel" :class="{ collapsed }">
    <div class="panel-header">
      <h3 class="panel-title">
        <i class="icon-component" />
        <span>组件库</span>
      </h3>
      <button class="collapse-btn" @click="toggleCollapse">
        <i :class="collapsed ? 'icon-chevron-right' : 'icon-chevron-left'" />
      </button>
    </div>
    
    <div v-show="!collapsed" class="panel-body">
      <!-- 组件分类 -->
      <div class="component-categories">
        <div
          v-for="category in componentCategories"
          :key="category.id"
          class="category-item"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          <i :class="category.icon" />
          <span>{{ category.name }}</span>
        </div>
      </div>
      
      <!-- 组件列表 -->
      <div class="component-list">
        <div class="search-box">
          <i class="icon-search" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索组件..."
          />
        </div>
        
        <div class="components-grid">
          <div
            v-for="component in filteredComponents"
            :key="component.id"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart(component, $event)"
            @click="handleComponentClick(component)"
          >
            <div class="component-icon">
              <i :class="component.icon" />
            </div>
            <span class="component-name">{{ component.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ComponentCategory {
  id: string
  name: string
  icon: string
}

interface ComponentDefinition {
  id: string
  name: string
  icon: string
  category: string
  description?: string
}

// Props
interface Props {
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

// Emits
const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'dragStart': [component: ComponentDefinition, event: DragEvent]
  'componentClick': [component: ComponentDefinition]
}>()

// 组件分类
const componentCategories: ComponentCategory[] = [
  { id: 'basic', name: '基础', icon: 'icon-square' },
  { id: 'chart', name: '图表', icon: 'icon-chart' },
  { id: 'text', name: '文本', icon: 'icon-text' },
  { id: 'media', name: '媒体', icon: 'icon-image' },
  { id: 'container', name: '容器', icon: 'icon-layout' },
  { id: 'decoration', name: '装饰', icon: 'icon-star' },
]

// 组件列表
const componentList: ComponentDefinition[] = [
  // 基础组件
  { id: 'basic-rect', name: '矩形', icon: 'icon-square', category: 'basic' },
  { id: 'basic-circle', name: '圆形', icon: 'icon-circle', category: 'basic' },
  { id: 'basic-line', name: '线条', icon: 'icon-minus', category: 'basic' },
  
  // 图表组件
  { id: 'chart-line', name: '折线图', icon: 'icon-trending-up', category: 'chart' },
  { id: 'chart-bar', name: '柱状图', icon: 'icon-bar-chart', category: 'chart' },
  { id: 'chart-pie', name: '饼图', icon: 'icon-pie-chart', category: 'chart' },
  { id: 'chart-scatter', name: '散点图', icon: 'icon-scatter', category: 'chart' },
  { id: 'chart-radar', name: '雷达图', icon: 'icon-radar', category: 'chart' },
  { id: 'chart-gauge', name: '仪表盘', icon: 'icon-gauge', category: 'chart' },
  
  // 文本组件
  { id: 'text-plain', name: '文本', icon: 'icon-text', category: 'text' },
  { id: 'text-title', name: '标题', icon: 'icon-heading', category: 'text' },
  { id: 'text-number', name: '数字', icon: 'icon-number', category: 'text' },
  { id: 'text-time', name: '时间', icon: 'icon-clock', category: 'text' },
  
  // 媒体组件
  { id: 'media-image', name: '图片', icon: 'icon-image', category: 'media' },
  { id: 'media-video', name: '视频', icon: 'icon-video', category: 'media' },
  { id: 'media-icon', name: '图标', icon: 'icon-smile', category: 'media' },
  
  // 容器组件
  { id: 'container-div', name: '容器', icon: 'icon-layout', category: 'container' },
  { id: 'container-card', name: '卡片', icon: 'icon-card', category: 'container' },
  { id: 'container-tabs', name: '标签页', icon: 'icon-tabs', category: 'container' },
  { id: 'container-carousel', name: '轮播', icon: 'icon-carousel', category: 'container' },
  
  // 装饰组件
  { id: 'decoration-border', name: '边框', icon: 'icon-border', category: 'decoration' },
  { id: 'decoration-bg', name: '背景', icon: 'icon-background', category: 'decoration' },
  { id: 'decoration-particle', name: '粒子', icon: 'icon-sparkles', category: 'decoration' },
]

// 状态
const activeCategory = ref('basic')
const searchQuery = ref('')

// 计算属性
const filteredComponents = computed(() => {
  let components = componentList.filter(c => c.category === activeCategory.value)
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    components = components.filter(c => 
      c.name.toLowerCase().includes(query)
    )
  }
  
  return components
})

// 方法
function toggleCollapse() {
  emit('update:collapsed', !props.collapsed)
}

function handleDragStart(component: ComponentDefinition, event: DragEvent) {
  emit('dragStart', component, event)
}

function handleComponentClick(component: ComponentDefinition) {
  emit('componentClick', component)
}
</script>

<style lang="scss" scoped>
.component-panel {
  width: 280px;
  height: 100%;
  background-color: var(--color-bg-elevated);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-normal);

  &.collapsed {
    width: 48px;

    .panel-header {
      justify-content: center;
      padding: 12px 0;

      .panel-title {
        display: none;
      }
    }
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);

  i {
    font-size: 16px;
  }
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--duration-fast);

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }
}

.panel-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.component-categories {
  display: flex;
  padding: 8px;
  gap: 4px;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);

  &::-webkit-scrollbar {
    height: 4px;
  }
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  white-space: nowrap;

  i {
    font-size: 20px;
  }

  span {
    font-size: var(--font-size-xs);
  }

  &:hover {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
  }

  &.active {
    background-color: rgba(24, 144, 255, 0.1);
    color: var(--color-primary);
  }
}

.component-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.search-box {
  position: relative;
  margin-bottom: 12px;

  i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-tertiary);
    font-size: 14px;
  }

  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    font-size: var(--font-size-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);

    &::placeholder {
      color: var(--color-text-tertiary);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  cursor: grab;
  transition: all var(--duration-fast);

  &:hover {
    border-color: var(--color-primary);
    background-color: rgba(24, 144, 255, 0.05);
  }

  &:active {
    cursor: grabbing;
  }

  .component-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background-color: rgba(24, 144, 255, 0.1);
    color: var(--color-primary);

    i {
      font-size: 16px;
    }
  }

  .component-name {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}
</style>
