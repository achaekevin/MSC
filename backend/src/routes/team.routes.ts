import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';

const router = Router();

router.get('/', (req, res, next) => teamController.getPublicTeam(req, res, next));

export default router;
