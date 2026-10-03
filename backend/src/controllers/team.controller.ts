import { Request, Response, NextFunction } from 'express';
import { teamService } from '../services/team.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class TeamController {
  async getPublicTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teamService.getPublicTeam();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAdminTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await teamService.getAdminTeam();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async createTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await teamService.createTeamMember(req.body, req.user?.id);
      return sendSuccess(res, data, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await teamService.updateTeamMember(id, req.body, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await teamService.deleteTeamMember(id, req.user?.id);
      return sendSuccess(res, { message: 'Team member deleted' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async approveTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await teamService.approveTeamMember(id, req.user?.id);
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const teamController = new TeamController();
