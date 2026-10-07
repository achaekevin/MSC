import { Router } from 'express';
import { formController } from '../controllers/form.controller.js';
import { validate } from '../middleware/validate.js';
import {
  contactFormLimiter,
  volunteerFormLimiter,
  partnershipFormLimiter,
  challengeLimiter
} from '../middleware/rateLimiter.js';
import { spamProtection } from '../middleware/spamProtection.js';
import { spamChallengeService } from '../services/spamChallenge.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  contactSubmissionSchema,
  volunteerApplicationSchema,
  partnershipApplicationSchema
} from '../schemas/form.schema.js';

const router = Router();

/**
 * Public Security Challenge Endpoint
 * Issues cryptographically signed anti-spam verification tokens
 */
router.get('/challenge', challengeLimiter, (_req, res) => {
  const challenge = spamChallengeService.generateChallenge();
  return sendSuccess(res, challenge, 200);
});

// Contact submission
router.post(
  '/contact',
  contactFormLimiter,
  spamProtection({ checkHoneypot: true, checkTimeTrap: true, checkDisposableEmail: true, checkContentPatterns: true }),
  validate({ body: contactSubmissionSchema }),
  (req, res, next) => formController.submitContact(req, res, next)
);

// Volunteer application (supports /volunteers/apply and /volunteers)
router.post(
  ['/volunteers/apply', '/volunteers'],
  volunteerFormLimiter,
  spamProtection({ checkHoneypot: true, checkTimeTrap: true, checkDisposableEmail: true, checkContentPatterns: true }),
  validate({ body: volunteerApplicationSchema }),
  (req, res, next) => formController.submitVolunteer(req, res, next)
);

// Partnership application (supports /partnerships/apply and /partnerships)
router.post(
  ['/partnerships/apply', '/partnerships'],
  partnershipFormLimiter,
  spamProtection({ checkHoneypot: true, checkTimeTrap: true, checkDisposableEmail: true, checkContentPatterns: true }),
  validate({ body: partnershipApplicationSchema }),
  (req, res, next) => formController.submitPartnership(req, res, next)
);

export default router;
