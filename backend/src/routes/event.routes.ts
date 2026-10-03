import { Router } from 'express';
import { eventController } from '../controllers/event.controller.js';

const router = Router();

router.get('/', (req, res, next) => eventController.getPublicEvents(req, res, next));
router.get('/:slug', (req, res, next) => eventController.getPublicEventBySlug(req, res, next));

export default router;
