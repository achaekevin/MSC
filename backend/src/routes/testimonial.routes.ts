import { Router } from 'express';
import { testimonialController } from '../controllers/testimonial.controller.js';

const router = Router();

router.get('/', (req, res, next) => testimonialController.getPublicTestimonials(req, res, next));

export default router;
