import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError.js';
import { UserRole, ROLE_PERMISSIONS, AuthUser } from '../types/index.js';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export class AuthService {
  async login(email: string, passwordPlain: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated. Please contact the administrator.');
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      throw new ForbiddenError(`Account is temporarily locked. Try again in ${minutesRemaining} minutes.`);
    }

    const isMatch = await comparePassword(passwordPlain, user.passwordHash);

    if (!isMatch) {
      // Increment failed attempts and lock if >= 5
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= 5;
      const lockUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockUntil: lockUntil ?? undefined
        }
      });

      // Audit log failed login
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          entity: 'User',
          entityId: user.id,
          ipAddress,
          userAgent,
          newData: JSON.stringify({ reason: 'Incorrect password', failedAttempts: newAttempts })
        }
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed attempts & update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null,
        lastLoginAt: new Date()
      }
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      permissions: ROLE_PERMISSIONS[user.role as UserRole] || []
    };

    const accessToken = signAccessToken(user as { id: string; email: string; role: UserRole; name: string });
    const refreshToken = signRefreshToken(user as { id: string; email: string; role: UserRole; name: string });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Audit log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent
      }
    });

    return {
      user: authUser,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(oldRefreshToken: string) {
    const payload = verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Check token in DB and ensure not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has been revoked or expired');
    }

    if (!storedToken.user.isActive) {
      throw new ForbiddenError('User account has been deactivated');
    }

    // Issue new tokens (Token rotation for high security)
    const newAccessToken = signAccessToken(storedToken.user as { id: string; email: string; role: UserRole; name: string });
    const newRefreshToken = signRefreshToken(storedToken.user as { id: string; email: string; role: UserRole; name: string });

    // Revoke old token & store new token in transaction
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt
        }
      })
    ]);

    const authUser: AuthUser = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      role: storedToken.user.role as UserRole,
      permissions: ROLE_PERMISSIONS[storedToken.user.role as UserRole] || []
    };

    return {
      user: authUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(token: string, userId?: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          entity: 'User',
          entityId: userId
        }
      });
    }

    return true;
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      permissions: ROLE_PERMISSIONS[user.role as UserRole] || []
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Even if user not found, return generic success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been dispatched.' };
    }

    const resetToken = signAccessToken(user as { id: string; email: string; role: UserRole; name: string });
    const resetUrl = `${env.FRONTEND_URL}/admin/reset-password?token=${resetToken}`;

    await mailService.sendEmail({
      to: user.email,
      subject: 'Mwancha Senior Community — Password Reset Request',
      html: emailTemplates.passwordReset(user.name, resetUrl)
    });

    return { message: 'If an account exists with this email, a reset link has been dispatched.' };
  }

  async resetPassword(token: string, newPasswordPlain: string) {
    const payload = verifyAccessToken(token);
    if (!payload) {
      throw new BadRequestError('Password reset link is invalid or has expired');
    }

    const newHash = await hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: payload.id },
      data: {
        passwordHash: newHash,
        failedLoginAttempts: 0,
        lockUntil: null
      }
    });

    // Revoke all existing refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: payload.id },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: payload.id
      }
    });

    return { message: 'Password has been successfully reset. You may now log in.' };
  }

  async changePassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await comparePassword(currentPasswordPlain, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password provided is incorrect');
    }

    const newHash = await hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: userId
      }
    });

    return { message: 'Password updated successfully' };
  }
}

export const authService = new AuthService();
