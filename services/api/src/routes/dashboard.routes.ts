/**
 * 仪表盘路由
 * 处理仪表盘相关的API端点
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// 所有路由都需要认证
router.use(authenticate);

/**
 * @swagger
 * /api/dashboards:
 *   get:
 *     summary: 获取仪表盘列表
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/', dashboardController.getAll);

/**
 * @swagger
 * /api/dashboards/{id}:
 *   get:
 *     summary: 获取单个仪表盘
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeComponents
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 仪表盘不存在
 */
router.get('/:id', dashboardController.getById);

/**
 * @swagger
 * /api/dashboards:
 *   post:
 *     summary: 创建仪表盘
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               config:
 *                 type: object
 *               themeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', dashboardController.create);

/**
 * @swagger
 * /api/dashboards/{id}:
 *   put:
 *     summary: 更新仪表盘
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               config:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               isPublic:
 *                 type: boolean
 *               themeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 仪表盘不存在
 */
router.put('/:id', dashboardController.update);

/**
 * @swagger
 * /api/dashboards/{id}:
 *   delete:
 *     summary: 删除仪表盘
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 仪表盘不存在
 */
router.delete('/:id', dashboardController.delete);

/**
 * @swagger
 * /api/dashboards/{id}/publish:
 *   post:
 *     summary: 发布仪表盘
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 发布成功
 *       404:
 *         description: 仪表盘不存在
 */
router.post('/:id/publish', dashboardController.publish);

/**
 * @swagger
 * /api/dashboards/{id}/unpublish:
 *   post:
 *     summary: 取消发布仪表盘
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 取消发布成功
 *       404:
 *         description: 仪表盘不存在
 */
router.post('/:id/unpublish', dashboardController.unpublish);

export default router;
