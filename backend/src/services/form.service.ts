import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContactStatus, FormStatus } from '@prisma/client';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export class FormService {
  // ----------------------------------------------------
  // CONTACT SUBMISSIONS
  // ----------------------------------------------------
  async submitContact(data: any) {
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        consent: data.consent ?? true,
        status: ContactStatus.NEW
      }
    });

    // 1. Send confirmation to sender
    await mailService.sendEmail({
      to: data.email,
      subject: `Mwancha Senior Community: We Received Your Inquiry: ${data.subject}`,
      html: emailTemplates.contactReceived(data.name, data.subject, data.message)
    });

    // 2. Send notification to MSC admin
    await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[NEW CONTACT INQUIRY]: ${data.subject} from ${data.name}`,
      replyTo: data.email,
      html: emailTemplates.adminContactAlert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        referenceId: submission.id
      })
    });

    // Record internal notification
    await prisma.notification.create({
      data: {
        title: `New Contact Submission from ${data.name}`,
        message: data.subject,
        type: 'FORM_SUBMISSION',
        link: `/admin/forms/contact/${submission.id}`
      }
    });

    return {
      message: 'Your inquiry has been received. Our team will review your message and respond promptly.',
      referenceId: submission.id
    };
  }

  async getAdminContactSubmissions(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as ContactStatus;
    }

    const [total, items] = await Promise.all([
      prisma.contactSubmission.count({ where }),
      prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' }
      })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateContactStatus(id: string, status: string, internalNotes?: string, userId?: string) {
    const existing = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Contact submission not found');

    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: {
        status: status as ContactStatus,
        internalNotes
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_STATUS',
        entity: 'ContactSubmission',
        entityId: id,
        newData: JSON.stringify({ status, internalNotes })
      }
    });

    return updated;
  }

  // ----------------------------------------------------
  // VOLUNTEER APPLICATIONS
  // ----------------------------------------------------
  async submitVolunteer(data: any) {
    const application = await prisma.volunteerApplication.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        county: data.county,
        subCounty: data.subCounty || null,
        areaOfInterest: data.areaOfInterest,
        availability: data.availability,
        experience: data.experience || null,
        message: data.message,
        consent: data.consent ?? true,
        status: FormStatus.NEW
      }
    });

    await mailService.sendEmail({
      to: data.email,
      subject: 'Mwancha Senior Community: Volunteer Application Received',
      html: emailTemplates.volunteerReceived(data.fullName, data.areaOfInterest)
    });

    await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[NEW VOLUNTEER APPLICATION]: ${data.fullName} (${data.county})`,
      replyTo: data.email,
      html: emailTemplates.adminVolunteerAlert({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        county: data.county,
        subCounty: data.subCounty,
        areaOfInterest: data.areaOfInterest,
        availability: data.availability,
        experience: data.experience,
        message: data.message,
        applicationId: application.id
      })
    });

    await prisma.notification.create({
      data: {
        title: `Volunteer Application: ${data.fullName}`,
        message: `Applied for ${data.areaOfInterest} in ${data.county}`,
        type: 'FORM_SUBMISSION',
        link: `/admin/forms/volunteers/${application.id}`
      }
    });

    return {
      message: 'Thank you for volunteering! Your application has been logged and our Volunteer Coordinator will be in touch.',
      applicationId: application.id
    };
  }

  async getAdminVolunteerApplications(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as FormStatus;
    }

    const [total, items] = await Promise.all([
      prisma.volunteerApplication.count({ where }),
      prisma.volunteerApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' }
      })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateVolunteerStatus(id: string, status: string, reviewNotes?: string, userId?: string) {
    const existing = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Volunteer application not found');

    const updated = await prisma.volunteerApplication.update({
      where: { id },
      data: {
        status: status as FormStatus,
        reviewNotes
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_STATUS',
        entity: 'VolunteerApplication',
        entityId: id,
        newData: JSON.stringify({ status, reviewNotes })
      }
    });

    return updated;
  }

  // ----------------------------------------------------
  // PARTNERSHIP APPLICATIONS
  // ----------------------------------------------------
  async submitPartnership(data: any) {
    const application = await prisma.partnershipApplication.create({
      data: {
        organizationName: data.organizationName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        organizationType: data.organizationType,
        partnershipInterests: data.partnershipInterests,
        message: data.message,
        website: data.website || null,
        consent: data.consent ?? true,
        status: FormStatus.NEW
      }
    });

    await mailService.sendEmail({
      to: data.email,
      subject: 'Mwancha Senior Community: Partnership Proposal Acknowledgment',
      html: emailTemplates.partnershipReceived(data.organizationName, data.contactPerson)
    });

    await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[NEW PARTNERSHIP PROPOSAL]: ${data.organizationName}`,
      replyTo: data.email,
      html: emailTemplates.adminPartnershipAlert({
        organizationName: data.organizationName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        organizationType: data.organizationType,
        partnershipInterests: data.partnershipInterests,
        message: data.message,
        website: data.website,
        applicationId: application.id
      })
    });

    await prisma.notification.create({
      data: {
        title: `Partnership Proposal: ${data.organizationName}`,
        message: `Proposed by ${data.contactPerson}`,
        type: 'FORM_SUBMISSION',
        link: `/admin/forms/partnerships/${application.id}`
      }
    });

    return {
      message: 'Partnership proposal successfully submitted. Our Executive Leadership will review your proposal.',
      applicationId: application.id
    };
  }

  async getAdminPartnershipApplications(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (status && status !== 'all') {
      where.status = status as FormStatus;
    }

    const [total, items] = await Promise.all([
      prisma.partnershipApplication.count({ where }),
      prisma.partnershipApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' }
      })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updatePartnershipStatus(id: string, status: string, reviewNotes?: string, userId?: string) {
    const existing = await prisma.partnershipApplication.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Partnership application not found');

    const updated = await prisma.partnershipApplication.update({
      where: { id },
      data: {
        status: status as FormStatus,
        reviewNotes
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_STATUS',
        entity: 'PartnershipApplication',
        entityId: id,
        newData: JSON.stringify({ status, reviewNotes })
      }
    });

    return updated;
  }
}

export const formService = new FormService();
