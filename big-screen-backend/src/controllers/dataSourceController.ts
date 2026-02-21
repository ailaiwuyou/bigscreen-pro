import { Request, Response } from 'express'
import { PrismaClient, DataSourceType, DataSourceStatus, Prisma } from '@prisma/client'
import { dataSourceService } from '../services/dataSourceService.js'
import { encryptionService } from '../services/encryptionService.js'

const prisma = new PrismaClient()

// 扩展 Request 类型
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string
    email: string
    role: string
  }
}

// 创建数据源
export const createDataSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { name, type, config } = req.body

    // 验证必填字段
    if (!name || !type || !config) {
      return res.status(400).json({
        success: false,
        message: '名称、类型和配置不能为空'
      })
    }

    // 验证数据源类型
    if (!Object.values(DataSourceType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: '不支持的数据源类型'
      })
    }

    // 加密敏感配置
    const encryptedConfig = encryptionService.encryptConfig(config) as unknown as Prisma.JsonValue

    const dataSource = await prisma.dataSource.create({
      data: {
        name,
        type: type as DataSourceType,
        config: encryptedConfig,
        status: DataSourceStatus.ACTIVE,
        ownerId: userId
      }
    })

    // 解密后返回（不返回密码）
    const decryptedConfig = encryptionService.decryptConfig(dataSource.config as Record<string, unknown>)
    delete (decryptedConfig as Record<string, unknown>).password

    res.status(201).json({
      success: true,
      message: '数据源创建成功',
      data: {
        ...dataSource,
        config: decryptedConfig
      }
    })
  } catch (error) {
    console.error('创建数据源失败:', error)
    res.status(500).json({
      success: false,
      message: '创建数据源失败'
    })
  }
}

// 获取数据源列表
export const getDataSources = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { type, status, page = 1, pageSize = 10 } = req.query

    const where: Record<string, unknown> = { ownerId: userId }
    if (type) where.type = type
    if (status) where.status = status

    const skip = (Number(page) - 1) * Number(pageSize)

    const [dataSources, total] = await Promise.all([
      prisma.dataSource.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(pageSize)
      }),
      prisma.dataSource.count({ where })
    ])

    // 解密配置（不返回密码）
    const sanitizedDataSources = dataSources.map(ds => {
      const decryptedConfig = encryptionService.decryptConfig(ds.config as Record<string, unknown>)
      delete (decryptedConfig as Record<string, unknown>).password
      return {
        ...ds,
        config: decryptedConfig
      }
    })

    res.json({
      success: true,
      data: {
        list: sanitizedDataSources,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      }
    })
  } catch (error) {
    console.error('获取数据源列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取数据源列表失败'
    })
  }
}

// 获取单个数据源
export const getDataSourceById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { id } = req.params

    const dataSource = await prisma.dataSource.findFirst({
      where: { id, ownerId: userId }
    })

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: '数据源不存在'
      })
    }

    // 解密配置（不返回密码）
    const decryptedConfig = encryptionService.decryptConfig(dataSource.config as Record<string, unknown>)
    delete (decryptedConfig as Record<string, unknown>).password

    res.json({
      success: true,
      data: {
        ...dataSource,
        config: decryptedConfig
      }
    })
  } catch (error) {
    console.error('获取数据源失败:', error)
    res.status(500).json({
      success: false,
      message: '获取数据源失败'
    })
  }
}

// 更新数据源
export const updateDataSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { id } = req.params
    const { name, config, status } = req.body

    // 检查数据源是否存在
    const existing = await prisma.dataSource.findFirst({
      where: { id, ownerId: userId }
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: '数据源不存在'
      })
    }

    // 准备更新数据
    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (status) updateData.status = status

    // 如果更新配置，需要加密
    if (config) {
      // 合并现有配置和新配置
      const existingConfig = encryptionService.decryptConfig(existing.config as Record<string, unknown>)
      const mergedConfig = { ...existingConfig, ...config }
      updateData.config = encryptionService.encryptConfig(mergedConfig)
    }

    const updated = await prisma.dataSource.update({
      where: { id },
      data: updateData
    })

    // 解密后返回（不返回密码）
    const decryptedConfig = encryptionService.decryptConfig(updated.config as Record<string, unknown>)
    delete (decryptedConfig as Record<string, unknown>).password

    res.json({
      success: true,
      message: '数据源更新成功',
      data: {
        ...updated,
        config: decryptedConfig
      }
    })
  } catch (error) {
    console.error('更新数据源失败:', error)
    res.status(500).json({
      success: false,
      message: '更新数据源失败'
    })
  }
}

// 删除数据源
export const deleteDataSource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { id } = req.params

    // 检查数据源是否存在
    const existing = await prisma.dataSource.findFirst({
      where: { id, ownerId: userId }
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: '数据源不存在'
      })
    }

    await prisma.dataSource.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '数据源删除成功'
    })
  } catch (error) {
    console.error('删除数据源失败:', error)
    res.status(500).json({
      success: false,
      message: '删除数据源失败'
    })
  }
}

// 测试连接
export const testConnection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { id } = req.params

    // 检查数据源是否存在
    const dataSource = await prisma.dataSource.findFirst({
      where: { id, ownerId: userId }
    })

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: '数据源不存在'
      })
    }

    // 解密配置
    const config = encryptionService.decryptConfig(dataSource.config as Record<string, unknown>)

    // 测试连接
    const result = await dataSourceService.testConnection(dataSource.type, config)

    // 更新最后测试时间
    await prisma.dataSource.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        status: result.success ? DataSourceStatus.ACTIVE : DataSourceStatus.ERROR
      }
    })

    res.json({
      success: result.success,
      message: result.message,
      data: {
        latency: result.latency,
        lastTestedAt: new Date()
      }
    })
  } catch (error) {
    console.error('测试连接失败:', error)
    res.status(500).json({
      success: false,
      message: '测试连接失败'
    })
  }
}

// 执行查询
export const executeQuery = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const { id } = req.params
    const { query, params = [] } = req.body

    if (!query) {
      return res.status(400).json({
        success: false,
        message: '查询语句不能为空'
      })
    }

    // 检查数据源是否存在
    const dataSource = await prisma.dataSource.findFirst({
      where: { id, ownerId: userId }
    })

    if (!dataSource) {
      return res.status(404).json({
        success: false,
        message: '数据源不存在'
      })
    }

    // 解密配置
    const config = encryptionService.decryptConfig(dataSource.config as Record<string, unknown>)

    // 执行查询
    const result = await dataSourceService.executeQuery(
      dataSource.type,
      config,
      query,
      params
    )

    res.json({
      success: true,
      message: '查询执行成功',
      data: result
    })
  } catch (error) {
    console.error('执行查询失败:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '执行查询失败'
    })
  }
}
