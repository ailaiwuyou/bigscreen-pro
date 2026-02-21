import dayjs from 'dayjs'

/**
 * 数据格式化工具函数
 */

/**
 * 格式化数字，添加千分位分隔符
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number | string, decimals = 0): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(n)) return '0'
  
  const fixed = n.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  return parts.join('.')
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式字符串
 * @returns 格式化后的字符串
 */
export function formatDateTime(
  date: string | number | Date,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化日期
 * @param date 日期
 * @returns 格式化后的字符串
 */
export function formatDate(date: string | number | Date): string {
  return formatDateTime(date, 'YYYY-MM-DD')
}

/**
 * 格式化时间
 * @param date 日期
 * @returns 格式化后的字符串
 */
export function formatTime(date: string | number | Date): string {
  return formatDateTime(date, 'HH:mm:ss')
}

/**
 * 格式化相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | number | Date): string {
  const now = dayjs()
  const target = dayjs(date)
  const diffSeconds = now.diff(target, 'second')
  
  if (diffSeconds < 60) {
    return '刚刚'
  } else if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}分钟前`
  } else if (diffSeconds < 86400) {
    return `${Math.floor(diffSeconds / 3600)}小时前`
  } else if (diffSeconds < 604800) {
    return `${Math.floor(diffSeconds / 86400)}天前`
  } else {
    return target.format('YYYY-MM-DD')
  }
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatCurrency(
  amount: number,
  currency = '¥',
  decimals = 2
): string {
  const formatted = formatNumber(amount, decimals)
  return `${currency}${formatted}`
}

/**
 * 格式化百分比
 * @param value 数值（0-1 或 0-100）
 * @param decimals 小数位数
 * @param isDecimal 是否为小数（0-1）
 * @returns 格式化后的字符串
 */
export function formatPercent(
  value: number,
  decimals = 2,
  isDecimal = false
): string {
  const percent = isDecimal ? value * 100 : value
  return `${percent.toFixed(decimals)}%`
}

/**
 * 格式化手机号码（隐藏中间四位）
 * @param phone 手机号
 * @returns 格式化后的字符串
 */
export function formatPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

/**
 * 格式化邮箱（隐藏部分字符）
 * @param email 邮箱
 * @returns 格式化后的字符串
 */
export function formatEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  const maskedLocal = local.length > 2 
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : '*'.repeat(local.length)
  return `${maskedLocal}@${domain}`
}

// 默认导出
export const format = {
  number: formatNumber,
  fileSize: formatFileSize,
  dateTime: formatDateTime,
  date: formatDate,
  time: formatTime,
  relativeTime: formatRelativeTime,
  currency: formatCurrency,
  percent: formatPercent,
  phone: formatPhone,
  email: formatEmail,
}

export default format