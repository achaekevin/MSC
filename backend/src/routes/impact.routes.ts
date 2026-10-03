import { Router } from 'express';
import { impactController } from '../controllers/impact.controller.js';

const router = Router();

router.get('/', (req, res, next) => impactController.getPublicMetrics(req, res, next));

export default router;
