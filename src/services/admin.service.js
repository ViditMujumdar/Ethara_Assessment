import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import Subscription from '../models/Subscription.js';
import Report from '../models/Report.js';
import AIUsage from '../models/AIUsage.js';
import Notification from '../models/Notification.js';
import { getConnectionStatus } from '../config/db.js';
import { getRedis, isRedisEnabled } from '../config/redis.js';
import { config } from '../config/index.js';

export const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalWorkspaces,
    totalTasks,
    activeSubscriptions,
    pendingReports,
    aiRequestsToday,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    Workspace.countDocuments(),
    Task.countDocuments(),
    Subscription.countDocuments({ status: 'active', plan: { $ne: 'free' } }),
    Report.countDocuments({ status: 'pending' }),
    AIUsage.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
  ]);

  const userGrowth = await User.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);

  const revenueData = await Subscription.aggregate([
    { $match: { status: 'active', plan: { $ne: 'free' } } },
    { $group: { _id: '$plan', count: { $sum: 1 } } },
  ]);

  const aiUsageByProvider = await AIUsage.aggregate([
    { $group: { _id: '$provider', requests: { $sum: 1 }, tokens: { $sum: '$tokensUsed' } } },
  ]);

  return {
    totalUsers,
    activeUsers,
    totalWorkspaces,
    totalTasks,
    activeSubscriptions,
    pendingReports,
    aiRequestsToday,
    userGrowth,
    revenueData,
    aiUsageByProvider,
    serverHealth: {
      database: getConnectionStatus(),
      redis: {
        enabled: config.redisEnabled,
        connected: isRedisEnabled() && getRedis()?.status === 'ready',
      },
    },
  };
};

export const getUsers = async ({ page = 1, limit = 20, search, role, status }) => {
  const filter = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role) filter.role = role;
  if (status === 'banned') filter.isBanned = true;
  if (status === 'suspended') filter.isSuspended = true;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, pagination: { page, limit, total } };
};

export const updateUser = async (userId, data, adminId) => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true });
  return user;
};

export const getWorkspaces = async ({ page = 1, limit = 20, search }) => {
  const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
  const skip = (page - 1) * limit;
  const [workspaces, total] = await Promise.all([
    Workspace.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Workspace.countDocuments(filter),
  ]);
  return { workspaces, pagination: { page, limit, total } };
};

export const getReports = async ({ page = 1, limit = 20, status }) => {
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [reports, total] = await Promise.all([
    Report.find(filter).populate('reporter reportedUser', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);
  return { reports, pagination: { page, limit, total } };
};

export const resolveReport = async (reportId, adminId, { status, resolution, action }) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status, resolution, resolvedBy: adminId, resolvedAt: new Date() },
    { new: true }
  );
  if (action === 'ban_user' && report.reportedUser) {
    await User.findByIdAndUpdate(report.reportedUser, { isBanned: true });
  }
  if (action === 'suspend_workspace' && report.workspace) {
    await Workspace.findByIdAndUpdate(report.workspace, { isSuspended: true });
  }
  return report;
};

export const broadcastNotification = async ({ title, message, userIds }) => {
  const filter = userIds?.length ? { _id: { $in: userIds } } : {};
  const users = await User.find(filter).select('_id');
  const notifications = users.map((u) => ({
    user: u._id,
    type: 'system',
    title,
    message,
  }));
  await Notification.insertMany(notifications);
  return { sent: notifications.length };
};

export default {
  getDashboardStats, getUsers, updateUser, getWorkspaces,
  getReports, resolveReport, broadcastNotification,
};
