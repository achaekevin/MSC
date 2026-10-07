import { prisma } from '../config/database.js';
import { ContactStatus, FormStatus, ContentStatus } from '@prisma/client';

export class NotificationService {
  /**
   * Get aggregated notification center summary for admin
   */
  async getNotificationCenterSummary(userId?: string) {
    const [
      newContactsCount,
      newVolunteersCount,
      newPartnershipsCount,
      pendingPrograms,
      pendingNews,
      pendingEvents,
      pendingTeam,
      pendingStories,
      recentNotifications
    ] = await Promise.all([
      prisma.contactSubmission.count({
        where: {
          status: ContactStatus.NEW,
          subject: { not: 'NEWSLETTER_SUBSCRIPTION' },
          deletedAt: null
        }
      }),
      prisma.volunteerApplication.count({
        where: { status: FormStatus.NEW, deletedAt: null }
      }),
      prisma.partnershipApplication.count({
        where: { status: FormStatus.NEW, deletedAt: null }
      }),
      prisma.program.count({
        where: { status: ContentStatus.IN_REVIEW, deletedAt: null }
      }),
      prisma.newsArticle.count({
        where: { status: ContentStatus.IN_REVIEW, deletedAt: null }
      }),
      prisma.event.count({
        where: { status: ContentStatus.IN_REVIEW, deletedAt: null }
      }),
      prisma.teamMember.count({
        where: { status: ContentStatus.IN_REVIEW, deletedAt: null }
      }),
      prisma.successStory.count({
        where: { status: ContentStatus.IN_REVIEW, deletedAt: null }
      }),
      prisma.notification.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const contentAwaitingReview =
      pendingPrograms + pendingNews + pendingEvents + pendingTeam + pendingStories;

    const totalActionItems =
      newContactsCount + newVolunteersCount + newPartnershipsCount + contentAwaitingReview;

    return {
      actionCounts: {
        newContactMessages: newContactsCount,
        newVolunteerApplications: newVolunteersCount,
        newPartnershipRequests: newPartnershipsCount,
        contentAwaitingReview
      },
      totalActionItems,
      recentNotifications: recentNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString()
      }))
    };
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string) {
    await prisma.notification.updateMany({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });
    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    return { success: true };
  }
}

export const notificationService = new NotificationService();
