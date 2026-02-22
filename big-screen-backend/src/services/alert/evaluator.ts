/**
 * 告警评估器
 * 
 * 功能：
 * - 评估告警条件
 * - 触发/解决告警
 * - 计算告警值
 */

import { AlertRule, AlertCondition, EvaluationResult } from './types.js'
import { dataSourceManager } from '../dataSource/index.js'

export class AlertEvaluator {
  // 评估历史缓存
  private evaluationHistory: Map<string, {
    isFiring: boolean
    evaluations: number
    lastValue: number
    lastTime: number
  }> = new Map()
  
  /**
   * 评估告警规则
   */
  async evaluate(rule: AlertRule): Promise<EvaluationResult> {
    const history = this.evaluationHistory.get(rule.id) || {
      isFiring: false,
      evaluations: 0,
      lastValue: 0,
      lastTime: 0
    }
    
    // 获取当前指标值
    let currentValue: number | undefined
    let message: string
    
    try {
      if (rule.dataSourceId && rule.query) {
        // 从数据源查询
        const result = await dataSourceManager.query(rule.dataSourceId, {
          sql: rule.query
        })
        
        // 获取第一个数值列的最新值
        if (result.rows.length > 0) {
          const row = result.rows[result.rows.length - 1]
          const numericColumn = result.columns.find(col => typeof row[col] === 'number')
          if (numericColumn) {
            currentValue = Number(row[numericColumn])
          }
        }
      }
    } catch (error) {
      console.error(`[AlertEvaluator] 查询失败: ${error}`)
    }
    
    // 评估条件
    const isFiring = this.checkConditions(rule.conditions, currentValue)
    
    // 更新历史
    if (isFiring && history.isFiring) {
      history.evaluations++
    } else if (isFiring && !history.isFiring) {
      history.evaluations = 1
    } else {
      history.evaluations = 0
    }
    
    history.isFiring = isFiring
    history.lastValue = currentValue || 0
    history.lastTime = Date.now()
    
    this.evaluationHistory.set(rule.id, history)
    
    // 生成消息
    if (isFiring) {
      message = this.generateMessage(rule, currentValue)
    } else {
      message = ''
    }
    
    return {
      ruleId: rule.id,
      timestamp: Date.now(),
      isFiring,
      value: currentValue,
      message
    }
  }
  
  /**
   * 检查条件是否满足
   */
  private checkConditions(conditions: AlertCondition[], value?: number): boolean {
    if (value === undefined || conditions.length === 0) {
      return false
    }
    
    // 所有条件都满足才算触发
    return conditions.every(condition => {
      return this.evaluateCondition(condition, value)
    })
  }
  
  /**
   * 评估单个条件
   */
  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case '>':
        return value > condition.threshold
      case '<':
        return value < condition.threshold
      case '>=':
        return value >= condition.threshold
      case '<=':
        return value <= condition.threshold
      case '==':
        return value === condition.threshold
      case '!=':
        return value !== condition.threshold
      default:
        return false
    }
  }
  
  /**
   * 生成告警消息
   */
  private generateMessage(rule: AlertRule, value?: number): string {
    const condition = rule.conditions[0]
    if (!condition) {
      return rule.name
    }
    
    const severityEmoji = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵'
    }
    
    return `${severityEmoji[rule.severity]} ${rule.name}: ${condition.metric} ${this.getOperatorText(condition.operator)} ${condition.threshold}, 当前值: ${value ?? 'N/A'}`
  }
  
  /**
   * 操作符转文本
   */
  private getOperatorText(operator: string): string {
    const map: Record<string, string> = {
      '>': '超过',
      '<': '低于',
      '>=': '大于等于',
      '<=': '小于等于',
      '==': '等于',
      '!=': '不等于'
    }
    return map[operator] || operator
  }
  
  /**
   * 获取评估历史
   */
  getHistory(ruleId: string) {
    return this.evaluationHistory.get(ruleId)
  }
  
  /**
   * 清除历史
   */
  clearHistory(ruleId?: string) {
    if (ruleId) {
      this.evaluationHistory.delete(ruleId)
    } else {
      this.evaluationHistory.clear()
    }
  }
}

export default AlertEvaluator
