/**
 * 数据源管理器
 */

import { IDataSource, IDataSourceManager, DataSourceConfig, DataSourceQuery, DataSourceResult, DataSourceTestResult, DataSourceType } from './types.js'
import { MySQLDataSource } from './MySQLDataSource.js'
import { PostgreSQLDataSource } from './PostgreSQLDataSource.js'
import { RESTApiDataSource } from './RESTApiDataSource.js'
import { CSVDataSource, JSONDataSource } from './FileDataSource.js'

export class DataSourceManager implements IDataSourceManager {
  private sources: Map<string, IDataSource> = new Map()
  
  constructor() {
    // 注册内置数据源
    this.register(DataSourceType.MYSQL, new MySQLDataSource())
    this.register(DataSourceType.POSTGRESQL, new PostgreSQLDataSource())
    this.register(DataSourceType.REST_API, new RESTApiDataSource())
    this.register(DataSourceType.CSV, new CSVDataSource())
    this.register(DataSourceType.JSON, new JSONDataSource())
  }
  
  register(type: string, source: IDataSource): void {
    this.sources.set(type.toUpperCase(), source)
  }
  
  unregister(type: string): void {
    const source = this.sources.get(type.toUpperCase())
    if (source) {
      source.disconnect()
      this.sources.delete(type.toUpperCase())
    }
  }
  
  get(type: string): IDataSource | undefined {
    return this.sources.get(type.toUpperCase())
  }
  
  getAll(): Map<string, IDataSource> {
    return new Map(this.sources)
  }
  
  async query(type: string, query: DataSourceQuery): Promise<DataSourceResult> {
    const source = this.sources.get(type.toUpperCase())
    
    if (!source) {
      throw new Error(`不支持的数据源类型: ${type}`)
    }
    
    return source.query(query)
  }
  
  async test(type: string, config: DataSourceConfig): Promise<DataSourceTestResult> {
    const source = this.sources.get(type.toUpperCase())
    
    if (!source) {
      return {
        success: false,
        message: `不支持的数据源类型: ${type}`
      }
    }
    
    return source.test(config)
  }
  
  async connect(type: string, config: DataSourceConfig): Promise<void> {
    const source = this.sources.get(type.toUpperCase())
    
    if (!source) {
      throw new Error(`不支持的数据源类型: ${type}`)
    }
    
    await source.connect(config)
  }
  
  async disconnect(type: string): Promise<void> {
    const source = this.sources.get(type.toUpperCase())
    
    if (source) {
      await source.disconnect()
    }
  }
  
  async disconnectAll(): Promise<void> {
    for (const source of this.sources.values()) {
      await source.disconnect()
    }
  }
  
  getSupportedTypes(): string[] {
    return Array.from(this.sources.keys())
  }
}

// 导出单例
export const dataSourceManager = new DataSourceManager()

export default dataSourceManager
