import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from './env.js';
import { logger } from './logger.js';

import { prisma } from './database.js';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  templateName?: string;
}

export interface EmailDeliveryResult {
  delivered: boolean;
  provider: 'Resend' | 'SMTP' | 'ConsoleMock' | 'None';
  messageId?: string;
  error?: string;
}

export class MailService {
  private resend: Resend | null = null;
  private smtpTransporter: Transporter | null = null;

  constructor() {
    // 1. Initialize Resend if API key is provided and valid
    if (env.RESEND_API_KEY && env.RESEND_API_KEY !== 're_sample_api_key_replace_in_production') {
      try {
        this.resend = new Resend(env.RESEND_API_KEY);
        logger.info('Transactional email service initialized with Resend provider.');
      } catch (err) {
        logger.error({ err }, 'Failed to initialize Resend mail provider.');
      }
    }

    // 2. Initialize Nodemailer SMTP if SMTP credentials are provided
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.smtpTransporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        });
        logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, 'Transactional email service initialized with SMTP provider.');
      } catch (err) {
        logger.error({ err }, 'Failed to initialize SMTP mail transporter.');
      }
    }
  }

  /**
   * Helper to normalize recipient list into an array of clean email addresses
   */
  private normalizeRecipients(to: string | string[]): string[] {
    if (Array.isArray(to)) {
      return to
        .flatMap((entry) => entry.split(','))
        .map((email) => email.trim())
        .filter((email) => email.length > 0 && email.includes('@'));
    }
    return to
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes('@'));
  }

  async sendEmail(options: EmailOptions): Promise<EmailDeliveryResult> {
    const recipientList = this.normalizeRecipients(options.to);
    const recipientStr = recipientList.join(', ');
    const templateName = options.templateName || 'GENERAL_TRANSACTIONAL';

    if (recipientList.length === 0) {
      logger.warn({ options }, 'Email send skipped: No valid recipients provided.');
      return { delivered: false, provider: 'None', error: 'No valid recipient email address provided' };
    }

    try {
      // 1. Try Resend if configured
      if (this.resend) {
        const resendRes: any = await this.resend.emails.send({
          from: env.EMAIL_FROM,
          to: recipientList,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo
        });

        const providerMessageId = resendRes?.data?.id || resendRes?.id || null;
        logger.info({ to: recipientList, subject: options.subject, provider: 'Resend' }, 'Email sent successfully via Resend.');

        try {
          await prisma.emailLog.create({
            data: {
              recipient: recipientStr,
              subject: options.subject,
              template: templateName,
              provider: 'Resend',
              providerMessageId,
              status: 'SENT',
              sentAt: new Date()
            }
          });
        } catch (dbErr) {
          logger.warn({ dbErr }, 'Could not record EmailLog entry for Resend delivery.');
        }

        return { delivered: true, provider: 'Resend', messageId: providerMessageId || undefined };
      }

      // 2. Try SMTP if configured
      if (this.smtpTransporter) {
        const info: any = await this.smtpTransporter.sendMail({
          from: env.EMAIL_FROM,
          to: recipientList.join(', '),
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo
        });

        const messageId = info?.messageId || null;
        logger.info({ to: recipientList, subject: options.subject, provider: 'SMTP' }, 'Email sent successfully via SMTP transporter.');

        try {
          await prisma.emailLog.create({
            data: {
              recipient: recipientStr,
              subject: options.subject,
              template: templateName,
              provider: 'SMTP',
              providerMessageId: messageId,
              status: 'SENT',
              sentAt: new Date()
            }
          });
        } catch (dbErr) {
          logger.warn({ dbErr }, 'Could not record EmailLog entry for SMTP delivery.');
        }

        return { delivered: true, provider: 'SMTP', messageId: messageId || undefined };
      }

      // 3. Fallback dev/mock logger (Safe development mode when external providers are unconfigured)
      logger.info(
        {
          to: recipientList,
          subject: options.subject,
          replyTo: options.replyTo,
          from: env.EMAIL_FROM
        },
        '[DEV/MOCK EMAIL NOTIFICATION]: Resend or SMTP not configured in .env. Logged email safely to console.'
      );

      try {
        await prisma.emailLog.create({
          data: {
            recipient: recipientStr,
            subject: options.subject,
            template: templateName,
            provider: 'ConsoleMock',
            status: 'SIMULATED',
            errorMessage: 'Logged to server console (no live SMTP/Resend API key configured in .env)',
            sentAt: new Date()
          }
        });
      } catch (dbErr) {
        logger.warn({ dbErr }, 'Could not record EmailLog entry for simulated delivery.');
      }

      // Simulation mode: email was not delivered across the internet to an actual mailbox
      return { delivered: false, provider: 'ConsoleMock', error: 'Email service in simulation mode: live provider not configured' };
    } catch (error: any) {
      logger.error({ error, options }, 'Failed to send transactional email.');

      try {
        await prisma.emailLog.create({
          data: {
            recipient: recipientStr,
            subject: options.subject,
            template: templateName,
            provider: this.resend ? 'Resend' : this.smtpTransporter ? 'SMTP' : 'None',
            status: 'FAILED',
            errorMessage: error?.message || 'Unknown email transmission error',
            sentAt: new Date()
          }
        });
      } catch (dbErr) {
        logger.warn({ dbErr }, 'Could not record failed EmailLog entry.');
      }

      return { delivered: false, provider: 'None', error: error?.message || 'Transmission failure' };
    }
  }
}

