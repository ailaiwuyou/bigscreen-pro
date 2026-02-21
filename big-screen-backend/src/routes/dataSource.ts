import { Router } from 'express'
import {
  createDataSource,
  getDataSources,
  getDataSourceById,
  updateDataSource,
  deleteDataSource,
  testConnection,
  executeQuery
} from '../controllers/dataSourceController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

// 所有路由都需要认证
router.use(authenticate)

// 数据源 CRUD
router.post('/', createDataSource)
router.get('/', getDataSources)
router.get('/:id', getDataSourceById)
router.put('/:id', updateDataSource)
router.delete('/:id', deleteDataSource)

// 测试连接
router.post('/:id/test', testConnection)

// 执行查询
router.post('/:id/query', executeQuery)

export default router