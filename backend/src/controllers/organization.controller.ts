import { Request, Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class OrganizationController {
  async getPublicOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizationService.getPublicOrganization();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await organizationService.getAdminOrganization();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await organizationService.updateOrganization(req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getStructureNodes(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizationService.getStructureNodes();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