export const mailService = new MailService();

// Reusable Professional Email Templates with Zero Em Dashes
export const emailTemplates = {
  // 1. Confirmation to Inquirer
  contactReceived: (name: string, subject: string, message: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Mwancha Senior Community</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #A7F3D0;">Inquiry Submission Received</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for reaching out to Mwancha Senior Community. We have safely received your inquiry:</p>
        <div style="background-color: #F9FAFB; border-left: 4px solid #1E3A2F; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 0; font-style: italic;">"${message}"</p>
        </div>
        <p>Our Secretariat and Community Liaison team will review your message and respond promptly.</p>
        <p style="margin-top: 24px;">Warm regards,<br/><strong>Mwancha Senior Community Secretariat</strong><br/>Mwancha House - Ekerenyo, Nyamira County, Kenya</p>
      </div>
    </div>
  `,

  // 2. Notification to Admin for Contact Inquiry
  adminContactAlert: (data: { name: string; email: string; phone?: string; subject: string; message: string; referenceId?: string }) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[NEW WEBSITE CONTACT MESSAGE]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Mwancha Senior Community Official Desk</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p style="margin-top: 0;">A new public message was submitted on the MSC website:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #1E3A2F;">Sender Name:</td><td>${data.name}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Email Address:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Phone Number:</td><td>${data.phone || 'Not provided'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Subject:</td><td>${data.subject}</td></tr>
          ${data.referenceId ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Reference ID:</td><td>${data.referenceId}</td></tr>` : ''}
        </table>
        <div style="background-color: #F3F4F6; border-left: 4px solid #1E3A2F; padding: 14px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #4B5563;">Message Body:</p>
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${data.message}</p>
        </div>
        <p style="font-size: 13px; color: #4B5563; margin-top: 20px;">
          <strong>Tip:</strong> Click "Reply" in your email client to respond directly to ${data.name} (${data.email}).
        </p>
      </div>
    </div>
  `,

  // 3. Confirmation to Volunteer Applicant
  volunteerReceived: (fullName: string, areaOfInterest: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Mwancha Senior Community</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #A7F3D0;">Volunteer Application Acknowledgment</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for offering your time and talent to stand with vulnerable older persons in our community.</p>
        <p>We have registered your application for <strong>${areaOfInterest}</strong>.</p>
        <p>Our Volunteer Coordinator will review your details and contact you for onboarding and ward-level orientation.</p>
        <p style="margin-top: 24px;">In community solidarity,<br/><strong>Volunteer Coordination Unit</strong><br/>Mwancha Senior Community</p>
      </div>
    </div>
  `,

  // 4. Notification to Admin for Volunteer Application
  adminVolunteerAlert: (data: { fullName: string; email: string; phone: string; county: string; subCounty?: string; areaOfInterest: string; availability: string; experience?: string; message?: string; applicationId?: string }) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[NEW VOLUNTEER APPLICATION]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Mwancha Senior Community Volunteer Desk</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 150px; color: #1E3A2F;">Applicant:</td><td>${data.fullName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Phone:</td><td>${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Location:</td><td>${data.county} ${data.subCounty ? `(${data.subCounty})` : ''}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Area of Interest:</td><td>${data.areaOfInterest}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Availability:</td><td>${data.availability}</td></tr>
          ${data.experience ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Experience:</td><td>${data.experience}</td></tr>` : ''}
          ${data.applicationId ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Application ID:</td><td>${data.applicationId}</td></tr>` : ''}
        </table>
        ${data.message ? `
          <div style="background-color: #F3F4F6; border-left: 4px solid #1E3A2F; padding: 14px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #4B5563;">Statement / Motivation:</p>
            <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${data.message}</p>
          </div>
        ` : ''}
        <p style="font-size: 13px; color: #4B5563; margin-top: 20px;">
          <strong>Tip:</strong> Click "Reply" to reach ${data.fullName} directly.
        </p>
      </div>
    </div>
  `,

  // 5. Confirmation to Partner
  partnershipReceived: (organizationName: string, contactPerson: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Mwancha Senior Community</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #A7F3D0;">Partnership Proposal Received</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>Dear <strong>${contactPerson}</strong>,</p>
        <p>We appreciate <strong>${organizationName}</strong>'s interest in collaborating with Mwancha Senior Community to advance elder care and intergenerational welfare.</p>
        <p>Our Executive Leadership will review your proposal and initiate discussions on strategic alignment.</p>
        <p style="margin-top: 24px;">Sincerely,<br/><strong>Executive Director & Secretariat</strong><br/>Mwancha Senior Community</p>
      </div>
    </div>
  `,

  // 6. Notification to Admin for Partnership Proposal
  adminPartnershipAlert: (data: { organizationName: string; contactPerson: string; email: string; phone: string; organizationType: string; partnershipInterests: string; message: string; website?: string; applicationId?: string }) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[NEW INSTITUTIONAL PARTNERSHIP PROPOSAL]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Mwancha Senior Community Leadership Desk</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 160px; color: #1E3A2F;">Organization:</td><td>${data.organizationName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Contact Person:</td><td>${data.contactPerson}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Email Address:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Phone Number:</td><td>${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Organization Type:</td><td>${data.organizationType}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Partnership Focus:</td><td>${data.partnershipInterests}</td></tr>
          ${data.website ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Website:</td><td><a href="${data.website}" target="_blank">${data.website}</a></td></tr>` : ''}
          ${data.applicationId ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Proposal ID:</td><td>${data.applicationId}</td></tr>` : ''}
        </table>
        <div style="background-color: #F3F4F6; border-left: 4px solid #1E3A2F; padding: 14px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #4B5563;">Collaboration Details:</p>
          <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${data.message}</p>
        </div>
      </div>
    </div>
  `,

  // 7. Confirmation to In-Kind Donor
  inKindDonationReceived: (fullName: string, category: string, deliveryMethod: string, referenceNumber: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Mwancha Senior Community</h2>
        <p style="margin: 5px 0 0 0; font-size: 13px; color: #A7F3D0;">In-Kind Donation Pledge Received</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for your generous pledge of food supplies and donation materials to support vulnerable senior citizens.</p>
        <div style="background-color: #F9FAFB; border-left: 4px solid #1E3A2F; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px 0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          <p style="margin: 0 0 6px 0;"><strong>Category:</strong> ${category}</p>
          <p style="margin: 0;"><strong>Handover Method:</strong> ${deliveryMethod.includes('DROP_OFF') || deliveryMethod.includes('Ekerenyo') ? 'Drop-off at Mwancha House - Ekerenyo' : 'Field Volunteer Collection'}</p>
        </div>
        <p><strong>Physical Facility Drop-off Location:</strong><br/>Mwancha House - Ekerenyo<br/>Ekerenyo-Obwari-Magwagwa Road, Nyamira North, Nyamira County, Kenya<br/>Helpline & WhatsApp: +254 790 629439</p>
        <p>Our Relief & Distribution Coordinator will review your submission and contact you shortly to coordinate receipt and issue an official acknowledgement receipt.</p>
        <p style="margin-top: 24px;">With profound gratitude,<br/><strong>Donations & Logistics Secretariat</strong><br/>Mwancha Senior Community</p>
      </div>
    </div>
  `,

  // 8. Notification to Admin for In-Kind Donation Pledge
  adminInKindAlert: (data: { fullName: string; email: string; phone: string; category: string; itemDescription: string; estimatedQuantity?: string; deliveryMethod: string; pickupAddress?: string; notes?: string; referenceNumber: string }) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[NEW IN-KIND DONATION PLEDGE]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Ref: ${data.referenceNumber}</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 160px; color: #1E3A2F;">Donor Name:</td><td>${data.fullName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Email:</td><td><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Phone:</td><td>${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Category:</td><td>${data.category}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Items:</td><td>${data.itemDescription}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Quantity:</td><td>${data.estimatedQuantity || 'Not specified'}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Delivery Method:</td><td>${data.deliveryMethod}</td></tr>
          ${data.pickupAddress ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Pickup/Drop-off Address:</td><td>${data.pickupAddress}</td></tr>` : ''}
          ${data.notes ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Notes:</td><td>${data.notes}</td></tr>` : ''}
        </table>
      </div>
    </div>
  `,

  // 9. Notification to Admin for New Newsletter Subscriber
  adminSubscriberAlert: (email: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; padding: 20px;">
      <h3 style="color: #1E3A2F; margin-top: 0;">New Newsletter Subscriber</h3>
      <p>A new visitor has subscribed to receive Mwancha Senior Community newsletters and briefings:</p>
      <p style="font-size: 16px; font-weight: bold; color: #1E3A2F;"><a href="mailto:${email}">${email}</a></p>
    </div>
  `,

  contentSubmittedForReview: (entityType: string, title: string, submittedBy: string, notes?: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[CONTENT SUBMITTED FOR REVIEW]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Mwancha Senior Community Editorial Review Desk</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>A new content record has been submitted for editorial verification:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #1E3A2F;">Content Type:</td><td>${entityType}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Title / Label:</td><td>${title}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Submitted By:</td><td>${submittedBy}</td></tr>
        </table>
        ${notes ? `
          <div style="background-color: #F3F4F6; border-left: 4px solid #1E3A2F; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #4B5563;">Editorial Notes:</p>
            <p style="margin: 0; font-size: 14px;">${notes}</p>
          </div>
        ` : ''}
        <p style="margin-top: 24px;">Please sign in to the MSC Admin Portal to inspect and verify this item.</p>
      </div>
    </div>
  `,

  contentApprovedAlert: (entityType: string, title: string, approvedBy?: string, notes?: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #059669; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #065F46; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[CONTENT APPROVED BY REVIEWER]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Mwancha Senior Community Editorial Board</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>The following content has been officially approved:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #065F46;">Content Type:</td><td>${entityType}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #065F46;">Title:</td><td>${title}</td></tr>
          ${approvedBy ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #065F46;">Approved By:</td><td>${approvedBy}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; font-weight: bold; color: #065F46;">Status:</td><td><strong style="color: #059669;">APPROVED</strong></td></tr>
        </table>
        ${notes ? `
          <div style="background-color: #F3F4F6; border-left: 4px solid #059669; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #4B5563;">Reviewer Notes:</p>
            <p style="margin: 0; font-size: 14px;">${notes}</p>
          </div>
        ` : ''}
        <p style="margin-top: 24px;">This content is now ready for publishing.</p>
      </div>
    </div>
  `,

  contentPublishedAlert: (entityType: string, title: string, publishedBy?: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #1E3A2F; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1E3A2F; color: #FFFFFF; padding: 20px;">
        <h2 style="margin: 0; font-size: 18px;">[CONTENT PUBLISHED LIVE]</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #A7F3D0;">Mwancha Senior Community Public Portal</p>
      </div>
      <div style="padding: 24px; line-height: 1.6;">
        <p>The following content has been published live to the public website:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #1E3A2F;">Content Type:</td><td>${entityType}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Title:</td><td>${title}</td></tr>
          ${publishedBy ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Published By:</td><td>${publishedBy}</td></tr>` : ''}
          <tr><td style="padding: 6px 0; font-weight: bold; color: #1E3A2F;">Status:</td><td><strong style="color: #1E3A2F;">PUBLISHED</strong></td></tr>
        </table>
        <p style="margin-top: 20px; font-size: 13px; color: #4B5563;">This record is now accessible to the public and synchronized with search indexes.</p>
      </div>
    </div>
  `,

  contentStatusChanged: (entityType: string, title: string, status: string, notes?: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <h3 style="color: #1E3A2F; margin-top: 0;">MSC Content Status Update: [${status}]</h3>
      <p>The status of <strong>${entityType}: ${title}</strong> has been updated to <strong>${status}</strong>.</p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
    </div>
  `,

  passwordReset: (name: string, resetLink: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px;">
      <h2 style="color: #1E3A2F;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your Mwancha Senior Community admin account.</p>
      <p>Please click the button below to set a new password. This link is valid for 1 hour:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetLink}" style="background-color: #1E3A2F; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #6B7280;">If you did not request this reset, please ignore this email or notify your system administrator immediately.</p>
    </div>
  `,

  emailVerification: (name: string, verifyUrl: string, code: string) => `
    <div style="font-family: Arial, sans-serif; color: #1F2421; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1B4332; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Mwancha Senior Community (MSC)</h1>
        <p style="color: #D8F3DC; margin: 4px 0 0 0; font-size: 13px;">Official Email Address Verification</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6;">Thank you for registering on the Mwancha Senior Community administrative portal. To protect system integrity and confirm your identity, please verify your email address.</p>
        <div style="background: #f4fbf7; border: 1px solid #b7e4c7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="font-size: 12px; color: #2d6a4f; margin: 0 0 8px 0; text-transform: uppercase; font-weight: bold;">Your 6-Digit Verification Code</p>
          <div style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #1b4332;">${code}</div>
        </div>
        <p style="font-size: 14px; text-align: center; margin: 20px 0;">
          <a href="${verifyUrl}" style="background-color: #2D6A4F; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </p>
        <p style="font-size: 12px; color: #6B7280; margin-top: 24px;">If you did not initiate this registration, please disregard this email or contact MSC Secretariat immediately.</p>
      </div>
    </div>
  `
};
