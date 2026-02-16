/**
 * 路由统一导出
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import componentRoutes from './component.routes';

const router = Router();

// 认证路由
router.use('/auth', authRoutes);

// 仪表盘路由
router.use('/dashboards', dashboardRoutes);

// 组件路由
router.use('/components', componentRoutes);

export default router;
