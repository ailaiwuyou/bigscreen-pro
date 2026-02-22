/**
 * 通知服务
 * 
 * 支持：
 * - 邮件通知
 * - Webhook 通知
 * - Slack 通知
 * - 钉钉通知
 */

import axios from 'axios'
import { NotificationChannel, AlertInstance, EmailConfig, WebhookConfig, SlackConfig, DingTalkConfig } from './types.js'

export class NotificationService {
  /**
   * 发送通知
   */
  async send(channel: NotificationChannel, alert: AlertInstance): Promise<boolean> {
    if (!channel.enabled) {
      return false
    }
    
    try {
      switch (channel.type) {
        case 'email':
          return await this.sendEmail(channel.config as EmailConfig, alert)
        case 'webhook':
          return await this.sendWebhook(channel.config as WebhookConfig, alert)
        case 'slack':
          return await this.sendSlack(channel.config as SlackConfig, alert)
        case 'dingtalk':
          return await this.sendDingTalk(channel.config as DingTalkConfig, alert)
        default:
          console.warn(`[Notification] 未知通知类型: ${channel.type}`)
          return false
      }
    } catch (error) {
      console.error(`[Notification] 发送失败: ${error}`)
      return false
    }
  }
  
  /**
   * 发送邮件
   */
  private async sendEmail(config: EmailConfig, alert: AlertInstance): Promise<boolean> {
    // 实际实现需要配置 SMTP
    // 这里只是模拟
    console.log(`[Notification] 发送邮件到 ${config.recipients.join(', ')}`)
    console.log(`[Notification] 主题: ${config.subject || '告警通知'}`)
    console.log(`[Notification] 内容: ${alert.message}`)
    
    // TODO: 实现真实的邮件发送
    return true
  }
  
  /**
   * 发送 Webhook
   */
  private async sendWebhook(config: WebhookConfig, alert: AlertInstance): Promise<boolean> {
    const payload = {
      alert: {
        id: alert.id,
        status: alert.status,
        severity: alert.severity,
        message: alert.message,
        startedAt: alert.startedAt,
        endedAt: alert.endedAt
      }
    }
    
    try {
      const response = await axios({
        method: config.method || 'POST',
        url: config.url,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        data: config.body ? this.interpolate(config.body, alert) : payload
      })
      
      return response.status >= 200 && response.status < 300
    } catch (error) {
      console.error(`[Notification] Webhook 发送失败: ${error}`)
      return false
    }
  }
  
  /**
   * 发送 Slack
   */
  private async sendSlack(config: SlackConfig, alert: AlertInstance): Promise<boolean> {
    const severityColors: Record<string, string> = {
      critical: '#FF0000',
      warning: '#FFA500',
      info: '#0000FF'
    }
    
    const payload = {
      channel: config.channel,
      username: config.username || 'BigScreen Alert',
      attachments: [{
        color: severityColors[alert.severity] || '#CCCCCC',
        title: alert.message,
        text: `告警ID: ${alert.id}\n状态: ${alert.status}\n开始时间: ${new Date(alert.startedAt).toLocaleString()}`,
        footer: 'BigScreen Pro',
        ts: Math.floor(alert.startedAt / 1000)
      }]
    }
    
    try {
      const response = await axios.post(config.webhookUrl, payload)
      return response.status === 200
    } catch (error) {
      console.error(`[Notification] Slack 发送失败: ${error}`)
      return false
    }
  }
  
  /**
   * 发送钉钉
   */
  private async sendDingTalk(config: DingTalkConfig, alert: AlertInstance): Promise<boolean> {
    const severityMarkdown: Record<string, string> = {
      critical: '🔴 严重告警',
      warning: '🟡 警告',
      info: '🔵 信息'
    }
    
    const payload = {
      msgtype: 'markdown',
      markdown: {
        title: `${severityMarkdown[alert.severity]} - 告警通知`,
        text: `### ${severityMarkdown[alert.severity]}\n\n${alert.message}\n\n> 告警ID: ${alert.id}\n> 状态: ${alert.status}\n> 开始时间: ${new Date(alert.startedAt).toLocaleString()}`
      },
      at: {
        atMobiles: config.atMobiles || [],
        isAtAll: config.isAtAll || false
      }
    }
    
    try {
      const response = await axios.post(config.webhookUrl, payload)
      return response.data.errcode === 0
    } catch (error) {
      console.error(`[Notification] 钉钉发送失败: ${error}`)
      return false
    }
  }
  
  /**
   * 插值替换
   */
  private interpolate(template: string, alert: AlertInstance): string {
    return template
      .replace(/\{\{alertId\}\}/g, alert.id)
      .replace(/\{\{message\}\}/g, alert.message)
      .replace(/\{\{severity\}\}/g, alert.severity)
      .replace(/\{\{status\}\}/g, alert.status)
      .replace(/\{\{startedAt\}\}/g, new Date(alert.startedAt).toISOString())
  }
  
  /**
   * 测试通知渠道
   */
  async testChannel(channel: NotificationChannel): Promise<boolean> {
    const testAlert: AlertInstance = {
      id: 'test',
      ruleId: 'test',
      status: 'firing',
      severity: 'info',
      message: '这是一条测试通知',
      startedAt: new Date()
    }
    
    return this.send(channel, testAlert)
  }
}

export default NotificationService
