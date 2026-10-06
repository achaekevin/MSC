import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, validate({ body: loginSchema }), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', validate({ body: refreshTokenSchema }), (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), (req, res, next) => authController.resetPassword(req, res, next));
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), (req, res, next) => authController.changePassword(req, res, next));

export default router;
