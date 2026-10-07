import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

function formatStoryRecord(s: any) {
  const images: string[] = (() => {
    try {
      return Array.isArray(s.images) ? s.images : JSON.parse(s.images || '[]');
    } catch {
      return [];
    }
  })();

  let structured: any = {};
  try {
    if (s.story && typeof s.story === 'string' && s.story.trim().startsWith('{')) {
      structured = JSON.parse(s.story);
    }
  } catch {}

  const coverImage = structured.coverImage || images[0] || '/images/mwancha-pavilion-gathering.jpg';
  const media = structured.media || images;
  const situation = structured.situation || '';
  const intervention = structured.intervention || '';
  const outcome = structured.outcome || '';
  const relatedProgram = structured.relatedProgram || '';
  const narrative = structured.narrative || (typeof s.story === 'string' && !s.story.trim().startsWith('{') ? s.story : '');

  return {
    ...s,
    images,
    media,
    coverImage,
    situation,
    intervention,
    outcome,
    relatedProgram,
    narrative: narrative || s.summary || ''
  };
}

export class StoryService {
  async getPublicStories(page = 1, limit = 12) {
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
      items: items.map(formatStoryRecord),
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

    return formatStoryRecord(story);
  }

  async getAdminStories(page = 1, limit = 20, status?: string) {
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
      items: items.map(formatStoryRecord),
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

    const allImages: string[] = Array.isArray(data.images)
      ? data.images
      : Array.isArray(data.media)
      ? data.media
      : [];
    if (data.coverImage && !allImages.includes(data.coverImage)) {
      allImages.unshift(data.coverImage);
    }

    const structuredPayload = {
      narrative: data.story || data.narrative || '',
      situation: data.situation || data.challenge || '',
      intervention: data.intervention || data.mscIntervention || '',
      outcome: data.outcome || '',
      relatedProgram: data.relatedProgram || '',
      coverImage: data.coverImage || allImages[0] || '',
      media: allImages
    };

    const storyString = JSON.stringify(structuredPayload);
    const summary = data.summary || (data.situation ? data.situation.substring(0, 300) : (data.title || ''));

    const story = await prisma.successStory.create({
      data: {
        slug,
        title: data.title,
        summary,
        story: storyString,
        images: JSON.stringify(allImages),
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

    return formatStoryRecord(story);
  }

  async updateStory(id: string, data: any, userId?: string) {
    const existing = await prisma.successStory.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Story not found');

    let currentStructured: any = {};
    try {
      if (existing.story && existing.story.trim().startsWith('{')) {
        currentStructured = JSON.parse(existing.story);
      }
    } catch {}

    const allImages = Array.isArray(data.images)
      ? data.images
      : Array.isArray(data.media)
      ? data.media
      : (() => {
          try {
            return JSON.parse(existing.images || '[]');
          } catch {
            return [];
          }
        })();

    if (data.coverImage && !allImages.includes(data.coverImage)) {
      allImages.unshift(data.coverImage);
    }

    const structuredPayload = {
      narrative: data.story !== undefined ? data.story : (data.narrative !== undefined ? data.narrative : (currentStructured.narrative || existing.story || '')),
      situation: data.situation !== undefined ? data.situation : (currentStructured.situation || ''),
      intervention: data.intervention !== undefined ? data.intervention : (currentStructured.intervention || ''),
      outcome: data.outcome !== undefined ? data.outcome : (currentStructured.outcome || ''),
      relatedProgram: data.relatedProgram !== undefined ? data.relatedProgram : (currentStructured.relatedProgram || ''),
      coverImage: data.coverImage !== undefined ? data.coverImage : (currentStructured.coverImage || allImages[0] || ''),
      media: allImages
    };

    const updateData: any = {
      title: data.title !== undefined ? data.title : undefined,
      summary: data.summary !== undefined ? data.summary : undefined,
      story: JSON.stringify(structuredPayload),
      images: JSON.stringify(allImages),
      beneficiaryConsent: data.beneficiaryConsent !== undefined ? (data.beneficiaryConsent === true || data.beneficiaryConsent === 'true') : undefined,
      privacyStatus: data.privacyStatus !== undefined ? data.privacyStatus : undefined,
      location: data.location !== undefined ? data.location : undefined,
      date: data.date ? new Date(data.date) : undefined
    };

    // Clean undefined fields
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

    const updated = await prisma.successStory.update({
      where: { id },
      data: updateData
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

    return formatStoryRecord(updated);
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
