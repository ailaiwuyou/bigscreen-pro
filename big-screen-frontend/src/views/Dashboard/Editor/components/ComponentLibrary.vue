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
          
          <!-- 趋势图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'trend')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M3 20 L7 16 L11 18 L17 10 L21 14" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M3 20 L21 20" stroke="currentColor" stroke-width="1" stroke-dasharray="4" fill="none"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">趋势图</span>
              <span class="item-desc">带趋势线</span>
            </div>
          </div>
          
          <!-- 雷达图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'radar')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" stroke="currentColor" stroke-width="2" fill="none"/>
                <polygon points="12,6 18,9 18,15 12,18 6,15 6,9" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">雷达图</span>
              <span class="item-desc">多维对比</span>
            </div>
          </div>
          
          <!-- 散点图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'scatter')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <circle cx="6" cy="18" r="2" fill="currentColor"/>
                <circle cx="10" cy="12" r="2" fill="currentColor"/>
                <circle cx="16" cy="8" r="2" fill="currentColor"/>
                <circle cx="20" cy="16" r="2" fill="currentColor"/>
                <circle cx="8" cy="6" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">散点图</span>
              <span class="item-desc">XY坐标分布</span>
            </div>
          </div>
          
          <!-- 热力图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'heatmap')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="2" y="2" width="6" height="6" fill="#5470c6"/>
                <rect x="9" y="2" width="6" height="6" fill="#91cc75"/>
                <rect x="16" y="2" width="6" height="6" fill="#fac858"/>
                <rect x="2" y="9" width="6" height="6" fill="#fac858"/>
                <rect x="9" y="9" width="6" height="6" fill="#5470c6"/>
                <rect x="16" y="9" width="6" height="6" fill="#91cc75"/>
                <rect x="2" y="16" width="6" height="6" fill="#91cc75"/>
                <rect x="9" y="16" width="6" height="6" fill="#fac858"/>
                <rect x="16" y="16" width="6" height="6" fill="#5470c6"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">热力图</span>
              <span class="item-desc">颜色深浅表示</span>
            </div>
          </div>
          
          <!-- 仪表盘 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'gauge')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M12 2 A10 10 0 0 0 2 12" stroke="#ddd" stroke-width="2" fill="none"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">仪表盘</span>
              <span class="item-desc">百分比指标</span>
            </div>
          </div>
          
          <!-- K线图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'candlestick')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="4" y="6" width="4" height="8" fill="#5470c6"/>
                <rect x="4" y="14" width="4" height="4" fill="#5470c6"/>
                <line x1="6" y1="4" x2="6" y2="8" stroke="#5470c6" stroke-width="1"/>
                <line x1="6" y1="16" x2="6" y2="20" stroke="#5470c6" stroke-width="1"/>
                <rect x="14" y="8" width="4" height="8" fill="#ee6666"/>
                <rect x="14" y="10" width="4" height="4" fill="#ee6666"/>
                <line x1="16" y1="6" x2="16" y2="10" stroke="#ee6666" stroke-width="1"/>
                <line x1="16" y1="14" x2="16" y2="18" stroke="#ee6666" stroke-width="1"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">K线图</span>
              <span class="item-desc">金融K线</span>
            </div>
          </div>
          
          <!-- 关系图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'graph')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <circle cx="5" cy="6" r="2" fill="currentColor"/>
                <circle cx="19" cy="6" r="2" fill="currentColor"/>
                <circle cx="5" cy="18" r="2" fill="currentColor"/>
                <circle cx="19" cy="18" r="2" fill="currentColor"/>
                <line x1="12" y1="9" x2="6" y2="7" stroke="currentColor" stroke-width="1"/>
                <line x1="12" y1="9" x2="18" y2="7" stroke="currentColor" stroke-width="1"/>
                <line x1="12" y1="15" x2="6" y2="17" stroke="currentColor" stroke-width="1"/>
                <line x1="12" y1="15" x2="18" y2="17" stroke="currentColor" stroke-width="1"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">关系图</span>
              <span class="item-desc">网络拓扑</span>
            </div>
          </div>
          
          <!-- 词云 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'wordcloud')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <text x="6" y="12" font-size="6" fill="#5470c6">词云</text>
                <text x="10" y="16" font-size="4" fill="#91cc75">文字</text>
                <text x="12" y="20" font-size="5" fill="#fac858">大小</text>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">词云</span>
              <span class="item-desc">关键词云</span>
            </div>
          </div>
          
          <!-- 桑基图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'sankey')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="2" y="4" width="4" height="6" fill="#5470c6"/>
                <rect x="2" y="12" width="4" height="6" fill="#91cc75"/>
                <rect x="2" y="20" width="4" height="2" fill="#fac858"/>
                <rect x="18" y="6" width="4" height="10" fill="#5470c6"/>
                <rect x="18" y="18" width="4" height="4" fill="#91cc75"/>
                <path d="M6 7 C12 7 12 10 18 10" stroke="#5470c6" stroke-width="2" fill="none"/>
                <path d="M6 15 C12 15 12 18 18 18" stroke="#91cc75" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">桑基图</span>
              <span class="item-desc">流量流向</span>
            </div>
          </div>
          
          <!-- 地图 -->
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, ComponentType.CHART, 'map')"
            @click="$emit('select', ComponentType.CHART)"
          >
            <div class="item-icon chart-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M3 6 L9 2 L15 4 L21 2 L21 14 L15 18 L9 22 L3 18 Z" stroke="currentColor" stroke-width="1" fill="none"/>
                <path d="M9 2 L9 22" stroke="#ddd" stroke-width="0.5"/>
                <path d="M3 10 L21 10" stroke="#ddd" stroke-width="0.5"/>
              </svg>
            </div>
            <div class="item-info">
              <span class="item-name">地图</span>
              <span class="item-desc">区域分布</span>
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
