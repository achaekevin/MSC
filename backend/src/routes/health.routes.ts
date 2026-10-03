import { Router } from 'express';
import { healthCheck, readinessCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', (req, res) => healthCheck(req, res));
router.get('/ready', (req, res) => readinessCheck(req, res));

export default router;
