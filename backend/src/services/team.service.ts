import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';

export class TeamService {
  async getPublicTeam() {
    const members = await prisma.teamMember.findMany({
      where: {
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
        isActive: true,
        deletedAt: null
      },
      orderBy: { displayOrder: 'asc' }
    });

    return members.map(m => ({
      id: m.id,
      name: m.name,
      role: m.position,
      department: m.department,
      bio: m.biography,
      image: m.photo,
      isPlaceholder: m.isPlaceholder
    }));
  }

  async getAdminTeam() {
    return prisma.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' }
    });
  }

  async createTeamMember(data: any, userId?: string) {
    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        position: data.position,
        department: data.department,
        biography: data.biography,
        photo: data.photo,
        responsibilities: data.responsibilities,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        isPlaceholder: data.isPlaceholder ?? true,
        status: ContentStatus.DRAFT,
        source: (data.source as ContentSource) || ContentSource.PLACEHOLDER,
        approvalRequired: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'TeamMember',
        entityId: member.id,
        newData: JSON.stringify(member)
      }
    });

    return member;
  }

  async updateTeamMember(id: string, data: any, userId?: string) {
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Team member not found');

    const updated = await prisma.teamMember.update({
      where: { id },
      data
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'TeamMember',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Team record updated',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'TeamMember',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return updated;
  }

  async deleteTeamMember(id: string, userId?: string) {
    const existing = await prisma.teamMember.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Team member not found');

    await prisma.teamMember.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'TeamMember',
        entityId: id
      }
    });

    return true;
  }

  async approveTeamMember(id: string, reviewerId?: string) {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundError('Team member not found');

    return prisma.teamMember.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        publishedAt: new Date()
      }
    });
  }

  async submitReview(id: string, userId?: string) {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member || member.deletedAt) throw new NotFoundError('Team member not found');

    return prisma.teamMember.update({
      where: { id },
      data: {
        status: ContentStatus.IN_REVIEW
      }
    });
  }

  async publishTeamMember(id: string, userId?: string) {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member || member.deletedAt) throw new NotFoundError('Team member not found');

    return prisma.teamMember.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });
  }
}

export const teamService = new TeamService();
