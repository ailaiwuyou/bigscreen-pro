/**
 * 模板变量类型定义
 */

/** 变量类型 */
export type VariableType = 'query' | 'custom' | 'text' | 'constant'

/** 变量刷新时机 */
export type VariableRefresh = 'onetime' | 'on Dashboard Load' | 'on Time Range Change'

/** 变量选择模式 */
export type VariableSelectMode = 'single' | 'multiple'

/** 变量作用域 */
export type VariableScope = 'dashboard' | 'system'

/** 变量选项 */
export interface VariableOption {
  label: string
  value: string
  selected?: boolean
  text?: string
}

/** 变量基础配置 */
export interface VariableBase {
  /** 变量唯一标识 */
  id?: string
  /** 变量名称（用于引用） */
  name: string
  /** 显示名称 */
  label?: string
  /** 变量类型 */
  type: VariableType
  /** 变量描述 */
  description?: string
  /** 是否启用 */
  enabled?: boolean
  /** 作用域 */
  scope?: VariableScope
  /** 默认值 */
  defaultValue?: any
  /** 是否隐藏 */
  hide?: 'variable' | 'label' | 'description' | 'dont'
  /** 刷新时机 */
  refresh?: VariableRefresh
}

/** 查询类型变量 */
export interface QueryVariable extends VariableBase {
  type: 'query'
  /** 数据源 ID */
  dataSourceId?: string
  /** 查询语句 */
  query: string
  /** 正则过滤表达式 */
  regex?: string
  /** 排序方式 */
  sort?: 'disabled' | 'alphabetical' | 'alphabetical-desc' | 'numerical' | 'numerical-desc'
  /** 选项值字段 */
  valueField?: string
  /** 选项标签字段 */
  labelField?: string
  /** 重新填充选项 */
  reFillOptions?: boolean
  /** 包含全选选项 */
  includeAll?: boolean
  /** 全选选项文本 */
  allValue?: string
}

/** 自定义选项变量 */
export interface CustomVariable extends VariableBase {
  type: 'custom'
  /** 自定义选项列表 */
  options: VariableOption[]
  /** 包含全选选项 */
  includeAll?: boolean
  /** 全选选项文本 */
  allValue?: string
}

/** 文本变量 */
export interface TextVariable extends VariableBase {
  type: 'text'
  /** 正则表达式 */
  regex?: string
  /** 值捕获组 */
  captureGroup?: number
}

/** 常量变量 */
export interface ConstantVariable extends VariableBase {
  type: 'constant'
  /** 查询值（用于隐藏时） */
  queryValue?: string
}

/** 变量联合类型 */
export type Variable = QueryVariable | CustomVariable | TextVariable | ConstantVariable

/** 变量值 */
export interface VariableValue {
  name: string
  value: any
  values?: any[]
}

/** 变量状态 */
export interface VariableState {
  variables: Variable[]
  values: Record<string, any>
}

/** 变量解析结果 */
export interface ParsedVariable {
  name: string
  value: string
  isMulti: boolean
  hasRegex: boolean
  regex?: string
  format?: string
}
