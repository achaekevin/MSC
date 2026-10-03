import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class DashboardController {
  async getDashboardSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getDashboardSummary();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
