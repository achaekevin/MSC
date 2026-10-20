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

  /**
   * Public / Customer: Authorized PDF streaming download
   */
  async downloadPublication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { token, email } = req.query as { token?: string; email?: string };

      const fileResult = await publicationService.getDownloadStream(id, token, email);

      if (fileResult.type === 'redirect') {
        return res.redirect(fileResult.redirectUrl);
      }

      res.setHeader('Content-Type', fileResult.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileResult.fileName}"`
      );

      fileResult.stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Upload official private PDF document
   */
  async uploadPrivatePdf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'No PDF file uploaded.' }
        });
      }

      const updated = await publicationService.savePrivatePdf(id, req.file.buffer, req.file.originalname);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer: View purchased publications library
   */
  async getCustomerLibrary(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query as { email?: string };
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Customer email is required.' }
        });
      }

      const library = await publicationService.getCustomerLibrary(email);
      return sendSuccess(res, library, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const publicationController = new PublicationController();

