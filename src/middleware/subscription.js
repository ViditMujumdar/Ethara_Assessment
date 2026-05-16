import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Subscription from '../models/Subscription.js';

const PLAN_LIMITS = {
  free: { workspaces: 1, members: 5, tasks: 100, storage: 100 },
  pro: { workspaces: 10, members: 50, tasks: 10000, storage: 5000 },
  enterprise: { workspaces: -1, members: -1, tasks: -1, storage: -1 },
};

export const requirePlan = (minPlan) =>
  asyncHandler(async (req, _res, next) => {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
    }).sort({ createdAt: -1 });

    const planOrder = ['free', 'pro', 'enterprise'];
    const userPlan = subscription?.plan || 'free';

    if (planOrder.indexOf(userPlan) < planOrder.indexOf(minPlan)) {
      throw ApiError.forbidden(`This feature requires ${minPlan} plan or higher`);
    }

    req.subscription = subscription;
    req.planLimits = PLAN_LIMITS[userPlan];
    next();
  });

export { PLAN_LIMITS };
export default requirePlan;
