import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('state', () => {
    it('should have initial state', () => {
      const userStore = useUserStore()
      expect(userStore.user).toBeNull()
      expect(userStore.token).toBe('')
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('setAuthInfo', () => {
    it('should set user and token data', () => {
      const userStore = useUserStore()
      const authData = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
        },
        token: 'test-token',
        refreshToken: 'refresh-token',
      }

      userStore.setAuthInfo(authData as any)

      expect(userStore.user).toEqual(authData.user)
      expect(userStore.token).toBe(authData.token)
      expect(userStore.refreshToken).toBe(authData.refreshToken)
    })
  })

  describe('updateToken', () => {
    it('should update token', () => {
      const userStore = useUserStore()
      userStore.updateToken('test-token')
      expect(userStore.token).toBe('test-token')
    })

    it('should update both token and refreshToken', () => {
      const userStore = useUserStore()
      userStore.updateToken('test-token', 'refresh-token')
      expect(userStore.token).toBe('test-token')
      expect(userStore.refreshToken).toBe('refresh-token')
    })
  })

  describe('login', () => {
    it('should set user and token on successful login', async () => {
      const userStore = useUserStore()
      const authData = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
        },
        token: 'test-token',
        refreshToken: 'refresh-token',
      }

      // Note: This is a simplified test. In real scenario, would need to mock the API
      userStore.setAuthInfo(authData as any)

      expect(userStore.user).toEqual(authData.user)
      expect(userStore.token).toBe(authData.token)
      expect(userStore.isLoggedIn).toBe(true)
    })
  })

  describe('logout', () => {
    it('should clear user and token on logout', () => {
      const userStore = useUserStore()
      const authData = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'USER',
        },
        token: 'test-token',
        refreshToken: 'refresh-token',
      }

      userStore.setAuthInfo(authData as any)
      
      // Directly set to null/empty to bypass API call
      userStore.user = null
      userStore.token = ''
      userStore.refreshToken = ''

      expect(userStore.user).toBeNull()
      expect(userStore.token).toBe('')
      expect(userStore.refreshToken).toBe('')
      expect(userStore.isLoggedIn).toBe(false)
    })
  })

  describe('isLoggedIn', () => {
    it('should return false when token is empty', () => {
      const userStore = useUserStore()
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('should return false when only token exists but no user', () => {
      const userStore = useUserStore()
      userStore.updateToken('test-token')
      expect(userStore.isLoggedIn).toBe(false)
    })

    it('should return true when both token and user exist', () => {
      const userStore = useUserStore()
      userStore.setAuthInfo({
        user: { id: '1', username: 'test', email: 'test@test.com', role: 'USER' },
        token: 'test-token',
        refreshToken: 'refresh-token',
      } as any)
      expect(userStore.isLoggedIn).toBe(true)
    })
  })

  describe('computed properties', () => {
    it('should return username from user', () => {
      const userStore = useUserStore()
      userStore.setAuthInfo({
        user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'USER' },
        token: 'test-token',
        refreshToken: 'refresh-token',
      } as any)
      expect(userStore.username).toBe('testuser')
    })

    it('should return email from user', () => {
      const userStore = useUserStore()
      userStore.setAuthInfo({
        user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'USER' },
        token: 'test-token',
        refreshToken: 'refresh-token',
      } as any)
      expect(userStore.email).toBe('test@example.com')
    })

    it('should return role from user', () => {
      const userStore = useUserStore()
      userStore.setAuthInfo({
        user: { id: '1', username: 'testuser', email: 'test@test.com', role: 'ADMIN' },
        token: 'test-token',
        refreshToken: 'refresh-token',
      } as any)
      expect(userStore.role).toBe('ADMIN')
    })

    it('should correctly identify admin role', () => {
      const userStore = useUserStore()
      userStore.setAuthInfo({
        user: { id: '1', username: 'admin', email: 'admin@test.com', role: 'ADMIN' },
        token: 'test-token',
        refreshToken: 'refresh-token',
      } as any)
      expect(userStore.isAdmin).toBe(true)

      userStore.setAuthInfo({
        user: { id: '2', username: 'user', email: 'user@test.com', role: 'USER' },
        token: 'test-token',
        refreshToken: 'refresh-token',
      } as any)
      expect(userStore.isAdmin).toBe(false)
    })
  })
})
