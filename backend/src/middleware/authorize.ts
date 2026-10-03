import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole, Permission } from '../types/index.js';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized for this resource.`
        )
      );
    }

    next();
  };
};

export const requirePermissions = (...requiredPermissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const hasPermission = requiredPermissions.every(perm =>
      req.user?.permissions.includes(perm)
    );

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          `Access denied. Missing required permission(s): ${requiredPermissions.join(', ')}`
        )
      );
    }

    next();
  };
};
