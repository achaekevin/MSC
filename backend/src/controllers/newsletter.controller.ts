import { Request, Response, NextFunction } from 'express';
import { newsletterService } from '../services/newsletter.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class NewsletterController {
  async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, consent, name } = req.body;
      const result = await newsletterService.subscribe(email, consent, name);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const email = (req.body?.email || req.query?.email) as string;
      const result = await newsletterService.unsubscribe(email);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getSubscribers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const data = await newsletterService.getSubscribers(page, limit, search);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubscriber(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await newsletterService.deleteSubscriber(id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await newsletterService.exportSubscribersCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="msc-newsletter-subscribers.csv"');
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const newsletterController = new NewsletterController();
