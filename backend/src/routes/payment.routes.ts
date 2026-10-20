import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermissions } from '../middleware/authorize.js';
import { generalLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public commerce endpoints
router.post('/purchase/initiate', generalLimiter, (req, res, next) =>
  paymentController.initiatePublicationPurchase(req, res, next)
);

router.post('/donation/initiate', generalLimiter, (req, res, next) =>
  paymentController.initiateDonation(req, res, next)
);

// M-Pesa Safaricom Daraja STK Callback (Webhook)
router.post('/mpesa/callback', (req, res, next) =>
  paymentController.handleMpesaCallback(req, res, next)
);

// Polling status by reference code
router.get('/status/:referenceCode', (req, res, next) =>
  paymentController.getPaymentStatus(req, res, next)
);

// Protected Admin / Finance endpoints
router.get(
  '/admin/summary',
  authenticate,
  requirePermissions('FINANCE_READ'),
  (req, res, next) => paymentController.getFinancialSummary(req, res, next)
);

router.get(
  '/admin/transactions',
  authenticate,
  requirePermissions('FINANCE_READ'),
  (req, res, next) => paymentController.getTransactions(req, res, next)
);

router.get(
  '/admin/export',
  authenticate,
  requirePermissions('FINANCE_MANAGE'),
  (req, res, next) => paymentController.exportTransactionsCsv(req, res, next)
);

export default router;
