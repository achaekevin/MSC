import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class NotificationController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await notificationService.getNotificationCenterSummary(req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead();
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
