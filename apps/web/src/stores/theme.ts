/**
 * 主题状态管理
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Theme, ThemeVariables } from '@bigscreen/types'

// 默认浅色主题
const defaultLightTheme: Theme = {
  id: 'light',
  name: '浅色主题',
  isDark: false,
  variables: {
    '--color-primary': '#1890ff',
    '--color-primary-light': '#40a9ff',
    '--color-primary-dark': '#096dd9',
    '--color-secondary': '#722ed1',
    '--color-success': '#52c41a',
    '--color-warning': '#faad14',
    '--color-error': '#f5222d',
    '--color-info': '#1890ff',
    '--color-bg-primary': '#ffffff',
    '--color-bg-secondary': '#f5f5f5',
    '--color-bg-tertiary': '#fafafa',
    '--color-bg-elevated': '#ffffff',
    '--color-text-primary': '#262626',
    '--color-text-secondary': '#595959',
    '--color-text-tertiary': '#8c8c8c',
    '--color-text-disabled': '#bfbfbf',
    '--color-border': '#d9d9d9',
    '--color-border-light': '#f0f0f0',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '--spacing-xs': '4px',
    '--spacing-sm': '8px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px',
    '--spacing-2xl': '48px',
    '--radius-sm': '2px',
    '--radius-md': '4px',
    '--radius-lg': '8px',
    '--radius-xl': '16px',
    '--radius-full': '9999px',
    '--font-family-base': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    '--font-family-mono': 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    '--font-size-xs': '12px',
    '--font-size-sm': '14px',
    '--font-size-base': '16px',
    '--font-size-lg': '18px',
    '--font-size-xl': '20px',
    '--font-size-2xl': '24px',
    '--duration-fast': '150ms',
    '--duration-normal': '250ms',
    '--duration-slow': '350ms',
    '--ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    '--ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  },
}

// 默认深色主题
const defaultDarkTheme: Theme = {
  id: 'dark',
  name: '深色主题',
  isDark: true,
  variables: {
    ...defaultLightTheme.variables,
    '--color-primary': '#177ddc',
    '--color-primary-light': '#3c9ae8',
    '--color-primary-dark': '#0958d9',
    '--color-bg-primary': '#141414',
    '--color-bg-secondary': '#1f1f1f',
    '--color-bg-tertiary': '#262626',
    '--color-bg-elevated': '#1f1f1f',
    '--color-text-primary': '#ffffff',
    '--color-text-secondary': '#bfbfbf',
    '--color-text-tertiary': '#8c8c8c',
    '--color-text-disabled': '#595959',
    '--color-border': '#434343',
    '--color-border-light': '#303030',
    '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
    '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
  },
}

export const useThemeStore = defineStore('theme', () => {
  // ============ State ============
  const currentTheme = ref<Theme>({ ...defaultLightTheme })
  const themes = ref<Theme[]>([defaultLightTheme, defaultDarkTheme])
  const customVariables = ref<Partial<ThemeVariables>>({})

  // ============ Getters ============
  const isDark = computed(() => currentTheme.value.isDark)
  
  const cssVariables = computed(() => {
    return {
      ...currentTheme.value.variables,
      ...customVariables.value,
    }
  })

  // ============ Actions ============
  
  /**
   * 初始化主题
   */
  function initTheme(): void {
    // 从本地存储读取主题设置
    const savedTheme = localStorage.getItem('bs-theme')
    const savedCustomVars = localStorage.getItem('bs-theme-custom-vars')
    
    if (savedTheme) {
      const theme = themes.value.find(t => t.id === savedTheme)
      if (theme) {
        setTheme(theme)
      }
    }
    
    if (savedCustomVars) {
      try {
        customVariables.value = JSON.parse(savedCustomVars)
      } catch {
        console.warn('Failed to parse custom theme variables')
      }
    }
    
    // 应用CSS变量
    applyCSSVariables()
  }

  /**
   * 设置主题
   */
  function setTheme(theme: Theme): void {
    currentTheme.value = { ...theme }
    localStorage.setItem('bs-theme', theme.id)
    applyCSSVariables()
  }

  /**
   * 切换主题
   */
  function toggleTheme(): void {
    const targetTheme = isDark.value 
      ? themes.value.find(t => t.id === 'light')
      : themes.value.find(t => t.id === 'dark')
    
    if (targetTheme) {
      setTheme(targetTheme)
    }
  }

  /**
   * 添加自定义主题
   */
  function addTheme(theme: Theme): void {
    themes.value.push(theme)
  }

  /**
   * 删除自定义主题
   */
  function removeTheme(themeId: string): void {
    const index = themes.value.findIndex(t => t.id === themeId)
    if (index > -1 && !['light', 'dark'].includes(themeId)) {
      themes.value.splice(index, 1)
    }
  }

  /**
   * 更新自定义变量
   */
  function updateCustomVariables(variables: Partial<ThemeVariables>): void {
    customVariables.value = { ...customVariables.value, ...variables }
    localStorage.setItem('bs-theme-custom-vars', JSON.stringify(customVariables.value))
    applyCSSVariables()
  }

  /**
   * 重置自定义变量
   */
  function resetCustomVariables(): void {
    customVariables.value = {}
    localStorage.removeItem('bs-theme-custom-vars')
    applyCSSVariables()
  }

  /**
   * 应用CSS变量到文档
   */
  function applyCSSVariables(): void {
    const root = document.documentElement
    const variables = cssVariables.value
    
    Object.entries(variables).forEach(([key, value]) => {
      if (value !== undefined) {
        root.style.setProperty(key, String(value))
      }
    })
  }

  return {
    // State
    currentTheme,
    themes,
    customVariables,
    
    // Getters
    isDark,
    cssVariables,
    
    // Actions
    initTheme,
    setTheme,
    toggleTheme,
    addTheme,
    removeTheme,
    updateCustomVariables,
    resetCustomVariables,
    applyCSSVariables,
  }
})
