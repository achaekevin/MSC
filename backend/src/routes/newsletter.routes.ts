import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRoles } from '../middleware/authorize.js';
import { newsletterLimiter } from '../middleware/rateLimiter.js';
import { spamProtection } from '../middleware/spamProtection.js';

const router = Router();

// Public routes
router.post(
  '/subscribe',
  newsletterLimiter,
  spamProtection({ checkHoneypot: true, checkTimeTrap: true, checkDisposableEmail: true }),
  (req, res, next) => newsletterController.subscribe(req, res, next)
);

router.post('/unsubscribe', (req, res, next) => newsletterController.unsubscribe(req, res, next));
router.get('/unsubscribe', (req, res, next) => newsletterController.unsubscribe(req, res, next));

// Protected admin routes
router.get(
  '/admin/subscribers',
  authenticate,
  requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN', 'FORM_MANAGER'),
  (req, res, next) => newsletterController.getSubscribers(req, res, next)
);

router.delete(
  '/admin/subscribers/:id',
  authenticate,
  requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN'),
  (req, res, next) => newsletterController.deleteSubscriber(req, res, next)
);

router.get(
  '/admin/export',
  authenticate,
  requireRoles('SUPER_ADMIN', 'CONTENT_ADMIN', 'FORM_MANAGER'),
  (req, res, next) => newsletterController.exportCsv(req, res, next)
);

export default router;
