/**
 * 告警管理器
 * 
 * 功能：
 * - 告警规则管理
 * - 告警评估调度
 * - 告警状态管理
 * - 通知发送
 */

import { AlertRule, AlertInstance, AlertStatus, NotificationChannel, AlertSeverity } from './types.js'
import { AlertEvaluator } from './evaluator.js'
import { NotificationService } from './notification.js'

export class AlertManager {
  private rules: Map<string, AlertRule> = new Map()
  private alerts: Map<string, AlertInstance> = new Map()
  private channels: Map<string, NotificationChannel> = new Map()
  
  private evaluator: AlertEvaluator
  private notificationService: NotificationService
  private scheduler: number | null = null
  
  constructor() {
    this.evaluator = new AlertEvaluator()
    this.notificationService = new NotificationService()
  }
  
  // ===== 告警规则管理 =====
  
  /**
   * 添加告警规则
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
  }
  
  /**
   * 更新告警规则
   */
  updateRule(rule: AlertRule): void {
    if (this.rules.has(rule.id)) {
      this.rules.set(rule.id, rule)
    }
  }
  
  /**
   * 删除告警规则
   */
  deleteRule(ruleId: string): void {
    this.rules.delete(ruleId)
    this.evaluator.clearHistory(ruleId)
  }
  
  /**
   * 获取告警规则
   */
  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId)
  }
  
  /**
   * 获取所有告警规则
   */
  getAllRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }
  
  /**
   * 获取启用的告警规则
   */
  getEnabledRules(): AlertRule[] {
    return this.getAllRules().filter(rule => rule.enabled)
  }
  
  // ===== 通知渠道管理 =====
  
  /**
   * 添加通知渠道
   */
  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel)
  }
  
  /**
   * 更新通知渠道
   */
  updateChannel(channel: NotificationChannel): void {
    if (this.channels.has(channel.id)) {
      this.channels.set(channel.id, channel)
    }
  }
  
  /**
   * 删除通知渠道
   */
  deleteChannel(channelId: string): void {
    this.channels.delete(channelId)
  }
  
  /**
   * 获取通知渠道
   */
  getChannel(channelId: string): NotificationChannel | undefined {
    return this.channels.get(channelId)
  }
  
  /**
   * 获取所有通知渠道
   */
  getAllChannels(): NotificationChannel[] {
    return Array.from(this.channels.values())
  }
  
  /**
   * 获取启用的通知渠道
   */
  getEnabledChannels(): NotificationChannel[] {
    return this.getAllChannels().filter(ch => ch.enabled)
  }
  
  // ===== 告警实例管理 =====
  
  /**
   * 获取告警实例
   */
  getAlert(alertId: string): AlertInstance | undefined {
    return this.alerts.get(alertId)
  }
  
  /**
   * 获取所有告警实例
   */
  getAllAlerts(): AlertInstance[] {
    return Array.from(this.alerts.values())
  }
  
  /**
   * 获取活跃告警
   */
  getActiveAlerts(): AlertInstance[] {
    return this.getAllAlerts().filter(a => a.status === 'firing')
  }
  
  // ===== 告警评估 =====
  
  /**
   * 评估所有告警规则
   */
  async evaluateAll(): Promise<void> {
    const rules = this.getEnabledRules()
    
    for (const rule of rules) {
      await this.evaluateRule(rule)
    }
  }
  
  /**
   * 评估单个告警规则
   */
  async evaluateRule(rule: AlertRule): Promise<void> {
    const result = await this.evaluator.evaluate(rule)
    
    // 检查告警状态变化
    const existingAlert = Array.from(this.alerts.values())
      .find(a => a.ruleId === rule.id && a.status === 'firing')
    
    if (result.isFiring && !existingAlert) {
      // 触发新告警
      await this.triggerAlert(rule, result)
    } else if (!result.isFiring && existingAlert) {
      // 解决告警
      await this.resolveAlert(existingAlert.id)
    }
  }
  
  /**
   * 触发告警
   */
  private async triggerAlert(rule: AlertRule, result: { value?: number; message?: string }): Promise<void> {
    const alert: AlertInstance = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      status: 'firing',
      severity: rule.severity,
      message: result.message || `${rule.name} 告警触发`,
      startedAt: new Date(),
      value: result.value,
      evaluations: 1
    }
    
    this.alerts.set(alert.id, alert)
    
    console.log(`[AlertManager] 触发告警: ${alert.id} - ${alert.message}`)
    
    // 发送通知
    await this.sendNotifications(alert)
  }
  
  /**
   * 解决告警
   */
  private async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId)
    if (!alert) return
    
    alert.status = 'resolved'
    alert.endedAt = new Date()
    
    console.log(`[AlertManager] 解决告警: ${alertId}`)
    
    // 发送解决通知
    await this.sendNotifications(alert, true)
  }
  
  /**
   * 静默告警
   */
  async muteAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.status = 'muted'
    }
  }
  
  // ===== 通知发送 =====
  
  /**
   * 发送通知
   */
  private async sendNotifications(alert: AlertInstance, isResolved: boolean = false): Promise<void> {
    const channels = this.getEnabledChannels()
    
    for (const channel of channels) {
      const success = await this.notificationService.send(channel, alert)
      
      if (!success) {
        console.warn(`[AlertManager] 通知发送失败: ${channel.name}`)
      }
    }
  }
  
  // ===== 调度管理 =====
  
  /**
   * 启动定时评估
   */
  startScheduler(intervalMs: number = 60000): void {
    if (this.scheduler) {
      this.stopScheduler()
    }
    
    this.scheduler = window.setInterval(() => {
      this.evaluateAll()
    }, intervalMs)
    
    console.log(`[AlertManager] 定时评估已启动: ${intervalMs}ms`)
  }
  
  /**
   * 停止定时评估
   */
  stopScheduler(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler)
      this.scheduler = null
    }
  }
  
  // ===== 统计 =====
  
  /**
   * 获取告警统计
   */
  getStats(): {
    totalRules: number
    enabledRules: number
    activeAlerts: number
    channels: number
  } {
    return {
      totalRules: this.rules.size,
      enabledRules: this.getEnabledRules().length,
      activeAlerts: this.getActiveAlerts().length,
      channels: this.channels.size
    }
  }
}

// 导出单例
export const alertManager = new AlertManager()

export default AlertManager
