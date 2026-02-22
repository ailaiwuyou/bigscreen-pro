/**
 * PostgreSQL 数据源
 */

import pg, { Pool, PoolConfig, QueryResult } from 'pg'
import { IDataSource, DataSourceConfig, DataSourceQuery, DataSourceResult, DataSourceTestResult } from './types.js'

const { Pool: PGPool } = pg

export class PostgreSQLDataSource implements IDataSource {
  readonly name = 'PostgreSQL'
  readonly type = 'POSTGRESQL'
  
  private pool: Pool | null = null
  
  async connect(config: DataSourceConfig): Promise<void> {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port || 5432,
      user: config.username,
      password: config.password,
      database: config.database,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: config.timeout || 30000
    }
    
    this.pool = new PGPool(poolConfig)
    
    // 测试连接
    const client = await this.pool.connect()
    client.release()
  }
  
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }
  
  async test(config: DataSourceConfig): Promise<DataSourceTestResult> {
    const start = Date.now()
    
    try {
      const tempPool = new PGPool({
        host: config.host,
        port: config.port || 5432,
        user: config.username,
        password: config.password,
        database: config.database,
        max: 1,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: config.timeout || 10000
      })
      
      const client = await tempPool.connect()
      await client.query('SELECT 1')
      client.release()
      await tempPool.end()
      
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
    if (!this.pool) {
      throw new Error('未连接数据库')
    }
    
    const start = Date.now()
    
    const result: QueryResult = await this.pool.query(
      query.sql || '',
      query.params || []
    )
    
    const columns = result.fields ? result.fields.map(f => f.name) : []
    
    return {
      columns,
      rows: result.rows,
      rowCount: result.rowCount || 0,
      duration: Date.now() - start
    }
  }
}

export default PostgreSQLDataSource
