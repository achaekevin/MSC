import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class UserController {
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const role = req.query.role as string;

      const result = await userService.getUsers(page, limit, role);
      return sendSuccess(res, result.users, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, name, password, role } = req.body;
      const user = await userService.createUser(
        { email, name, passwordPlain: password, role },
        req.user?.id
      );
      return sendSuccess(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async setUserActiveStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = await userService.setUserActiveStatus(id, isActive, req.user?.id);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async setUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await userService.setUserRole(id, role, req.user?.id);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async adminResetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const result = await userService.adminResetPassword(id, newPassword, req.user?.id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async revokeUserSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await userService.revokeUserSessions(id, req.user?.id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
