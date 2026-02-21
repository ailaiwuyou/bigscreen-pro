/**
 * localStorage 封装工具
 * 提供类型安全的存储操作
 */

const STORAGE_PREFIX = 'bigscreen_'

interface StorageOptions {
  expires?: number // 过期时间（毫秒）
}

interface StorageItem<T> {
  value: T
  expires?: number
  timestamp: number
}

/**
 * 存储数据到 localStorage
 * @param key 键名
 * @param value 值
 * @param options 配置选项
 */
export function set<T>(key: string, value: T, options?: StorageOptions): void {
  try {
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
    }

    if (options?.expires) {
      item.expires = Date.now() + options.expires
    }

    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item))
  } catch (error) {
    console.error('Storage set error:', error)
  }
}

/**
 * 从 localStorage 获取数据
 * @param key 键名
 * @param defaultValue 默认值
 * @returns 存储的值或默认值
 */
export function get<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const itemStr = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
    if (!itemStr) return defaultValue

    const item: StorageItem<T> = JSON.parse(itemStr)

    // 检查是否过期
    if (item.expires && Date.now() > item.expires) {
      remove(key)
      return defaultValue
    }

    return item.value
  } catch (error) {
    console.error('Storage get error:', error)
    return defaultValue
  }
}

/**
 * 从 localStorage 删除数据
 * @param key 键名
 */
export function remove(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
  } catch (error) {
    console.error('Storage remove error:', error)
  }
}

/**
 * 清空所有以 prefix 开头的存储项
 */
export function clear(): void {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Storage clear error:', error)
  }
}

/**
 * 获取所有存储的键名
 * @returns 键名数组（不含前缀）
 */
export function keys(): string[] {
  const keys: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        keys.push(key.slice(STORAGE_PREFIX.length))
      }
    }
  } catch (error) {
    console.error('Storage keys error:', error)
  }
  return keys
}

/**
 * 检查是否存在某个键
 * @param key 键名
 * @returns 是否存在
 */
export function has(key: string): boolean {
  return localStorage.getItem(`${STORAGE_PREFIX}${key}`) !== null
}

// 默认导出
export const storage = {
  set,
  get,
  remove,
  clear,
  keys,
  has,
}

export default storage