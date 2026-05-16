import * as subscriptionService from '../services/subscription.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getPlans = asyncHandler(async (_req, res) => {
  sendResponse(res, ApiResponse.ok({ plans: subscriptionService.getPlans() }));
});

export const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getUserSubscription(req.user._id);
  sendResponse(res, ApiResponse.ok({ subscription }));
});

export const stripeCheckout = asyncHandler(async (req, res) => {
  const session = await subscriptionService.createStripeCheckout(
    req.user._id,
    req.body.plan,
    req.user.email
  );
  sendResponse(res, ApiResponse.ok({ url: session.url, sessionId: session.id }));
});

export const razorpayOrder = asyncHandler(async (req, res) => {
  const order = await subscriptionService.createRazorpayOrder(req.user._id, req.body.plan);
  sendResponse(res, ApiResponse.ok({ order }));
});

export const cancel = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(req.user._id);
  sendResponse(res, ApiResponse.ok({ subscription }));
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  await subscriptionService.handleStripeWebhook(req.body, req.headers['stripe-signature']);
  res.status(200).json({ received: true });
});

export default { getPlans, getSubscription, stripeCheckout, razorpayOrder, cancel, stripeWebhook };
