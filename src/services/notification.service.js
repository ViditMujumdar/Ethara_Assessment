import Notification from '../models/Notification.js';

export const createNotification = async (data) => Notification.create(data);

export const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly }) => {
  const filter = { user: userId };
  if (unreadOnly === 'true') filter.isRead = false;
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);
  return { notifications, unreadCount, pagination: { page, limit, total } };
};

export const markAsRead = async (userId, notificationIds) => {
  await Notification.updateMany(
    { user: userId, _id: { $in: notificationIds } },
    { isRead: true }
  );
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};

export default { createNotification, getUserNotifications, markAsRead, markAllAsRead };
