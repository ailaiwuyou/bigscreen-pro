<template>
  <div class="variable-selector" :class="{ 'is-loading': loading }">
    <!-- 标签 -->
    <label v-if="showLabel && !hideLabel" class="variable-label">
      {{ variable.label || variable.name }}
    </label>
    
    <!-- 下拉选择器 -->
    <el-select
      v-if="isDropdown"
      v-model="currentValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :multiple="variable.multi"
      :clearable="clearable"
      :filterable="filterable"
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="collapseTagsTooltip"
      :loading="loading"
      :popper-class="popperClass"
      @change="handleChange"
      @clear="handleClear"
    >
      <!-- 全选选项 -->
      <el-option
        v-if="includeAllOption"
        :label="allOptionLabel"
        :value="allOptionValue"
        class="variable-option-all"
      />
      
      <!-- 选项列表 -->
      <el-option
        v-for="option in computedOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </el-select>
    
    <!-- 文本输入 -->
    <el-input
      v-else-if="variable.type === 'text'"
      v-model="currentValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @change="handleChange"
    />
    
    <!-- 常量（只读） -->
    <span v-else-if="variable.type === 'constant'" class="constant-value">
      {{ variable.defaultValue }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Variable, VariableOption } from '../types'
import { useVariableStore } from '../stores/variable'
import { sortVariableOptions } from '../parser'

interface Props {
  variable: Variable
  showLabel?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
  disabled: false,
})

const emit = defineEmits<{
  change: [name: string, value: any]
  load: [name: string, options: VariableOption[]]
}>()

const variableStore = useVariableStore()
const loading = ref(false)
const options = ref<VariableOption[]>([])

// 是否隐藏标签
const hideLabel = computed(() => props.variable.hide === 'label')

// 是否为下拉类型
const isDropdown = computed(() => 
  ['query', 'custom'].includes(props.variable.type)
)

// 是否显示全选选项
const includeAllOption = computed(() => 
  props.variable.type === 'custom' 
    ? (props.variable as any).includeAll
    : props.variable.type === 'query'
      ? (props.variable as any).includeAll
      : false
)

// 全选选项文本
const allOptionLabel = computed(() => 
  (props.variable as any).allText || 'All'
)

// 全选选项值
const allOptionValue = computed(() => 
  (props.variable as any).allValue || ''
)

// 占位符
const placeholder = computed(() => 
  `Select ${props.variable.label || props.variable.name}`
)

// 是否可清除
const clearable = computed(() => 
  props.variable.multi !== true
)

// 是否可搜索
const filterable = computed(() => true)

// 是否折叠标签
const collapseTags = computed(() => 
  props.variable.multi === true
)

// 折叠标签提示
const collapseTagsTooltip = computed(() => true)

// popper class
const popperClass = computed(() => 'variable-selector-popper')

// 当前值
const currentValue = computed({
  get: () => {
    const value = variableStore.values[props.variable.name]
    if (props.variable.multi) {
      return value || []
    }
    return value ?? props.variable.defaultValue ?? ''
  },
  set: (val) => {
    variableStore.setValue(props.variable.name, val)
  }
})

// 计算后的选项
const computedOptions = computed(() => {
  let opts = [...options.value]
  
  // 排序
  if ((props.variable as any).sort && (props.variable as any).sort !== 'disabled') {
    opts = sortVariableOptions(opts, (props.variable as any).sort)
  }
  
  return opts
})

// 处理选择变化
function handleChange(value: any) {
  emit('change', props.variable.name, value)
}

// 处理清除
function handleClear() {
  if (props.variable.multi) {
    variableStore.setValue(props.variable.name, [])
  } else {
    variableStore.setValue(props.variable.name, null)
  }
  emit('change', props.variable.name, props.variable.multi ? [] : null)
}

// 加载选项
async function loadOptions() {
  if (props.variable.type === 'custom') {
    options.value = (props.variable as any).options || []
    emit('load', props.variable.name, options.value)
    return
  }
  
  if (props.variable.type === 'query') {
    loading.value = true
    try {
      // TODO: 从数据源查询选项
      // 这里模拟异步加载
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟选项数据
      options.value = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
        { label: 'Option 3', value: 'opt3' },
      ]
      
      emit('load', props.variable.name, options.value)
    } catch (error: any) {
      ElMessage.error(`Failed to load options: ${error.message}`)
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  loadOptions()
})

// 监听变量配置变化
watch(() => props.variable, () => {
  loadOptions()
}, { deep: true })
</script>

<style scoped lang="scss">
.variable-selector {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &.is-loading {
    opacity: 0.7;
  }
}

.variable-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.constant-value {
  font-family: monospace;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
}

:deep(.variable-selector-popper) {
  .variable-option-all {
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 4px;
  }
}
</style>
