import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { notificationService } from './notification.service.js';

export class TestimonialService {
  async getPublicTestimonials() {
    return prisma.testimonial.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        consentGiven: true, // Strict beneficiary safeguarding
        deletedAt: null
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        roleRelationship: true,
        quote: true,
        photo: true
      }
    });
  }

  async getAdminTestimonials(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    const [total, items] = await Promise.all([
      prisma.testimonial.count({ where }),
      prisma.testimonial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createTestimonial(data: any, userId?: string) {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        roleRelationship: data.roleRelationship,
        quote: data.quote,
        photo: data.photo,
        source: (data.source as ContentSource) || ContentSource.CLIENT,
        consentGiven: data.consentGiven === true || data.consentGiven === 'true',
        displayOrder: data.displayOrder ?? 0,
        status: ContentStatus.DRAFT,
        approvalRequired: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Testimonial',
        entityId: testimonial.id,
        newData: JSON.stringify(testimonial)
      }
    });

    return testimonial;
  }

  async updateTestimonial(id: string, data: any, userId?: string) {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Testimonial not found');

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...data,
        consentGiven: data.consentGiven !== undefined ? Boolean(data.consentGiven) : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'Testimonial',
        entityId: id,
        newData: JSON.stringify(data)
      }
    });

    return updated;
  }

  async deleteTestimonial(id: string, userId?: string) {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Testimonial not found');

    await prisma.testimonial.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Testimonial',
        entityId: id
      }
    });

    return true;
  }

  async approveTestimonial(id: string, reviewerId?: string) {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundError('Testimonial not found');

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        publishedAt: new Date()
      }
    });

    try {
      let reviewerName = 'MSC Reviewer';
      if (reviewerId) {
        const user = await prisma.user.findUnique({ where: { id: reviewerId }, select: { name: true } });
        if (user?.name) reviewerName = user.name;
      }
      await notificationService.notifyContentApproved({
        entityType: 'Testimonial',
        entityId: id,
        title: `Testimonial from ${testimonial.name}`,
        reviewerName
      });
    } catch {
      // Notification dispatch should not invalidate approval
    }

    return updated;
  }

  async publishTestimonial(id: string, publisherId?: string) {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundError('Testimonial not found');

    if (testimonial.status !== ContentStatus.APPROVED) {
      throw new BadRequestError('Only APPROVED testimonials can transition to PUBLISHED.');
    }

    if (!testimonial.consentGiven) {
      throw new BadRequestError('Cannot publish testimonial without documented beneficiary consent.');
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    try {
      let publisherName = 'MSC Publisher';
      if (publisherId) {
        const user = await prisma.user.findUnique({ where: { id: publisherId }, select: { name: true } });
        if (user?.name) publisherName = user.name;
      }
      await notificationService.notifyContentPublished({
        entityType: 'Testimonial',
        entityId: id,
        title: `Testimonial from ${testimonial.name}`,
        publisherName,
        publisherId,
        notifyStaff: true
      });
    } catch {
      // Notification dispatch should not invalidate publication
    }

    return updated;
  }
}

export const testimonialService = new TestimonialService();
