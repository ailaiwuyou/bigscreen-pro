/**
 * REST API 数据源
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { IDataSource, DataSourceConfig, DataSourceQuery, DataSourceResult, DataSourceTestResult } from './types.js'

export class RESTApiDataSource implements IDataSource {
  readonly name = 'REST API'
  readonly type = 'REST_API'
  
  private client: AxiosInstance | null = null
  private config: DataSourceConfig | null = null
  
  async connect(config: DataSourceConfig): Promise<void> {
    this.config = config
    
    this.client = axios.create({
      baseURL: config.url,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      }
    })
  }
  
  async disconnect(): Promise<void> {
    this.client = null
    this.config = null
  }
  
  async test(config: DataSourceConfig): Promise<DataSourceTestResult> {
    const start = Date.now()
    
    try {
      const tempClient = axios.create({
        baseURL: config.url,
        timeout: config.timeout || 10000,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      })
      
      await tempClient.get('')
      
      return {
        success: true,
        message: '连接成功',
        latency: Date.now() - start
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      }
    }
  }
  
  async query(query: DataSourceQuery): Promise<DataSourceResult> {
    if (!this.client) {
      throw new Error('未连接 API')
    }
    
    const start = Date.now()
    
    // 支持 SQL 风格的查询，如: GET /users WHERE id = 1
    // 或者直接使用 params
    const sql = query.sql || ''
    
    let response
    
    if (sql.toUpperCase().startsWith('SELECT') || sql.includes('?')) {
      // 解析 SQL 风格查询
      const urlParams = this.parseSqlToParams(sql)
      response = await this.client.get('', { params: urlParams })
    } else {
      // 直接使用 SQL 作为路径
      response = await this.client.get(sql.startsWith('/') ? sql : `/${sql}`)
    }
    
    const data = response.data
    
    // 处理不同响应格式
    let rows: any[] = []
    let columns: string[] = []
    
    if (Array.isArray(data)) {
      rows = data
      if (rows.length > 0 && typeof rows[0] === 'object') {
        columns = Object.keys(rows[0])
      }
    } else if (data.data && Array.isArray(data.data)) {
      rows = data.data
      if (data.columns) {
        columns = data.columns
      } else if (rows.length > 0) {
        columns = Object.keys(rows[0])
      }
    } else if (typeof data === 'object') {
      rows = [data]
      columns = Object.keys(data)
    }
    
    return {
      columns,
      rows,
      rowCount: rows.length,
      duration: Date.now() - start
    }
  }
  
  private parseSqlToParams(sql: string): Record<string, any> {
    const params: Record<string, any> = {}
    
    // 简单的 WHERE 解析
    const whereMatch = sql.match(/WHERE\s+(.+)/i)
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+/i)
      conditions.forEach(condition => {
        const [key, operator, value] = condition.trim().split(/\s+/)
        if (key && value) {
          const cleanKey = key.replace(/[=]/g, '')
          let cleanValue = value.replace(/['"]/g, '')
          
          if (operator === 'IN') {
            params[cleanKey] = cleanValue.split(',').map(v => v.trim().replace(/['"]/g, ''))
          } else {
            params[cleanKey] = cleanValue
          }
        }
      })
    }
    
    return params
  }
}

export default RESTApiDataSource
