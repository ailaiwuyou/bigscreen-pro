/**
 * MySQL 数据源
 */

import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { IDataSource, DataSourceConfig, DataSourceQuery, DataSourceResult, DataSourceTestResult } from './types.js'

export class MySQLDataSource implements IDataSource {
  readonly name = 'MySQL'
  readonly type = 'MYSQL'
  
  private pool: Pool | null = null
  
  async connect(config: DataSourceConfig): Promise<void> {
    const poolOptions: PoolOptions = {
      host: config.host,
      port: config.port || 3306,
      user: config.username,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timeout: config.timeout || 30000
    }
    
    this.pool = mysql.createPool(poolOptions)
    
    // 测试连接
    const connection = await this.pool.getConnection()
    connection.release()
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
      const tempPool = mysql.createPool({
        host: config.host,
        port: config.port || 3306,
        user: config.username,
        password: config.password,
        database: config.database,
        connectionLimit: 1,
        timeout: config.timeout || 10000
      })
      
      const connection = await tempPool.getConnection()
      await connection.ping()
      connection.release()
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
    
    const [rows, fields] = await this.pool.query<RowDataPacket[]>(
      query.sql || '',
      query.params || []
    )
    
    const columns = fields ? fields.map(f => f.name) : []
    
    return {
      columns,
      rows: rows as any[],
      rowCount: rows.length,
      duration: Date.now() - start
    }
  }
}

export default MySQLDataSource
