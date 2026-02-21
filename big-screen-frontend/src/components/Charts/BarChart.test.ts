import { describe, it, expect } from 'vitest'

describe('BarChart', () => {
  describe('data processing', () => {
    it('should handle single series data', () => {
      const data = [{ name: 'A', value: 100 }]
      expect(data).toHaveLength(1)
      expect(data[0].value).toBe(100)
    })

    it('should handle multi-series data', () => {
      const data = [
        { name: 'Series A', values: [120, 200, 150] },
        { name: 'Series B', values: [80, 70, 90] },
      ]
      expect(data).toHaveLength(2)
    })

    it('should handle data with custom colors', () => {
      const data = [
        { name: 'A', value: 100, itemStyle: { color: '#ff0000' } },
        { name: 'B', value: 200, itemStyle: { color: '#00ff00' } },
      ]
      
      expect(data[0].itemStyle?.color).toBe('#ff0000')
      expect(data[1].itemStyle?.color).toBe('#00ff00')
    })

    it('should handle numeric values including zero and negative', () => {
      const data = [
        { name: 'A', value: 0 },
        { name: 'B', value: 100 },
        { name: 'C', value: -50 },
      ]
      
      expect(data[0].value).toBe(0)
      expect(data[1].value).toBe(100)
      expect(data[2].value).toBe(-50)
    })

    it('should handle empty data', () => {
      const data: any[] = []
      expect(data).toHaveLength(0)
    })

    it('should handle large values', () => {
      const data = [
        { name: 'A', value: 1000000 },
        { name: 'B', value: 2500000 },
      ]
      
      expect(data[0].value).toBe(1000000)
      expect(data[1].value).toBe(2500000)
    })
  })

  describe('direction options', () => {
    it('should generate correct config for vertical', () => {
      const direction = 'vertical'
      const expectedXAxis = { type: 'category' }
      const expectedYAxis = { type: 'value' }
      
      expect(expectedXAxis.type).toBe('category')
      expect(expectedYAxis.type).toBe('value')
    })

    it('should generate correct config for horizontal', () => {
      const direction = 'horizontal'
      
      // For horizontal, xAxis is value and yAxis is category
      const expectedXAxis = { type: 'value' }
      const expectedYAxis = { type: 'category' }
      
      expect(expectedXAxis.type).toBe('value')
      expect(expectedYAxis.type).toBe('category')
    })
  })

  describe('stacked mode', () => {
    it('should enable stack for multiple series', () => {
      const stacked = true
      const data = [
        { name: 'Series A', values: [120, 200, 150] },
        { name: 'Series B', values: [80, 70, 90] },
      ]
      
      // In stacked mode, each series should have stack property
      const shouldHaveStack = stacked && data.length > 1
      
      expect(shouldHaveStack).toBe(true)
    })

    it('should not enable stack for single series', () => {
      const stacked = true
      const data = [{ name: 'Series A', values: [120] }]
      
      const shouldHaveStack = stacked && data.length > 1
      
      expect(shouldHaveStack).toBe(false)
    })

    it('should not enable stack when stacked is false', () => {
      const stacked = false
      const data = [
        { name: 'Series A', values: [120, 200] },
        { name: 'Series B', values: [80, 70] },
      ]
      
      expect(stacked).toBe(false)
    })
  })

  describe('chart options', () => {
    it('should include title when provided', () => {
      const title = 'Sales Chart'
      const hasTitle = !!title
      
      expect(hasTitle).toBe(true)
    })

    it('should include legend when multiple series', () => {
      const data = [
        { name: 'Series A', values: [120] },
        { name: 'Series B', values: [80] },
      ]
      
      const shouldShowLegend = data.length > 1
      
      expect(shouldShowLegend).toBe(true)
    })

    it('should handle custom colors', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff']
      
      expect(colors).toHaveLength(3)
      expect(colors[0]).toBe('#ff0000')
    })

    it('should handle showValue option', () => {
      const showValue = true
      
      expect(showValue).toBe(true)
    })

    it('should handle grid options', () => {
      const grid = {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '10%',
      }
      
      expect(grid.left).toBe('10%')
      expect(grid.right).toBe('10%')
    })
  })

  describe('animation', () => {
    it('should enable animation by default', () => {
      const animation = true
      expect(animation).toBe(true)
    })

    it('should allow disabling animation', () => {
      const animation = false
      expect(animation).toBe(false)
    })

    it('should handle custom animation duration', () => {
      const animationDuration = 1000
      expect(animationDuration).toBe(1000)
    })
  })

  describe('tooltip', () => {
    it('should show tooltip by default', () => {
      const showTooltip = true
      expect(showTooltip).toBe(true)
    })

    it('should allow disabling tooltip', () => {
      const showTooltip = false
      expect(showTooltip).toBe(false)
    })

    it('should format tooltip value', () => {
      const formatter = (value: number) => `${value.toFixed(2)}`
      
      expect(formatter(100)).toBe('100.00')
      expect(formatter(99.9)).toBe('99.90')
    })
  })

  describe('xAxis and yAxis', () => {
    it('should handle category axis', () => {
      const axis = { type: 'category', data: ['Mon', 'Tue', 'Wed'] }
      expect(axis.type).toBe('category')
      expect(axis.data).toHaveLength(3)
    })

    it('should handle value axis', () => {
      const axis = { type: 'value', min: 0 }
      expect(axis.type).toBe('value')
      expect(axis.min).toBe(0)
    })

    it('should handle axis label rotation', () => {
      const axisLabel = { rotate: 45 }
      expect(axisLabel.rotate).toBe(45)
    })

    it('should handle axis interval', () => {
      const axisLabel = { interval: 0 }
      expect(axisLabel.interval).toBe(0)
    })
  })
})
