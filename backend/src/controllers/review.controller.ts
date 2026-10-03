import { Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReviewController {
  async getPendingReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.getPendingReviews();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async requestChanges(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, id } = req.params;
      const { reviewNotes } = req.body;
      const data = await reviewService.requestChanges(entityType, id, reviewNotes, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveContent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, id } = req.params;
      const { reviewNotes } = req.body;
      const data = await reviewService.approveContent(entityType, id, reviewNotes, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async publishContent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, id } = req.params;
      const data = await reviewService.publishContent(entityType, id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async recordClientSignoff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.recordClientSignoff(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async getRevisions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { entityType, id } = req.params;
      const data = await reviewService.getRevisions(entityType, id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
