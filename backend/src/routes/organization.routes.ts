import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';

const router = Router();

router.get('/', (req, res, next) => organizationController.getPublicOrganization(req, res, next));
router.get('/structure', (req, res, next) => organizationController.getStructureNodes(req, res, next));

export default router;
