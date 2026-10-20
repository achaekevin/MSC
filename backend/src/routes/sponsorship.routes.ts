import { Router } from 'express';
import { sponsorshipController } from '../controllers/sponsorship.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermissions } from '../middleware/authorize.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public partner routes
router.post('/enquire', generalLimiter, (req, res, next) =>
  sponsorshipController.createEnquiry(req, res, next)
);

router.get('/partners', (req, res, next) =>
  sponsorshipController.getPublicSponsors(req, res, next)
);

// Protected Admin / Finance routes
router.get(
  '/admin/all',
  authenticate,
  requirePermissions('FINANCE_READ'),
  (req, res, next) => sponsorshipController.getAdminSponsorships(req, res, next)
);

router.put(
  '/admin/:id',
  authenticate,
  requirePermissions('FINANCE_MANAGE'),
  (req, res, next) => sponsorshipController.updateSponsorship(req, res, next)
);

router.post(
  '/admin/:id/record-payment',
  authenticate,
  requirePermissions('PAYMENT_RECONCILE'),
  (req, res, next) => sponsorshipController.recordPayment(req, res, next)
);

export default router;
