/**
 * 数学计算工具函数
 */

/**
 * 精确计算浮点数
 * @param num - 数值
 * @param precision - 精度
 * @returns 格式化后的数值
 */
export function round(num: number, precision = 2): number {
  const factor = Math.pow(10, precision)
  return Math.round(num * factor) / factor
}

/**
 * 向下取整到指定精度
 * @param num - 数值
 * @param precision - 精度
 * @returns 取整后的数值
 */
export function floor(num: number, precision = 0): number {
  const factor = Math.pow(10, precision)
  return Math.floor(num * factor) / factor
}

/**
 * 向上取整到指定精度
 * @param num - 数值
 * @param precision - 精度
 * @returns 取整后的数值
 */
export function ceil(num: number, precision = 0): number {
  const factor = Math.pow(10, precision)
  return Math.ceil(num * factor) / factor
}

/**
 * 将数值吸附到网格
 * @param value - 数值
 * @param gridSize - 网格大小
 * @returns 吸附后的数值
 */
export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value
  return Math.round(value / gridSize) * gridSize
}

/**
 * 计算两点之间的曼哈顿距离
 * @param x1 - 点1 X坐标
 * @param y1 - 点1 Y坐标
 * @param x2 - 点2 X坐标
 * @param y2 - 点2 Y坐标
 * @returns 曼哈顿距离
 */
export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1)
}

/**
 * 计算两点之间的欧几里得距离
 * @param x1 - 点1 X坐标
 * @param y1 - 点1 Y坐标
 * @param x2 - 点2 X坐标
 * @param y2 - 点2 Y坐标
 * @returns 欧几里得距离
 */
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * 计算矩形中心点
 * @param x - 矩形X坐标
 * @param y - 矩形Y坐标
 * @param width - 矩形宽度
 * @param height - 矩形高度
 * @returns 中心点坐标
 */
export function getRectCenter(
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: x + width / 2,
    y: y + height / 2
  }
}

/**
 * 计算旋转后的点坐标
 * @param x - 原始X坐标
 * @param y - 原始Y坐标
 * @param centerX - 旋转中心X坐标
 * @param centerY - 旋转中心Y坐标
 * @param angle - 旋转角度（度）
 * @returns 旋转后的坐标
 */
export function rotatePoint(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  angle: number
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  
  const dx = x - centerX
  const dy = y - centerY
  
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos
  }
}

/**
 * 计算缩放后的矩形尺寸
 * @param width - 原始宽度
 * @param height - 原始高度
 * @param scale - 缩放比例
 * @param maintainAspectRatio - 是否保持宽高比
 * @returns 缩放后的尺寸
 */
export function scaleRect(
  width: number,
  height: number,
  scale: number,
  maintainAspectRatio = true
): { width: number; height: number } {
  if (maintainAspectRatio) {
    return {
      width: width * scale,
      height: height * scale
    }
  }
  return {
    width: width * scale,
    height: height
  }
}

/**
 * 格式化数字为千分位
 * @param num - 数字
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number, decimals = 0): string {
  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * 生成指定范围内的随机整数
 * @param min - 最小值
 * @param max - 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成指定范围内的随机浮点数
 * @param min - 最小值
 * @param max - 最大值
 * @param decimals - 小数位数
 * @returns 随机浮点数
 */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const num = Math.random() * (max - min) + min
  return parseFloat(num.toFixed(decimals))
}
