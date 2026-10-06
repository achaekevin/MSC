import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(email, password, ipAddress, userAgent);

      // Set refresh token in secure HTTP-only cookie
      res.cookie('msc_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.register(email, password, name, role, ipAddress, userAgent);

      // Set refresh token in secure HTTP-only cookie
      res.cookie('msc_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refreshToken || req.cookies?.msc_refresh_token;
      if (!token) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Refresh token is required' }
        });
      }

      const result = await authService.refreshToken(token);

      res.cookie('msc_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = req.body?.refreshToken || req.cookies?.msc_refresh_token;
      let userId = req.user?.id;

      // Extract user ID from bearer token if not populated by middleware
      if (!userId && req.headers.authorization?.startsWith('Bearer ')) {
        const accessToken = req.headers.authorization.split(' ')[1];
        try {
          const payload = verifyAccessToken(accessToken);
          if (payload) userId = payload.id;
        } catch {
          // Token may already be expired, continue with token cleanup
        }
      }

      await authService.logout(token, userId);

      // Clear cookie with exact matching attributes & path
      res.clearCookie('msc_refresh_token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      res.clearCookie('msc_access_token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      return sendSuccess(res, { message: 'Logged out successfully' }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
      }

      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
