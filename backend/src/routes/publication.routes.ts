import { Router } from 'express';
import { publicationController } from '../controllers/publication.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermissions } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createPublicationSchema, updatePublicationSchema } from '../schemas/content.schema.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => publicationController.getPublicPublications(req, res, next));
router.get('/:slug', (req, res, next) => publicationController.getPublicPublicationBySlug(req, res, next));

// Admin management routes
router.get(
  '/admin/all',
  authenticate,
  requirePermissions('CONTENT_READ'),
  (req, res, next) => publicationController.getAdminPublications(req, res, next)
);

router.get(
  '/admin/item/:id',
  authenticate,
  requirePermissions('CONTENT_READ'),
  (req, res, next) => publicationController.getPublicationById(req, res, next)
);

router.post(
  '/admin/create',
  authenticate,
  requirePermissions('CONTENT_CREATE'),
  validate({ body: createPublicationSchema }),
  (req, res, next) => publicationController.createPublication(req, res, next)
);

router.put(
  '/admin/update/:id',
  authenticate,
  requirePermissions('CONTENT_UPDATE'),
  validate({ body: updatePublicationSchema }),
  (req, res, next) => publicationController.updatePublication(req, res, next)
);

router.delete(
  '/admin/delete/:id',
  authenticate,
  requirePermissions('CONTENT_DELETE'),
  (req, res, next) => publicationController.deletePublication(req, res, next)
);

router.post(
  '/admin/publish/:id',
  authenticate,
  requirePermissions('CONTENT_PUBLISH'),
  (req, res, next) => publicationController.publishPublication(req, res, next)
);

router.post(
  '/admin/approve/:id',
  authenticate,
  requirePermissions('CONTENT_APPROVE'),
  (req, res, next) => publicationController.approvePublication(req, res, next)
);

export default router;
