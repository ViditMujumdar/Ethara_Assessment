import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'past_due', 'trialing'], default: 'active' },
    provider: { type: String, enum: ['stripe', 'razorpay', 'manual'], default: 'manual' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    razorpaySubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    invoices: [{
      amount: Number,
      currency: { type: String, default: 'usd' },
      status: String,
      invoiceId: String,
      paidAt: Date,
    }],
  },
  { timestamps: true }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
