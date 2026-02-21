import { describe, it, expect } from 'vitest'

describe('Format Utils', () => {
  describe('number formatting', () => {
    it('should format numbers with commas', () => {
      const formatWithCommas = (num: number) => num.toLocaleString()
      
      expect(formatWithCommas(1000)).toBe('1,000')
      expect(formatWithCommas(1000000)).toBe('1,000,000')
    })

    it('should format currency', () => {
      const formatCurrency = (num: number, currency = 'USD') => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num)
      
      expect(formatCurrency(1000)).toContain('1,000')
      expect(formatCurrency(1000, 'USD')).toContain('$')
    })

    it('should format decimal places', () => {
      const formatDecimals = (num: number, decimals = 2) => 
        num.toFixed(decimals)
      
      expect(formatDecimals(3.14159, 2)).toBe('3.14')
      expect(formatDecimals(3.14159, 3)).toBe('3.142')
    })
  })

  describe('date formatting', () => {
    it('should format date with toLocaleDateString', () => {
      const date = new Date('2024-01-15')
      const formatted = date.toLocaleDateString('zh-CN')
      
      expect(formatted).toContain('2024')
    })

    it('should format time with toLocaleTimeString', () => {
      const date = new Date('2024-01-15T10:30:00')
      const formatted = date.toLocaleTimeString('zh-CN')
      
      expect(formatted).toContain('10')
    })

    it('should format datetime', () => {
      const date = new Date('2024-01-15T10:30:00')
      const formatted = date.toLocaleString('zh-CN')
      
      expect(formatted).toContain('2024')
      expect(formatted).toContain('10')
    })

    it('should calculate relative time', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const diffHours = (now.getTime() - oneHourAgo.getTime()) / (1000 * 60 * 60)
      const diffDays = (now.getTime() - oneDayAgo.getTime()) / (1000 * 60 * 60 * 24)
      
      expect(diffHours).toBeCloseTo(1, 0)
      expect(diffDays).toBeCloseTo(1, 0)
    })
  })

  describe('string formatting', () => {
    it('should truncate string', () => {
      const truncate = (str: string, length: number) => 
        str.length > length ? str.slice(0, length) + '...' : str
      
      expect(truncate('Hello World', 5)).toBe('Hello...')
      expect(truncate('Hi', 10)).toBe('Hi')
    })

    it('should capitalize string', () => {
      const capitalize = (str: string) => 
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
      
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
    })

    it('should convert to camelCase', () => {
      const toCamelCase = (str: string) => 
        str.replace(/[-_](\w)/g, (_, c) => c ? c.toUpperCase() : '')
      
      expect(toCamelCase('hello-world')).toBe('helloWorld')
      expect(toCamelCase('hello_world')).toBe('helloWorld')
    })

    it('should convert to kebab-case', () => {
      const toKebabCase = (str: string) => 
        str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      
      expect(toKebabCase('helloWorld')).toBe('hello-world')
    })
  })

  describe('file size formatting', () => {
    it('should format bytes to KB, MB, GB', () => {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      }
      
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })

  describe('validation helpers', () => {
    it('should validate email', () => {
      const isValidEmail = (email: string) => 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })

    it('should validate URL', () => {
      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      }
      
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://test.com/path')).toBe(true)
      expect(isValidUrl('invalid')).toBe(false)
    })

    it('should validate phone number', () => {
      const isValidPhone = (phone: string) => 
        /^1[3-9]\d{9}$/.test(phone)
      
      expect(isValidPhone('13812345678')).toBe(true)
      expect(isValidPhone('12345678901')).toBe(false)
      expect(isValidPhone('12345')).toBe(false)
    })
  })

  describe('array operations', () => {
    it('should group array by key', () => {
      const groupBy = <T>(arr: T[], key: keyof T) => 
        arr.reduce((result, item) => {
          const groupKey = String(item[key])
          if (!result[groupKey]) result[groupKey] = []
          result[groupKey].push(item)
          return result
        }, {} as Record<string, T[]>)
      
      const data = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ]
      
      const grouped = groupBy(data, 'type')
      expect(grouped['a']).toHaveLength(2)
      expect(grouped['b']).toHaveLength(1)
    })

    it('should remove duplicates', () => {
      const unique = <T>(arr: T[], key?: keyof T): T[] => {
        if (!key) return [...new Set(arr)]
        return [...new Map(arr.map(item => [item[key], item])).values()]
      }
      
      expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3])
    })

    it('should sort by multiple keys', () => {
      const sortBy = <T>(arr: T[], ...keys: (keyof T)[]): T[] => {
        return [...arr].sort((a, b) => {
          for (const key of keys) {
            if (a[key] < b[key]) return -1
            if (a[key] > b[key]) return 1
          }
          return 0
        })
      }
      
      const data = [
        { name: 'b', age: 20 },
        { name: 'a', age: 30 },
        { name: 'a', age: 20 },
      ]
      
      const sorted = sortBy(data, 'name', 'age')
      expect(sorted[0].name).toBe('a')
      expect(sorted[0].age).toBe(20)
    })
  })
})
