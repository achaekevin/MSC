import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { securityMonitoringService } from '../services/securityMonitoring.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class SecurityMonitoringController {
  async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await securityMonitoringService.getOverview();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getFailedLogins(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const data = securityMonitoringService.getFailedLogins(limit);
      return sendSuccess(res, { failedLogins: data }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getApiErrors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const data = securityMonitoringService.getApiErrors(limit);
      return sendSuccess(res, { apiErrors: data }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const includeAcknowledged = req.query.includeAcknowledged === 'true';
      const alerts = securityMonitoringService.getAlerts(includeAcknowledged);
      return sendSuccess(res, { alerts }, 200);
    } catch (error) {
      next(error);
    }
  }

  async acknowledgeAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const alertId = req.params.id;
      const acknowledgedBy = req.user?.email || 'admin';
      const success = securityMonitoringService.acknowledgeAlert(alertId, acknowledgedBy);
      return sendSuccess(res, { success, alertId }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getDependencyStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = securityMonitoringService.getDependencyStatus();
      return sendSuccess(res, status, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const securityMonitoringController = new SecurityMonitoringController();
