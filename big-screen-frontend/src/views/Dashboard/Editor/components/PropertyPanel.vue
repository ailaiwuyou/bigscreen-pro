<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性配置</h3>
      <el-button v-if="selectedComponent" link @click="resetProps">
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>
    
    <div class="panel-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础" name="basic" />
        <el-tab-pane label="数据" name="data" />
        <el-tab-pane label="样式" name="style" />
        <el-tab-pane label="高级" name="advanced" />
      </el-tabs>
    </div>

    <div class="panel-content">
      <div v-if="selectedComponent">
        <!-- 基础配置 -->
        <div v-show="activeTab === 'basic'" class="props-section">
          <el-form label-width="70px" size="small">
            <el-form-item label="组件类型">
              <el-tag>{{ getTypeLabel(selectedComponent.type) }}</el-tag>
            </el-form-item>
            <el-form-item label="组件名称">
              <el-input v-model="localProps.name" placeholder="请输入名称" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="localProps.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="localProps.width" :min="1" :max="1920" />
            </el-form-item>
            <el-form-item label="高度">
              <el-input-number v-model="localProps.height" :min="1" :max="1080" />
            </el-form-item>
            <el-form-item label="X位置">
              <el-input-number v-model="localProps.x" :min="0" />
            </el-form-item>
            <el-form-item label="Y位置">
              <el-input-number v-model="localProps.y" :min="0" />
            </el-form-item>
            <el-form-item label="层级">
              <el-input-number v-model="localProps.zIndex" :min="0" />
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="localProps.opacity" :min="0" :max="1" :step="0.1" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 数据配置 -->
        <div v-show="activeTab === 'data'" class="props-section">
          <el-form label-width="70px" size="small">
            <el-form-item label="数据源">
              <el-select v-model="localProps.dataSourceId" placeholder="选择数据源" clearable>
                <el-option
                  v-for="ds in dataSources"
                  :key="ds.id"
                  :label="ds.name"
                  :value="ds.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="刷新间隔">
              <el-select v-model="localProps.refreshInterval" placeholder="选择刷新间隔">
                <el-option label="手动" :value="0" />
                <el-option label="5秒" :value="5000" />
                <el-option label="10秒" :value="10000" />
                <el-option label="30秒" :value="30000" />
                <el-option label="1分钟" :value="60000" />
                <el-option label="5分钟" :value="300000" />
              </el-select>
            </el-form-item>
            <el-form-item label="查询语句">
              <el-input
                v-model="localProps.query"
                type="textarea"
                :rows="3"
                placeholder="SQL 查询或 API 路径"
              />
            </el-form-item>
            <el-form-item label="数据映射">
              <el-input
                v-model="localProps.dataMapping"
                type="textarea"
                :rows="2"
                placeholder='{"x": "time", "y": "value"}'
              />
            </el-form-item>
            <el-divider>字段映射</el-divider>
            <el-form-item label="X轴字段">
              <el-input v-model="localProps.xField" placeholder="X轴字段名" />
            </el-form-item>
            <el-form-item label="Y轴字段">
              <el-input v-model="localProps.yField" placeholder="Y轴字段名" />
            </el-form-item>
            <el-form-item label="系列字段">
              <el-input v-model="localProps.seriesField" placeholder="系列字段名" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 样式配置 -->
        <div v-show="activeTab === 'style'" class="props-section">
          <el-form label-width="70px" size="small">
            <el-form-item label="主题">
              <el-radio-group v-model="localProps.theme">
                <el-radio label="light">浅色</el-radio>
                <el-radio label="dark">深色</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="localProps.backgroundColor" show-alpha />
            </el-form-item>
            <el-form-item label="边框">
              <el-switch v-model="localProps.border" />
            </el-form-item>
            <el-form-item v-if="localProps.border" label="边框颜色">
              <el-color-picker v-model="localProps.borderColor" />
            </el-form-item>
            <el-form-item v-if="localProps.border" label="边框宽度">
              <el-input-number v-model="localProps.borderWidth" :min="0" :max="10" />
            </el-form-item>
            <el-form-item label="圆角">
              <el-input-number v-model="localProps.borderRadius" :min="0" :max="20" />
            </el-form-item>
            <el-form-item label="阴影">
              <el-switch v-model="localProps.shadow" />
            </el-form-item>
            <el-form-item v-if="localProps.shadow" label="阴影色">
              <el-color-picker v-model="localProps.shadowColor" show-alpha />
            </el-form-item>
            <el-divider>字体设置</el-divider>
            <el-form-item label="字体">
              <el-select v-model="localProps.fontFamily" placeholder="选择字体">
                <el-option label="默认" value="inherit" />
                <el-option label="雅黑" value="'Microsoft YaHei', sans-serif" />
                <el-option label="黑体" value="'SimHei', sans-serif" />
                <el-option label="宋体" value="'SimSun', serif" />
                <el-option label="Arial" value="Arial, sans-serif" />
              </el-select>
            </el-form-item>
            <el-form-item label="标题大小">
              <el-input-number v-model="localProps.titleFontSize" :min="10" :max="32" />
            </el-form-item>
            <el-form-item label="标题颜色">
              <el-color-picker v-model="localProps.titleColor" />
            </el-form-item>
            <el-form-item label="字体大小">
              <el-input-number v-model="localProps.fontSize" :min="10" :max="24" />
            </el-form-item>
            <el-form-item label="字体颜色">
              <el-color-picker v-model="localProps.fontColor" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 高级配置 -->
        <div v-show="activeTab === 'advanced'" class="props-section">
          <el-form label-width="70px" size="small">
            <el-form-item label="动画">
              <el-switch v-model="localProps.animation" />
            </el-form-item>
            <el-form-item v-if="localProps.animation" label="动画时长">
              <el-input-number v-model="localProps.animationDuration" :min="0" :max="5000" :step="100" />
            </el-form-item>
            <el-form-item v-if="localProps.animation" label="动画效果">
              <el-select v-model="localProps.animationEasing">
                <el-option label="线性" value="linear" />
                <el-option label="缓入" value="easeIn" />
                <el-option label="缓出" value="easeOut" />
                <el-option label="缓入缓出" value="easeInOut" />
              </el-select>
            </el-form-item>
            <el-divider>交互设置</el-divider>
            <el-form-item label="可拖拽">
              <el-switch v-model="localProps.draggable" />
            </el-form-item>
            <el-form-item label="可缩放">
              <el-switch v-model="localProps.resizable" />
            </el-form-item>
            <el-form-item label="可旋转">
              <el-switch v-model="localProps.rotatable" />
            </el-form-item>
            <el-divider>事件处理</el-divider>
            <el-form-item label="点击事件">
              <el-switch v-model="localProps.clickable" />
            </el-form-item>
            <el-form-item v-if="localProps.clickable" label="事件类型">
              <el-select v-model="localProps.clickEventType">
                <el-option label="无操作" value="" />
                <el-option label="跳转链接" value="link" />
                <el-option label="弹窗" value="modal" />
                <el-option label="钻取" value="drilldown" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="localProps.clickEventType === 'link'" label="链接地址">
              <el-input v-model="localProps.linkUrl" placeholder="https://..." />
            </el-form-item>
            <el-divider>工具提示</el-divider>
            <el-form-item label="显示提示">
              <el-switch v-model="localProps.tooltip" />
            </el-form-item>
            <el-form-item v-if="localProps.tooltip" label="提示格式">
              <el-select v-model="localProps.tooltipFormat">
                <el-option label="默认" value="default" />
                <el-option label="简洁" value="compact" />
                <el-option label="详细" value="detailed" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <div v-else class="no-selection">
        <el-empty description="请选择一个组件">
          <template #image>
            <el-icon :size="60"><Pointer /></el-icon>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Refresh, Pointer } from '@element-plus/icons-vue'
