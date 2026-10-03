import { Router } from 'express';
import { newsController } from '../controllers/news.controller.js';

const router = Router();

router.get('/', (req, res, next) => newsController.getPublicNews(req, res, next));
router.get('/:slug', (req, res, next) => newsController.getPublicNewsBySlug(req, res, next));

export default router;
