import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    throw ApiError.unauthorized('Access token required');
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select('-password -refreshTokens');

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  if (user.isBanned || user.isSuspended) {
    throw ApiError.forbidden('Account suspended');
  }

  req.user = user;
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  });

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-password -refreshTokens');
    } catch {
      // ignore invalid token
    }
  }
  next();
});

export default authenticate;
