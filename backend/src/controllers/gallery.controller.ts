import { Request, Response, NextFunction } from 'express';
import { galleryService } from '../services/gallery.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class GalleryController {
  async getPublicGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
      const category = req.query.category as string;

      const result = await galleryService.getPublicGallery(category, page, limit);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getPublicAlbums(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await galleryService.getPublicAlbums();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as string;

      const result = await galleryService.getAdminMedia(page, limit, status);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async uploadMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const data = await galleryService.uploadMedia(file!, req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await galleryService.deleteMedia(id, req.user?.id);
      return sendSuccess(res, { message: 'Media record deleted' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await galleryService.approveMedia(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async publishMedia(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await galleryService.publishMedia(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const galleryController = new GalleryController();
