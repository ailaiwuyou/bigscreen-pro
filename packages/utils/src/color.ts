/**
 * 颜色处理工具函数
 */

/** RGB颜色对象 */
export interface RGBColor {
  r: number
  g: number
  b: number
}

/** RGBA颜色对象 */
export interface RGBAColor extends RGBColor {
  a: number
}

/** HSL颜色对象 */
export interface HSLColor {
  h: number
  s: number
  l: number
}

/** HSLA颜色对象 */
export interface HSLAColor extends HSLColor {
  a: number
}

/**
 * 解析HEX颜色
 * @param hex - HEX颜色字符串
 * @returns RGB颜色对象
 */
export function hexToRgb(hex: string): RGBColor {
  // 移除#前缀
  hex = hex.replace('#', '')
  
  // 处理3位HEX
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  
  const bigint = parseInt(hex, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

/**
 * 将RGB转换为HEX
 * @param r - 红色值
 * @param g - 绿色值
 * @param b - 蓝色值
 * @returns HEX颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 将RGB转换为HSL
 * @param r - 红色值 (0-255)
 * @param g - 绿色值 (0-255)
 * @param b - 蓝色值 (0-255)
 * @returns HSL颜色对象
 */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * 将HSL转换为RGB
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param l - 亮度 (0-100)
 * @returns RGB颜色对象
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
  h /= 360
  s /= 100
  l /= 100
  
  let r: number, g: number, b: number
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * 调整颜色亮度
 * @param color - 颜色值(HEX或RGB)
 * @param amount - 调整量(-1到1，负数变暗，正数变亮)
 * @returns 调整后的HEX颜色
 */
export function adjustBrightness(color: string, amount: number): string {
  let r: number, g: number, b: number
  
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    r = rgb.r
    g = rgb.g
    b = rgb.b
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (!match) return color
    r = parseInt(match[0])
    g = parseInt(match[1])
    b = parseInt(match[2])
  } else {
    return color
  }
  
  const hsl = rgbToHsl(r, g, b)
  hsl.l = Math.max(0, Math.min(100, hsl.l + amount * 100))
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * 调整颜色透明度
 * @param color - 颜色值(HEX或RGB)
 * @param alpha - 透明度(0-1)
 * @returns RGBA颜色字符串
 */
export function adjustAlpha(color: string, alpha: number): string {
  let r: number, g: number, b: number
  
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    r = rgb.r
    g = rgb.g
    b = rgb.b
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (!match) return color
    r = parseInt(match[0])
    g = parseInt(match[1])
    b = parseInt(match[2])
  } else {
    return color
  }
  
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

/**
 * 生成渐变颜色
 * @param color1 - 起始颜色
 * @param color2 - 结束颜色
 * @param steps - 步数
 * @returns 颜色数组
 */
export function generateGradient(color1: string, color2: string, steps: number): string[] {
  const c1 = color1.startsWith('#') ? hexToRgb(color1) : { r: 0, g: 0, b: 0 }
  const c2 = color2.startsWith('#') ? hexToRgb(color2) : { r: 255, g: 255, b: 255 }
  
  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    const r = Math.round(c1.r + (c2.r - c1.r) * ratio)
    const g = Math.round(c1.g + (c2.g - c1.g) * ratio)
    const b = Math.round(c1.b + (c2.b - c1.b) * ratio)
    colors.push(rgbToHex(r, g, b))
  }
  
  return colors
}

/**
 * 判断颜色是否为深色
 * @param color - 颜色值
 * @returns 是否为深色
 */
export function isDarkColor(color: string): boolean {
  let r: number, g: number, b: number
  
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color)
    r = rgb.r
    g = rgb.g
    b = rgb.b
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (!match) return false
    r = parseInt(match[0])
    g = parseInt(match[1])
    b = parseInt(match[2])
  } else {
    return false
  }
  
  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 128
}
