import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class EventController {
  async getPublicEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await eventService.getPublicEvents(page, limit, category, search);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await eventService.getCategories();
      return sendSuccess(res, categories, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPublicEventBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const data = await eventService.getPublicEventBySlug(slug);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const status = req.query.status as string;
      const category = req.query.category as string;
      const search = req.query.search as string;

      const result = await eventService.getAdminEvents(page, limit, status, category, search);
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAdminEventById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await eventService.getAdminEventById(id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await eventService.createEvent(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await eventService.updateEvent(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await eventService.deleteEvent(id, req.user?.id);
      return sendSuccess(res, { message: 'Event deleted successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async submitReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const data = await eventService.submitReview(id, reviewNotes, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reviewNotes } = req.body;
      const data = await eventService.approveEvent(id, reviewNotes, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async publishEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await eventService.publishEvent(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async duplicateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await eventService.duplicateEvent(id, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const eventController = new EventController();

