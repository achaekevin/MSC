import { Router } from 'express';
import { impactController } from '../controllers/impact.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermissions } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createImpactMetricSchema, updateImpactMetricSchema } from '../schemas/content.schema.js';

const router = Router();

// Public endpoints
router.get('/', (req, res, next) => impactController.getPublicMetrics(req, res, next));
router.get('/metrics', (req, res, next) => impactController.getPublicMetrics(req, res, next));

// Admin management endpoints
router.get(
  '/admin/metrics',
  authenticate,
  requirePermissions('CONTENT_READ'),
  (req, res, next) => impactController.getAdminMetrics(req, res, next)
);

router.get(
  '/admin/metrics/:id',
  authenticate,
  requirePermissions('CONTENT_READ'),
  (req, res, next) => impactController.getMetricById(req, res, next)
);

router.post(
  '/admin/metrics',
  authenticate,
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createImpactMetricSchema }),
  (req, res, next) => impactController.createMetric(req, res, next)
);

router.put(
  '/admin/metrics/:id',
  authenticate,
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updateImpactMetricSchema }),
  (req, res, next) => impactController.updateMetric(req, res, next)
);

router.delete(
  '/admin/metrics/:id',
  authenticate,
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => impactController.deleteMetric(req, res, next)
);

router.post(
  '/admin/metrics/:id/approve',
  authenticate,
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => impactController.approveMetric(req, res, next)
);

router.post(
  '/admin/metrics/:id/publish',
  authenticate,
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => impactController.publishMetric(req, res, next)
);

router.post(
  '/admin/metrics/:id/submit',
  authenticate,
  requirePermissions('CONTENT_UPDATE'),
  (req, res, next) => impactController.submitReview(req, res, next)
);

export default router;
