import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sign2FATempToken,
  verify2FATempToken
} from '../utils/jwt.js';
import {
  generateTotpSecret,
  verifyTotpCode,
  getTotpAuthUri,
  generateBackupCodes,
  hashToken
} from '../utils/totp.js';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError
} from '../errors/AppError.js';
import { UserRole, ROLE_PERMISSIONS, AuthUser } from '../types/index.js';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export class AuthService {
  /**
   * Helper to fetch 2FA information using direct query
   */
  async getUser2FA(userId: string) {
    const rows: any = await prisma.$queryRawUnsafe(
      'SELECT id, email, twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes FROM users WHERE id = ? LIMIT 1',
      userId
    );
    if (!rows || rows.length === 0) return null;
    let backupCodes: { hash: string; used: boolean }[] = [];
    if (rows[0].twoFactorBackupCodes) {
      try {
        backupCodes = JSON.parse(rows[0].twoFactorBackupCodes);
      } catch {
        backupCodes = [];
      }
    }
    return {
      id: rows[0].id,
      email: rows[0].email,
      twoFactorEnabled: Boolean(rows[0].twoFactorEnabled),
      twoFactorSecret: rows[0].twoFactorSecret as string | null,
      twoFactorBackupCodes: backupCodes
    };
  }

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

    // Protection against repeated failed logins: Check lockout window
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      throw new ForbiddenError(`Account is temporarily locked. Try again in ${minutesRemaining} minutes.`);
    }

    const isMatch = await comparePassword(passwordPlain, user.passwordHash);

    if (!isMatch) {
      // Increment failed attempts and lock for 15 minutes after 5 consecutive failures
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

      // Audit log failed attempt
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
      }).catch(() => {});

      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user has optional Two-Factor Authentication (2FA) enabled
    const twoFactor = await this.getUser2FA(user.id);
    if (twoFactor && twoFactor.twoFactorEnabled && twoFactor.twoFactorSecret) {
      const tempToken = sign2FATempToken({ id: user.id, email: user.email });
      return {
        requires2FA: true,
        tempToken,
        email: user.email
      };
    }

    return this.completeLoginSuccess(user, ipAddress, userAgent);
  }

  /**
   * Completes login success, issues tokens and hashes refresh token in database
   */
  private async completeLoginSuccess(user: any, ipAddress?: string, userAgent?: string) {
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      permissions: ROLE_PERMISSIONS[user.role as UserRole] || []
    };

    // Short-lived access token (15 minutes) and 7-day refresh token
    const accessToken = signAccessToken(user as { id: string; email: string; role: UserRole; name: string });
    const refreshToken = signRefreshToken(user as { id: string; email: string; role: UserRole; name: string });

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store only cryptographic hash of refresh token (never plain text)
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockUntil: null,
          lastLoginAt: new Date()
        }
      }),
      prisma.refreshToken.create({
        data: {
          token: tokenHash,
          tokenHash,
          userId: user.id,
          expiresAt
        }
      })
    ]);

    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent
      }
    }).catch(err => {
      console.warn('Asynchronous login audit log creation failed:', err);
    });

    return {
      user: authUser,
      accessToken,
      refreshToken
    };
  }

  /**
   * Verifies 2FA code during login
   */
  async verifyTwoFactorLogin(tempToken: string, code: string, ipAddress?: string, userAgent?: string) {
    const payload = verify2FATempToken(tempToken);
    if (!payload) {
      throw new UnauthorizedError('Two-factor authentication session expired. Please log in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) {
      throw new ForbiddenError('Account is not accessible or has been deactivated.');
    }

    const twoFactor = await this.getUser2FA(user.id);
    if (!twoFactor || !twoFactor.twoFactorEnabled || !twoFactor.twoFactorSecret) {
      throw new BadRequestError('Two-factor authentication is not configured for this account.');
    }

    const cleanCode = code.trim();
    let isValid = verifyTotpCode(cleanCode, twoFactor.twoFactorSecret);

    // If TOTP code is not valid, check emergency backup codes
    if (!isValid && twoFactor.twoFactorBackupCodes.length > 0) {
      const codeHash = hashToken(cleanCode.toUpperCase().replace(/[\s-]/g, ''));
      const backupIndex = twoFactor.twoFactorBackupCodes.findIndex(
        (b) => !b.used && b.hash === codeHash
      );

      if (backupIndex >= 0) {
        isValid = true;
        twoFactor.twoFactorBackupCodes[backupIndex].used = true;
        await prisma.$executeRawUnsafe(
          'UPDATE users SET twoFactorBackupCodes = ? WHERE id = ?',
          JSON.stringify(twoFactor.twoFactorBackupCodes),
          user.id
        );

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: '2FA_BACKUP_CODE_USED',
            entity: 'User',
            entityId: user.id,
            ipAddress,
            userAgent
          }
        }).catch(() => {});
      }
    }

    if (!isValid) {
      throw new UnauthorizedError('Invalid two-factor authentication code or backup code.');
    }

    return this.completeLoginSuccess(user, ipAddress, userAgent);
  }

  /**
   * Generates a new 2FA setup secret and QR code URI
   */
  async generateTwoFactorSecret(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const secret = generateTotpSecret(20);
    const otpAuthUri = getTotpAuthUri(user.email, secret);

    return {
      secret,
      otpAuthUri
    };
  }

  /**
   * Verifies code and enables 2FA for the administrator
   */
  async enableTwoFactor(userId: string, secret: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const isValid = verifyTotpCode(code, secret);
    if (!isValid) {
      throw new BadRequestError('Invalid verification code. Please make sure your authenticator app time is accurate.');
    }

    const { plainCodes, hashedCodes } = generateBackupCodes(8);

    await prisma.$executeRawUnsafe(
      'UPDATE users SET twoFactorEnabled = 1, twoFactorSecret = ?, twoFactorBackupCodes = ? WHERE id = ?',
      secret,
      JSON.stringify(hashedCodes),
      userId
    );

    await prisma.auditLog.create({
      data: {
        userId,
        action: '2FA_ENABLED',
        entity: 'User',
        entityId: userId
      }
    }).catch(() => {});

    return {
      enabled: true,
      backupCodes: plainCodes,
      message: 'Two-factor authentication has been enabled successfully. Save your backup codes in a secure location.'
    };
  }

  /**
   * Disables 2FA for the administrator after password verification
   */
  async disableTwoFactor(userId: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const isMatch = await comparePassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect. Verification failed.');
    }

    await prisma.$executeRawUnsafe(
      'UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = NULL, twoFactorBackupCodes = NULL WHERE id = ?',
      userId
    );

    await prisma.auditLog.create({
      data: {
        userId,
        action: '2FA_DISABLED',
        entity: 'User',
        entityId: userId
      }
    }).catch(() => {});

    return {
      enabled: false,
      message: 'Two-factor authentication has been disabled.'
    };
  }

  async getTwoFactorStatus(userId: string) {
    const twoFactor = await this.getUser2FA(userId);
    return {
      enabled: twoFactor?.twoFactorEnabled ?? false
    };
  }

  async register(
    email: string,
    passwordPlain: string,
    name: string,
    role?: UserRole,
    adminInviteCode?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const expectedKey = env.ADMIN_INVITE_CODE || 'MSC-ADMIN-2024-SECURE';
    if (!adminInviteCode || adminInviteCode.trim() !== expectedKey) {
      throw new ForbiddenError(
        'Unauthorized: A valid administrative authorization key issued by MSC leadership is required to create an admin account.'
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new ConflictError('A user account with this email address already exists');
    }

    const passwordHash = await hashPassword(passwordPlain);

    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 
      ? 'SUPER_ADMIN' 
      : (role === 'SUPER_ADMIN' ? 'CONTENT_ADMIN' : (role || 'CONTENT_ADMIN'));

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        role: assignedRole as any,
        isActive: true,
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

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
        newData: JSON.stringify({ email: user.email, role: user.role })
      }
    }).catch(() => {});

    // Generate 6-digit email verification code and signed token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email, purpose: 'email_verification' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '24h' }
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMAIL_VERIFICATION_SENT',
        entity: 'User',
        entityId: user.id,
        newData: JSON.stringify({ code: verificationCode, token: verificationToken, sentAt: new Date() })
      }
    }).catch(() => {});

    const verifyUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/admin/verify-email?token=${verificationToken}`;
    mailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address - Mwancha Senior Community',
      html: emailTemplates.emailVerification(user.name, verifyUrl, verificationCode)
    }).catch(err => {
      console.warn('Asynchronous verification email delivery failed:', err);
    });

    return {
      user: authUser,
      accessToken,
      refreshToken
    };
  }

  /**
   * Secure refresh token mechanism with token rotation and hashed lookup
   */
  async refreshToken(oldRefreshToken: string) {
    const payload = verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(oldRefreshToken);

    // Look up hashed token in DB (and legacy raw token if any)
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        OR: [{ tokenHash }, { token: tokenHash }, { token: oldRefreshToken }]
      },
      include: { user: true }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has been revoked or expired');
    }

    if (!storedToken.user.isActive) {
      throw new ForbiddenError('User account has been deactivated');
    }

    // Token rotation: Issue new access token and new refresh token
    const newAccessToken = signAccessToken(storedToken.user as { id: string; email: string; role: UserRole; name: string });
    const newRefreshToken = signRefreshToken(storedToken.user as { id: string; email: string; role: UserRole; name: string });
    const newTokenHash = hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Revoke old token and store new hashed token in transaction
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      }),
      prisma.refreshToken.create({
        data: {
          token: newTokenHash,
          tokenHash: newTokenHash,
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

  /**
   * Revokes user refresh token or all user sessions on logout
   */
  async logout(token?: string, userId?: string) {
    if (token) {
      const tokenHash = hashToken(token);
      await prisma.refreshToken.updateMany({
        where: {
          OR: [{ tokenHash }, { token: tokenHash }, { token }],
          revokedAt: null
        },
        data: { revokedAt: new Date() }
      }).catch(err => console.warn('Failed to revoke refresh token:', err));
    }

    if (userId) {
      // Invalidate all active sessions for this user
      await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() }
      }).catch(err => console.warn('Failed to revoke user tokens:', err));

      prisma.auditLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          entity: 'User',
          entityId: userId
        }
      }).catch(() => {});
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

  /**
   * Password reset request: Generates high-entropy token, stores hash in DB with 30-min expiration
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Generic success response prevents email enumeration
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been dispatched.' };
    }

    // Invalidate any previous unconsumed password reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    }).catch(() => {});

    // High-entropy 64-character hex token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const resetUrl = `${env.FRONTEND_URL}/admin/reset-password?token=${rawToken}`;

    await mailService.sendEmail({
      to: user.email,
      subject: 'Mwancha Senior Community: Password Reset Request',
      html: emailTemplates.passwordReset(user.name, resetUrl)
    });

    return { message: 'If an account exists with this email, a reset link has been dispatched.' };
  }

  /**
   * Resets password using single-use hashed token with full session revocation
   */
  async resetPassword(token: string, newPasswordPlain: string) {
    const tokenHash = hashToken(token);

    // Look up token in password_reset_tokens table
    const storedReset = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    let targetUserId: string | null = null;

    if (storedReset) {
      targetUserId = storedReset.userId;
      // Mark token as consumed immediately
      await prisma.passwordResetToken.update({
        where: { id: storedReset.id },
        data: { usedAt: new Date() }
      });
    } else {
      // Fallback check for JWT token if legacy link
      const payload = verifyAccessToken(token);
      if (payload) {
        targetUserId = payload.id;
      }
    }

    if (!targetUserId) {
      throw new BadRequestError('Password reset link is invalid or has expired.');
    }

    const newHash = await hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash: newHash,
        failedLoginAttempts: 0,
        lockUntil: null,
        passwordChangedAt: new Date()
      }
    });

    // Revoke all existing sessions for this user upon password reset
    await prisma.refreshToken.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId: targetUserId,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: targetUserId
      }
    });

    return { message: 'Password has been successfully reset. You may now log in with your new credentials.' };
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
      data: {
        passwordHash: newHash,
        passwordChangedAt: new Date()
      }
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

  async verifyEmail(tokenOrCode: string) {
    if (!tokenOrCode || tokenOrCode.trim().length === 0) {
      throw new BadRequestError('Verification token or 6-digit code is required');
    }

    const trimmed = tokenOrCode.trim();

    try {
      const payload = jwt.verify(trimmed, env.JWT_ACCESS_SECRET) as { userId: string; email: string; purpose: string };
      if (payload && payload.purpose === 'email_verification') {
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) throw new NotFoundError('User not found');

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EMAIL_VERIFIED',
            entity: 'User',
            entityId: user.id,
            newData: JSON.stringify({ email: user.email, verifiedAt: new Date() })
          }
        });

        return { message: 'Email address verified successfully. Your administrative account is confirmed.' };
      }
    } catch {
      // Continue to check 6-digit code
    }

    const recentAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'EMAIL_VERIFICATION_SENT',
        newData: { contains: trimmed }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!recentAudit || !recentAudit.userId) {
      throw new BadRequestError('Invalid or expired verification code. Please request a new verification code.');
    }

    const ageMs = Date.now() - new Date(recentAudit.createdAt).getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      throw new BadRequestError('Verification code has expired. Please request a new one.');
    }

    await prisma.auditLog.create({
      data: {
        userId: recentAudit.userId,
        action: 'EMAIL_VERIFIED',
        entity: 'User',
        entityId: recentAudit.userId,
        newData: JSON.stringify({ code: trimmed, verifiedAt: new Date() })
      }
    });

    return { message: 'Email address verified successfully. Your administrative account is confirmed.' };
  }

  async resendVerification(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return { message: 'If an account exists with this email, a verification link has been sent.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = jwt.sign(
      { userId: user.id, email: user.email, purpose: 'email_verification' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '24h' }
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMAIL_VERIFICATION_SENT',
        entity: 'User',
        entityId: user.id,
        newData: JSON.stringify({ code, token, resentAt: new Date() })
      }
    });

    const verifyUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/admin/verify-email?token=${token}`;
    mailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address - Mwancha Senior Community',
      html: emailTemplates.emailVerification(user.name, verifyUrl, code)
    }).catch(err => {
      console.warn('Failed to resend verification email:', err);
    });

    return { message: 'Verification email sent. Please check your inbox and spam folder.' };
  }
}

export const authService = new AuthService();
