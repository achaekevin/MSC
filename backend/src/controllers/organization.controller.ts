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

  async getValues(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.getPublicOrganization();
      const rawValues = org.values || [];
      const values = Array.isArray(rawValues)
        ? rawValues.map((v, idx) => typeof v === 'string' ? { id: String(idx + 1), name: v, description: v, displayOrder: idx + 1, status: 'PUBLISHED' } : v)
        : [];
      return sendSuccess(res, values, 200);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.getPublicOrganization();
      const historyList = org.history
        ? [{ id: '1', year: '2016', title: 'Foundation & Community Roots', description: org.history, displayOrder: 1 }]
        : [];
      return sendSuccess(res, historyList, 200);
    } catch (error) {
      next(error);
    }
  }

  async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.getPublicOrganization();
      const contacts = [
        { id: '1', type: 'EMAIL', label: 'Official Email', value: org.email, isPrimary: true, isPublic: true },
        { id: '2', type: 'PHONE', label: 'Helpline & Phone', value: org.phone || org.helpline || '+254 790 629439', isPrimary: true, isPublic: true },
        { id: '3', type: 'ADDRESS', label: 'Official Postal Address', value: org.address, isPrimary: true, isPublic: true }
      ];
      return sendSuccess(res, contacts, 200);
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
