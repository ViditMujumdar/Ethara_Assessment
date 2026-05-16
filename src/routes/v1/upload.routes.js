import { Router } from 'express';
import * as uploadController from '../../controllers/upload.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { uploadMiddleware } from '../../middleware/upload.js';

const router = Router();
router.use(authenticate);
router.post('/', uploadMiddleware.single('file'), uploadController.upload);
router.delete('/', uploadController.remove);

export default router;
