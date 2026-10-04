import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

export class EventService {
  async getCategories() {
    const events = await prisma.event.findMany({
      where: { deletedAt: null },
      select: { category: true },
      distinct: ['category']
    });

    const defaultCategories = [
      'Community Outreach',
      'Senior Engagement',
      'Health & Wellness',
      'Advocacy & Rights',
      'Capacity Building'
    ];

    const existingNames = events.map(e => e.category).filter(Boolean);
    const combined = Array.from(new Set([...defaultCategories, ...existingNames]));
    return combined.map(name => ({ id: name, name, slug: name.toLowerCase().replace(/\s+/g, '-') }));
  }

  async getPublicEvents(page = 1, limit = 10, category?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: ContentStatus.PUBLISHED,
      deletedAt: null
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { location: { contains: search.trim() } }
      ];
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

  async getAdminEvents(page = 1, limit = 10, status?: string, category?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    if (category && category !== 'All' && category !== 'all') {
      where.category = category;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { location: { contains: search.trim() } }
      ];
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          registrations: {
            take: 5
          }
        }
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

  async getAdminEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!event || event.deletedAt) {
      throw new NotFoundError('Event not found');
    }

    return {
      ...event,
      date: event.startDate.toISOString().split('T')[0],
      time: event.timeString
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

  async submitReview(id: string, notes?: string, submitterId?: string) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event || event.deletedAt) throw new NotFoundError('Event not found');

    const updated = await prisma.event.update({
      where: { id },
      data: { status: ContentStatus.IN_REVIEW }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'Event',
        entityId: id,
        currentStatus: ContentStatus.IN_REVIEW,
        previousStatus: event.status,
        requestedAction: 'REVIEW_REQUESTED',
        submitterId,
        submissionNotes: notes
      }
    });

    return updated;
  }

  async duplicateEvent(id: string, userId?: string) {
    const original = await prisma.event.findUnique({ where: { id } });
    if (!original || original.deletedAt) throw new NotFoundError('Event not found');

    const newTitle = `${original.title} (Copy)`;
    const newSlug = await generateUniqueSlug(newTitle, async candidate => {
      const existing = await prisma.event.findUnique({ where: { slug: candidate } });
      return !!existing;
    });

    const duplicate = await prisma.event.create({
      data: {
        title: newTitle,
        slug: newSlug,
        description: original.description,
        location: original.location,
        county: original.county,
        category: original.category,
        startDate: original.startDate,
        endDate: original.endDate,
        timeString: original.timeString,
        isRegistrationOpen: original.isRegistrationOpen,
        registrationRequired: original.registrationRequired,
        registrationUrl: original.registrationUrl,
        image: original.image,
        organizer: original.organizer,
        status: ContentStatus.DRAFT,
        source: original.source,
        createdById: userId
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Event',
        entityId: duplicate.id,
        newData: JSON.stringify(duplicate)
      }
    });

    return duplicate;
  }
}

export const eventService = new EventService();
