/**
 * 对象相关工具函数
 */

/**
 * 深度克隆对象
 * @param obj - 要克隆的对象
 * @returns 克隆后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 深度合并对象
 * @param target - 目标对象
 * @param sources - 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断值是否为对象
 * @param value - 要判断的值
 * @returns 是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 判断值是否为空
 * @param value - 要判断的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 获取对象路径值
 * @param obj - 对象
 * @param path - 路径
 * @param defaultValue - 默认值
 * @returns 路径值
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = (result as Record<string, unknown>)[key]
  }

  return result as T | undefined
}

/**
 * 设置对象路径值
 * @param obj - 对象
 * @param path - 路径
 * @param value - 值
 */
export function set(
  obj: Record<string, unknown>,
  path: string | string[],
  value: unknown
): void {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
}

/**
 * 删除对象路径值
 * @param obj - 对象
 * @param path - 路径
 */
export function unset(obj: Record<string, unknown>, path: string | string[]): void {
  const keys = Array.isArray(path) ? path : path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key] || typeof current[key] !== 'object') {
      return
    }
    current = current[key] as Record<string, unknown>
  }

  delete current[keys[keys.length - 1]]
}

/**
 * 对象键值映射
 * @param obj - 对象
 * @param mapper - 映射函数
 * @returns 映射后的对象
 */
export function mapKeys<T = unknown>(
  obj: Record<string, T>,
  mapper: (key: string, value: T) => string
): Record<string, T> {
  const result: Record<string, T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = mapper(key, obj[key])
      result[newKey] = obj[key]
    }
  }
  return result
}

/**
 * 对象值映射
 * @param obj - 对象
 * @param mapper - 映射函数
 * @returns 映射后的对象
 */
export function mapValues<T = unknown, R = unknown>(
  obj: Record<string, T>,
  mapper: (value: T, key: string) => R
): Record<string, R> {
  const result: Record<string, R> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapper(obj[key], key)
    }
  }
  return result
}

/**
 * 对象过滤
 * @param obj - 对象
 * @param predicate - 判断函数
 * @returns 过滤后的对象
 */
export function filterObject<T = unknown>(
  obj: Record<string, T>,
  predicate: (value: T, key: string) => boolean
): Record<string, T> {
  const result: Record<string, T> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(obj[key], key)) {
      result[key] = obj[key]
    }
  }
  return result
}

/**
 * 对象转查询字符串
 * @param obj - 对象
 * @returns 查询字符串
 */
export function toQueryString(obj: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (value !== null && value !== undefined) {
        params.append(key, String(value))
      }
    }
  }
  return params.toString()
}

/**
 * 查询字符串转对象
 * @param queryString - 查询字符串
 * @returns 对象
 */
export function fromQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}
