<template>
  <aside class="property-panel" :class="{ collapsed }">
    <div class="panel-header">
      <h3 class="panel-title">
        <i class="icon-properties" />
        <span>属性面板</span>
      </h3>
      <button class="collapse-btn" @click="toggleCollapse">
        <i :class="collapsed ? 'icon-chevron-left' : 'icon-chevron-right'" />
      </button>
    </div>
    
    <div v-show="!collapsed" class="panel-body">
      <!-- 未选中状态 -->
      <div v-if="!hasSelection" class="empty-state">
        <i class="icon-mouse-pointer" />
        <p>在画布上选择一个组件<br />以编辑其属性</p>
      </div>
      
      <!-- 多选状态 -->
      <div v-else-if="selectedComponents.length > 1" class="multi-select">
        <div class="multi-select-header">
          <i class="icon-layers" />
          <span>已选择 {{ selectedComponents.length }} 个组件</span>
        </div>
        
        <!-- 批量操作 -->
        <div class="property-group">
          <h4 class="property-group-title">对齐</h4>
          <div class="align-actions">
            <button class="align-btn" title="左对齐" @click="alignLeft">
              <i class="icon-align-left" />
            </button>
            <button class="align-btn" title="水平居中" @click="alignCenter">
              <i class="icon-align-center" />
            </button>
            <button class="align-btn" title="右对齐" @click="alignRight">
              <i class="icon-align-right" />
            </button>
            <button class="align-btn" title="顶部对齐" @click="alignTop">
              <i class="icon-align-top" />
            </button>
            <button class="align-btn" title="垂直居中" @click="alignMiddle">
              <i class="icon-align-middle" />
            </button>
            <button class="align-btn" title="底部对齐" @click="alignBottom">
              <i class="icon-align-bottom" />
            </button>
          </div>
        </div>
        
        <div class="property-group">
          <h4 class="property-group-title">分布</h4>
          <div class="distribute-actions">
            <button class="distribute-btn" @click="distributeHorizontal">
              <i class="icon-distribute-h" />
              <span>水平分布</span>
            </button>
            <button class="distribute-btn" @click="distributeVertical">
              <i class="icon-distribute-v" />
              <span>垂直分布</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 单选属性编辑 -->
      <div v-else class="properties-form">
        <!-- 基础属性 -->
        <div class="property-group">
          <h4 class="property-group-title">
            <i class="icon-position" />
            位置与尺寸
          </h4>
          
          <div class="property-row">
            <div class="property-field">
              <label>X</label>
              <input
                type="number"
                :value="Math.round(currentComponent?.position?.x ?? 0)"
                @input="updatePosition('x', $event)"
              />
            </div>
            <div class="property-field">
              <label>Y</label>
              <input
                type="number"
                :value="Math.round(currentComponent?.position?.y ?? 0)"
                @input="updatePosition('y', $event)"
              />
            </div>
          </div>
          
          <div class="property-row">
            <div class="property-field">
              <label>宽</label>
              <input
                type="number"
                :value="Math.round(currentComponent?.size?.width ?? 100)"
                @input="updateSize('width', $event)"
              />
            </div>
            <div class="property-field">
              <label>高</label>
              <input
                type="number"
                :value="Math.round(currentComponent?.size?.height ?? 100)"
                @input="updateSize('height', $event)"
              />
            </div>
          </div>
          
          <div class="property-row single">
            <div class="property-field">
              <label>旋转</label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  :value="Math.round(currentComponent?.rotation ?? 0)"
                  @input="updateRotation($event)"
                />
                <span class="suffix">°</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 样式属性 -->
        <div class="property-group">
          <h4 class="property-group-title">
            <i class="icon-style" />
            样式
          </h4>
          
          <div class="property-row">
            <div class="property-field full">
              <label>背景颜色</label>
              <div class="color-picker-wrapper">
                <input
                  type="color"
                  :value="currentComponent?.style?.backgroundColor || '#ffffff'"
                  @input="updateStyle('backgroundColor', $event)"
                />
                <input
                  type="text"
                  :value="currentComponent?.style?.backgroundColor || '#ffffff'"
                  @input="updateStyle('backgroundColor', $event)"
                />
              </div>
            </div>
          </div>
          
          <div class="property-row">
            <div class="property-field">
              <label>透明度</label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  min="0"
                  max="100"
                  :value="Math.round(((currentComponent?.style?.opacity ?? 1) * 100))"
                  @input="updateStyle('opacity', $event, (v: number) => v / 100)"
                />
                <span class="suffix">%</span>
              </div>
            </div>
            <div class="property-field">
              <label>圆角</label>
              <div class="input-with-suffix">
                <input
                  type="number"
                  min="0"
                  :value="currentComponent?.style?.borderRadius || 0"
                  @input="updateStyle('borderRadius', $event)"
                />
                <span class="suffix">px</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 可见性和锁定 -->
        <div class="property-group">
          <h4 class="property-group-title">
            <i class="icon-eye" />
            状态
          </h4>
          
          <div class="property-row toggle-row">
            <label class="toggle-label">
              <span>可见</span>
              <input
                type="checkbox"
                :checked="currentComponent?.visible ?? true"
                @change="updateProperty('visible', $event)"
              />
            </label>
            
            <label class="toggle-label">
              <span>锁定</span>
              <input
                type="checkbox"
                :checked="currentComponent?.locked ?? false"
                @change="updateProperty('locked', $event)"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ComponentInstance, UUID } from '@bigscreen/types'

