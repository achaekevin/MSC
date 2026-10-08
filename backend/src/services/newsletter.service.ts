import { prisma } from '../config/database.js';
import { ContactStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  consent: boolean;
}

export class NewsletterService {
  /**
   * Subscribe an email to the MSC Community Newsletter
   */
  async subscribe(email: string, consent: boolean, name?: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestError('A valid email address is required.');
    }

    if (!consent) {
      throw new BadRequestError('Explicit consent is required to receive community updates.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await prisma.contactSubmission.findFirst({
      where: {
        email: cleanEmail,
        subject: 'NEWSLETTER_SUBSCRIPTION',
        deletedAt: null
      }
    });

    if (existing) {
      if (existing.status === ContactStatus.ARCHIVED) {
        // Reactivate subscription
        await prisma.contactSubmission.update({
          where: { id: existing.id },
          data: {
            status: ContactStatus.NEW,
            consent: true,
            message: `Re-subscribed on ${new Date().toISOString()}`
          }
        });
        return {
          message: 'Welcome back! Your subscription to MSC community updates has been reactivated.',
          isNew: false
        };
      }

      return {
        message: 'You are already subscribed to Mwancha Senior Community newsletters.',
        isNew: false
      };
    }

    // Create subscription record
    const subscriber = await prisma.contactSubmission.create({
      data: {
        name: name?.trim() || 'Community Friend',
        email: cleanEmail,
        subject: 'NEWSLETTER_SUBSCRIPTION',
        message: 'Subscribed to Mwancha Senior Community monthly updates and elder welfare briefings.',
        consent: true,
        status: ContactStatus.NEW
      }
    });

    // Record internal notification for admin
    await prisma.notification.create({
      data: {
        title: 'New Newsletter Subscriber',
        message: `${cleanEmail} subscribed to community updates`,
        type: 'SUBSCRIPTION',
        link: '/admin/applications?tab=subscribers'
      }
    });

    // Send confirmation email to subscriber
    await mailService.sendEmail({
      to: cleanEmail,
      subject: 'Welcome to Mwancha Senior Community Updates',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #14532d;">Stay Connected with Mwancha Senior Community</h2>
          <p>Thank you for subscribing to our community newsletters and policy briefings.</p>
          <p>You will receive authentic updates regarding our elder welfare programs, field barazas, medical outreach camps, and stories of impact from Ekerenyo, Nyamira County, and across Kenya.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            Mwancha Senior Community &bull; Mwancha House - Ekerenyo &bull; P.O. Box 162-40506, Ekerenyo-Nyamira, Kenya<br />
            To unsubscribe at any time, visit our website or contact us at ${env.ADMIN_NOTIFICATION_EMAIL}.
          </p>
        </div>
      `
    });

    // Send notification to MSC admin
    await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[NEW NEWSLETTER SUBSCRIBER]: ${cleanEmail}`,
      replyTo: cleanEmail,
      html: emailTemplates.adminSubscriberAlert(cleanEmail)
    });

    return {
      message: 'Thank you for subscribing! You will receive our monthly updates and elder care news.',
      isNew: true
    };
  }

  /**
   * Unsubscribe an email
   */
  async unsubscribe(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestError('Valid email address is required.');
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.contactSubmission.findFirst({
      where: {
        email: cleanEmail,
        subject: 'NEWSLETTER_SUBSCRIPTION',
        deletedAt: null
      }
    });

    if (!existing) {
      return { message: 'This email address is not found in our subscription registry.' };
    }

    await prisma.contactSubmission.update({
      where: { id: existing.id },
      data: {
        status: ContactStatus.ARCHIVED,
        adminNotes: `Unsubscribed on ${new Date().toISOString()}`
      }
    });

    return { message: 'You have been successfully unsubscribed from MSC newsletters.' };
  }

  /**
   * Admin: List subscribers
   */
  async getSubscribers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      subject: 'NEWSLETTER_SUBSCRIPTION',
      deletedAt: null
    };

    if (search && search.trim()) {
      where.OR = [
        { email: { contains: search.trim() } },
        { name: { contains: search.trim() } }
      ];
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

    const subscribers: NewsletterSubscriber[] = items.map((item) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      subscribedAt: item.submittedAt.toISOString(),
      status: item.status === ContactStatus.ARCHIVED ? 'UNSUBSCRIBED' : 'ACTIVE',
      consent: item.consent
    }));

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Admin: Remove subscriber
   */
  async deleteSubscriber(id: string) {
    const existing = await prisma.contactSubmission.findUnique({ where: { id } });
    if (!existing || existing.subject !== 'NEWSLETTER_SUBSCRIPTION') {
      throw new NotFoundError('Subscriber not found.');
    }

    await prisma.contactSubmission.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return { message: 'Subscriber removed from registry.' };
  }

  /**
   * Admin: Export all active subscribers (CSV format)
   */
  async exportSubscribersCsv() {
    const items = await prisma.contactSubmission.findMany({
      where: {
        subject: 'NEWSLETTER_SUBSCRIPTION',
        deletedAt: null,
        status: { not: ContactStatus.ARCHIVED }
      },
      orderBy: { submittedAt: 'desc' }
    });

    let csv = 'Email,Name,SubscribedDate,Status\n';
    items.forEach((item) => {
      csv += `"${item.email}","${item.name || ''}","${item.submittedAt.toISOString()}","ACTIVE"\n`;
    });

    return csv;
  }
}

export const newsletterService = new NewsletterService();
