/**
 * 权限服务导出
 */

export * from './types.js'
export * from './permission.js'
export * from './middleware.js'

import { permissionService } from './permission.js'

// 初始化默认权限（可以根据需要调整）
export function initPermissions() {
  // 可以在这里加载默认配置
  console.log('[Permission] 权限服务已初始化')
}

export default {
  permissionService,
  initPermissions
}
