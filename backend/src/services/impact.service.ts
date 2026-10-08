import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';

export class ImpactService {
  private async ensureDefaultMetrics() {
    const count = await prisma.impactMetric.count({ where: { deletedAt: null } });
    if (count > 0) return;

    const defaults = [
      {
        name: 'Beneficiary Households',
        value: '1,203+',
        description: 'Elderly individuals and Orphaned & Vulnerable Children (OVC) households directly documented and supported through case management.',
        category: 'beneficiaries',
        icon: 'Users',
        sourceDocument: 'MSC Organizational Profile 2024',
        reportingPeriod: '2024-2026',
        displayOrder: 1,
        status: ContentStatus.PUBLISHED
      },
      {
        name: 'Ward-Based Volunteers',
        value: '40',
        description: 'Trained grassroots volunteers actively conducting home visits, needs mapping, and community monitoring.',
        category: 'volunteers',
        icon: 'HeartHandshake',
        sourceDocument: 'MSC Organizational Profile 2024',
        reportingPeriod: '2024-2026',
        displayOrder: 2,
        status: ContentStatus.PUBLISHED
      },
      {
        name: 'National Scope',
        value: 'Mandate Extends Across Kenya',
        description: 'Officially mandated to advocate for senior citizen welfare nationwide, expanding from its grassroots foundation in Nyamira County.',
        category: 'coverage',
        icon: 'Globe',
        sourceDocument: 'MSC Organizational Profile 2024',
        reportingPeriod: '2024-2026',
        displayOrder: 3,
        status: ContentStatus.PUBLISHED
      },
      {
        name: 'Community Service',
        value: 'Since 2016',
        description: 'Established in 2016 as Mwancha Home for the Elderly, progressing to Mwancha Senior Community in 2024 to advance systemic impact.',
        category: 'operations',
        icon: 'Calendar',
        sourceDocument: 'MSC Organizational Profile 2024',
        reportingPeriod: '2024-2026',
        displayOrder: 4,
        status: ContentStatus.PUBLISHED
      }
    ];

    for (const d of defaults) {
      await prisma.impactMetric.create({
        data: {
          name: d.name,
          value: d.value,
          description: d.description,
          category: d.category,
          icon: d.icon,
          source: ContentSource.OFFICIAL_PROFILE,
          sourceDocument: d.sourceDocument,
          reportingPeriod: d.reportingPeriod,
          displayOrder: d.displayOrder,
          status: d.status,
          approvalRequired: false,
          publishedAt: new Date()
        }
      });
    }
  }

  async getPublicMetrics() {
    await this.ensureDefaultMetrics();

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
      name: m.name,
      value: m.value,
      unit: m.unit,
      description: m.description,
      category: m.category,
      icon: m.icon,
      source: m.sourceDocument,
      sourceDocument: m.sourceDocument,
      reportingPeriod: m.reportingPeriod,
      status: m.status,
      displayOrder: m.displayOrder,
      metadata: {
        status: m.status.toLowerCase(),
        source: m.source.toLowerCase()
      }
    }));
  }

  async getAdminMetrics() {
    await this.ensureDefaultMetrics();

    const metrics = await prisma.impactMetric.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' }
    });
    return metrics.map(m => ({
      ...m,
      label: m.name
    }));
  }

  async getMetricById(id: string) {
    const metric = await prisma.impactMetric.findUnique({
      where: { id }
    });
    if (!metric || metric.deletedAt) throw new NotFoundError('Metric not found');
    return {
      ...metric,
      label: metric.name
    };
  }

  async createMetric(data: any, userId?: string) {
    const metric = await prisma.impactMetric.create({
      data: {
        name: data.name || data.label || 'Impact Metric',
        value: String(data.value),
        unit: data.unit ?? null,
        description: data.description ?? null,
        category: data.category || 'beneficiaries',
        icon: data.icon || 'Users',
        source: (data.source as ContentSource) || ContentSource.OFFICIAL_PROFILE,
        sourceDocument: data.sourceDocument || 'MSC Organizational Profile 2024',
        reportingPeriod: data.reportingPeriod || '2024-2026',
        displayOrder: data.displayOrder ?? 0,
        status: (data.status as ContentStatus) || ContentStatus.APPROVED,
        approvalRequired: false,
        createdById: userId,
        publishedAt: data.status === ContentStatus.PUBLISHED ? new Date() : new Date()
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

    return {
      ...metric,
      label: metric.name
    };
  }

  async updateMetric(id: string, data: any, userId?: string) {
    const existing = await prisma.impactMetric.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Metric not found');

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.label !== undefined) updatePayload.name = data.label;
    if (data.value !== undefined) updatePayload.value = String(data.value);
    if (data.unit !== undefined) updatePayload.unit = data.unit;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.source !== undefined) updatePayload.source = data.source as ContentSource;
    if (data.sourceDocument !== undefined) updatePayload.sourceDocument = data.sourceDocument;
    if (data.reportingPeriod !== undefined) updatePayload.reportingPeriod = data.reportingPeriod;
    if (data.displayOrder !== undefined) updatePayload.displayOrder = data.displayOrder;
    if (data.status !== undefined) {
      updatePayload.status = data.status as ContentStatus;
      if (data.status === ContentStatus.PUBLISHED || data.status === ContentStatus.APPROVED) {
        updatePayload.publishedAt = new Date();
      }
    }
    if (userId) updatePayload.updatedById = userId;

    const updated = await prisma.impactMetric.update({
      where: { id },
      data: updatePayload
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'ImpactMetric',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Impact statistic adjusted by admin',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'ImpactMetric',
          entityId: id,
          newData: JSON.stringify(updatePayload)
        }
      })
    ]);

    return {
      ...updated,
      label: updated.name
    };
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
