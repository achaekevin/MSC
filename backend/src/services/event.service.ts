import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

export class EventService {
  async getPublicEvents(page = 1, limit = 10, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: ContentStatus.PUBLISHED,
      deletedAt: null
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' }
      })
    ]);

    return {
      items: events.map(e => ({
        ...e,
        date: e.startDate.toISOString().split('T')[0],
        time: e.timeString
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPublicEventBySlug(slug: string) {
    const event = await prisma.event.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
        deletedAt: null
      }
    });

    if (!event) {
      throw new NotFoundError(`Event '${slug}' not found or is awaiting client sign-off`);
    }

    return {
      ...event,
      date: event.startDate.toISOString().split('T')[0],
      time: event.timeString
    };
  }

  async getAdminEvents(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' }
      })
    ]);

    return {
      items: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createEvent(data: any, userId?: string) {
    const slug = await generateUniqueSlug(data.title, async candidate => {
      const existing = await prisma.event.findUnique({ where: { slug: candidate } });
      return !!existing;
    });

    const event = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        description: data.description,
        location: data.location,
        county: data.county || 'Nyamira',
        category: data.category || 'Community Outreach',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        timeString: data.timeString || '09:00 AM - 03:00 PM EAT',
        isRegistrationOpen: data.isRegistrationOpen ?? true,
        registrationUrl: data.registrationUrl,
        image: data.image,
        organizer: data.organizer || 'Mwancha Senior Community',
        status: ContentStatus.DRAFT,
        source: (data.source as ContentSource) || ContentSource.OFFICIAL_PROFILE
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Event',
        entityId: event.id,
        newData: JSON.stringify(event)
      }
    });

    return event;
  }

  async updateEvent(id: string, data: any, userId?: string) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Event not found');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      }
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'Event',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Event details updated',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'Event',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return updated;
  }

  async deleteEvent(id: string, userId?: string) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Event not found');

    await prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Event',
        entityId: id
      }
    });

    return true;
  }

  async approveEvent(id: string, notes?: string, reviewerId?: string) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    const updated = await prisma.event.update({
      where: { id },
      data: { status: ContentStatus.APPROVED }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'Event',
        entityId: id,
        currentStatus: ContentStatus.APPROVED,
        previousStatus: event.status,
        requestedAction: 'APPROVE',
        reviewerId,
        reviewNotes: notes,
        decidedAt: new Date()
      }
    });

    return updated;
  }

  async publishEvent(id: string, publisherId?: string) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    if (event.status !== ContentStatus.APPROVED) {
      throw new BadRequestError('Only APPROVED events can be PUBLISHED.');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    return updated;
  }
}

export const eventService = new EventService();