interface Props {
  collapsed?: boolean
  selectedComponents: ComponentInstance[]
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'propertyChange': [key: string, value: unknown]
  'align': [type: string]
  'distribute': [type: string]
}>()

// 计算属性
const hasSelection = computed(() => props.selectedComponents.length > 0)
const currentComponent = computed(() => props.selectedComponents[0] ?? null)

// 方法
function toggleCollapse() {
  emit('update:collapsed', !props.collapsed)
}

// 位置更新
function updatePosition(axis: 'x' | 'y', event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value) || 0
  emit('propertyChange', `position.${axis}`, value)
}

// 尺寸更新
function updateSize(dimension: 'width' | 'height', event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value) || 100
  emit('propertyChange', `size.${dimension}`, value)
}

// 旋转更新
function updateRotation(event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value) || 0
  emit('propertyChange', 'rotation', value)
}

// 样式更新
function updateStyle(key: string, event: Event, transform?: (v: number) => number) {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (transform && typeof value === 'string') {
    value = transform(parseFloat(value))
  }
  
  emit('propertyChange', `style.${key}`, value)
}

// 属性更新
function updateProperty(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('propertyChange', key, target.checked)
}

// 对齐操作
function alignLeft() { emit('align', 'left') }
function alignCenter() { emit('align', 'center') }
function alignRight() { emit('align', 'right') }
function alignTop() { emit('align', 'top') }
function alignMiddle() { emit('align', 'middle') }
function alignBottom() { emit('align', 'bottom') }

// 分布操作
function distributeHorizontal() { emit('distribute', 'horizontal') }
function distributeVertical() { emit('distribute', 'vertical') }
</script>

<style lang="scss" scoped>
.property-panel {
  width: 280px;
  height: 100%;
  background-color: var(--color-bg-elevated);
  border-left: 1px solid var(--color-border);
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
  overflow-y: auto;
  padding: 16px;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: var(--color-text-tertiary);
  text-align: center;

  i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: var(--font-size-sm);
    line-height: 1.6;
  }
}

// 多选状态
.multi-select {
  .multi-select-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 16px;
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    font-weight: 500;

    i {
      color: var(--color-primary);
    }
  }
}

// 属性分组
.property-group {
  margin-bottom: 20px;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 20px;
  }
}

.property-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;

  i {
    font-size: 14px;
  }
}

// 属性行
.property-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  &.single {
    .property-field {
      flex: 0 0 50%;
    }
  }

  &.toggle-row {
    gap: 24px;
  }
}

.property-field {
  flex: 1;
  min-width: 0;

  &.full {
    flex: 1 1 100%;
  }

  label {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    margin-bottom: 4px;
  }

  input[type="number"],
  input[type="text"] {
    width: 100%;
    padding: 6px 8px;
    font-size: var(--font-size-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }
}

.input-with-suffix {
  position: relative;

  input {
    padding-right: 24px;
  }

  .suffix {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    pointer-events: none;
  }
}

// 颜色选择器
.color-picker-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;

  input[type="color"] {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: none;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 2px;
    }

    &::-webkit-color-swatch {
      border-radius: var(--radius-sm);
    }
  }

  input[type="text"] {
    flex: 1;
    text-transform: uppercase;
  }
}

// 开关
.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  span {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  input[type="checkbox"] {
    appearance: none;
    width: 36px;
    height: 20px;
    background-color: var(--color-border);
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background-color var(--duration-fast);

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      background-color: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: transform var(--duration-fast);
    }

    &:checked {
      background-color: var(--color-primary);

      &::after {
        transform: translateX(16px);
      }
    }
  }
}

// 对齐按钮
.align-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.align-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background-color: rgba(24, 144, 255, 0.05);
  }

  i {
    font-size: 14px;
  }
}

// 分布按钮
.distribute-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribute-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-fast);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background-color: rgba(24, 144, 255, 0.05);
  }

  i {
    font-size: 14px;
    color: var(--color-text-tertiary);
  }
}
</style>
