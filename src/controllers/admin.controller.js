import Admin from '../models/Admin.js';
import * as adminService from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';

export const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  sendResponse(res, ApiResponse.ok({
    isAdmin: Boolean(admin),
    role: admin?.role ?? null,
    permissions: admin?.permissions ?? [],
  }));
});

export const dashboard = asyncHandler(async (_req, res) => {
  const stats = await adminService.getDashboardStats();
  sendResponse(res, ApiResponse.ok(stats));
});

export const users = asyncHandler(async (req, res) => {
  const result = await adminService.getUsers(req.query);
  sendResponse(res, ApiResponse.ok(result));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.userId, req.body, req.admin._id);
  sendResponse(res, ApiResponse.ok({ user }));
});

export const workspaces = asyncHandler(async (req, res) => {
  const result = await adminService.getWorkspaces(req.query);
  sendResponse(res, ApiResponse.ok(result));
});

export const reports = asyncHandler(async (req, res) => {
  const result = await adminService.getReports(req.query);
  sendResponse(res, ApiResponse.ok(result));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await adminService.resolveReport(req.params.reportId, req.admin._id, req.body);
  sendResponse(res, ApiResponse.ok({ report }));
});

export const broadcast = asyncHandler(async (req, res) => {
  const result = await adminService.broadcastNotification(req.body);
  sendResponse(res, ApiResponse.ok(result));
});

export default { me, dashboard, users, updateUser, workspaces, reports, resolveReport, broadcast };
