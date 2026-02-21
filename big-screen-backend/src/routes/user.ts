import { Router } from 'express'
import { body, param, query } from 'express-validator'
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js'
import { authenticate, requireRole } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// 所有路由都需要认证
router.use(authenticate)

// 获取用户列表（仅限管理员）
router.get(
  '/',
  requireRole('ADMIN'),
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
    query('role')
      .optional()
      .isIn(['ADMIN', 'USER', 'GUEST'])
      .withMessage('无效的角色值'),
    query('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
      .withMessage('无效的状态值'),
    validate
  ],
  getUsers
)

// 获取单个用户（仅限管理员或本人）
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('无效的用户ID'),
    validate
  ],
  getUserById
)

// 更新用户（仅限管理员）
router.put(
  '/:id',
  requireRole('ADMIN'),
  [
    param('id')
      .isUUID()
      .withMessage('无效的用户ID'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名必须为3-20位字母、数字或下划线'),
    body('avatar')
      .optional()
      .trim()
      .isURL()
      .withMessage('头像必须是有效的URL'),
    body('role')
      .optional()
      .isIn(['ADMIN', 'USER', 'GUEST'])
      .withMessage('无效的角色值'),
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
      .withMessage('无效的状态值'),
    validate
  ],
  updateUser
)

// 删除用户（仅限管理员）
router.delete(
  '/:id',
  requireRole('ADMIN'),
  [
    param('id')
      .isUUID()
      .withMessage('无效的用户ID'),
    validate
  ],
  deleteUser
)

export default router