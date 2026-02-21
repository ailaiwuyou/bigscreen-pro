import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useVariableStore } from '../variable'

describe('Variable Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have empty variables array', () => {
      const store = useVariableStore()
      expect(store.variables).toEqual([])
      expect(store.values).toEqual({})
    })

    it('should have loading as false', () => {
      const store = useVariableStore()
      expect(store.loading).toBe(false)
    })

    it('should have error as null', () => {
      const store = useVariableStore()
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('allVariables should return all variables', () => {
      const store = useVariableStore()
      // @ts-ignore
      store.variables = [
        { id: '1', name: 'var1', type: 'query' },
        { id: '2', name: 'var2', type: 'custom' },
      ]
      expect(store.allVariables).toHaveLength(2)
    })

    it('enabledVariables should filter disabled', () => {
      const store = useVariableStore()
      // @ts-ignore
      store.variables = [
        { id: '1', name: 'var1', enabled: true },
        { id: '2', name: 'var2', enabled: false },
      ]
      expect(store.enabledVariables).toHaveLength(1)
    })

    it('hasVariable should check existence', () => {
      const store = useVariableStore()
      // @ts-ignore
      store.variables = [{ id: '1', name: 'testVar', type: 'query' }]
      expect(store.hasVariable('testVar')).toBe(true)
      expect(store.hasVariable('nonExistent')).toBe(false)
    })
  })

  describe('Actions', () => {
    describe('addVariable', () => {
      it('should add a new variable', () => {
        const store = useVariableStore()
        const newVar = store.addVariable({
          name: 'server',
          type: 'query',
          defaultValue: 'prod',
        })
        
        expect(newVar).toBeDefined()
        expect(newVar.name).toBe('server')
        expect(store.variables).toHaveLength(1)
      })

      it('should set default value for single select', () => {
        const store = useVariableStore()
        store.addVariable({
          name: 'env',
          type: 'query',
          defaultValue: 'dev',
          multi: false,
        })
        
        expect(store.values.env).toBe('dev')
      })

      it('should set default value as array for multi select', () => {
        const store = useVariableStore()
        store.addVariable({
          name: 'servers',
          type: 'query',
          defaultValue: 'srv1',
          multi: true,
        })
        
        expect(store.values.servers).toEqual(['srv1'])
      })

      it('should generate unique id', () => {
        const store = useVariableStore()
        const var1 = store.addVariable({ name: 'var1', type: 'query' })
        const var2 = store.addVariable({ name: 'var2', type: 'query' })
        
        expect(var1.id).not.toBe(var2.id)
      })
    })

    describe('updateVariable', () => {
      it('should update existing variable', () => {
        const store = useVariableStore()
        const { id } = store.addVariable({ name: 'test', type: 'query' })
        
        const result = store.updateVariable(id, { label: 'Test Label' })
        
        expect(result).toBe(true)
        expect(store.variables[0].label).toBe('Test Label')
      })

      it('should return false for non-existent variable', () => {
        const store = useVariableStore()
        const result = store.updateVariable('non-existent', { label: 'Test' })
        
        expect(result).toBe(false)
      })
    })

    describe('removeVariable', () => {
      it('should remove variable by id', () => {
        const store = useVariableStore()
        const { id } = store.addVariable({ name: 'test', type: 'query' })
        
        const result = store.removeVariable(id)
        
        expect(result).toBe(true)
        expect(store.variables).toHaveLength(0)
      })

      it('should clean up values when removed', () => {
        const store = useVariableStore()
        const { id } = store.addVariable({ name: 'test', type: 'query', defaultValue: 'val' })
        
        store.removeVariable(id)
        
        expect(store.values.test).toBeUndefined()
      })
    })

    describe('setValue', () => {
      it('should set value for existing variable', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'server', type: 'query' })
        
        const result = store.setValue('server', 'prod-1')
        
        expect(result).toBe(true)
        expect(store.values.server).toBe('prod-1')
      })

      it('should handle multi-select value as array', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'servers', type: 'query', multi: true })
        
        store.setValue('servers', ['srv1', 'srv2'])
        
        expect(store.values.servers).toEqual(['srv1', 'srv2'])
      })

      it('should handle non-array value for multi-select', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'servers', type: 'query', multi: true })
        
        store.setValue('servers', 'single')
        
        expect(store.values.servers).toEqual(['single'])
      })

      it('should warn for non-existent variable', () => {
        const store = useVariableStore()
        const result = store.setValue('nonExistent', 'value')
        
        expect(result).toBe(false)
      })
    })

    describe('resetValue', () => {
      it('should reset to default value', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'env', type: 'query', defaultValue: 'dev' })
        store.setValue('env', 'prod')
        
        store.resetValue('env')
        
        expect(store.values.env).toBe('dev')
      })

      it('should handle multi-select reset', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'env', type: 'query', defaultValue: 'dev', multi: true })
        store.setValue('env', ['prod', 'staging'])
        
        store.resetValue('env')
        
        expect(store.values.env).toEqual(['dev'])
      })
    })

    describe('resetAll', () => {
      it('should reset all variables to defaults', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'var1', type: 'query', defaultValue: 'val1' })
        store.addVariable({ name: 'var2', type: 'query', defaultValue: 'val2' })
        
        store.setValue('var1', 'newVal1')
        store.setValue('var2', 'newVal2')
        
        store.resetAll()
        
        expect(store.values.var1).toBe('val1')
        expect(store.values.var2).toBe('val2')
      })
    })

    describe('clearAll', () => {
      it('should remove all variables and values', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'var1', type: 'query' })
        store.addVariable({ name: 'var2', type: 'custom' })
        
        store.clearAll()
        
        expect(store.variables).toEqual([])
        expect(store.values).toEqual({})
      })
    })

    describe('loadFromConfig', () => {
      it('should load variables from config array', () => {
        const store = useVariableStore()
        const config = [
          { name: 'server', type: 'query', defaultValue: 'prod' },
          { name: 'env', type: 'custom', defaultValue: 'dev' },
        ]
        
        store.loadFromConfig(config)
        
        expect(store.variables).toHaveLength(2)
        expect(store.values.server).toBe('prod')
        expect(store.values.env).toBe('dev')
      })

      it('should generate ids if not provided', () => {
        const store = useVariableStore()
        store.loadFromConfig([{ name: 'test', type: 'query' }])
        
        expect(store.variables[0].id).toBeDefined()
      })
    })

    describe('exportConfig', () => {
      it('should export variables without internal id', () => {
        const store = useVariableStore()
        store.addVariable({ name: 'test', type: 'query' })
        
        const config = store.exportConfig()
        
        expect(config[0].id).toBeUndefined()
        expect(config[0].name).toBe('test')
      })
    })
  })
})
