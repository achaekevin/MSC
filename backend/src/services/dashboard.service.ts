import { prisma } from '../config/database.js';
import { ContentStatus, FormStatus, ContactStatus } from '@prisma/client';

export class DashboardService {
  async getDashboardSummary() {
    const [
      totalPrograms,
      publishedPrograms,
      totalNews,
      publishedNews,
      totalEvents,
      totalMedia,
      pendingPrograms,
      pendingNews,
      pendingEvents,
      pendingTeam,
      newInquiriesCount,
      newVolunteerAppsCount,
      newPartnerAppsCount,
      recentAuditLogs
    ] = await Promise.all([
      prisma.program.count({ where: { deletedAt: null } }),
      prisma.program.count({ where: { status: ContentStatus.PUBLISHED, deletedAt: null } }),
      prisma.newsArticle.count({ where: { deletedAt: null } }),
      prisma.newsArticle.count({ where: { status: ContentStatus.PUBLISHED, deletedAt: null } }),
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.media.count({ where: { deletedAt: null } }),
      prisma.program.count({ where: { status: ContentStatus.IN_REVIEW, deletedAt: null } }),
      prisma.newsArticle.count({ where: { status: ContentStatus.IN_REVIEW, deletedAt: null } }),
      prisma.event.count({ where: { status: ContentStatus.IN_REVIEW, deletedAt: null } }),
      prisma.teamMember.count({ where: { status: ContentStatus.IN_REVIEW, deletedAt: null } }),
      prisma.contactSubmission.count({ where: { status: ContactStatus.NEW, deletedAt: null } }),
      prisma.volunteerApplication.count({ where: { status: FormStatus.NEW, deletedAt: null } }),
      prisma.partnershipApplication.count({ where: { status: FormStatus.NEW, deletedAt: null } }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, role: true } }
        }
      })
    ]);

    const pendingReviewsCount = pendingPrograms + pendingNews + pendingEvents + pendingTeam;

    return {
      contentMetrics: {
        programs: { total: totalPrograms, published: publishedPrograms },
        news: { total: totalNews, published: publishedNews },
        events: { total: totalEvents },
        media: { total: totalMedia },
        pendingReviews: pendingReviewsCount
      },
      formMetrics: {
        newInquiries: newInquiriesCount,
        newVolunteerApplications: newVolunteerAppsCount,
        newPartnershipProposals: newPartnerAppsCount
      },
      recentActivity: recentAuditLogs
    };
  }
}

export const dashboardService = new DashboardService();
