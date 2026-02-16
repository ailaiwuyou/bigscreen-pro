/**
 * 组件路由
 * 处理组件相关的API端点
 */

import { Router } from 'express';
import { ComponentController } from '../controllers/ComponentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const componentController = new ComponentController();

// 所有路由都需要认证
router.use(authenticate);

/**
 * @swagger
 * /api/components:
 *   get:
 *     summary: 获取仪表盘的所有组件
 *     tags: [组件]
 *     parameters:
 *       - in: query
 *         name: dashboardId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/', componentController.getByDashboard);

/**
 * @swagger
 * /api/components/{id}:
 *   get:
 *     summary: 获取单个组件
 *     tags: [组件]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', componentController.getById);

/**
 * @swagger
 * /api/components:
 *   post:
 *     summary: 创建组件
 *     tags: [组件]
 *     parameters:
 *       - in: query
 *         name: dashboardId
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/', componentController.create);

/**
 * @swagger
 * /api/components/{id}:
 *   put:
 *     summary: 更新组件
 *     tags: [组件]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', componentController.update);

/**
 * @swagger
 * /api/components/{id}:
 *   delete:
 *     summary: 删除组件
 *     tags: [组件]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', componentController.delete);

/**
 * @swagger
 * /api/components/batch/positions:
 *   put:
 *     summary: 批量更新组件位置
 *     tags: [组件]
 */
router.put('/batch/positions', componentController.batchUpdatePositions);

export default router;
