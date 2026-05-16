import { Router } from 'express';
import express from 'express';
import * as subscriptionController from '../../controllers/subscription.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/plans', subscriptionController.getPlans);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), subscriptionController.stripeWebhook);

router.use(authenticate);
router.get('/', subscriptionController.getSubscription);
router.post('/stripe/checkout', subscriptionController.stripeCheckout);
router.post('/razorpay/order', subscriptionController.razorpayOrder);
router.post('/cancel', subscriptionController.cancel);

export default router;
