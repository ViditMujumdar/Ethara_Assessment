import { Router } from 'express';
import * as aiController from '../../controllers/ai.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePlan } from '../../middleware/subscription.js';

const router = Router();
router.use(authenticate);
router.use(requirePlan('pro'));

router.post('/summarize', aiController.summarize);
router.post('/breakdown', aiController.breakdown);
router.post('/prioritize', aiController.prioritize);
router.post('/chat', aiController.chat);
router.post('/meeting-notes', aiController.meetingNotes);

export default router;
