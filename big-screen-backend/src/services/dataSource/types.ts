/**
 * 数据源接口定义
 */

export interface DataSourceConfig {
  // 数据库配置
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  
  // API 配置
  url?: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  apiKey?: string
  
  // 文件配置
  filePath?: string
  fileType?: 'csv' | 'json'
  
  // 通用配置
  timeout?: number
}

export interface DataSourceQuery {
  sql?: string
  params?: any[]
}

export interface DataSourceResult {
  columns: string[]
  rows: any[]
  rowCount: number
  duration: number
}

export interface DataSourceTestResult {
  success: boolean
  message: string
  latency?: number
}

export interface IDataSource {
  readonly name: string
  readonly type: string
  
  connect(config: DataSourceConfig): Promise<void>
  disconnect(): Promise<void>
  test(config: DataSourceConfig): Promise<DataSourceTestResult>
  query(query: DataSourceQuery): Promise<DataSourceResult>
}

// 数据源类型枚举
export enum DataSourceType {
  MYSQL = 'MYSQL',
  POSTGRESQL = 'POSTGRESQL',
  MONGODB = 'MONGODB',
  REST_API = 'REST_API',
  GRAPHQL = 'GRAPHQL',
  CSV = 'CSV',
  JSON = 'JSON'
}

// 数据源管理器接口
export interface IDataSourceManager {
  register(type: string, source: IDataSource): void
  unregister(type: string): void
  get(type: string): IDataSource | undefined
  getAll(): Map<string, IDataSource>
  query(type: string, query: DataSourceQuery): Promise<DataSourceResult>
  test(type: string, config: DataSourceConfig): Promise<DataSourceTestResult>
}
