import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class SearchController {
  async searchPublicContent(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const results = await searchService.searchPublicContent(q, limit);
      return sendSuccess(res, results, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