import { useDataSourceStore } from '@/stores/dataSource'

interface ComponentProps {
  type: string
  props: Record<string, any>
}

const props = defineProps<{
  selectedComponent: ComponentProps | null
}>()

const emit = defineEmits<{
  (e: 'update:props', props: Record<string, any>): void
}>()

const dataSourceStore = useDataSourceStore()
const activeTab = ref('basic')

// 本地属性副本
const localProps = ref<Record<string, any>>({})

// 数据源列表
const dataSources = computed(() => dataSourceStore.dataSources)

// 初始化数据源
dataSourceStore.fetchDataSources()

// 监听选中组件变化
watch(() => props.selectedComponent, (newVal) => {
  if (newVal) {
    localProps.value = { ...newVal.props }
  } else {
    localProps.value = {}
  }
}, { immediate: true, deep: true })

// 监听属性变化，触发更新
watch(localProps, (newVal) => {
  emit('update:props', newVal)
}, { deep: true })

// 获取类型标签
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    text: '文本',
    image: '图片',
    line: '折线图',
    bar: '柱状图',
    pie: '饼图',
    gauge: '仪表盘',
    map: '地图',
    radar: '雷达图',
    scatter: '散点图',
    heatmap: '热力图',
    candlestick: 'K线图',
    funnel: '漏斗图',
    tree: '树图',
    treemap: '矩形树图',
    graph: '关系图',
    liquid: '水球图',
    boxplot: '箱线图',
    sankey: '桑基图',
    wordcloud: '词云',
    metric: '指标卡',
  }
  return labels[type] || type
}

// 重置属性
const resetProps = () => {
  if (props.selectedComponent) {
    localProps.value = { ...props.selectedComponent.props }
  }
}
</script>

<style scoped lang="scss">
.property-panel {
  width: 320px;
  background: #fff;
  border-left: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.panel-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }
  
  :deep(.el-tabs__item) {
    font-size: 12px;
    padding: 0 8px;
  }
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.props-section {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
  
  :deep(.el-divider__text) {
    font-size: 12px;
  }
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  
  :deep(.el-empty) {
    text-align: center;
  }
}
</style>
