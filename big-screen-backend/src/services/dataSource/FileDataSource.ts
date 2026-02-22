/**
 * CSV/JSON 文件数据源
 */

import fs from 'fs/promises'
import path from 'path'
import { IDataSource, DataSourceConfig, DataSourceQuery, DataSourceResult, DataSourceTestResult } from './types.js'

export class FileDataSource implements IDataSource {
  readonly name: string
  readonly type: 'CSV' | 'JSON'
  
  private data: any[] = []
  private columns: string[] = []
  private filePath: string = ''
  
  constructor(type: 'CSV' | 'JSON') {
    this.name = type === 'CSV' ? 'CSV File' : 'JSON File'
    this.type = type
  }
  
  async connect(config: DataSourceConfig): Promise<void> {
    if (!config.filePath) {
      throw new Error('文件路径不能为空')
    }
    
    this.filePath = config.filePath
    
    await this.loadData()
  }
  
  async disconnect(): Promise<void> {
    this.data = []
    this.columns = []
    this.filePath = ''
  }
  
  async test(config: DataSourceConfig): Promise<DataSourceTestResult> {
    const start = Date.now()
    
    try {
      if (!config.filePath) {
        return { success: false, message: '文件路径不能为空' }
      }
      
      const stats = await fs.stat(config.filePath)
      
      if (!stats.isFile()) {
        return { success: false, message: '路径不是文件' }
      }
      
      return {
        success: true,
        message: `文件存在，大小: ${stats.size} bytes`,
        latency: Date.now() - start
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '测试失败'
      }
    }
  }
  
  async query(query: DataSourceQuery): Promise<DataSourceResult> {
    if (this.data.length === 0) {
      throw new Error('未加载数据')
    }
    
    const start = Date.now()
    
    let rows = [...this.data]
    const sql = query.sql || ''
    
    // 简单的 SQL 解析支持
    // SELECT * FROM data WHERE column = value
    // SELECT column1, column2 FROM data
    
    // 处理 SELECT
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i)
    if (selectMatch) {
      const fields = selectMatch[1].split(',').map(f => f.trim())
      if (fields[0] !== '*') {
        rows = rows.map(row => {
          const newRow: any = {}
          fields.forEach(field => {
            if (row[field] !== undefined) {
              newRow[field] = row[field]
            }
          })
          return newRow
        })
        this.columns = fields
      }
    }
    
    // 处理 WHERE
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s*$)/i)
    if (whereMatch) {
      const whereClause = whereMatch[1]
      const conditions = whereClause.split(/\s+AND\s+/i)
      
      conditions.forEach(condition => {
        const match = condition.match(/(\w+)\s*(=|!=|>|<|>=|<=|LIKE)\s*['"]?(.+?)['"]?$/i)
        if (match) {
          const [, field, operator, value] = match
          rows = rows.filter(row => {
            const rowValue = row[field]
            const compareValue = isNaN(Number(value)) ? value : Number(value)
            
            switch (operator.toUpperCase()) {
              case '=':
                return rowValue == compareValue
              case '!=':
                return rowValue != compareValue
              case '>':
                return rowValue > compareValue
              case '<':
                return rowValue < compareValue
              case '>=':
                return rowValue >= compareValue
              case '<=':
                return rowValue <= compareValue
              case 'LIKE':
                return String(rowValue).includes(value.replace(/%/g, ''))
              default:
                return true
            }
          })
        }
      })
    }
    
    // 处理 ORDER BY
    const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i)
    if (orderMatch) {
      const orderField = orderMatch[1]
      const orderDir = (orderMatch[2] || 'ASC').toUpperCase()
      rows.sort((a, b) => {
        if (orderDir === 'ASC') {
          return a[orderField] > b[orderField] ? 1 : -1
        } else {
          return a[orderField] < b[orderField] ? 1 : -1
        }
      })
    }
    
    // 处理 LIMIT
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i)
    if (limitMatch) {
      rows = rows.slice(0, parseInt(limitMatch[1]))
    }
    
    // 更新列名
    if (this.columns.length === 0 && rows.length > 0) {
      this.columns = Object.keys(rows[0])
    }
    
    return {
      columns: this.columns,
      rows,
      rowCount: rows.length,
      duration: Date.now() - start
    }
  }
  
  private async loadData(): Promise<void> {
    const ext = path.extname(this.filePath).toLowerCase()
    
    if (ext === '.csv') {
      await this.loadCSV()
    } else if (ext === '.json') {
      await this.loadJSON()
    } else {
      throw new Error(`不支持的文件类型: ${ext}`)
    }
  }
  
  private async loadCSV(): Promise<void> {
    const content = await fs.readFile(this.filePath, 'utf-8')
    const lines = content.trim().split('\n')
    
    if (lines.length === 0) {
      return
    }
    
    // 解析表头
    const headers = this.parseCSVLine(lines[0])
    this.columns = headers
    
    // 解析数据行
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      const row: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        // 尝试转换为数字
        row[header] = isNaN(Number(value)) ? value : Number(value)
      })
      
      this.data.push(row)
    }
  }
  
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }
  
  private async loadJSON(): Promise<void> {
    const content = await fs.readFile(this.filePath, 'utf-8')
    const json = JSON.parse(content)
    
    if (Array.isArray(json)) {
      this.data = json
    } else {
      this.data = [json]
    }
    
    if (this.data.length > 0) {
      this.columns = Object.keys(this.data[0])
    }
  }
}

export class CSVDataSource extends FileDataSource {
  constructor() {
    super('CSV')
  }
}

export class JSONDataSource extends FileDataSource {
  constructor() {
    super('JSON')
  }
}

export default FileDataSource
