import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'

// 日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// 日志颜色配置
const colors: Record<LogLevel, string> = {
  debug: '\x1b[36m', // 青色
  info: '\x1b[32m',  // 绿色
  warn: '\x1b[33m',  // 黄色
  error: '\x1b[31m'  // 红色
}

const resetColor = '\x1b[0m'

// 日志配置
interface LoggerConfig {
  level: LogLevel
  logToFile: boolean
  logDir: string
}

const config: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  logToFile: process.env.LOG_TO_FILE === 'true',
  logDir: process.env.LOG_DIR || 'logs'
}

// 日志级别权重
const levelWeights: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// 确保日志目录存在
async function ensureLogDir(): Promise<void> {
  if (!config.logToFile) return
  try {
    await mkdir(config.logDir, { recursive: true })
  } catch (error) {
    console.error('创建日志目录失败:', error)
  }
}

// 写入日志文件
async function writeToFile(level: LogLevel, message: string): Promise<void> {
  if (!config.logToFile) return

  const date = new Date()
  const filename = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`
  const filepath = `${config.logDir}/${filename}`

  const logEntry = `[${date.toISOString()}] [${level.toUpperCase()}] ${message}\n`

  try {
    const stream = createWriteStream(filepath, { flags: 'a' })
    stream.write(logEntry)
    stream.end()
  } catch (error) {
    console.error('写入日志文件失败:', error)
  }
}

// 格式化日志消息
function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString()
  let formatted = `${timestamp} [${level.toUpperCase()}] ${message}`
  
  if (meta && Object.keys(meta).length > 0) {
    formatted += ` ${JSON.stringify(meta)}`
  }
  
  return formatted
}

// 主日志函数
function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  // 检查日志级别
  if (levelWeights[level] < levelWeights[config.level]) {
    return
  }

  const formattedMessage = formatMessage(level, message, meta)
  
  // 输出到控制台（带颜色）
  const color = colors[level]
  console.log(`${color}${formattedMessage}${resetColor}`)
  
  // 写入文件
  writeToFile(level, formattedMessage)
}

// 日志对象
export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  
  // 设置日志级别
  setLevel: (level: LogLevel) => {
    config.level = level
  },
  
  // 启用/禁用文件日志
  setFileLogging: (enabled: boolean) => {
    config.logToFile = enabled
    if (enabled) {
      ensureLogDir()
    }
  }
}

// 初始化
ensureLogDir()

export default logger