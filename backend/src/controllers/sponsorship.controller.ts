import { Request, Response, NextFunction } from 'express';
import { sponsorshipService } from '../services/sponsorship.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class SponsorshipController {
  /**
   * Public: Submit sponsorship enquiry
   */
  async createEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sponsorshipService.createEnquiry(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Approved corporate partner logos
   */
  async getPublicSponsors(req: Request, res: Response, next: NextFunction) {
    try {
      const sponsors = await sponsorshipService.getPublicSponsors();
      return sendSuccess(res, sponsors, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all sponsorship agreements
   */
  async getAdminSponsorships(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, tier } = req.query as { status?: string; tier?: string };
      const items = await sponsorshipService.getAdminSponsorships({ status, tier });
      return sendSuccess(res, items, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update sponsorship terms and brand approval
   */
  async updateSponsorship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await sponsorshipService.updateSponsorship(id, req.body, req.user?.id);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin / Accountant: Reconcile and record an offline sponsorship payment
   */
  async recordPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await sponsorshipService.recordPayment(id, req.body, req.user?.id);
      return sendSuccess(res, payment, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const sponsorshipController = new SponsorshipController();
