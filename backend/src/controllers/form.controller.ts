import { Request, Response, NextFunction } from 'express';
import { formService } from '../services/form.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class FormController {
  // Public handlers
  async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await formService.submitContact(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async submitVolunteer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await formService.submitVolunteer(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async submitPartnership(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await formService.submitPartnership(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin handlers
  async getContactSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;

      const result = await formService.getAdminContactSubmissions(page, limit, status);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async updateContactStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, internalNotes } = req.body;
      const updated = await formService.updateContactStatus(id, status, internalNotes, req.user?.id);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async getVolunteerApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;

      const result = await formService.getAdminVolunteerApplications(page, limit, status);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async updateVolunteerStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      const updated = await formService.updateVolunteerStatus(id, status, reviewNotes, req.user?.id);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPartnershipApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;

      const result = await formService.getAdminPartnershipApplications(page, limit, status);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async updatePartnershipStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      const updated = await formService.updatePartnershipStatus(id, status, reviewNotes, req.user?.id);
      return sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const formController = new FormController();
