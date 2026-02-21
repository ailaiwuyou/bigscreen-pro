import { Router } from 'express'
import { body } from 'express-validator'
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'

const router = Router()

// 注册
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('请输入有效的邮箱地址'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名必须为3-20位字母、数字或下划线'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为6位'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('两次输入的密码不一致')
        }
        return true
      }),
    validate
  ],
  register
)

// 登录
router.post(
  '/login',
  [
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('请输入有效的邮箱地址'),
    body('username')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('用户名不能为空'),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空'),
    body()
      .custom((value) => {
        if (!value.email && !value.username) {
          throw new Error('请提供邮箱或用户名')
        }
        return true
      }),
    validate
  ],
  login
)

// 登出
router.post('/logout', authenticate, logout)

// 刷新 Token
router.post('/refresh', refreshToken)

// 获取当前用户信息
router.get('/me', authenticate, getCurrentUser)

// 更新个人资料
router.put(
  '/profile',
  authenticate,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('用户名必须为3-20位字母、数字或下划线'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('头像必须是有效的URL'),
    validate
  ],
  updateProfile
)

// 修改密码
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('当前密码不能为空'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码长度至少为6位'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('两次输入的密码不一致')
        }
        return true
      }),
    validate
  ],
  changePassword
)

export default router