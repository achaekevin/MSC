import { Router } from 'express';
import { programController } from '../controllers/program.controller.js';

const router = Router();

router.get('/', (req, res, next) => programController.getPublicPrograms(req, res, next));
router.get('/categories', (req, res, next) => programController.getPublicCategories(req, res, next));
router.get('/:slug', (req, res, next) => programController.getPublicProgramBySlug(req, res, next));

export default router;
