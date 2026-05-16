import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireAdmin, requirePermission } from '../../middleware/adminAuth.js';

const router = Router();

router.get('/me', authenticate, adminController.me);

router.use(authenticate, requireAdmin);

router.get('/dashboard', requirePermission('view_analytics'), adminController.dashboard);
router.get('/users', requirePermission('manage_users'), adminController.users);
router.patch('/users/:userId', requirePermission('manage_users'), adminController.updateUser);
router.get('/workspaces', requirePermission('manage_workspaces'), adminController.workspaces);
router.get('/reports', requirePermission('manage_reports'), adminController.reports);
router.patch('/reports/:reportId', requirePermission('manage_reports'), adminController.resolveReport);
router.post('/notifications/broadcast', requirePermission('manage_users'), adminController.broadcast);

export default router;
