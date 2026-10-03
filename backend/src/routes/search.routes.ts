import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';

const router = Router();

router.get('/', (req, res, next) => searchController.searchPublicContent(req, res, next));

export default router;
