import { Router } from 'express';
import { galleryController } from '../controllers/gallery.controller.js';

const router = Router();

router.get('/', (req, res, next) => galleryController.getPublicGallery(req, res, next));
router.get('/albums', (req, res, next) => galleryController.getPublicAlbums(req, res, next));

export default router;
