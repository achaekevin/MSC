import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../errors/AppError.js';
import { UserRole, ROLE_PERMISSIONS } from '../types/index.js';

export class UserService {
  async getUsers(page = 1, limit = 10, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (role && role !== 'all') {
      where.role = role as UserRole;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          failedLoginAttempts: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      users: users.map(u => ({
        ...u,
        permissions: ROLE_PERMISSIONS[u.role as UserRole] || []
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createUser(data: { email: string; name: string; passwordPlain: string; role: UserRole }, currentUserId?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });

    if (existing) {
      throw new ConflictError('A user account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.passwordPlain);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name,
        passwordHash,
        role: data.role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        newData: JSON.stringify({ email: user.email, role: user.role, name: user.name })
      }
    });

    return {
      ...user,
      permissions: ROLE_PERMISSIONS[user.role as UserRole] || []
    };
  }

  async setUserActiveStatus(targetUserId: string, isActive: boolean, currentUserId?: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError('User not found');

    if (user.id === currentUserId && !isActive) {
      throw new BadRequestError('Administrators cannot deactivate their own active account.');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    // If deactivating, revoke all active sessions
    if (!isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId: targetUserId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entity: 'User',
        entityId: targetUserId,
        newData: JSON.stringify({ isActive })
      }
    });

    return updated;
  }

  async setUserRole(targetUserId: string, newRole: UserRole, currentUserId?: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError('User not found');

    if (user.id === currentUserId && newRole !== 'SUPER_ADMIN') {
      throw new ForbiddenError('Super Administrators cannot demote their own account role.');
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'CHANGE_USER_ROLE',
        entity: 'User',
        entityId: targetUserId,
        newData: JSON.stringify({ previousRole: user.role, newRole })
      }
    });

    return {
      ...updated,
      permissions: ROLE_PERMISSIONS[updated.role as UserRole] || []
    };
  }

  async adminResetPassword(targetUserId: string, newPasswordPlain: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError('User not found');

    const passwordHash = await hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockUntil: null
      }
    });

    // Revoke all sessions so the user must log in with new password
    await prisma.refreshToken.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'ADMIN_RESET_PASSWORD',
        entity: 'User',
        entityId: targetUserId
      }
    });

    return { message: `Password for ${user.email} successfully updated.` };
  }

  async revokeUserSessions(targetUserId: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError('User not found');

    await prisma.refreshToken.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'REVOKE_SESSIONS',
        entity: 'User',
        entityId: targetUserId
      }
    });

    return { message: `All active sessions revoked for ${user.email}.` };
  }
}

export const userService = new UserService();
