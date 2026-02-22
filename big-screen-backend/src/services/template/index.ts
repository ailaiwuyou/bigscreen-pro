/**
 * 仪表盘模板系统
 */

import { v4 as uuidv4 } from 'uuid'

// 模板类型
export interface DashboardTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  version: string
  author?: string
  components: TemplateComponent[]
  variables?: TemplateVariable[]
  settings: DashboardSettings
  createdAt: Date
  updatedAt: Date
}

// 模板组件
export interface TemplateComponent {
  id: string
  type: string
  title?: string
  x: number
  y: number
  width: number
  height: number
  props: Record<string, any>
}

// 模板变量
export interface TemplateVariable {
  name: string
  type: 'query' | 'custom' | 'text' | 'constant'
  defaultValue: any
  options?: { label: string; value: string }[]
  query?: string
}

// 仪表盘设置
export interface DashboardSettings {
  theme: 'light' | 'dark'
  backgroundColor?: string
  gridSize?: number
  refreshInterval?: number
}

// 预设模板库
export const PRESET_TEMPLATES: Omit<DashboardTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '销售数据大屏',
    description: '展示销售数据、订单统计、区域分布等',
    category: 'business',
    version: '1.0.0',
    author: 'BigScreen Team',
    components: [
      { id: 'c1', type: 'metric', title: '今日销售额', x: 0, y: 0, width: 3, height: 2, props: { value: 0, prefix: '¥' } },
      { id: 'c2', type: 'metric', title: '订单数量', x: 3, y: 0, width: 3, height: 2, props: { value: 0 } },
      { id: 'c3', type: 'metric', title: '客户数量', x: 6, y: 0, width: 3, height: 2, props: { value: 0 } },
      { id: 'c4', type: 'metric', title: '转化率', x: 9, y: 0, width: 3, height: 2, props: { value: 0, suffix: '%' } },
      { id: 'c5', type: 'bar', title: '月度销售趋势', x: 0, y: 2, width: 6, height: 4, props: {} },
      { id: 'c6', type: 'pie', title: '产品分类占比', x: 6, y: 2, width: 6, height: 4, props: {} },
      { id: 'c7', type: 'line', title: '地区销售排名', x: 0, y: 6, width: 12, height: 4, props: {} }
    ],
    settings: { theme: 'dark', backgroundColor: '#1a1a2e', gridSize: 12 }
  },
  {
    name: '运营监控大屏',
    description: '实时监控应用性能、用户行为、系统状态',
    category: 'monitoring',
    version: '1.0.0',
    author: 'BigScreen Team',
    components: [
      { id: 'c1', type: 'metric', title: 'DAU', x: 0, y: 0, width: 4, height: 2, props: {} },
      { id: 'c2', type: 'metric', title: '请求量', x: 4, y: 0, width: 4, height: 2, props: {} },
      { id: 'c3', type: 'metric', title: '错误率', x: 8, y: 0, width: 4, height: 2, props: {} },
      { id: 'c4', type: 'line', title: '实时请求', x: 0, y: 2, width: 8, height: 4, props: {} },
      { id: 'c5', type: 'graph', title: '服务拓扑', x: 8, y: 2, width: 4, height: 4, props: {} },
      { id: 'c6', type: 'table', title: '慢请求', x: 0, y: 6, width: 12, height: 4, props: {} }
    ],
    settings: { theme: 'dark', refreshInterval: 30000 }
  },
  {
    name: '数据统计分析',
    description: '数据可视化分析，支持多种图表类型',
    category: 'analytics',
    version: '1.0.0',
    author: 'BigScreen Team',
    components: [
      { id: 'c1', type: 'bar', title: '柱状图', x: 0, y: 0, width: 6, height: 4, props: {} },
      { id: 'c2', type: 'line', title: '折线图', x: 6, y: 0, width: 6, height: 4, props: {} },
      { id: 'c3', type: 'pie', title: '饼图', x: 0, y: 4, width: 4, height: 4, props: {} },
      { id: 'c4', type: 'radar', title: '雷达图', x: 4, y: 4, width: 4, height: 4, props: {} },
      { id: 'c5', type: 'scatter', title: '散点图', x: 8, y: 4, width: 4, height: 4, props: {} }
    ],
    settings: { theme: 'light', gridSize: 12 }
  },
  {
    name: 'IoT 设备监控',
    description: '展示物联网设备状态、传感器数据',
    category: 'iot',
    version: '1.0.0',
    author: 'BigScreen Team',
    components: [
      { id: 'c1', type: 'metric', title: '在线设备', x: 0, y: 0, width: 3, height: 2, props: {} },
      { id: 'c2', type: 'metric', title: '离线设备', x: 3, y: 0, width: 3, height: 2, props: {} },
      { id: 'c3', type: 'metric', title: '告警数', x: 6, y: 0, width: 3, height: 2, props: {} },
      { id: 'c4', type: 'gauge', title: '平均温度', x: 9, y: 0, width: 3, height: 2, props: {} },
      { id: 'c5', type: 'line', title: '温度趋势', x: 0, y: 2, width: 6, height: 4, props: {} },
      { id: 'c6', type: 'heatmap', title: '设备分布', x: 6, y: 2, width: 6, height: 4, props: {} },
      { id: 'c7', type: 'table', title: '设备列表', x: 0, y: 6, width: 12, height: 4, props: {} }
    ],
    settings: { theme: 'dark', refreshInterval: 10000 }
  }
]

