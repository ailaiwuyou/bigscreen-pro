import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateShortId,
  snapToGrid,
  calculateScale,
  formatNumber,
  formatPercent,
  deepCloneComponent,
  createDefaultComponent,
} from '@/utils/editor'

describe('editor utils', () => {
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('generateShortId', () => {
    it('should generate a short ID', () => {
      const id = generateShortId()
      expect(id.length).toBe(8)
    })

    it('should generate unique short IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateShortId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('snapToGrid', () => {
    it('should snap value to nearest grid point', () => {
      expect(snapToGrid(15, 10)).toBe(20)
      expect(snapToGrid(14, 10)).toBe(10)
      expect(snapToGrid(10, 10)).toBe(10)
    })

    it('should return original value when gridSize is 0', () => {
      expect(snapToGrid(15, 0)).toBe(15)
    })

    it('should return original value when gridSize is negative', () => {
      expect(snapToGrid(15, -5)).toBe(15)
    })
  })

  describe('calculateScale', () => {
    it('should calculate scale for contain mode', () => {
      expect(calculateScale(100, 100, 50, 50, 'contain')).toBe(2)
      expect(calculateScale(100, 50, 50, 100, 'contain')).toBe(0.5)
    })

    it('should calculate scale for cover mode', () => {
      expect(calculateScale(100, 100, 50, 50, 'cover')).toBe(2)
      // cover mode uses max, so 100/50=2 and 50/100=0.5, max is 2
      expect(calculateScale(100, 50, 50, 100, 'cover')).toBe(2)
    })

    it('should return 1 for none mode', () => {
      expect(calculateScale(100, 100, 50, 50, 'none')).toBe(1)
    })
  })

  describe('formatNumber', () => {
    it('should format billions', () => {
      expect(formatNumber(1000000000)).toBe('1.0B')
      expect(formatNumber(2500000000)).toBe('2.5B')
    })

    it('should format millions', () => {
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(2500000)).toBe('2.5M')
    })

    it('should format thousands', () => {
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(2500)).toBe('2.5K')
    })

    it('should return string for small numbers', () => {
      expect(formatNumber(100)).toBe('100')
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatPercent', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercent(0.5)).toBe('50.0%')
      expect(formatPercent(1)).toBe('100.0%')
    })

    it('should format percentage with custom decimals', () => {
      expect(formatPercent(0.333, 2)).toBe('33.30%')
      expect(formatPercent(0.125, 3)).toBe('12.500%')
    })
  })

  describe('deepCloneComponent', () => {
    it('should deep clone a component', () => {
      const component = {
        id: 'test-id',
        type: 'text',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        props: {
          content: 'Hello',
          style: {
            color: '#ff0000',
          },
        },
      }

      const cloned = deepCloneComponent(component as any)

      expect(cloned).toEqual(component)
      expect(cloned.id).toBe(component.id)
      expect(cloned.props).not.toBe(component.props)
      expect(cloned.props.style).not.toBe(component.props.style)
    })
  })

  describe('createDefaultComponent', () => {
    it('should create text component', () => {
      const component = createDefaultComponent('text')
      expect(component.type).toBe('text')
      expect(component.props.content).toBe('文本内容')
    })

    it('should create image component', () => {
      const component = createDefaultComponent('image')
      expect(component.type).toBe('image')
      expect(component.props.fit).toBe('contain')
    })

    it('should create bar-chart component', () => {
      const component = createDefaultComponent('bar-chart')
      expect(component.type).toBe('bar-chart')
      expect(component.props.title).toBe('柱状图')
    })

    it('should create line-chart component', () => {
      const component = createDefaultComponent('line-chart')
      expect(component.type).toBe('line-chart')
    })

    it('should create pie-chart component', () => {
      const component = createDefaultComponent('pie-chart')
      expect(component.type).toBe('pie-chart')
    })

    it('should create metric-card component', () => {
      const component = createDefaultComponent('metric-card')
      expect(component.type).toBe('metric-card')
    })

    it('should create generic component for unknown type', () => {
      const component = createDefaultComponent('unknown')
      expect(component.type).toBe('unknown')
      expect(component.width).toBe(200)
      expect(component.height).toBe(200)
    })
  })
})
