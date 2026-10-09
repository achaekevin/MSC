import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContactStatus, FormStatus } from '@prisma/client';
import { notificationService } from './notification.service.js';

export class FormService {
  // ----------------------------------------------------
  // CONTACT SUBMISSIONS
  // ----------------------------------------------------
  async submitContact(data: any) {
    // 1. Form Submission: Save record to database first
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

    // 2. Email Delivery: Separate operation that never invalidates a successful submission
    let emailDelivery = { adminNotified: false, confirmationSent: false };
    try {
      emailDelivery = await notificationService.notifyContactSubmission(submission);
    } catch {
      // Form submission succeeded even if email delivery encountered an issue
    }

    // Accurate messaging: never claim email was delivered if delivery failed
    const message = emailDelivery.confirmationSent
      ? 'Your inquiry has been received and a confirmation email has been sent to your address.'
      : 'Your inquiry has been received and logged in our system. Our team will review your message and respond promptly.';

    return {
      success: true,
      referenceId: submission.id,
      emailDelivery,
      message
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
    // 1. Form Submission: Save application in database first
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

    // 2. Email Delivery: Separate operation that never invalidates a saved application
    let emailDelivery = { adminNotified: false, confirmationSent: false };
    try {
      emailDelivery = await notificationService.notifyVolunteerApplication(application);
    } catch {
      // Application record is preserved even if notification delivery fails
    }

    // Accurate messaging: never claim email was delivered if delivery failed
    const message = emailDelivery.confirmationSent
      ? 'Thank you for volunteering! Your application has been logged and a confirmation email has been sent to your address.'
      : 'Thank you for volunteering! Your application has been logged in our system. Our Volunteer Coordinator will be in touch.';

    return {
      success: true,
      applicationId: application.id,
      emailDelivery,
      message
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
    // 1. Form Submission: Save application in database first
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

    // 2. Email Delivery: Separate operation that never invalidates a saved application
    let emailDelivery = { adminNotified: false, confirmationSent: false };
    try {
      emailDelivery = await notificationService.notifyPartnershipApplication(application);
    } catch {
      // Application record is preserved even if notification delivery fails
    }

    // Accurate messaging: never claim email was delivered if delivery failed
    const message = emailDelivery.confirmationSent
      ? 'Partnership proposal successfully submitted. A confirmation email has been sent to your address.'
      : 'Partnership proposal successfully submitted and logged in our system. Our Executive Leadership will review your proposal.';

    return {
      success: true,
      applicationId: application.id,
      emailDelivery,
      message
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
