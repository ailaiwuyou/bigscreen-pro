import type { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { AppError } from './errorHandler.js'

// 请求验证中间件
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    // 格式化错误信息
    const errorMessages = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : error.type,
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }))

    throw new AppError(400, '请求参数验证失败', 'VALIDATION_ERROR', {
      errors: errorMessages
    })
  }

  next()
}