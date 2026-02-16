/**
 * 组件管理器
 * 
 * 负责组件的创建、更新、删除和查询
 */

import { reactive, ref, type Ref } from 'vue'
import type {
  UUID,
  ComponentInstance,
  ComponentDefinition,
  Point,
  Size,
} from '@bigscreen/types'
import { generateUUID, deepClone } from '@bigscreen/utils'

export interface CreateComponentOptions {
  definitionId: string
  position?: Point
  size?: Size
  parentId?: UUID | null
  props?: Record<string, unknown>
}

export class ComponentManager {
  /** 组件实例映射 */
  private components: Map<UUID, ComponentInstance> = new Map()
  
  /** 组件定义映射 */
  private definitions: Map<string, ComponentDefinition> = new Map()
  
  /** 响应式引用（供Vue使用） */
  public reactiveComponents: Ref<Map<UUID, ComponentInstance>> = ref(new Map())
  
  /**
   * 注册组件定义
   */
  registerDefinition(definition: ComponentDefinition): void {
    this.definitions.set(definition.id, definition)
  }
  
  /**
   * 获取组件定义
   */
  getDefinition(id: string): ComponentDefinition | undefined {
    return this.definitions.get(id)
  }
  
  /**
   * 获取所有组件定义
   */
  getAllDefinitions(): ComponentDefinition[] {
    return Array.from(this.definitions.values())
  }
  
  /**
   * 创建组件实例
   */
  createComponent(options: CreateComponentOptions): ComponentInstance {
    const definition = this.definitions.get(options.definitionId)
    if (!definition) {
      throw new Error(`Component definition not found: ${options.definitionId}`)
    }
    
    const now = Date.now()
    const instance: ComponentInstance = {
      id: generateUUID(),
      definitionId: options.definitionId,
      type: definition.type,
      parentId: options.parentId ?? null,
      childrenIds: [],
      position: options.position ?? { x: 0, y: 0 },
      size: options.size ?? { width: 100, height: 100 },
      rotation: 0,
      scale: 1,
      visible: true,
      locked: false,
      style: deepClone(definition.defaultProps.style ?? {}),
      data: {
        sourceType: 'static',
        staticData: null,
      },
      animation: {
        enabled: false,
      },
      events: [],
      customProps: deepClone(options.props ?? {}),
    }
    
    // 保存到父组件
    if (instance.parentId) {
      const parent = this.components.get(instance.parentId)
      if (parent) {
        parent.childrenIds.push(instance.id)
      }
    }
    
    // 保存组件
    this.components.set(instance.id, instance)
    this.reactiveComponents.value.set(instance.id, instance)
    
    return instance
  }
  
  /**
   * 获取组件实例
   */
  getComponent(id: UUID): ComponentInstance | undefined {
    return this.components.get(id)
  }
  
  /**
   * 更新组件属性
   */
  updateComponent(id: UUID, updates: Partial<ComponentInstance>): void {
    const component = this.components.get(id)
    if (!component) {
      console.warn(`Component not found: ${id}`)
      return
    }
    
    // 应用更新
    Object.assign(component, updates)
    
    // 更新时间戳
    // component.updatedAt = Date.now()
    
    // 触发响应式更新
    this.reactiveComponents.value = new Map(this.components)
  }
  
  /**
   * 移动组件
   */
  moveComponent(id: UUID, position: Point): void {
    this.updateComponent(id, { position })
  }
  
  /**
   * 调整组件大小
   */
  resizeComponent(id: UUID, size: Size): void {
    this.updateComponent(id, { size })
  }
  
  /**
   * 旋转组件
   */
  rotateComponent(id: UUID, rotation: number): void {
    this.updateComponent(id, { rotation })
  }
  
  /**
   * 删除组件
   */
  deleteComponent(id: UUID): void {
    const component = this.components.get(id)
    if (!component) return
    
    // 递归删除子组件
    component.childrenIds.forEach(childId => {
      this.deleteComponent(childId)
    })
    
    // 从父组件中移除
    if (component.parentId) {
      const parent = this.components.get(component.parentId)
      if (parent) {
        parent.childrenIds = parent.childrenIds.filter(cid => cid !== id)
      }
    }
    
    // 删除组件
    this.components.delete(id)
    this.reactiveComponents.value.delete(id)
  }
  
  /**
   * 获取所有组件
   */
  getAllComponents(): ComponentInstance[] {
    return Array.from(this.components.values())
  }
  
  /**
   * 获取根级组件（无父组件）
   */
  getRootComponents(): ComponentInstance[] {
    return this.getAllComponents().filter(c => c.parentId === null)
  }
  
  /**
   * 清除所有组件
   */
  clear(): void {
    this.components.clear()
    this.reactiveComponents.value.clear()
  }
}
