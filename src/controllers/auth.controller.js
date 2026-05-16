import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import ApiResponse from '../utils/ApiResponse.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  sendResponse(res, ApiResponse.created({ user }, 'Registration successful. Please verify your email.'));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser({
    ...req.body,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  setAuthCookies(res, { accessToken, refreshToken });
  sendResponse(res, ApiResponse.ok({ user, accessToken, refreshToken }));
});

export const refresh = asyncHandler(async (req, res) => {
  const oldToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!oldToken) {
    const { ApiError } = await import('../utils/ApiError.js');
    throw ApiError.unauthorized('Refresh token required');
  }

  const { user, accessToken, refreshToken } = await authService.refreshTokens(
    oldToken,
    req.headers['user-agent'],
    req.ip
  );
  setAuthCookies(res, { accessToken, refreshToken });
  sendResponse(res, ApiResponse.ok({ user, accessToken, refreshToken }));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  await authService.logoutUser(req.user?._id, refreshToken);
  clearAuthCookies(res);
  sendResponse(res, ApiResponse.ok(null, 'Logged out successfully'));
});

export const me = asyncHandler(async (req, res) => {
  sendResponse(res, ApiResponse.ok({ user: req.user }));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.query.token || req.body.token);
  sendResponse(res, ApiResponse.ok({ user }, 'Email verified successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, ApiResponse.ok(null, 'If email exists, reset link has been sent'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword(req.body.token, req.body.password);
  sendResponse(res, ApiResponse.ok({ user }, 'Password reset successful'));
});

export default { register, login, refresh, logout, me, verifyEmail, forgotPassword, resetPassword };
