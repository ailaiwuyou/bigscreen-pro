import { Router } from 'express'
import { body, param, query } from 'express-validator'
import {
  createDashboard,
  getDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
  duplicateDashboard,
  publishDashboard,
  archiveDashboard
} from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// 所有路由都需要认证
router.use(authenticate)

// 创建仪表盘
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('仪表盘名称不能为空')
      .isLength({ max: 100 })
      .withMessage('仪表盘名称不能超过100个字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('描述不能超过500个字符'),
    body('config')
      .optional()
      .isObject()
      .withMessage('配置必须是有效的JSON对象'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    validate
  ],
  createDashboard
)

// 获取仪表盘列表
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是正整数'),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须在1-100之间'),
    query('keyword')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('关键词不能超过100个字符'),
    query('status')
      .optional()
      .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
      .withMessage('无效的状态值'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'name'])
      .withMessage('无效的排序字段'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('无效的排序方向'),
    validate
  ],
  getDashboards
)

// 获取单个仪表盘
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('无效的仪表盘ID'),
    validate
  ],
  getDashboardById
)

// 更新仪表盘
router.put(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('无效的仪表盘ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('仪表盘名称不能为空')
      .isLength({ max: 100 })
      .withMessage('仪表盘名称不能超过100个字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('描述不能超过500个字符'),
    body('config')
      .optional()
      .isObject()
      .withMessage('配置必须是有效的JSON对象'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    body('thumbnail')
      .optional()
      .trim()
      .isURL()
      .withMessage('缩略图必须是有效的URL'),
    validate
  ],
  updateDashboard
)

// 删除仪表盘
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('无效的仪表盘ID'),
    validate
  ],
  deleteDashboard
)

// 复制仪表盘
router.post(
  '/:id/duplicate',
  [
    param('id')
      .isUUID()
      .withMessage('无效的仪表盘ID'),
    validate
  ],
  duplicateDashboard
)

// 发布仪表盘
router.post(
  '/:id/publish',
  [
    param('id')
      .isUUID()
      .withMessage('无效的仪表盘ID'),
    validate
  ],
  publishDashboard
)

// 归档仪表盘
router.post(
  '/:id/archive',
  [
    param('id')
      .isUUID()
      .withMessage('无效的仪表盘ID'),
    validate
  ],
  archiveDashboard
)

export default router