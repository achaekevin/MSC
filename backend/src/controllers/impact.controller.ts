import { Request, Response, NextFunction } from 'express';
import { impactService } from '../services/impact.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ImpactController {
  async getPublicMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await impactService.getPublicMetrics();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await impactService.getAdminMetrics();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async createMetric(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await impactService.createMetric(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMetric(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await impactService.updateMetric(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveMetric(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await impactService.approveMetric(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const impactController = new ImpactController();
