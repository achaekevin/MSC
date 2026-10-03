import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

export class ProgramService {
  private formatProgram(p: any) {
    return {
      ...p,
      objectives: typeof p.objectives === 'string' ? JSON.parse(p.objectives || '[]') : p.objectives,
      activities: typeof p.activities === 'string' ? JSON.parse(p.activities || '[]') : p.activities,
      targetBeneficiaries: typeof p.targetPopulation === 'string' ? JSON.parse(p.targetPopulation || '[]') : p.targetPopulation,
      relatedProgramSlugs: typeof p.relatedSlugs === 'string' ? JSON.parse(p.relatedSlugs || '[]') : p.relatedSlugs,
      shortDescription: p.summary,
      fullDescription: p.description
    };
  }

  async getPublicPrograms() {
    const programs = await prisma.program.findMany({
      where: {
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
        deletedAt: null
      },
      orderBy: { displayOrder: 'asc' }
    });

    return programs.map(p => this.formatProgram(p));
  }

  async getPublicProgramBySlug(slug: string) {
    const program = await prisma.program.findFirst({
      where: {
        slug,
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
        deletedAt: null
      }
    });

    if (!program) {
      throw new NotFoundError(`Program '${slug}' not found or is currently awaiting client verification`);
    }

    return this.formatProgram(program);
  }

  async getAdminPrograms(page = 1, limit = 10, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContentStatus;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      })
    ]);

    return {
      items: items.map(p => this.formatProgram(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createProgram(data: any, userId?: string) {
    const slug = await generateUniqueSlug(data.title, async candidate => {
      const existing = await prisma.program.findUnique({ where: { slug: candidate } });
      return !!existing;
    });

    const program = await prisma.program.create({
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        objectives: JSON.stringify(data.objectives || []),
        activities: JSON.stringify(data.activities || []),
        targetPopulation: JSON.stringify(data.targetBeneficiaries || data.targetPopulation || []),
        thematicArea: data.thematicArea,
        approach: data.approach,
        iconName: data.iconName || 'HeartHandshake',
        image: data.image,
        imageAlt: data.imageAlt || `${data.title} outreach visual`,
        metricsHighlight: data.metricsHighlight,
        relatedSlugs: JSON.stringify(data.relatedSlugs || data.relatedProgramSlugs || []),
        displayOrder: data.displayOrder ?? 0,
        status: ContentStatus.DRAFT,
        source: (data.source as ContentSource) || ContentSource.OFFICIAL_PROFILE,
        approvalRequired: true,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Program',
        entityId: program.id,
        newData: JSON.stringify(program)
      }
    });

    return this.formatProgram(program);
  }

  async updateProgram(id: string, data: any, userId?: string) {
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Program not found');
    }

    const updated = await prisma.program.update({
      where: { id },
      data: {
        ...data,
        objectives: data.objectives ? JSON.stringify(data.objectives) : undefined,
        activities: data.activities ? JSON.stringify(data.activities) : undefined,
        targetPopulation: (data.targetBeneficiaries || data.targetPopulation)
          ? JSON.stringify(data.targetBeneficiaries || data.targetPopulation)
          : undefined,
        relatedSlugs: (data.relatedSlugs || data.relatedProgramSlugs)
          ? JSON.stringify(data.relatedSlugs || data.relatedProgramSlugs)
          : undefined
      }
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'Program',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Program updated by administrator',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'Program',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return this.formatProgram(updated);
  }

  async deleteProgram(id: string, userId?: string) {
    const existing = await prisma.program.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Program not found');
    }

    // Soft delete
    await prisma.program.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Program',
        entityId: id
      }
    });

    return true;
  }

  async submitReview(id: string, notes?: string, userId?: string) {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundError('Program not found');

    const updated = await prisma.program.update({
      where: { id },
      data: { status: ContentStatus.IN_REVIEW }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'Program',
        entityId: id,
        currentStatus: ContentStatus.IN_REVIEW,
        previousStatus: program.status,
        requestedAction: 'SUBMIT',
        reviewNotes: notes
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBMIT_REVIEW',
        entity: 'Program',
        entityId: id,
        newData: JSON.stringify({ status: ContentStatus.IN_REVIEW, notes })
      }
    });

    return this.formatProgram(updated);
  }

  async approveProgram(id: string, notes?: string, reviewerId?: string) {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundError('Program not found');

    const updated = await prisma.program.update({
      where: { id },
      data: { status: ContentStatus.APPROVED }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'Program',
        entityId: id,
        currentStatus: ContentStatus.APPROVED,
        previousStatus: program.status,
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
        entity: 'Program',
        entityId: id,
        newData: JSON.stringify({ status: ContentStatus.APPROVED, notes })
      }
    });

    return this.formatProgram(updated);
  }

  async publishProgram(id: string, publisherId?: string) {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundError('Program not found');

    if (program.status !== ContentStatus.APPROVED) {
      throw new BadRequestError('Only APPROVED content can transition to PUBLISHED.');
    }

    const updated = await prisma.program.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    await prisma.contentReview.create({
      data: {
        entityType: 'Program',
        entityId: id,
        currentStatus: ContentStatus.PUBLISHED,
        previousStatus: program.status,
        requestedAction: 'PUBLISH',
        reviewerId: publisherId,
        decidedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: publisherId,
        action: 'PUBLISH',
        entity: 'Program',
        entityId: id,
        newData: JSON.stringify({ status: ContentStatus.PUBLISHED })
      }
    });

    return this.formatProgram(updated);
  }
}

export const programService = new ProgramService();
