import { Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuditController {
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const entity = req.query.entity as string;
      const action = req.query.action as string;

      const result = await auditService.getAuditLogs(page, limit, entity, action);
      return sendSuccess(res, result.logs, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
