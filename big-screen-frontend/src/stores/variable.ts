import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Variable, VariableOption, VariableScope } from './types'

export const useVariableStore = defineStore('variable', () => {
  // ============ State ============
  
  /** 变量列表 */
  const variables = ref<Variable[]>([])
  
  /** 变量值映射 */
  const values = ref<Record<string, any>>({})
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 错误信息 */
  const error = ref<string | null>(null)

  // ============ Getters ============
  
  /** 获取所有变量 */
  const allVariables = computed(() => variables.value)
  
  /** 获取已启用的变量 */
  const enabledVariables = computed(() => 
    variables.value.filter(v => v.enabled !== false)
  )
  
  /** 获取变量值 */
  const getValue = computed(() => (name: string) => values.value[name])
  
  /** 检查变量是否存在 */
  const hasVariable = computed(() => (name: string) => 
    variables.value.some(v => v.name === name)
  )

  // ============ Actions ============
  
  /**
   * 添加变量
   */
  function addVariable(variable: Omit<Variable, 'id'>) {
    const newVariable: Variable = {
      ...variable,
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    variables.value.push(newVariable)
    
    // 初始化默认值
    if (variable.defaultValue !== undefined) {
      values.value[variable.name] = variable.multi 
        ? [variable.defaultValue] 
        : variable.defaultValue
    }
    
    return newVariable
  }
  
  /**
   * 更新变量
   */
  function updateVariable(id: string, updates: Partial<Variable>) {
    const index = variables.value.findIndex(v => v.id === id)
    if (index !== -1) {
      variables.value[index] = { ...variables.value[index], ...updates }
      return true
    }
    return false
  }
  
  /**
   * 删除变量
   */
  function removeVariable(id: string) {
    const index = variables.value.findIndex(v => v.id === id)
    if (index !== -1) {
      const name = variables.value[index].name
      variables.value.splice(index, 1)
      delete values.value[name]
      return true
    }
    return false
  }
  
  /**
   * 设置变量值
   */
  function setValue(name: string, value: any) {
    const variable = variables.value.find(v => v.name === name)
    if (!variable) {
      console.warn(`Variable "${name}" not found`)
      return false
    }
    
    if (variable.multi) {
      // 多选模式，确保是数组
      values.value[name] = Array.isArray(value) ? value : [value]
    } else {
      values.value[name] = value
    }
    
    return true
  }
  
  /**
   * 重置变量值
   */
  function resetValue(name: string) {
    const variable = variables.value.find(v => v.name === name)
    if (variable?.defaultValue !== undefined) {
      values.value[name] = variable.multi 
        ? [variable.defaultValue] 
        : variable.defaultValue
      return true
    }
    return false
  }
  
  /**
   * 重置所有变量
   */
  function resetAll() {
    variables.value.forEach(v => {
      if (v.defaultValue !== undefined) {
        values.value[v.name] = v.multi ? [v.defaultValue] : v.defaultValue
      }
    })
  }
  
  /**
   * 清空所有变量
   */
  function clearAll() {
    variables.value = []
    values.value = {}
  }
  
  /**
   * 加载变量配置
   */
  function loadFromConfig(config: Variable[]) {
    variables.value = config.map((v, index) => ({
      ...v,
      id: v.id || `var_${index}_${Date.now()}`,
    }))
    
    // 初始化默认值
    variables.value.forEach(v => {
      if (v.defaultValue !== undefined) {
        values.value[v.name] = v.multi ? [v.defaultValue] : v.defaultValue
      }
    })
  }
  
  /**
   * 导出变量配置
   */
  function exportConfig(): Variable[] {
    return variables.value.map(({ id, ...rest }) => rest)
  }
  
  /**
   * 清除错误
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    variables,
    values,
    loading,
    error,
    // Getters
    allVariables,
    enabledVariables,
    getValue,
    hasVariable,
    // Actions
    addVariable,
    updateVariable,
    removeVariable,
    setValue,
    resetValue,
    resetAll,
    clearAll,
    loadFromConfig,
    exportConfig,
    clearError,
  }
})
