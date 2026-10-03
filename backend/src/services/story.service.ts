import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

export class StoryService {
  async getPublicStories(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: ContentStatus.PUBLISHED,
      deletedAt: null
    };

    const [total, items] = await Promise.all([
      prisma.successStory.count({ where }),
      prisma.successStory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      })
    ]);

    return {
      items: items.map(s => ({
        ...s,
        images: JSON.parse(s.images || '[]')
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPublicStoryBySlug(slug: string) {
    const story = await prisma.successStory.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
        deletedAt: null
      }
    });

    if (!story) throw new NotFoundError('Success story not found or awaiting client publication approval');

    return {
      ...story,
      images: JSON.parse(story.images || '[]')
    };
  }

  async getAdminStories(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    const [total, items] = await Promise.all([
      prisma.successStory.count({ where }),
      prisma.successStory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items: items.map(s => ({
        ...s,
        images: JSON.parse(s.images || '[]')
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createStory(data: any, userId?: string) {
    const slug = await generateUniqueSlug(data.title, async candidate => {
      const existing = await prisma.successStory.findUnique({ where: { slug: candidate } });
      return !!existing;
    });

    const story = await prisma.successStory.create({
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        story: data.story,
        images: JSON.stringify(data.images || []),
        beneficiaryConsent: data.beneficiaryConsent === true || data.beneficiaryConsent === 'true',
        privacyStatus: data.privacyStatus || 'anonymized',
        location: data.location || 'Nyamira County',
        date: data.date ? new Date(data.date) : new Date(),
        status: ContentStatus.DRAFT,
        source: (data.source as ContentSource) || ContentSource.OFFICIAL_PROFILE,
        approvalRequired: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'SuccessStory',
        entityId: story.id,
        newData: JSON.stringify(story)
      }
    });

    return {
      ...story,
      images: JSON.parse(story.images || '[]')
    };
  }

  async updateStory(id: string, data: any, userId?: string) {
    const existing = await prisma.successStory.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Story not found');

    const updated = await prisma.successStory.update({
      where: { id },
      data: {
        ...data,
        images: data.images ? JSON.stringify(data.images) : undefined,
        date: data.date ? new Date(data.date) : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'SuccessStory',
        entityId: id,
        newData: JSON.stringify(data)
      }
    });

    return {
      ...updated,
      images: JSON.parse(updated.images || '[]')
    };
  }

  async deleteStory(id: string, userId?: string) {
    const existing = await prisma.successStory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Story not found');

    await prisma.successStory.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'SuccessStory',
        entityId: id
      }
    });

    return true;
  }

  async approveStory(id: string, reviewerId?: string) {
    const story = await prisma.successStory.findUnique({ where: { id } });
    if (!story) throw new NotFoundError('Story not found');

    return prisma.successStory.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        publishedAt: new Date()
      }
    });
  }

  async publishStory(id: string, publisherId?: string) {
    const story = await prisma.successStory.findUnique({ where: { id } });
    if (!story) throw new NotFoundError('Story not found');

    if (story.status !== ContentStatus.APPROVED) {
      throw new BadRequestError('Only APPROVED stories can transition to PUBLISHED.');
    }

    if (story.privacyStatus === 'identified_with_consent' && !story.beneficiaryConsent) {
      throw new BadRequestError('Cannot publish identified beneficiary story without verified legal consent.');
    }

    return prisma.successStory.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });
  }
}

export const storyService = new StoryService();
