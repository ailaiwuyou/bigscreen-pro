/**
 * UUID生成工具
 */

/**
 * 生成标准UUID v4
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成短UUID（8位）
 * @returns 短UUID字符串
 */
export function generateShortUUID(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 生成唯一ID（时间戳+随机数）
 * @returns 唯一ID字符串
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

/**
 * 验证UUID格式
 * @param uuid - 要验证的字符串
 * @returns 是否为有效的UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * 从UUID中提取时间戳（仅适用于特定类型的UUID）
 * @param uuid - UUID字符串
 * @returns 时间戳或null
 */
export function extractTimestampFromUUID(uuid: string): number | null {
  if (!isValidUUID(uuid)) return null
  
  // UUID v1 包含时间戳，这里简单返回null
  // 实际实现需要根据UUID类型解析
  return null
}

/**
 * 生成批量UUID
 * @param count - 数量
 * @returns UUID数组
 */
export function generateUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID())
}

/**
 * UUID生成器类
 */
export class UUIDGenerator {
  private counter = 0
  private prefix: string

  constructor(prefix = 'id') {
    this.prefix = prefix
  }

  /**
   * 生成下一个ID
   * @returns 递增ID
   */
  next(): string {
    return `${this.prefix}-${++this.counter}`
  }

  /**
   * 重置计数器
   */
  reset(): void {
    this.counter = 0
  }

  /**
   * 获取当前计数
   * @returns 当前计数
   */
  current(): number {
    return this.counter
  }
}
