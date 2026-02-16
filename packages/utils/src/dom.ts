/**
 * DOM 相关工具函数
 */

/** 判断是否运行在浏览器环境 */
export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

/** 判断是否运行在服务器环境 */
export const isServer = !isBrowser

/** 判断是否运行在移动端 */
export const isMobile = isBrowser && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

/** 判断是否运行在触摸设备 */
export const isTouchDevice = isBrowser && (('ontouchstart' in window) || navigator.maxTouchPoints > 0)

/**
 * 获取元素相对于视口的位置
 * @param element - DOM元素
 * @returns 元素位置信息
 */
export function getElementRect(element: Element): DOMRect {
  return element.getBoundingClientRect()
}

/**
 * 获取元素相对于父元素的位置
 * @param element - DOM元素
 * @param parent - 父元素（默认为offsetParent）
 * @returns 相对位置
 */
export function getRelativePosition(element: HTMLElement, parent?: HTMLElement): { x: number; y: number } {
  const parentRect = (parent || element.offsetParent)?.getBoundingClientRect() || { left: 0, top: 0 }
  const elementRect = element.getBoundingClientRect()
  
  return {
    x: elementRect.left - parentRect.left,
    y: elementRect.top - parentRect.top
  }
}

/**
 * 检测点是否在元素内
 * @param element - DOM元素
 * @param x - X坐标
 * @param y - Y坐标
 * @returns 是否在内
 */
export function isPointInElement(element: Element, x: number, y: number): boolean {
  const rect = element.getBoundingClientRect()
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

/**
 * 检测两个元素是否重叠
 * @param elem1 - 元素1
 * @param elem2 - 元素2
 * @returns 是否重叠
 */
export function isElementsOverlap(elem1: Element, elem2: Element): boolean {
  const rect1 = elem1.getBoundingClientRect()
  const rect2 = elem2.getBoundingClientRect()
  
  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom)
}

/**
 * 获取滚动条宽度
 * @returns 滚动条宽度
 */
export function getScrollbarWidth(): number {
  if (!isBrowser) return 0
  
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll'
  outer.style.msOverflowStyle = 'scrollbar'
  document.body.appendChild(outer)
  
  const inner = document.createElement('div')
  outer.appendChild(inner)
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth
  
  outer.parentNode?.removeChild(outer)
  
  return scrollbarWidth
}

/**
 * 平滑滚动到元素
 * @param element - 目标元素或选择器
 * @param options - 滚动选项
 */
export function scrollToElement(
  element: Element | string,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
): void {
  if (!isBrowser) return
  
  const el = typeof element === 'string' 
    ? document.querySelector(element)
    : element
    
  el?.scrollIntoView(options)
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param delay - 延迟时间(ms)
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastTime = 0
  let lastResult: ReturnType<T>
  
  return function(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      lastResult = fn.apply(this, args) as ReturnType<T>
    }
    return lastResult
  }
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间(ms)
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return function(this: unknown, ...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}
