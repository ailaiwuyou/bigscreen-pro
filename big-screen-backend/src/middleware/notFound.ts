import type { RequestHandler } from 'express'

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    message: `The requested resource ${req.method} ${req.originalUrl} was not found on this server.`,
    data: {
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  })
}