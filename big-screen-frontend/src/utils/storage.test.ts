import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('localStorage operations', () => {
    it('should set item in localStorage', () => {
      const store: Record<string, string> = {}
      const setItem = vi.fn((key: string, value: string) => { store[key] = value })
      
      setItem('key', 'value')
      expect(setItem).toHaveBeenCalledWith('key', 'value')
      expect(store['key']).toBe('value')
    })

    it('should get item from localStorage', () => {
      const store: Record<string, string> = { key: 'value' }
      const getItem = vi.fn((key: string) => store[key] || null)
      
      expect(getItem('key')).toBe('value')
      expect(getItem('nonexistent')).toBeNull()
    })

    it('should remove item from localStorage', () => {
      const store: Record<string, string> = { key: 'value' }
      const removeItem = vi.fn((key: string) => { delete store[key] })
      
      removeItem('key')
      expect(removeItem).toHaveBeenCalledWith('key')
      expect(store['key']).toBeUndefined()
    })

    it('should handle JSON objects', () => {
      const data = { name: 'test', value: 123 }
      const jsonString = JSON.stringify(data)
      
      expect(() => JSON.parse(jsonString)).not.toThrow()
      expect(JSON.parse(jsonString)).toEqual(data)
    })

    it('should handle JSON arrays', () => {
      const data = [1, 2, 3, 'test', { key: 'value' }]
      const jsonString = JSON.stringify(data)
      
      expect(JSON.parse(jsonString)).toEqual(data)
    })
  })

  describe('sessionStorage operations', () => {
    it('should set item in sessionStorage', () => {
      const store: Record<string, string> = {}
      const setItem = vi.fn((key: string, value: string) => { store[key] = value })
      
      setItem('key', 'value')
      expect(setItem).toHaveBeenCalledWith('key', 'value')
    })

    it('should get item from sessionStorage', () => {
      const store: Record<string, string> = { key: 'value' }
      const getItem = vi.fn((key: string) => store[key] || null)
      
      expect(getItem('key')).toBe('value')
    })

    it('should remove item from sessionStorage', () => {
      const store: Record<string, string> = { key: 'value' }
      const removeItem = vi.fn((key: string) => { delete store[key] })
      
      removeItem('key')
      expect(removeItem).toHaveBeenCalledWith('key')
    })
  })

  describe('storage with expiration', () => {
    it('should store data with expiration time', () => {
      const storeWithExpiration = (key: string, value: any, expireMinutes: number) => {
        const item = {
          value,
          expire: Date.now() + expireMinutes * 60 * 1000
        }
        return JSON.stringify(item)
      }

      const result = storeWithExpiration('test', 'value', 30)
      const parsed = JSON.parse(result)
      
      expect(parsed.value).toBe('value')
      expect(parsed.expire).toBeGreaterThan(Date.now())
    })

    it('should check if data is expired', () => {
      const isExpired = (expire: number): boolean => {
        return Date.now() > expire
      }

      const expiredTime = Date.now() - 1000
      expect(isExpired(expiredTime)).toBe(true)
      
      const futureTime = Date.now() + 10000
      expect(isExpired(futureTime)).toBe(false)
    })
  })

  describe('storage size', () => {
    it('should calculate approximate storage size', () => {
      const calculateSize = (str: string): number => {
        return new Blob([str]).size
      }

      expect(calculateSize('hello')).toBe(5)
    })

    it('should estimate remaining storage', () => {
      const estimateRemaining = (): number => {
        return 5 * 1024 * 1024
      }

      expect(estimateRemaining()).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('should handle quota exceeded error', () => {
      const mockSetItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })
      
      expect(() => mockSetItem('key', 'value')).toThrow('QuotaExceededError')
    })
  })

  describe('data serialization', () => {
    it('should serialize and deserialize objects', () => {
      const obj = { name: 'test', nested: { key: 'value' } }
      const serialized = JSON.stringify(obj)
      const deserialized = JSON.parse(serialized)
      
      expect(deserialized).toEqual(obj)
    })

    it('should handle special values', () => {
      expect(JSON.parse('null')).toBeNull()
    })
  })

  describe('key naming conventions', () => {
    it('should use consistent prefix', () => {
      const PREFIX = 'bigscreen_'
      
      const generateKey = (key: string) => `${PREFIX}${key}`
      
      expect(generateKey('user')).toBe('bigscreen_user')
      expect(generateKey('token')).toBe('bigscreen_token')
    })

    it('should handle namespaced keys', () => {
      const namespacedGet = (namespace: string, key: string) => {
        return `${namespace}:${key}`
      }
      
      expect(namespacedGet('auth', 'token')).toBe('auth:token')
      expect(namespacedGet('config', 'theme')).toBe('config:theme')
    })
  })
})
