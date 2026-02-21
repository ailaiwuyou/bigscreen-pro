/**
 * 图表工具函数
 */

import type { ChartDataItem, ChartSeries } from '../types'

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, digits: number = 2): string {
  if (isNaN(num)) return '-'
  if (Math.abs(num) >= 100000000) {
    return (num / 100000000).toFixed(digits) + '亿'
  }
  if (Math.abs(num) >= 10000) {
    return (num / 10000).toFixed(digits) + '万'
  }
  return num.toFixed(digits)
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, digits: number = 1): string {
  if (isNaN(value)) return '-'
  return (value * 100).toFixed(digits) + '%'
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  const result: Record<string, any> = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result as T
}

/**
 * 转换数据为 ECharts 格式
 */
export function transformDataToSeries(
  data: ChartDataItem[],
  type: string,
  name?: string
): ChartSeries {
  return {
    name: name || data[0]?.name || '数据',
    type,
    data: data.map(item => item.value) as number[]
  }
}

/**
 * 从数据中提取维度
 */
export function extractDimensions(data: Record<string, any>[]): string[] {
  if (!data || data.length === 0) return []
  return Object.keys(data[0]).filter(key => key !== 'name' && key !== 'value')
}

/**
 * 生成渐变色
 */
export function generateGradient(
  color1: string,
  color2: string,
  direction: 'horizontal' | 'vertical' | 'radial' = 'vertical'
): any {
  const x = direction === 'horizontal' ? 1 : 0
  const y = direction === 'vertical' ? 1 : 0

  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: x,
    y2: y,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 }
    ]
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => ReturnType<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      func.apply(context, args)
    }, wait)

    return undefined as ReturnType<T>
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> {
  let inThrottle = false

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }

    return undefined as ReturnType<T>
  }
}

/**
 * 计算数据集统计信息
 */
export function calculateStats(data: number[]) {
  const sorted = [...data].sort((a, b) => a - b)
  const n = sorted.length
  const min = sorted[0]
  const max = sorted[n - 1]
  const mean = sorted.reduce((a, b) => a + b, 0) / n
  
  const q1Index = Math.floor(n * 0.25)
  const q2Index = Math.floor(n * 0.5)
  const q3Index = Math.floor(n * 0.75)
  
  return {
    min,
    q1: sorted[q1Index],
    median: sorted[q2Index],
    q3: sorted[q3Index],
    max,
    mean,
    count: n
  }
}

/**
 * 数据标准化
 */
export function normalize(data: number[], method: 'minmax' | 'zscore' | 'log' = 'minmax'): number[] {
  if (method === 'minmax') {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    return data.map(v => (v - min) / range)
  }
  
  if (method === 'zscore') {
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const std = Math.sqrt(data.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / data.length) || 1
    return data.map(v => (v - mean) / std)
  }
  
  if (method === 'log') {
    return data.map(v => Math.log(v + 1))
  }
  
  return data
}
