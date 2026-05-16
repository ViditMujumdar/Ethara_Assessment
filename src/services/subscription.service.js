import Stripe from 'stripe';
import Razorpay from 'razorpay';
import Subscription from '../models/Subscription.js';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

const PLANS = {
  free: { price: 0, name: 'Free' },
  pro: { price: 999, name: 'Pro', stripePriceId: 'price_pro' },
  enterprise: { price: 2999, name: 'Enterprise', stripePriceId: 'price_enterprise' },
};

let stripe = null;
let razorpay = null;

const getStripe = () => {
  if (!stripe && config.stripe.secretKey) {
    stripe = new Stripe(config.stripe.secretKey);
  }
  return stripe;
};

const getRazorpay = () => {
  if (!razorpay && config.razorpay.keyId) {
    razorpay = new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
  }
  return razorpay;
};

export const getPlans = () => PLANS;

export const getUserSubscription = async (userId) => {
  let sub = await Subscription.findOne({ user: userId, status: 'active' }).sort({ createdAt: -1 });
  if (!sub) {
    sub = await Subscription.create({ user: userId, plan: 'free', status: 'active' });
  }
  return sub;
};

export const createStripeCheckout = async (userId, plan, email) => {
  const stripeClient = getStripe();
  if (!stripeClient) throw ApiError.internal('Stripe not configured');

  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: PLANS[plan].stripePriceId, quantity: 1 }],
    success_url: `${config.clientUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.clientUrl}/billing`,
    metadata: { userId: userId.toString(), plan },
  });
  return session;
};

export const handleStripeWebhook = async (payload, signature) => {
  const stripeClient = getStripe();
  if (!stripeClient) return;

  const event = stripeClient.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await Subscription.findOneAndUpdate(
      { user: session.metadata.userId },
      {
        plan: session.metadata.plan,
        status: 'active',
        provider: 'stripe',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      { upsert: true }
    );
  }
};

export const createRazorpayOrder = async (userId, plan) => {
  const rp = getRazorpay();
  if (!rp) throw ApiError.internal('Razorpay not configured');

  const order = await rp.orders.create({
    amount: PLANS[plan].price * 100,
    currency: 'INR',
    notes: { userId: userId.toString(), plan },
  });
  return order;
};

export const cancelSubscription = async (userId) => {
  const sub = await getUserSubscription(userId);
  sub.cancelAtPeriodEnd = true;
  sub.status = 'cancelled';
  await sub.save();
  return sub;
};

export default { getPlans, getUserSubscription, createStripeCheckout, handleStripeWebhook, createRazorpayOrder, cancelSubscription };
