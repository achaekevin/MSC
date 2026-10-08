import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  name: z.string().min(2, 'Full name must be at least 2 characters long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['CONTENT_ADMIN', 'EDITOR', 'REVIEWER', 'FORM_MANAGER']).optional(),
  adminInviteCode: z.string().min(1, 'A valid administrative authorization key is required to register an admin account')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address').toLowerCase().trim()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const createUserSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['SUPER_ADMIN', 'CONTENT_ADMIN', 'EDITOR', 'REVIEWER', 'FORM_MANAGER'])
});

export const setUserActiveStatusSchema = z.object({
  isActive: z.boolean()
});

export const setUserRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'CONTENT_ADMIN', 'EDITOR', 'REVIEWER', 'FORM_MANAGER'])
});

export const adminResetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

