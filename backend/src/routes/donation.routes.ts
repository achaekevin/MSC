import { Router } from 'express';
import { donationController } from '../controllers/donation.controller.js';
import { validate } from '../middleware/validate.js';
import { contactFormLimiter } from '../middleware/rateLimiter.js';
import { inKindDonationSchema } from '../schemas/form.schema.js';

const router = Router();

router.get('/config', (req, res, next) => donationController.getPublicMethods(req, res, next));

router.post(
  '/in-kind',
  contactFormLimiter,
  validate({ body: inKindDonationSchema }),
  (req, res, next) => donationController.submitInKindDonation(req, res, next)
);

export default router;
