import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail(),
];

export const resetPasswordValidator = [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
];

export default { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator };
