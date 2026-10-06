import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';

const router = Router();

router.get('/', (req, res, next) => organizationController.getPublicOrganization(req, res, next));
router.get('/profile', (req, res, next) => organizationController.getPublicOrganization(req, res, next));
router.get('/values', (req, res, next) => organizationController.getValues(req, res, next));
router.get('/history', (req, res, next) => organizationController.getHistory(req, res, next));
router.get('/contacts', (req, res, next) => organizationController.getContacts(req, res, next));
router.get('/structure', (req, res, next) => organizationController.getStructureNodes(req, res, next));

export default router;
