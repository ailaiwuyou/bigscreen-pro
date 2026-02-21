import mysql from 'mysql2/promise'
import { Pool, Client } from 'pg'
import axios, { AxiosError } from 'axios'
import { DataSourceType } from '@prisma/client'

// 连接池缓存
const connectionPools: Map<string, mysql.Pool | Pool> = new Map()

interface TestResult {
  success: boolean
  message: string
  latency?: number
}

interface QueryResult {
  columns: string[]
  rows: unknown[][]
  total: number
}

export const dataSourceService = {
  // 测试连接
  async testConnection(type: DataSourceType, config: Record<string, unknown>): Promise<TestResult> {
    const startTime = Date.now()

    try {
      switch (type) {
        case DataSourceType.MYSQL:
          return await this.testMySQLConnection(config, startTime)
        case DataSourceType.POSTGRESQL:
          return await this.testPostgreSQLConnection(config, startTime)
        case DataSourceType.REST_API:
          return await this.testAPIConnection(config, startTime)
        case DataSourceType.JSON:
        case DataSourceType.EXCEL:
        case DataSourceType.CSV:
          // 文件类型不需要测试连接
          return {
            success: true,
            message: '文件数据源配置正确',
            latency: Date.now() - startTime
          }
        default:
          return {
            success: false,
            message: `不支持的数据源类型: ${type}`
          }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接测试失败'
      }
    }
  },

  // 测试 MySQL 连接
  async testMySQLConnection(config: Record<string, unknown>, startTime: number): Promise<TestResult> {
    const { host, port, database, username, password, ssl = false } = config

    const connection = await mysql.createConnection({
      host: host as string,
      port: Number(port) || 3306,
      database: database as string,
      user: username as string,
      password: password as string,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 10000
    })

    await connection.ping()
    await connection.end()

    return {
      success: true,
      message: 'MySQL 连接成功',
      latency: Date.now() - startTime
    }
  },

  // 测试 PostgreSQL 连接
  async testPostgreSQLConnection(config: Record<string, unknown>, startTime: number): Promise<TestResult> {
    const { host, port, database, username, password, ssl = false } = config

    const client = new Client({
      host: host as string,
      port: Number(port) || 5432,
      database: database as string,
      user: username as string,
      password: password as string,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000
    })

    await client.connect()
    await client.query('SELECT 1')
    await client.end()

    return {
      success: true,
      message: 'PostgreSQL 连接成功',
      latency: Date.now() - startTime
    }
  },

  // 测试 API 连接
  async testAPIConnection(config: Record<string, unknown>, startTime: number): Promise<TestResult> {
    const { url, method = 'GET', headers = {}, timeout = 10000 } = config

    if (!url) {
      throw new Error('API URL 不能为空')
    }

    const response = await axios({
      url: url as string,
      method: method as string,
      headers: headers as Record<string, string>,
      timeout: Number(timeout),
      validateStatus: () => true // 接受任何状态码
    })

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: `API 连接成功 (HTTP ${response.status})`,
        latency: Date.now() - startTime
      }
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  },

  // 执行查询
  async executeQuery(
    type: DataSourceType,
    config: Record<string, unknown>,
    query: string,
    params: unknown[] = []
  ): Promise<QueryResult> {
    switch (type) {
      case DataSourceType.MYSQL:
        return await this.executeMySQLQuery(config, query, params)
      case DataSourceType.POSTGRESQL:
        return await this.executePostgreSQLQuery(config, query, params)
      case DataSourceType.REST_API:
        return await this.executeAPIQuery(config)
      case DataSourceType.JSON:
        return await this.executeJSONQuery(config, query)
      default:
        throw new Error(`不支持的数据源类型: ${type}`)
    }
  },

  // 执行 MySQL 查询
  async executeMySQLQuery(
    config: Record<string, unknown>,
    query: string,
    params: unknown[]
  ): Promise<QueryResult> {
    const poolKey = JSON.stringify({ type: 'mysql', config })

    let pool = connectionPools.get(poolKey) as mysql.Pool | undefined

    if (!pool) {
      const { host, port, database, username, password, ssl = false } = config

      pool = mysql.createPool({
        host: host as string,
        port: Number(port) || 3306,
        database: database as string,
        user: username as string,
        password: password as string,
        ssl: ssl ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      })

      connectionPools.set(poolKey, pool)
    }

    const connection = await pool.getConnection()

    try {
      // 使用参数化查询防止 SQL 注入
      const [rows] = await connection.execute(query, params)

      // 处理结果
      if (Array.isArray(rows)) {
        const columns = rows.length > 0 ? Object.keys(rows[0] as object) : []
        const data = rows.map(row => Object.values(row as object))

        return {
          columns,
          rows: data,
          total: data.length
        }
      }

      // 非 SELECT 语句（INSERT、UPDATE、DELETE）
      return {
        columns: ['affectedRows'],
        rows: [[(rows as mysql.ResultSetHeader).affectedRows]],
        total: 1
      }
    } finally {
      connection.release()
    }
  },

  // 执行 PostgreSQL 查询
  async executePostgreSQLQuery(
    config: Record<string, unknown>,
    query: string,
    params: unknown[]
  ): Promise<QueryResult> {
    const poolKey = JSON.stringify({ type: 'postgresql', config })

    let pool = connectionPools.get(poolKey) as Pool | undefined

    if (!pool) {
      const { host, port, database, username, password, ssl = false } = config

      pool = new Pool({
        host: host as string,
        port: Number(port) || 5432,
        database: database as string,
        user: username as string,
        password: password as string,
        ssl: ssl ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      })

      connectionPools.set(poolKey, pool)
    }

    const client = await pool.connect()

    try {
      // 使用参数化查询防止 SQL 注入
      const result = await client.query(query, params)

      // 处理 SELECT 结果
      if (result.rows) {
        const columns = result.fields.map(f => f.name)
        const rows = result.rows.map(row => columns.map(col => row[col]))

        return {
          columns,
          rows,
          total: rows.length
        }
      }

      // 非 SELECT 语句
      return {
        columns: ['command', 'rowCount'],
        rows: [[result.command, result.rowCount || 0]],
        total: 1
      }
    } finally {
      client.release()
    }
  },

  // 执行 API 查询
  async executeAPIQuery(config: Record<string, unknown>): Promise<QueryResult> {
    const { url, method = 'GET', headers = {}, body, timeout = 30000 } = config

    if (!url) {
      throw new Error('API URL 不能为空')
    }

    const response = await axios({
      url: url as string,
      method: method as string,
      headers: headers as Record<string, string>,
      data: body,
      timeout: Number(timeout),
      transformResponse: [(data) => {
        // 保留原始响应数据
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }]
    })

    // 将 API 响应转换为表格格式
    const data = response.data
    let columns: string[] = []
    let rows: unknown[][] = []

    if (Array.isArray(data)) {
      // 数组格式
      if (data.length > 0 && typeof data[0] === 'object') {
        columns = Object.keys(data[0] as object)
        rows = data.map(item => columns.map(col => (item as Record<string, unknown>)[col]))
      }
    } else if (typeof data === 'object' && data !== null) {
      // 对象格式 - 展平对象
      columns = Object.keys(data)
      rows = [columns.map(col => (data as Record<string, unknown>)[col])]
    }

    return {
      columns,
      rows,
      total: rows.length
    }
  },

  // 执行 JSON 查询（从 JSON 文件中提取数据）
  async executeJSONQuery(config: Record<string, unknown>, query?: string): Promise<QueryResult> {
    const { content, filePath } = config

    let data: unknown

    if (content) {
      // 直接提供 JSON 内容
      try {
        data = JSON.parse(content as string)
      } catch {
        throw new Error('无效的 JSON 内容')
      }
    } else if (filePath) {
      // 从文件读取（需要 fs 模块，这里简化处理）
      throw new Error('从文件读取 JSON 暂不支持，请直接提供内容')
    } else {
      throw new Error('必须提供 JSON 内容或文件路径')
    }

    // 如果提供了查询（JSONPath 或简单的字段选择）
    if (query) {
      // 简单的字段选择支持，如 "users.name"
      const path = query.split('.')
      for (const key of path) {
        if (data && typeof data === 'object') {
          data = (data as Record<string, unknown>)[key]
        } else {
          data = undefined
          break
        }
      }
    }

    // 转换为表格格式
    let columns: string[] = []
    let rows: unknown[][] = []

    if (Array.isArray(data)) {
      if (data.length > 0 && typeof data[0] === 'object') {
        columns = Object.keys(data[0] as object)
        rows = data.map(item => columns.map(col => (item as Record<string, unknown>)[col]))
      }
    } else if (typeof data === 'object' && data !== null) {
      columns = Object.keys(data)
      rows = [columns.map(col => (data as Record<string, unknown>)[col])]
    } else {
      // 标量值
      columns = ['value']
      rows = [[data]]
    }

    return {
      columns,
      rows,
      total: rows.length
    }
  },

  // 关闭所有连接池
  async closeAllPools(): Promise<void> {
    for (const [key, pool] of connectionPools.entries()) {
      try {
        if (key.includes('mysql')) {
          await (pool as mysql.Pool).end()
        } else if (key.includes('postgresql')) {
          await (pool as Pool).end()
        }
      } catch (error) {
        console.error(`关闭连接池失败: ${key}`, error)
      }
    }
    connectionPools.clear()
  }
}