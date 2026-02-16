/**
 * 验证工具函数
 */

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * 验证手机号格式（中国）
 * @param phone - 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证URL格式
 * @param url - URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为数字
 * @param value - 要验证的值
 * @returns 是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 验证是否为整数
 * @param value - 要验证的值
 * @returns 是否为整数
 */
export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value)
}

/**
 * 验证是否为正数
 * @param value - 要验证的值
 * @returns 是否为正数
 */
export function isPositive(value: unknown): boolean {
  return isNumber(value) && value > 0
}

/**
 * 验证是否在范围内
 * @param value - 数值
 * @param min - 最小值
 * @param max - 最大值
 * @param inclusive - 是否包含边界
 * @returns 是否在范围内
 */
export function isInRange(
  value: number,
  min: number,
  max: number,
  inclusive = true
): boolean {
  if (inclusive) {
    return value >= min && value <= max
  }
  return value > min && value < max
}

/**
 * 验证是否为JSON字符串
 * @param str - 字符串
 * @returns 是否为JSON
 */
export function isJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为Base64字符串
 * @param str - 字符串
 * @returns 是否为Base64
 */
export function isBase64(str: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str) && str.length % 4 === 0
}

/**
 * 验证密码强度
 * @param password - 密码
 * @returns 密码强度等级 (0-4)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
}

/**
 * 验证身份证格式（中国）
 * @param idCard - 身份证号
 * @returns 是否有效
 */
export function isValidIdCard(idCard: string): boolean {
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
  if (!idCardRegex.test(idCard)) return false
  
  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  return idCard[17].toUpperCase() === checkCodes[sum % 11]
}

/**
 * 验证IP地址格式
 * @param ip - IP地址
 * @returns 是否有效
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * 验证端口号
 * @param port - 端口号
 * @returns 是否有效
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}
