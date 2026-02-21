<template>
  <div class="component-library">
    <div class="library-header">
      <h3 class="library-title">
        <el-icon><Menu /></el-icon>
        组件库
      </h3>
    </div>

    <div class="library-content">
      <!-- 文本组件 -->
      <div class="component-group">
        <div class="group-title" @click="toggleGroup('text')">
          <el-icon><Document /></el-icon>
          <span>文本组件</span>
          <el-icon class="arrow" :class="{ 'is-expanded': expandedGroups.text }">
            <ArrowDown />
          </el-icon>
        </div>
        <div class="group-items" v-show="expandedGroups.text">
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.TEXT, 'title')"
            @click="$emit('select', ComponentType.TEXT)"
          >
            <div class="item-icon">
              <el-icon><Title /></el-icon>
            </div>
            <div class="item-info">
              <span class="item-name">标题</span>
              <span class="item-desc">大标题文本</span>
            </div>
          </div>
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.TEXT, 'paragraph')"
            @click="$emit('select', ComponentType.TEXT)"
          >
            <div class="item-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="item-info">
              <span class="item-name">段落</span>
              <span class="item-desc">正文文本</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表组件 -->
      <div class="component-group">
        <div class="group-title" @click="toggleGroup('chart')">
          <el-icon><TrendCharts /></el-icon>
          <span>图表组件</span>
          <el-icon class="arrow" :class="{ 'is-expanded': expandedGroups.chart }">
            <ArrowDown />
          </el-icon>
        </div>
        <div class="group-items" v-show="expandedGroups.chart">
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'bar')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="3" y="10" width="4" height="11" fill="currentColor"/>
                <rect x="10" y="6" width="4" height="15" fill="currentColor"/>
                <rect x="17" y="14" width="4" height="7" fill="currentColor"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">柱状图</span>
              <span class="item-desc">垂直柱状图</span>
            </div>
          </div>
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'line')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M3 17 L8 12 L13 15 L21 7" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">折线图</span>
              <span class="item-desc">趋势折线图</span>
            </div>
          </div>
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'pie')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M12 3 A9 9 0 0 1 21 12 L12 12 Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">饼图</span>
              <span class="item-desc">占比饼图</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 指标组件 -->
      <div class="component-group">
        <div class="group-title" @click="toggleGroup('metric')">
          <el-icon><DataLine /></el-icon>
          <span>指标组件</span>
          <el-icon class="arrow" :class="{ 'is-expanded': expandedGroups.metric }">
            <ArrowDown />
          </el-icon>
        </div>
        <div class="group-items" v-show="expandedGroups.metric">
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.METRIC)"
            @click="$emit('select', ComponentType.METRIC)"
          >
            <div class="item-icon">
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="item-info">
              <span class="item-name">数字指标</span>
              <span class="item-desc">关键数值展示</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片组件 -->
      <div class="component-group">
        <div class="group-title" @click="toggleGroup('image')">
          <el-icon><Picture /></el-icon>
          <span>图片组件</span>
          <el-icon class="arrow" :class="{ 'is-expanded': expandedGroups.image }">
            <ArrowDown />
          </el-icon>
        </div>
        <div class="group-items" v-show="expandedGroups.image">
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.IMAGE, 'image')"
            @click="$emit('select', ComponentType.IMAGE)"
          >
            <div class="item-icon">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="item-info">
              <span class="item-name">图片</span>
              <span class="item-desc">图片展示</span>
            </div>
          </div>
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.IMAGE, 'background')"
            @click="$emit('select', ComponentType.IMAGE)"
          >
            <div class="item-icon">
              <el-icon><Image /></el-icon>
            </div>
            <div class="item-info">
              <span class="item-name">背景图</span>
              <span class="item-desc">背景图片</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  Menu, Document, EditPen, ArrowDown, 
  TrendCharts, DataLine, Picture, Odometer 
} from '@element-plus/icons-vue'

// Title 和 Image 不存在，使用替代图标
const Title = EditPen
const Image = Picture
import { ComponentType } from '@/types/dashboard'

// Emits
const emit = defineEmits<{
  (e: 'drag-start', event: DragEvent, type: ComponentType, subType?: string): void
  (e: 'select', type: ComponentType): void
}>()

// 展开状态
const expandedGroups = reactive({
  text: true,
  chart: true,
  metric: false,
  image: false
})

// 切换展开
const toggleGroup = (group: keyof typeof expandedGroups) => {
  expandedGroups[group] = !expandedGroups[group]
}

// 拖拽处理
const handleDragStart = (event: DragEvent, type: ComponentType, subType?: string) => {
  emit('drag-start', event, type, subType)
}
</script>

<style scoped>
.component-library {
  width: 240px;
  height: 100%;
  background: var(--bg-color, #1a1a2e);
  border-right: 1px solid var(--border-color, #2a2a4a);
  display: flex;
  flex-direction: column;
}

.library-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color, #2a2a4a);
}

.library-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #e0e0e0);
  margin: 0;
}

.library-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.component-group {
  margin-bottom: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  color: var(--text-secondary, #888);
  font-size: 13px;
  transition: all 0.2s;
}

.group-title:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-color, #e0e0e0);
}

.group-title .arrow {
  margin-left: auto;
  transition: transform 0.2s;
}

.group-title .arrow.is-expanded {
  transform: rotate(180deg);
}

.group-items {
  padding: 0 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  margin: 4px 0;
}

.component-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.component-item:active {
  cursor: grabbing;
}

.item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.15);
  border-radius: 6px;
  color: #409eff;
  font-size: 18px;
}

.item-icon.chart-icon {
  background: rgba(103, 194, 58, 0.15);
  color: #67c23a;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 13px;
  color: var(--text-color, #e0e0e0);
  font-weight: 500;
}

.item-desc {
  font-size: 11px;
  color: var(--text-secondary, #888);
}
</style>
