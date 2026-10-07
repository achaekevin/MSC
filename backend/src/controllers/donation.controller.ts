import { Request, Response, NextFunction } from 'express';
import { donationService } from '../services/donation.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class DonationController {
  async getPublicMethods(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await donationService.getPublicMethods();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminConfigs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await donationService.getAdminConfigs();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await donationService.updateConfig(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async submitInKindDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await donationService.submitInKindDonation(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const donationController = new DonationController();
