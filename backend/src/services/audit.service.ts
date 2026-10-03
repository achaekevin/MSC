import { prisma } from '../config/database.js';

export class AuditService {
  async getAuditLogs(page = 1, limit = 20, entity?: string, action?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (entity && entity !== 'all') {
      where.entity = entity;
    }

    if (action && action !== 'all') {
      where.action = action;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      })
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        oldData: log.oldData ? JSON.parse(log.oldData) : null,
        newData: log.newData ? JSON.parse(log.newData) : null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const auditService = new AuditService();
