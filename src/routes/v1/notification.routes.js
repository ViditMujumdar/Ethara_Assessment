import { Router } from 'express';
import * as notificationController from '../../controllers/notification.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);
router.post('/mark-read', notificationController.markRead);

export default router;
