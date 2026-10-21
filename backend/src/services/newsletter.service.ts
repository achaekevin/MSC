import { prisma } from '../config/database.js';
import { ContactStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

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
    const subscriberName = name?.trim() || 'Community Friend';

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

        // Send welcome-back confirmation email
        this.sendSubscriberConfirmationEmail(cleanEmail, subscriberName, true).catch((err) => {
          logger.error({ err, email: cleanEmail }, 'Failed to send re-subscription confirmation email.');
        });

        return {
          message: 'Welcome back! Your subscription has been reactivated. A confirmation email has been sent to your inbox.',
          isNew: false
        };
      }

      // Send confirmation email in case subscriber missed it or previous delivery failed
      this.sendSubscriberConfirmationEmail(cleanEmail, subscriberName, false).catch((err) => {
        logger.error({ err, email: cleanEmail }, 'Failed to send newsletter subscription confirmation email.');
      });

      return {
        message: 'You are subscribed to Mwancha Senior Community newsletters! A confirmation email has been sent to your inbox.',
        isNew: false
      };
    }

    // Create subscription record
    await prisma.contactSubmission.create({
      data: {
        name: subscriberName,
        email: cleanEmail,
        subject: 'NEWSLETTER_SUBSCRIPTION',
        message: 'Subscribed to Mwancha Senior Community monthly updates and elder welfare briefings.',
        consent: true,
        status: ContactStatus.NEW
      }
    });

    // Record internal notification for admin dashboard
    await prisma.notification.create({
      data: {
        title: 'New Newsletter Subscriber',
        message: `${cleanEmail} subscribed to community updates`,
        type: 'SUBSCRIPTION',
        link: '/admin/applications?tab=subscribers'
      }
    });

    // Send confirmation email to subscriber (non-blocking - subscription succeeds regardless)
    this.sendSubscriberConfirmationEmail(cleanEmail, subscriberName, false).catch((err) => {
      logger.error({ err, email: cleanEmail }, 'Failed to send newsletter subscription confirmation email.');
    });

    // Send notification to MSC admin (non-blocking)
    this.sendAdminNotificationEmail(cleanEmail, subscriberName).catch((err) => {
      logger.error({ err, email: cleanEmail }, 'Failed to send admin newsletter subscriber notification.');
    });

    return {
      message: 'Thank you for subscribing! A confirmation email has been sent to your inbox with details about our community updates.',
      isNew: true
    };
  }

  /**
   * Send beautifully branded confirmation email to the subscriber
   */
  private async sendSubscriberConfirmationEmail(email: string, name: string, isReactivation: boolean) {
    const unsubscribeUrl = `${env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
    const websiteUrl = env.FRONTEND_URL;

    const result = await mailService.sendEmail({
      to: email,
      subject: isReactivation
        ? 'Welcome Back to Mwancha Senior Community Updates'
        : 'Welcome to Mwancha Senior Community - Subscription Confirmed',
      templateName: 'NEWSLETTER_WELCOME',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.7; background-color: #ffffff;">
          <!-- Header Banner -->
          <div style="background-color: #1E3A2F; padding: 28px 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
              Mwancha Senior Community
            </h1>
            <p style="color: #A7F3D0; margin: 6px 0 0 0; font-size: 13px;">
              Advancing Dignity, Care & Wellbeing for Older Persons in Kenya
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #14532d; margin: 0 0 16px 0; font-size: 20px;">
              ${isReactivation ? 'Welcome Back!' : 'Subscription Confirmed!'}
            </h2>

            <p style="margin: 0 0 16px 0; font-size: 15px;">
              Dear <strong>${name}</strong>,
            </p>

            <p style="margin: 0 0 16px 0; font-size: 14px;">
              ${isReactivation
                ? 'Your subscription to Mwancha Senior Community updates has been successfully reactivated. We are glad to have you back!'
                : 'Thank you for subscribing to the Mwancha Senior Community newsletter. You are now part of a growing network of supporters committed to the dignity and welfare of older persons in Kenya.'}
            </p>

            <!-- What You'll Receive Box -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px 20px; margin: 20px 0; border-radius: 0 6px 6px 0;">
              <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 13px; color: #14532d; text-transform: uppercase;">
                What You Will Receive
              </p>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #334155;">
                <li style="margin-bottom: 6px;">Monthly field updates from our elder care programs in Ekerenyo, Nyamira County</li>
                <li style="margin-bottom: 6px;">Policy briefs and advocacy news on senior citizen rights in Kenya</li>
                <li style="margin-bottom: 6px;">Stories of impact from our 40 ward-based community volunteers</li>
                <li style="margin-bottom: 6px;">Upcoming baraza schedules, medical outreach camps, and community events</li>
              </ul>
            </div>

            <!-- Organization Info -->
            <div style="background-color: #f8fafc; padding: 16px 20px; margin: 20px 0; border-radius: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #1E3A2F;">About Mwancha Senior Community (MSC)</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Founded in 2016 in Ekerenyo, Nyamira County, MSC is a registered community organization dedicated to eldercare, social protection, and intergenerational support for vulnerable older persons across Kenya.
              </p>
            </div>

            <p style="margin: 24px 0 8px 0; font-size: 14px;">
              Warm regards,
            </p>
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1E3A2F;">
              Mwancha Senior Community Secretariat
            </p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
              Mwancha House - Ekerenyo, Nyamira County, Kenya
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">
              You are receiving this email because you subscribed to Mwancha Senior Community updates.
            </p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
              <a href="${websiteUrl}" style="color: #16a34a; text-decoration: none;">Visit Website</a>
              &nbsp;&bull;&nbsp;
              <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
              &nbsp;&bull;&nbsp;
              P.O. Box 162-40506, Ekerenyo-Nyamira, Kenya
            </p>
          </div>
        </div>
      `
    });

    if (result.delivered) {
      logger.info({ email, provider: result.provider }, 'Newsletter confirmation email delivered successfully.');
    } else {
      logger.warn({ email, provider: result.provider, error: result.error }, 'Newsletter confirmation email was not delivered to mailbox.');
    }

    return result;
  }

  /**
   * Send notification to MSC admin about new subscriber
   */
  private async sendAdminNotificationEmail(subscriberEmail: string, subscriberName: string) {
    const result = await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[NEW NEWSLETTER SUBSCRIBER]: ${subscriberEmail}`,
      replyTo: subscriberEmail,
      templateName: 'ADMIN_SUBSCRIBER_ALERT',
      html: emailTemplates.adminSubscriberAlert(subscriberEmail)
    });

    if (result.delivered) {
      logger.info({ subscriberEmail }, 'Admin notification sent for new newsletter subscriber.');
    }

    return result;
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

