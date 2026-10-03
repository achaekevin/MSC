import { Router } from 'express';
import { donationController } from '../controllers/donation.controller.js';

const router = Router();

router.get('/config', (req, res, next) => donationController.getPublicMethods(req, res, next));

export default router;