// 模板服务类
export class TemplateService {
  private templates: Map<string, DashboardTemplate> = new Map()
  
  constructor() {
    // 加载预设模板
    this.loadPresetTemplates()
  }
  
  /**
   * 加载预设模板
   */
  private loadPresetTemplates(): void {
    PRESET_TEMPLATES.forEach(template => {
      const fullTemplate: DashboardTemplate = {
        ...template,
        id: `preset_${template.name.toLowerCase().replace(/\s+/g, '-')}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.templates.set(fullTemplate.id, fullTemplate)
    })
  }
  
  /**
   * 获取所有模板
   */
  getAll(): DashboardTemplate[] {
    return Array.from(this.templates.values())
  }
  
  /**
   * 获取模板
   */
  get(id: string): DashboardTemplate | undefined {
    return this.templates.get(id)
  }
  
  /**
   * 按分类获取模板
   */
  getByCategory(category: string): DashboardTemplate[] {
    return this.getAll().filter(t => t.category === category)
  }
  
  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    const categories = new Set(this.getAll().map(t => t.category))
    return Array.from(categories)
  }
  
  /**
   * 添加模板
   */
  add(template: Omit<DashboardTemplate, 'id' | 'createdAt' | 'updatedAt'>): DashboardTemplate {
    const fullTemplate: DashboardTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.templates.set(fullTemplate.id, fullTemplate)
    return fullTemplate
  }
  
  /**
   * 更新模板
   */
  update(id: string, updates: Partial<DashboardTemplate>): DashboardTemplate | undefined {
    const template = this.templates.get(id)
    if (!template) return undefined
    
    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date()
    }
    this.templates.set(id, updated)
    return updated
  }
  
  /**
   * 删除模板
   */
  delete(id: string): boolean {
    // 不允许删除预设模板
    if (id.startsWith('preset_')) {
      return false
    }
    return this.templates.delete(id)
  }
  
  /**
   * 从模板创建仪表盘
   */
  createFromTemplate(templateId: string, name?: string): Omit<DashboardTemplate, 'id' | 'createdAt' | 'updatedAt'> | undefined {
    const template = this.get(templateId)
    if (!template) return undefined
    
    return {
      name: name || template.name,
      description: template.description,
      category: template.category,
      thumbnail: template.thumbnail,
      version: template.version,
      author: template.author,
      components: template.components.map(c => ({ ...c, id: uuidv4() })),
      variables: template.variables,
      settings: { ...template.settings }
    }
  }
  
  /**
   * 导出模板
   */
  export(id: string): string | undefined {
    const template = this.get(id)
    if (!template) return undefined
    
    return JSON.stringify(template, null, 2)
  }
  
  /**
   * 导入模板
   */
  import(json: string): DashboardTemplate | undefined {
    try {
      const data = JSON.parse(json)
      
      // 验证必要字段
      if (!data.name || !data.components || !data.settings) {
        throw new Error('无效的模板格式')
      }
      
      const template: DashboardTemplate = {
        ...data,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      this.templates.set(template.id, template)
      return template
    } catch (error) {
      console.error('[Template] 导入失败:', error)
      return undefined
    }
  }
}

// 导出单例
export const templateService = new TemplateService()

export default TemplateService
