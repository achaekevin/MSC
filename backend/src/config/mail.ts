import { Resend } from 'resend';
import { env } from './env.js';
import { logger } from './logger.js';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class MailService {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY && env.RESEND_API_KEY !== 're_sample_api_key_replace_in_production') {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.resend) {
        logger.info(
          {
            to: options.to,
            subject: options.subject
          },
          '📧 [DEV/MOCK EMAIL NOTIFICATION]: Resend API key not configured or in development mode. Email logged to console.'
        );
        return true;
      }

      const recipientList = Array.isArray(options.to) ? options.to : [options.to];

      await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: recipientList,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo
      });

      logger.info({ to: options.to, subject: options.subject }, 'Email sent successfully via Resend.');
      return true;
    } catch (error) {
      logger.error({ error, options }, 'Failed to send transactional email.');
      return false;
    }
  }
}

export const mailService = new MailService();

// Reusable Professional Email Templates (Section 31)
export const emailTemplates = {
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
        <p style="margin-top: 24px;">Warm regards,<br/><strong>Mwancha Senior Community Secretariat</strong><br/>Nyamira County, Kenya</p>
      </div>
    </div>
  `,

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

  contentSubmittedForReview: (entityType: string, title: string, submittedBy: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <h3 style="color: #1E3A2F; margin-top: 0;">MSC Content Review Alert: [IN REVIEW]</h3>
      <p>A new content record has been submitted for verification:</p>
      <ul>
        <li><strong>Type:</strong> ${entityType}</li>
        <li><strong>Title:</strong> ${title}</li>
        <li><strong>Submitted By:</strong> ${submittedBy}</li>
      </ul>
      <p>Please review and verify in the MSC Content Approval dashboard.</p>
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
  `
};
