import { Request, Response, NextFunction } from 'express';
import { programService } from '../services/program.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ProgramController {
  async getPublicPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await programService.getPublicPrograms();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPublicProgramBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const data = await programService.getPublicProgramBySlug(slug);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminPrograms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await programService.getAdminPrograms(page, limit, status, search);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async createProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await programService.createProgram(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await programService.updateProgram(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await programService.deleteProgram(id, req.user?.id);
      return sendSuccess(res, { message: 'Program deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const data = await programService.submitReview(id, reviewNotes, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const data = await programService.approveProgram(id, reviewNotes, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async publishProgram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await programService.publishProgram(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const programController = new ProgramController();
