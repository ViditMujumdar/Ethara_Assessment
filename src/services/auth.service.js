import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { bootstrapFirstAdmin } from '../utils/bootstrapAdmin.js';

const generateToken = () => crypto.randomBytes(32).toString('hex');

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const verificationToken = generateToken();
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  await sendVerificationEmail(user, verificationToken);
  await bootstrapFirstAdmin(user._id);
  return user;
};

export const loginUser = async ({ email, password, userAgent, ip }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.isBanned) throw ApiError.forbidden('Account banned');
  if (user.isSuspended) throw ApiError.forbidden('Account suspended');

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  user.refreshTokens.push({
    refreshToken,
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  user.refreshTokens = user.refreshTokens.slice(-5);
  user.lastLogin = new Date();
  user.loginHistory = [...(user.loginHistory || []).slice(-19), { ip, userAgent }];
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refreshTokens = async (oldRefreshToken, userAgent, ip) => {
  const decoded = verifyRefreshToken(oldRefreshToken);
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) throw ApiError.unauthorized('Invalid refresh token');

  const session = user.refreshTokens.find((s) => s.refreshToken === oldRefreshToken);
  if (!session || session.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token expired');
  }

  user.refreshTokens = user.refreshTokens.filter((s) => s.refreshToken !== oldRefreshToken);

  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const refreshToken = signRefreshToken({ id: user._id });

  user.refreshTokens.push({
    refreshToken,
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();

  return { user, accessToken, refreshToken };
};

export const logoutUser = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user && refreshToken) {
    user.refreshTokens = user.refreshTokens.filter((s) => s.refreshToken !== refreshToken);
    await user.save();
  }
};

export const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) throw ApiError.badRequest('Invalid or expired verification token');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return user;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = generateToken();
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  await sendPasswordResetEmail(user, resetToken);
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();
  return user;
};

export default { registerUser, loginUser, refreshTokens, logoutUser, verifyEmail, forgotPassword, resetPassword };
