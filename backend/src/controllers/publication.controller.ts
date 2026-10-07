import { Request, Response, NextFunction } from 'express';
import { publicationService } from '../services/publication.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class PublicationController {
  // Public endpoints
  async getPublicPublications(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const data = await publicationService.getPublicPublications({
        category: typeof category === 'string' ? category : undefined,
        search: typeof search === 'string' ? search : undefined
      });
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPublicPublicationBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const data = await publicationService.getPublicPublicationBySlug(slug);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async getAdminPublications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await publicationService.getAdminPublications();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPublicationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await publicationService.getPublicationById(id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async createPublication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await publicationService.createPublication(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async updatePublication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await publicationService.updatePublication(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async publishPublication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await publicationService.publishPublication(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async approvePublication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await publicationService.approvePublication(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async deletePublication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await publicationService.deletePublication(id, req.user?.id);
      return sendSuccess(res, { message: 'Publication deleted successfully.' }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const publicationController = new PublicationController();
