/**
 * 告警系统类型定义
 */

// 告警级别
export type AlertSeverity = 'critical' | 'warning' | 'info'

// 告警状态
export type AlertStatus = 'pending' | 'firing' | 'resolved' | 'muted'

// 告警条件
export interface AlertCondition {
  metric: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  threshold: number
  duration?: number // 持续时间(秒)
}

// 告警规则
export interface AlertRule {
  id: string
  name: string
  description?: string
  severity: AlertSeverity
  enabled: boolean
  conditions: AlertCondition[]
  dataSourceId?: string
  query?: string
  annotations?: Record<string, string>
  labels?: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

// 告警实例
export interface AlertInstance {
  id: string
  ruleId: string
  status: AlertStatus
  severity: AlertSeverity
  message: string
  startedAt: Date
  endedAt?: Date
  value?: number
  evaluations?: number
}

// 通知渠道配置
export interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'webhook' | 'slack' | 'dingtalk'
  enabled: boolean
  config: EmailConfig | WebhookConfig | SlackConfig | DingTalkConfig
}

// 邮件配置
export interface EmailConfig {
  recipients: string[]
  subject?: string
}

// Webhook 配置
export interface WebhookConfig {
  url: string
  method: 'POST' | 'PUT'
  headers?: Record<string, string>
  body?: string
}

// Slack 配置
export interface SlackConfig {
  webhookUrl: string
  channel?: string
  username?: string
}

// 钉钉配置
export interface DingTalkConfig {
  webhookUrl: string
  atMobiles?: string[]
  isAtAll?: boolean
}

// 告警评估结果
export interface EvaluationResult {
  ruleId: string
  timestamp: number
  isFiring: boolean
  value?: number
  message?: string
}

// 通知记录
export interface NotificationRecord {
  id: string
  alertId: string
  channelId: string
  status: 'sent' | 'failed'
  sentAt: Date
  error?: string
}
