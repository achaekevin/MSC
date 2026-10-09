import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';
import { notificationService } from './notification.service.js';

export class NewsService {
  private formatArticle(a: any) {
    let contentParsed: string[] = [];
    if (typeof a.content === 'string') {
      try {
        contentParsed = JSON.parse(a.content);
        if (!Array.isArray(contentParsed)) {
          contentParsed = [a.content];
        }
      } catch {
        contentParsed = [a.content];
      }
    } else if (Array.isArray(a.content)) {
      contentParsed = a.content;
    }

    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      content: contentParsed,
      featuredImage: a.featuredImage,
      imageAlt: a.imageAlt,
      category: a.category,
      categoryId: a.categoryId,
      categoryRelation: a.categoryRelation,
      tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags,
      isFeatured: a.isFeatured,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : a.createdAt.toISOString(),
      author: {
        name: a.authorName,
        role: a.authorRole
      },
      status: a.status,
      source: a.source
    };
  }

  async getCategories() {
    return prisma.newsCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: { deletedAt: null }
            }
          }
        }
      }
    });
  }

  async getArticleById(id: string) {
    const article = await prisma.newsArticle.findUnique({
      where: { id },
      include: {
        categoryRelation: true
      }
    });

    if (!article || article.deletedAt) {
      throw new NotFoundError('News article not found');
    }

    return this.formatArticle(article);
  }

  async getPublicNews(page = 1, limit = 10, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
      deletedAt: null
    };

    if (category && category !== 'All Stories' && category !== 'All') {
      where.OR = [
        { category },
        { categoryRelation: { slug: category } },
        { categoryId: category }
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          categoryRelation: true
        },
        orderBy: { publishedAt: 'desc' }
      })
    ]);

    return {
      items: articles.map(a => this.formatArticle(a)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPublicNewsBySlug(slug: string) {
    const article = await prisma.newsArticle.findFirst({
      where: {
        slug,
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
        deletedAt: null
      },
      include: {
        categoryRelation: true
      }
    });

    if (!article) {
      throw new NotFoundError(`News article '${slug}' not found or is awaiting client sign-off`);
    }

    return this.formatArticle(article);
  }

  async getAdminNews(page = 1, limit = 10, status?: string, search?: string, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    if (category && category !== 'ALL') {
      where.OR = [
        { category },
        { categoryId: category },
        { categoryRelation: { slug: category } }
      ];
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } }
      ];
    }

    const [total, articles] = await Promise.all([
      prisma.newsArticle.count({ where }),
      prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        include: {
          categoryRelation: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      items: articles.map(a => this.formatArticle(a)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createNews(data: any, userId?: string) {
    const slug = data.slug
      ? await generateUniqueSlug(data.slug, async candidate => {
          const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
          return !!existing;
        })
      : await generateUniqueSlug(data.title, async candidate => {
          const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
          return !!existing;
        });

    const contentFormatted = Array.isArray(data.content)
      ? JSON.stringify(data.content)
      : typeof data.content === 'string'
      ? JSON.stringify([data.content])
      : '[]';

    const article = await prisma.newsArticle.create({
      data: {
        slug,
        categoryId: data.categoryId || null,
        title: data.title,
        summary: data.summary,
        content: contentFormatted,
        featuredImage: data.featuredImage,
        imageAlt: data.imageAlt || `${data.title} featured image`,
        authorName: data.authorName || 'MSC Communications Unit',
        authorRole: data.authorRole || 'Communications & Outreach',
        category: data.category || 'Community Story',
        tags: JSON.stringify(data.tags || []),
        isFeatured: data.isFeatured ?? false,
        status: (data.status as ContentStatus) || ContentStatus.APPROVED,
        publishedAt: data.publishedAt
          ? new Date(data.publishedAt)
          : new Date(),
        source: (data.source as ContentSource) || ContentSource.OFFICIAL_PROFILE,
        approvalRequired: false,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        authorId: userId
      },
      include: {
        categoryRelation: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'NewsArticle',
        entityId: article.id,
        newData: JSON.stringify(article)
      }
    });

    return this.formatArticle(article);
  }

  async updateNews(id: string, data: any, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('News article not found');
    }

    const contentFormatted = data.content
      ? Array.isArray(data.content)
        ? JSON.stringify(data.content)
        : JSON.stringify([data.content])
      : undefined;

    const { changeNote, publishedAt, ...cleanData } = data;

    const updatePayload: any = {
      ...cleanData,
      categoryId: cleanData.categoryId !== undefined ? (cleanData.categoryId || null) : undefined,
      content: contentFormatted,
      tags: cleanData.tags ? JSON.stringify(cleanData.tags) : undefined
    };

    if (publishedAt) {
      updatePayload.publishedAt = new Date(publishedAt);
    } else if (cleanData.status === 'PUBLISHED' && !existing.publishedAt) {
      updatePayload.publishedAt = new Date();
    }

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: updatePayload,
      include: {
        categoryRelation: true
      }
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'NewsArticle',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'News article updated',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'NewsArticle',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return this.formatArticle(updated);
  }

  async deleteNews(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('News article not found');

    await prisma.newsArticle.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'NewsArticle',
        entityId: id
      }
    });

    return true;
  }

  async submitReview(id: string, notes?: string, userId?: string) {
    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundError('News article not found');

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: { status: ContentStatus.IN_REVIEW }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'NewsArticle',
        entityId: id,
        currentStatus: ContentStatus.IN_REVIEW,
        previousStatus: article.status,
        requestedAction: 'SUBMIT',
        reviewNotes: notes
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBMIT_REVIEW',
        entity: 'NewsArticle',
        entityId: id
      }
    });

    try {
      let submitterName = 'MSC Staff Member';
      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
        if (user?.name) submitterName = user.name;
      }
      await notificationService.notifyContentSubmittedForReview({
        entityType: 'NewsArticle',
        entityId: id,
        title: article.title,
        submitterName,
        notes
      });
    } catch {
      // Notification dispatch should not invalidate submission
    }

    return this.formatArticle(updated);
  }

  async approveNews(id: string, notes?: string, reviewerId?: string) {
    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundError('News article not found');

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: { status: ContentStatus.APPROVED }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'NewsArticle',
        entityId: id,
        currentStatus: ContentStatus.APPROVED,
        previousStatus: article.status,
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
        entity: 'NewsArticle',
        entityId: id
      }
    });

    try {
      let reviewerName = 'MSC Reviewer';
      if (reviewerId) {
        const user = await prisma.user.findUnique({ where: { id: reviewerId }, select: { name: true } });
        if (user?.name) reviewerName = user.name;
      }
      await notificationService.notifyContentApproved({
        entityType: 'NewsArticle',
        entityId: id,
        title: article.title,
        reviewerName,
        notes
      });
    } catch {
      // Notification dispatch should not invalidate approval
    }

    return this.formatArticle(updated);
  }

  async publishNews(id: string, publisherId?: string) {
    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (!article || article.deletedAt) throw new NotFoundError('News article not found');

    if (article.status === ContentStatus.ARCHIVED) {
      throw new BadRequestError('Archived articles cannot be published directly. Restore first.');
    }

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: publisherId
      }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'NewsArticle',
        entityId: id,
        currentStatus: ContentStatus.PUBLISHED,
        previousStatus: article.status,
        requestedAction: 'PUBLISH',
        reviewerId: publisherId,
        decidedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: publisherId,
        action: 'PUBLISH',
        entity: 'NewsArticle',
        entityId: id
      }
    });

    try {
      let publisherName = 'MSC Publisher';
      if (publisherId) {
        const user = await prisma.user.findUnique({ where: { id: publisherId }, select: { name: true } });
        if (user?.name) publisherName = user.name;
      }
      await notificationService.notifyContentPublished({
        entityType: 'NewsArticle',
        entityId: id,
        title: article.title,
        publisherName,
        publisherId,
        notifyStaff: true
      });
    } catch {
      // Notification dispatch should not invalidate publication
    }

    return this.formatArticle(updated);
  }
}

export const newsService = new NewsService();
