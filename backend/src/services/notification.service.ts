import { prisma } from '../config/database.js';
import { ContactStatus, FormStatus, ContentStatus, UserRole } from '@prisma/client';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class NotificationService {
  /**
   * Helper to retrieve active administrator and staff emails by role
   */
  private async getRecipientEmailsByRoles(roles: UserRole[], fallbackEmail?: string): Promise<string[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: { in: roles },
          isActive: true,
          deletedAt: null
        },
        select: { email: true }
      });

      const emails = users.map((u) => u.email.trim()).filter((e) => e.length > 0 && e.includes('@'));
      if (fallbackEmail && !emails.includes(fallbackEmail.toLowerCase())) {
        emails.push(fallbackEmail);
      }
      return emails.length > 0 ? emails : [fallbackEmail || env.ADMIN_NOTIFICATION_EMAIL];
    } catch (err) {
      logger.error({ err }, 'Error querying recipient emails by roles');
      return [fallbackEmail || env.ADMIN_NOTIFICATION_EMAIL];
    }
  }

  // ----------------------------------------------------
  // FORM NOTIFICATIONS (Contact, Volunteer, Partnership, In-Kind)
  // ----------------------------------------------------

  /**
   * Notify designated contact recipient and send confirmation to submitter
   */
  async notifyContactSubmission(submission: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
  }) {
    // 1. Designated contact recipients (Form Managers and Super Admins)
    const adminRecipients = await this.getRecipientEmailsByRoles(
      [UserRole.FORM_MANAGER, UserRole.SUPER_ADMIN],
      env.ADMIN_NOTIFICATION_EMAIL
    );

    // 2. Send email notification to designated admin recipient
    const adminResult = await mailService.sendEmail({
      to: adminRecipients,
      subject: `[NEW CONTACT INQUIRY]: ${submission.subject} from ${submission.name}`,
      replyTo: submission.email,
      templateName: 'ADMIN_CONTACT_ALERT',
      html: emailTemplates.adminContactAlert({
        name: submission.name,
        email: submission.email,
        phone: submission.phone || undefined,
        subject: submission.subject,
        message: submission.message,
        referenceId: submission.id
      })
    });

    // 3. Send confirmation email to sender if valid email provided
    let confirmationResult = { delivered: false };
    if (submission.email && submission.email.includes('@')) {
      confirmationResult = await mailService.sendEmail({
        to: submission.email,
        subject: `Mwancha Senior Community: We Received Your Inquiry: ${submission.subject}`,
        templateName: 'CONTACT_CONFIRMATION',
        html: emailTemplates.contactReceived(submission.name, submission.subject, submission.message)
      });
    }

    // 4. Record internal in-app notification
    try {
      await prisma.notification.create({
        data: {
          title: `New Contact Submission from ${submission.name}`,
          message: submission.subject,
          type: 'FORM_SUBMISSION',
          link: `/admin/forms/contact/${submission.id}`
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for contact submission');
    }

    return {
      adminNotified: adminResult.delivered,
      confirmationSent: confirmationResult.delivered
    };
  }

  /**
   * Notify responsible administrator for volunteer application
   */
  async notifyVolunteerApplication(application: {
    id: string;
    fullName?: string | null;
    email: string;
    phone?: string | null;
    county?: string | null;
    subCounty?: string | null;
    areaOfInterest?: string | null;
    availability?: string | null;
    experience?: string | null;
    message?: string | null;
  }) {
    const applicantName = application.fullName || 'Volunteer Applicant';
    const applicantCounty = application.county || 'Kenya';
    const applicantInterest = application.areaOfInterest || 'Community Support';
    const applicantAvailability = application.availability || 'Flexible';
    const applicantPhone = application.phone || '';

    // 1. Responsible administrators (Volunteer/Form Managers and Super Admins)
    const adminRecipients = await this.getRecipientEmailsByRoles(
      [UserRole.FORM_MANAGER, UserRole.SUPER_ADMIN],
      env.ADMIN_NOTIFICATION_EMAIL
    );

    // 2. Send notification to admin
    const adminResult = await mailService.sendEmail({
      to: adminRecipients,
      subject: `[NEW VOLUNTEER APPLICATION]: ${applicantName} (${applicantCounty})`,
      replyTo: application.email,
      templateName: 'ADMIN_VOLUNTEER_ALERT',
      html: emailTemplates.adminVolunteerAlert({
        fullName: applicantName,
        email: application.email,
        phone: applicantPhone,
        county: applicantCounty,
        subCounty: application.subCounty || undefined,
        areaOfInterest: applicantInterest,
        availability: applicantAvailability,
        experience: application.experience || undefined,
        message: application.message || undefined,
        applicationId: application.id
      })
    });

    // 3. Send confirmation email to applicant
    let confirmationResult = { delivered: false };
    if (application.email && application.email.includes('@')) {
      confirmationResult = await mailService.sendEmail({
        to: application.email,
        subject: 'Mwancha Senior Community: Volunteer Application Received',
        templateName: 'VOLUNTEER_CONFIRMATION',
        html: emailTemplates.volunteerReceived(applicantName, applicantInterest)
      });
    }

    // 4. Internal in-app notification
    try {
      await prisma.notification.create({
        data: {
          title: `Volunteer Application: ${applicantName}`,
          message: `Applied for ${applicantInterest} in ${applicantCounty}`,
          type: 'FORM_SUBMISSION',
          link: `/admin/forms/volunteers/${application.id}`
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for volunteer application');
    }

    return {
      adminNotified: adminResult.delivered,
      confirmationSent: confirmationResult.delivered
    };
  }

  /**
   * Notify responsible administrator for partnership application
   */
  async notifyPartnershipApplication(application: {
    id: string;
    organizationName?: string | null;
    contactPerson?: string | null;
    email: string;
    phone?: string | null;
    organizationType?: string | null;
    partnershipInterests?: string | null;
    message?: string | null;
    website?: string | null;
  }) {
    const orgName = application.organizationName || 'Partner Organization';
    const contactPerson = application.contactPerson || 'Representative';
    const partnerPhone = application.phone || '';
    const orgType = application.organizationType || 'Community Partner';
    const interests = application.partnershipInterests || 'General Collaboration';
    const partnerMsg = application.message || '';

    // 1. Responsible administrators (Partnerships / Content Admin / Super Admin)
    const adminRecipients = await this.getRecipientEmailsByRoles(
      [UserRole.FORM_MANAGER, UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN],
      env.ADMIN_NOTIFICATION_EMAIL
    );

    // 2. Send notification to admin
    const adminResult = await mailService.sendEmail({
      to: adminRecipients,
      subject: `[NEW PARTNERSHIP PROPOSAL]: ${orgName}`,
      replyTo: application.email,
      templateName: 'ADMIN_PARTNERSHIP_ALERT',
      html: emailTemplates.adminPartnershipAlert({
        organizationName: orgName,
        contactPerson: contactPerson,
        email: application.email,
        phone: partnerPhone,
        organizationType: orgType,
        partnershipInterests: interests,
        message: partnerMsg,
        website: application.website || undefined,
        applicationId: application.id
      })
    });

    // 3. Send confirmation email to partner contact person
    let confirmationResult = { delivered: false };
    if (application.email && application.email.includes('@')) {
      confirmationResult = await mailService.sendEmail({
        to: application.email,
        subject: 'Mwancha Senior Community: Partnership Proposal Acknowledgment',
        templateName: 'PARTNERSHIP_CONFIRMATION',
        html: emailTemplates.partnershipReceived(orgName, contactPerson)
      });
    }

    // 4. Internal in-app notification
    try {
      await prisma.notification.create({
        data: {
          title: `Partnership Proposal: ${application.organizationName}`,
          message: `Proposed by ${application.contactPerson}`,
          type: 'FORM_SUBMISSION',
          link: `/admin/forms/partnerships/${application.id}`
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for partnership application');
    }

    return {
      adminNotified: adminResult.delivered,
      confirmationSent: confirmationResult.delivered
    };
  }

  /**
   * Notify admin and donor for in-kind donation pledges
   */
  async notifyInKindDonation(
    submission: { id: string },
    data: {
      fullName: string;
      email: string;
      phone: string;
      donationCategory?: string;
      itemDescription: string;
      estimatedQuantity?: string;
      deliveryMethod: string;
      pickupAddress?: string;
      notes?: string;
    },
    referenceNumber: string
  ) {
    const adminRecipients = await this.getRecipientEmailsByRoles(
      [UserRole.FORM_MANAGER, UserRole.SUPER_ADMIN],
      env.ADMIN_NOTIFICATION_EMAIL
    );

    const categoryLabel = data.donationCategory || 'Food and Donation Materials';

    const adminResult = await mailService.sendEmail({
      to: adminRecipients,
      subject: `[IN-KIND DONATION PLEDGE]: ${categoryLabel} from ${data.fullName}`,
      replyTo: data.email,
      templateName: 'ADMIN_INKIND_ALERT',
      html: emailTemplates.adminInKindAlert({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        category: categoryLabel,
        itemDescription: data.itemDescription,
        estimatedQuantity: data.estimatedQuantity,
        deliveryMethod: data.deliveryMethod,
        pickupAddress: data.pickupAddress,
        notes: data.notes,
        referenceNumber
      })
    });

    let confirmationResult = { delivered: false };
    if (data.email && data.email.includes('@')) {
      confirmationResult = await mailService.sendEmail({
        to: data.email,
        subject: `Mwancha Senior Community: In-Kind Donation Pledge Received [${referenceNumber}]`,
        templateName: 'INKIND_CONFIRMATION',
        html: emailTemplates.inKindDonationReceived(data.fullName, categoryLabel, data.deliveryMethod, referenceNumber)
      });
    }

    try {
      await prisma.notification.create({
        data: {
          title: `In-Kind Donation: ${categoryLabel}`,
          message: `Pledged by ${data.fullName} [${referenceNumber}]`,
          type: 'DONATION',
          link: `/admin/forms/contacts/${submission.id}`
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for in-kind donation');
    }

    return {
      adminNotified: adminResult.delivered,
      confirmationSent: confirmationResult.delivered
    };
  }

  // ----------------------------------------------------
  // EDITORIAL & CONTENT REVIEW NOTIFICATIONS
  // ----------------------------------------------------

  /**
   * Notify reviewers when new content is submitted for review
   */
  async notifyContentSubmittedForReview(data: {
    entityType: string;
    entityId: string;
    title: string;
    submitterName?: string;
    notes?: string;
  }) {
    const reviewerRecipients = await this.getRecipientEmailsByRoles(
      [UserRole.REVIEWER, UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN],
      env.ADMIN_NOTIFICATION_EMAIL
    );

    const emailResult = await mailService.sendEmail({
      to: reviewerRecipients,
      subject: `[CONTENT REVIEW REQUIRED]: ${data.entityType} - ${data.title}`,
      templateName: 'REVIEWER_ALERT',
      html: emailTemplates.contentSubmittedForReview(
        data.entityType,
        data.title,
        data.submitterName || 'MSC Staff Member',
        data.notes
      )
    });

    try {
      await prisma.notification.create({
        data: {
          title: `Review Requested: ${data.entityType}`,
          message: `"${data.title}" submitted by ${data.submitterName || 'an editor'}.`,
          type: 'CONTENT_REVIEW',
          link: '/admin/content'
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for review submission');
    }

    return {
      reviewersNotified: emailResult.delivered,
      recipientCount: reviewerRecipients.length
    };
  }

  /**
   * Notify the relevant editor when content is approved
   */
  async notifyContentApproved(data: {
    entityType: string;
    entityId: string;
    title: string;
    reviewerName?: string;
    notes?: string;
    authorEmail?: string;
    authorName?: string;
  }) {
    // 1. Gather editor recipients
    const editorRecipients = await this.getRecipientEmailsByRoles(
      [UserRole.EDITOR, UserRole.CONTENT_ADMIN],
      env.ADMIN_NOTIFICATION_EMAIL
    );

    if (data.authorEmail && !editorRecipients.includes(data.authorEmail.toLowerCase())) {
      editorRecipients.unshift(data.authorEmail);
    }

    // 2. Send email notification to relevant editor(s)
    const emailResult = await mailService.sendEmail({
      to: editorRecipients,
      subject: `[CONTENT APPROVED]: ${data.entityType} - ${data.title}`,
      templateName: 'EDITOR_APPROVED_ALERT',
      html: emailTemplates.contentApprovedAlert(
        data.entityType,
        data.title,
        data.reviewerName,
        data.notes
      )
    });

    // 3. Record in-app notification
    try {
      await prisma.notification.create({
        data: {
          title: `Content Approved: ${data.entityType}`,
          message: `"${data.title}" has been approved by ${data.reviewerName || 'a reviewer'}.`,
          type: 'CONTENT_APPROVED',
          link: '/admin/content'
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for content approval');
    }

    return {
      editorNotified: emailResult.delivered
    };
  }

  /**
   * Record publishing event and optionally notify relevant staff
   */
  async notifyContentPublished(data: {
    entityType: string;
    entityId: string;
    title: string;
    publisherName?: string;
    publisherId?: string;
    notifyStaff?: boolean;
  }) {
    // 1. In-app publishing broadcast
    try {
      await prisma.notification.create({
        data: {
          title: `Content Published: ${data.entityType}`,
          message: `"${data.title}" is now published live on the website.`,
          type: 'CONTENT_PUBLISHED',
          link: '/admin/content'
        }
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to record in-app notification for content publishing');
    }

    // 2. Optional email notification to relevant staff
    let staffDelivered = false;
    if (data.notifyStaff !== false) {
      const staffRecipients = await this.getRecipientEmailsByRoles(
        [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN, UserRole.EDITOR],
        env.ADMIN_NOTIFICATION_EMAIL
      );

      const emailResult = await mailService.sendEmail({
        to: staffRecipients,
        subject: `[CONTENT PUBLISHED LIVE]: ${data.entityType} - ${data.title}`,
        templateName: 'STAFF_PUBLISHED_ALERT',
        html: emailTemplates.contentPublishedAlert(
          data.entityType,
          data.title,
          data.publisherName || 'MSC Editorial Team'
        )
      });
      staffDelivered = emailResult.delivered;
    }

    return {
      recorded: true,
      staffNotified: staffDelivered
    };
  }

  // ----------------------------------------------------
  // NOTIFICATION CENTER QUERIES
  // ----------------------------------------------------

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
