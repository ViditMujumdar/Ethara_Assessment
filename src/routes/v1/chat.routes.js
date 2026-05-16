import { Router } from 'express';
import * as chatController from '../../controllers/chat.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/:workspaceId/messages', chatController.getMessages);
router.get('/:workspaceId/search', chatController.search);
router.get('/dm/:userId', chatController.getDMs);

export default router;
