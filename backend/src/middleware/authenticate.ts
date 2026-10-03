import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthUser, UserRole, ROLE_PERMISSIONS } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { prisma } from '../config/database.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.msc_access_token) {
      token = req.cookies.msc_access_token;
    }

    if (!token) {
      return next(new UnauthorizedError('Authentication token missing'));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return next(new UnauthorizedError('Invalid or expired authentication token'));
    }

    // Verify user exists and is active in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, lockUntil: true }
    });

    if (!dbUser) {
      return next(new UnauthorizedError('User account associated with token no longer exists'));
    }

    if (!dbUser.isActive) {
      return next(new ForbiddenError('User account has been deactivated. Contact an administrator.'));
    }

    if (dbUser.lockUntil && dbUser.lockUntil > new Date()) {
      return next(new ForbiddenError('Account is temporarily locked due to excessive failed login attempts.'));
    }

    const user: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      permissions: ROLE_PERMISSIONS[dbUser.role as UserRole] || []
    };

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
