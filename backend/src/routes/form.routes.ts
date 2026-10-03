import { Router } from 'express';
import { formController } from '../controllers/form.controller.js';
import { validate } from '../middleware/validate.js';
import {
  contactFormLimiter,
  volunteerFormLimiter,
  partnershipFormLimiter
} from '../middleware/rateLimiter.js';
import {
  contactSubmissionSchema,
  volunteerApplicationSchema,
  partnershipApplicationSchema
} from '../schemas/form.schema.js';

const router = Router();

// Contact submission
router.post(
  '/contact',
  contactFormLimiter,
  validate({ body: contactSubmissionSchema }),
  (req, res, next) => formController.submitContact(req, res, next)
);

// Volunteer application
router.post(
  '/volunteers/apply',
  volunteerFormLimiter,
  validate({ body: volunteerApplicationSchema }),
  (req, res, next) => formController.submitVolunteer(req, res, next)
);

// Partnership application
router.post(
  '/partnerships/apply',
  partnershipFormLimiter,
  validate({ body: partnershipApplicationSchema }),
  (req, res, next) => formController.submitPartnership(req, res, next)
);

export default router;
