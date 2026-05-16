import * as notificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  sendResponse(res, ApiResponse.ok(result));
});

export const markRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.user._id, req.body.ids || [req.params.id]);
  sendResponse(res, ApiResponse.ok(null, 'Marked as read'));
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendResponse(res, ApiResponse.ok(null, 'All marked as read'));
});

export default { list, markRead, markAllRead };
