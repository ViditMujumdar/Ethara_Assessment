import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Admin from '../models/Admin.js';

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator', 'support'];

export const requireAdmin = asyncHandler(async (req, _res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  if (!admin) {
    throw ApiError.forbidden('Admin access required');
  }

  req.admin = admin;
  next();
});

export const requireAdminRole = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.admin) {
      throw ApiError.forbidden('Admin access required');
    }
    if (!roles.includes(req.admin.role)) {
      throw ApiError.forbidden('Insufficient admin permissions');
    }
    next();
  });

export const requirePermission = (permission) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.admin?.permissions?.includes(permission) && req.admin?.role !== 'super_admin') {
      throw ApiError.forbidden(`Missing permission: ${permission}`);
    }
    next();
  });

export { ADMIN_ROLES };
export default requireAdmin;
