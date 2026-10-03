import { Request, Response, NextFunction } from 'express';
import { testimonialService } from '../services/testimonial.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class TestimonialController {
  async getPublicTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await testimonialService.getPublicTestimonials();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminTestimonials(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;

      const result = await testimonialService.getAdminTestimonials(page, limit, status);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async createTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await testimonialService.createTestimonial(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await testimonialService.updateTestimonial(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await testimonialService.deleteTestimonial(id, req.user?.id);
      return sendSuccess(res, { message: 'Testimonial deleted' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await testimonialService.approveTestimonial(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async publishTestimonial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await testimonialService.publishTestimonial(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const testimonialController = new TestimonialController();
