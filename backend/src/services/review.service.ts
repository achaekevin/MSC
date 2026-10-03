import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus } from '@prisma/client';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export class ReviewService {
  async getPendingReviews() {
    const [programs, news, events, team, metrics, media] = await Promise.all([
      prisma.program.findMany({
        where: { status: { in: [ContentStatus.IN_REVIEW, ContentStatus.CHANGES_REQUESTED] }, deletedAt: null },
        select: { id: true, title: true, status: true, source: true, updatedAt: true, slug: true }
      }),
      prisma.newsArticle.findMany({
        where: { status: { in: [ContentStatus.IN_REVIEW, ContentStatus.CHANGES_REQUESTED] }, deletedAt: null },
        select: { id: true, title: true, status: true, source: true, updatedAt: true, slug: true }
      }),
      prisma.event.findMany({
        where: { status: { in: [ContentStatus.IN_REVIEW, ContentStatus.CHANGES_REQUESTED] }, deletedAt: null },
        select: { id: true, title: true, status: true, source: true, updatedAt: true, slug: true }
      }),
      prisma.teamMember.findMany({
        where: { status: { in: [ContentStatus.IN_REVIEW, ContentStatus.CHANGES_REQUESTED] }, deletedAt: null },
        select: { id: true, name: true, status: true, source: true, updatedAt: true, position: true }
      }),
      prisma.impactMetric.findMany({
        where: { status: { in: [ContentStatus.IN_REVIEW, ContentStatus.CHANGES_REQUESTED] }, deletedAt: null },
        select: { id: true, name: true, value: true, status: true, source: true, updatedAt: true }
      }),
      prisma.media.findMany({
        where: { status: { in: [ContentStatus.IN_REVIEW, ContentStatus.CHANGES_REQUESTED] }, deletedAt: null },
        select: { id: true, title: true, status: true, source: true, updatedAt: true, secureUrl: true }
      })
    ]);

    const pending = [
      ...programs.map(p => ({ id: p.id, title: p.title, entityType: 'Program', status: p.status, source: p.source, updatedAt: p.updatedAt, path: `/programs/${p.slug}` })),
      ...news.map(n => ({ id: n.id, title: n.title, entityType: 'NewsArticle', status: n.status, source: n.source, updatedAt: n.updatedAt, path: `/news/${n.slug}` })),
      ...events.map(e => ({ id: e.id, title: e.title, entityType: 'Event', status: e.status, source: e.source, updatedAt: e.updatedAt, path: `/events/${e.slug}` })),
      ...team.map(t => ({ id: t.id, title: `${t.name} (${t.position})`, entityType: 'TeamMember', status: t.status, source: t.source, updatedAt: t.updatedAt, path: '/team' })),
      ...metrics.map(m => ({ id: m.id, title: `${m.name}: ${m.value}`, entityType: 'ImpactMetric', status: m.status, source: m.source, updatedAt: m.updatedAt, path: '/impact' })),
      ...media.map(m => ({ id: m.id, title: m.title, entityType: 'Media', status: m.status, source: m.source, updatedAt: m.updatedAt, path: '/gallery' }))
    ];

    return pending;
  }

  async requestChanges(entityType: string, entityId: string, notes: string, reviewerId?: string) {
    // 1. Update entity status
    await this.updateEntityStatus(entityType, entityId, ContentStatus.CHANGES_REQUESTED);

    // 2. Create review record
    const review = await prisma.contentReview.create({
      data: {
        entityType,
        entityId,
        currentStatus: ContentStatus.CHANGES_REQUESTED,
        previousStatus: ContentStatus.IN_REVIEW,
        requestedAction: 'REQUEST_CHANGES',
        reviewerId,
        reviewNotes: notes,
        decidedAt: new Date()
      }
    });

    // 3. Audit log
    await prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'REQUEST_CHANGES',
        entity: entityType,
        entityId,
        newData: JSON.stringify({ status: ContentStatus.CHANGES_REQUESTED, notes })
      }
    });

    // 4. Send email alert
    await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[MSC CONTENT AMENDMENT REQUIRED]: ${entityType}`,
      html: emailTemplates.contentStatusChanged(entityType, entityId, 'CHANGES_REQUESTED', notes)
    });

    return review;
  }

  async approveContent(entityType: string, entityId: string, notes?: string, reviewerId?: string) {
    await this.updateEntityStatus(entityType, entityId, ContentStatus.APPROVED);

    const review = await prisma.contentReview.create({
      data: {
        entityType,
        entityId,
        currentStatus: ContentStatus.APPROVED,
        previousStatus: ContentStatus.IN_REVIEW,
        requestedAction: 'APPROVE',
        reviewerId,
        reviewNotes: notes,
        decidedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'APPROVE',
        entity: entityType,
        entityId,
        newData: JSON.stringify({ status: ContentStatus.APPROVED, notes })
      }
    });

    return review;
  }

  async publishContent(entityType: string, entityId: string, publisherId?: string) {
    const currentStatus = await this.getEntityStatus(entityType, entityId);
    if (currentStatus !== ContentStatus.APPROVED) {
      throw new BadRequestError('Only content with APPROVED status can be published.');
    }

    await this.updateEntityStatus(entityType, entityId, ContentStatus.PUBLISHED, new Date());

    const review = await prisma.contentReview.create({
      data: {
        entityType,
        entityId,
        currentStatus: ContentStatus.PUBLISHED,
        previousStatus: ContentStatus.APPROVED,
        requestedAction: 'PUBLISH',
        reviewerId: publisherId,
        decidedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: publisherId,
        action: 'PUBLISH',
        entity: entityType,
        entityId,
        newData: JSON.stringify({ status: ContentStatus.PUBLISHED })
      }
    });

    return review;
  }

  async recordClientSignoff(data: any, developerId?: string) {
    const signoff = await prisma.clientApproval.create({
      data: {
        scope: data.scope || 'FULL_WEBSITE',
        approvedBy: `${data.clientRepresentativeName} (${data.clientRepresentativeRole})`,
        notes: data.notes,
        version: data.version || '1.0.0',
        status: 'APPROVED'
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: developerId,
        action: 'CLIENT_SIGNOFF_RECORDED',
        entity: 'ClientApproval',
        entityId: signoff.id,
        newData: JSON.stringify(signoff)
      }
    });

    return signoff;
  }

  async getRevisions(entityType: string, entityId: string) {
    return prisma.contentRevision.findMany({
      where: { entityType, entityId },
      include: {
        changedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async updateEntityStatus(entityType: string, id: string, status: ContentStatus, publishedAt?: Date) {
    const data: any = { status };
    if (publishedAt) data.publishedAt = publishedAt;

    switch (entityType) {
      case 'Program':
        return prisma.program.update({ where: { id }, data });
      case 'NewsArticle':
        return prisma.newsArticle.update({ where: { id }, data });
      case 'Event':
        return prisma.event.update({ where: { id }, data });
      case 'TeamMember':
        return prisma.teamMember.update({ where: { id }, data });
      case 'ImpactMetric':
        return prisma.impactMetric.update({ where: { id }, data });
      case 'Media':
        return prisma.media.update({ where: { id }, data });
      default:
        throw new BadRequestError(`Invalid entityType: ${entityType}`);
    }
  }

  private async getEntityStatus(entityType: string, id: string): Promise<ContentStatus> {
    let record: any = null;
    switch (entityType) {
      case 'Program':
        record = await prisma.program.findUnique({ where: { id } });
        break;
      case 'NewsArticle':
        record = await prisma.newsArticle.findUnique({ where: { id } });
        break;
      case 'Event':
        record = await prisma.event.findUnique({ where: { id } });
        break;
      case 'TeamMember':
        record = await prisma.teamMember.findUnique({ where: { id } });
        break;
      case 'ImpactMetric':
        record = await prisma.impactMetric.findUnique({ where: { id } });
        break;
      case 'Media':
        record = await prisma.media.findUnique({ where: { id } });
        break;
      default:
        throw new BadRequestError(`Invalid entityType: ${entityType}`);
    }

    if (!record) throw new NotFoundError(`${entityType} not found`);
    return record.status;
  }
}

export const reviewService = new ReviewService();
