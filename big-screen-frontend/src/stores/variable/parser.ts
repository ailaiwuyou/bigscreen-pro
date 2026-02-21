/**
 * 变量解析工具函数
 */

/**
 * 正则表达式匹配变量
 * 支持格式: $variable, ${variable}, ${variable:format}
 */
const VARIABLE_PATTERN = /\$\{?([a-zA-Z0-9_]+)(?::([^}]+))?\}?/g

/**
 * 解析文本中的所有变量引用
 */
export function parseVariables(text: string): string[] {
  const variables: string[] = []
  let match: RegExpExecArray | null
  
  // Reset regex state
  VARIABLE_PATTERN.lastIndex = 0
  
  while ((match = VARIABLE_PATTERN.exec(text)) !== null) {
    const varName = match[1]
    if (!variables.includes(varName)) {
      variables.push(varName)
    }
  }
  
  return variables
}

/**
 * 替换文本中的变量
 */
export function replaceVariables(
  text: string,
  values: Record<string, any>
): string {
  return text.replace(VARIABLE_PATTERN, (match, varName, format) => {
    const value = values[varName]
    
    if (value === undefined || value === null) {
      return match
    }
    
    // 处理多值情况
    if (Array.isArray(value)) {
      const formatted = value.map(v => formatValue(v, format)).join(',')
      return formatted
    }
    
    return formatValue(value, format)
  })
}

/**
 * 格式化变量值
 */
export function formatValue(value: any, format?: string): string {
  if (value === undefined || value === null) {
    return ''
  }
  
  if (!format) {
    return String(value)
  }
  
  // 处理不同的格式
  switch (format) {
    case 'raw':
      return String(value)
    case 'url':
      return encodeURIComponent(String(value))
    case 'doubleurl':
      return encodeURIComponent(encodeURIComponent(String(value)))
    case 'regex':
      // 转义为正则表达式
      return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    case 'lucene':
      // Lucene 查询转义
      return String(value).replace(/[+\-!&(){}[\]^"~*?:\\]/g, '\\$&')
    case 'csv':
      if (Array.isArray(value)) {
        return value.join(',')
      }
      return String(value)
    case 'json':
      return JSON.stringify(value)
    case 'percentencode':
      return encodeURIComponent(String(value))
    default:
      return String(value)
  }
}

/**
 * 解析带正则过滤的变量
 */
export function parseVariableRegex(text: string): { name: string; regex?: string } | null {
  const match = text.match(/^\$(\w+)(?::(.*))?$/)
  if (match) {
    return {
      name: match[1],
      regex: match[2],
    }
  }
  return null
}

/**
 * 生成变量选择 SQL 条件
 */
export function buildVariableSqlCondition(
  varName: string,
  values: Record<string, any>,
  operator: '=' | '!=' | '=~' | '!~' = '='
): string {
  const value = values[varName]
  
  if (value === undefined || value === null) {
    return '1=1' // 无效变量，不限制
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '1=1'
    }
    
    const op = operator === '=' || operator === '=~' ? 'IN' : 'NOT IN'
    const valuesStr = value.map(v => `'${v}'`).join(', ')
    return `${op} (${valuesStr})`
  }
  
  if (operator === '=~' || operator === '!~') {
    return `${operator} '/^${value}$/'`
  }
  
  return `${operator} '${value}'`
}

/**
 * 时间范围变量
 */
export const TIME_VARIABLES = {
  /** 当前时间 Unix 时间戳 */
  __from: 0,
  /** 结束时间 Unix 时间戳 */
  __to: 0,
  /** 当前时间 ISO 字符串 */
  __fromISO: '',
  /** 结束时间 ISO 字符串 */
  __toISO: '',
  /** 时间间隔字符串 */
  __interval: '',
  /** 时间间隔秒数 */
  __interval_ms: 0,
}

/**
 * 生成时间范围过滤条件
 */
export function buildTimeFilter(
  timeField: string,
  from: number,
  to: number
): string {
  return `${timeField} >= ${from} AND ${timeField} <= ${to}`
}

/**
 * 验证变量名称是否合法
 */
export function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)
}

/**
 * 清理变量名称
 */
export function sanitizeVariableName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

/**
 * 生成默认变量选项
 */
export function generateVariableOptions(
  values: string[],
  includeAll: boolean = false,
  allText: string = 'All'
): Array<{ label: string; value: string }> {
  const options = values.map(v => ({ label: v, value: v }))
  
  if (includeAll) {
    options.unshift({ label: allText, value: '' })
  }
  
  return options
}

/**
 * 对变量选项排序
 */
export function sortVariableOptions(
  options: Array<{ label: string; value: string }>,
  sort: 'disabled' | 'alphabetical' | 'alphabetical-desc' | 'numerical' | 'numerical-desc' = 'disabled'
): Array<{ label: string; value: string }> {
  if (sort === 'disabled') {
    return options
  }
  
  return [...options].sort((a, b) => {
    let aVal = a.value
    let bVal = b.value
    
    if (sort.startsWith('numerical')) {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    }
    
    let result = 0
    if (aVal < bVal) result = -1
    if (aVal > bVal) result = 1
    
    if (sort === 'alphabetical-desc' || sort === 'numerical-desc') {
      result = -result
    }
    
    return result
  })
}
