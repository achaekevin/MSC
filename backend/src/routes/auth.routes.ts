import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { spamProtection } from '../middleware/spamProtection.js';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  enableTwoFactorSchema,
  disableTwoFactorSchema,
  verifyTwoFactorLoginSchema
} from '../schemas/auth.schema.js';

const router = Router();

/**
 * Authentication Routes
 * Protected with strict rate limiting: maximum of 3 attempts per authentication route per 15 minutes
 */
router.post(
  '/register',
  authLimiter,
  spamProtection({ checkHoneypot: true, checkTimeTrap: true, checkDisposableEmail: true }),
  validate({ body: registerSchema }),
  (req, res, next) => authController.register(req, res, next)
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  (req, res, next) => authController.login(req, res, next)
);

// 2FA login verification
router.post(
  '/2fa/verify',
  authLimiter,
  validate({ body: verifyTwoFactorLoginSchema }),
  (req, res, next) => authController.verifyTwoFactor(req, res, next)
);

// 2FA administration (authenticated)
router.get(
  '/2fa/status',
  authenticate,
  (req, res, next) => authController.getTwoFactorStatus(req, res, next)
);

router.post(
  '/2fa/generate',
  authenticate,
  (req, res, next) => authController.generateTwoFactorSecret(req, res, next)
);

router.post(
  '/2fa/enable',
  authenticate,
  validate({ body: enableTwoFactorSchema }),
  (req, res, next) => authController.enableTwoFactor(req, res, next)
);

router.post(
  '/2fa/disable',
  authenticate,
  validate({ body: disableTwoFactorSchema }),
  (req, res, next) => authController.disableTwoFactor(req, res, next)
);

router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  (req, res, next) => authController.refresh(req, res, next)
);

router.post(
  '/logout',
  (req, res, next) => authController.logout(req as any, res, next)
);

router.get(
  '/me',
  authenticate,
  (req, res, next) => authController.getMe(req, res, next)
);

router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  (req, res, next) => authController.forgotPassword(req, res, next)
);

router.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordSchema }),
  (req, res, next) => authController.resetPassword(req, res, next)
);

router.post(
  '/change-password',
  authLimiter,
  authenticate,
  validate({ body: changePasswordSchema }),
  (req, res, next) => authController.changePassword(req, res, next)
);

router.post(
  '/verify-email',
  authLimiter,
  (req, res, next) => authController.verifyEmail(req, res, next)
);

router.post(
  '/resend-verification',
  authLimiter,
  (req, res, next) => authController.resendVerification(req, res, next)
);

export default router;
