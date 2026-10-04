import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';

export class ImpactService {
  async getPublicMetrics() {
    const metrics = await prisma.impactMetric.findMany({
      where: {
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
        deletedAt: null
      },
      orderBy: { displayOrder: 'asc' }
    });

    return metrics.map(m => ({
      id: m.id,
      label: m.name,
      value: m.value,
      unit: m.unit,
      description: m.description,
      category: m.category,
      icon: m.icon,
      source: m.sourceDocument
    }));
  }

  async getAdminMetrics() {
    return prisma.impactMetric.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async createMetric(data: any, userId?: string) {
    const metric = await prisma.impactMetric.create({
      data: {
        name: data.name,
        value: data.value,
        unit: data.unit,
        description: data.description,
        category: data.category || 'beneficiaries',
        icon: data.icon || 'Users',
        source: (data.source as ContentSource) || ContentSource.OFFICIAL_PROFILE,
        sourceDocument: data.sourceDocument || 'MSC Organizational Profile 2024',
        reportingPeriod: data.reportingPeriod || '2024-2026',
        displayOrder: data.displayOrder ?? 0,
        status: ContentStatus.DRAFT,
        approvalRequired: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'ImpactMetric',
        entityId: metric.id,
        newData: JSON.stringify(metric)
      }
    });

    return metric;
  }

  async updateMetric(id: string, data: any, userId?: string) {
    const existing = await prisma.impactMetric.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Metric not found');

    const updated = await prisma.impactMetric.update({
      where: { id },
      data
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'ImpactMetric',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Impact statistic adjusted',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'ImpactMetric',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return updated;
  }

  async approveMetric(id: string, reviewerId?: string) {
    const metric = await prisma.impactMetric.findUnique({ where: { id } });
    if (!metric) throw new NotFoundError('Metric not found');

    return prisma.impactMetric.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        publishedAt: new Date()
      }
    });
  }

  async submitReview(id: string, userId?: string) {
    const metric = await prisma.impactMetric.findUnique({ where: { id } });
    if (!metric || metric.deletedAt) throw new NotFoundError('Metric not found');

    return prisma.impactMetric.update({
      where: { id },
      data: {
        status: ContentStatus.IN_REVIEW
      }
    });
  }

  async publishMetric(id: string, userId?: string) {
    const metric = await prisma.impactMetric.findUnique({ where: { id } });
    if (!metric || metric.deletedAt) throw new NotFoundError('Metric not found');

    return prisma.impactMetric.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });
  }

  async deleteMetric(id: string, userId?: string) {
    const metric = await prisma.impactMetric.findUnique({ where: { id } });
    if (!metric) throw new NotFoundError('Metric not found');

    await prisma.impactMetric.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'ImpactMetric',
        entityId: id
      }
    });

    return true;
  }
}

export const impactService = new ImpactService();
