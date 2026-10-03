import { Router } from 'express';
import { storyController } from '../controllers/story.controller.js';

const router = Router();

router.get('/', (req, res, next) => storyController.getPublicStories(req, res, next));
router.get('/:slug', (req, res, next) => storyController.getPublicStoryBySlug(req, res, next));

export default router;
