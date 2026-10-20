import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import {
  SponsorshipStatus,
  SponsorshipTier,
  PaymentCategory,
  PaymentStatus,
  PaymentProvider
} from '@prisma/client';
import { mailService } from '../config/mail.js';

export interface CreateSponsorshipEnquiryInput {
  organizationName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'STRATEGIC';
  proposedAmount?: number;
  websiteUrl?: string;
  notes?: string;
}

export class SponsorshipService {
  /**
   * Public: Submit a corporate sponsorship inquiry
   */
  async createEnquiry(data: CreateSponsorshipEnquiryInput) {
    const reference = `MSC-SPON-${Date.now().toString().slice(-6)}`;
    const tier = (data.tier as SponsorshipTier) || SponsorshipTier.BRONZE;

    // Estimate initial tier contribution amounts if not explicitly offered
    const defaultTierAmounts: Record<SponsorshipTier, number> = {
      BRONZE: 50000,
      SILVER: 150000,
      GOLD: 350000,
      PLATINUM: 750000,
      STRATEGIC: 1500000
    };

    const amount = data.proposedAmount && data.proposedAmount > 0
      ? data.proposedAmount
      : defaultTierAmounts[tier] || 50000;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const sponsorship = await prisma.corporateSponsorship.create({
      data: {
        organizationName: data.organizationName.trim(),
        contactPerson: data.contactPerson.trim(),
        contactEmail: data.contactEmail.toLowerCase().trim(),
        contactPhone: data.contactPhone.trim(),
        tier,
        agreedAmount: amount,
        currency: env.DEFAULT_CURRENCY || 'KES',
        startDate,
        endDate,
        status: SponsorshipStatus.ENQUIRY,
        websiteUrl: data.websiteUrl ? data.websiteUrl.trim() : null,
        agreementReference: reference,
        notes: data.notes || '',
        isPublicDisplayApproved: false
      }
    });

    // Notify secretariat
    const adminEmail = env.FINANCE_NOTIFICATION_EMAIL || env.ADMIN_NOTIFICATION_EMAIL;
    mailService.sendEmail({
      to: adminEmail,
      subject: `[Corporate Sponsorship Enquiry]: ${sponsorship.organizationName} (${tier})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Corporate Sponsorship Enquiry</h2>
          <p><strong>Organization:</strong> ${sponsorship.organizationName}</p>
          <p><strong>Contact Person:</strong> ${sponsorship.contactPerson}</p>
          <p><strong>Email:</strong> ${sponsorship.contactEmail}</p>
          <p><strong>Phone:</strong> ${sponsorship.contactPhone}</p>
          <p><strong>Selected Tier:</strong> ${tier}</p>
          <p><strong>Proposed Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p><strong>Notes:</strong> ${data.notes || 'None'}</p>
        </div>
      `
    }).catch((err) => {
      logger.warn({ err }, 'Failed to dispatch sponsorship notification email');
    });

    return {
      success: true,
      message: 'Thank you for your partnership inquiry. The Mwancha Senior Community Secretariat will review the terms and reach out.',
      referenceNumber: reference,
      sponsorshipId: sponsorship.id
    };
  }

  /**
   * Public: Retrieve approved sponsors for public brand display
   */
  async getPublicSponsors() {
    const now = new Date();
    const sponsors = await prisma.corporateSponsorship.findMany({
      where: {
        isPublicDisplayApproved: true,
        status: { in: [SponsorshipStatus.ACTIVE, SponsorshipStatus.AGREED] },
        endDate: { gte: now }
      },
      select: {
        id: true,
        organizationName: true,
        tier: true,
        logoUrl: true,
        websiteUrl: true,
        campaign: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return sponsors;
  }

  /**
   * Admin: Get all sponsorships with pagination and status filter
   */
  async getAdminSponsorships(params?: { status?: string; tier?: string }) {
    const where: any = {};
    if (params?.status && params.status !== 'all') {
      where.status = params.status as SponsorshipStatus;
    }
    if (params?.tier && params.tier !== 'all') {
      where.tier = params.tier as SponsorshipTier;
    }

    const sponsorships = await prisma.corporateSponsorship.findMany({
      where,
      include: {
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return sponsorships.map((s) => {
      const totalPaid = s.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      const agreed = Number(s.agreedAmount);
      const balance = Math.max(0, agreed - totalPaid);

      return {
        id: s.id,
        organizationName: s.organizationName,
        contactPerson: s.contactPerson,
        contactEmail: s.contactEmail,
        contactPhone: s.contactPhone,
        tier: s.tier,
        campaign: s.campaign,
        agreedAmount: agreed,
        totalPaid,
        balance,
        currency: s.currency,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status,
        logoUrl: s.logoUrl,
        websiteUrl: s.websiteUrl,
        isPublicDisplayApproved: s.isPublicDisplayApproved,
        agreementReference: s.agreementReference,
        notes: s.notes,
        paymentsCount: s.payments.length,
        createdAt: s.createdAt
      };
    });
  }

  /**
   * Admin: Update sponsorship terms and public display status
   */
  async updateSponsorship(id: string, data: any, userId?: string) {
    const existing = await prisma.corporateSponsorship.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Sponsorship record not found.');

    const updateData: any = {
      updatedById: userId
    };

    if (data.organizationName) updateData.organizationName = data.organizationName;
    if (data.contactPerson) updateData.contactPerson = data.contactPerson;
    if (data.contactEmail) updateData.contactEmail = data.contactEmail;
    if (data.contactPhone) updateData.contactPhone = data.contactPhone;
    if (data.tier) updateData.tier = data.tier as SponsorshipTier;
    if (data.campaign) updateData.campaign = data.campaign;
    if (data.agreedAmount !== undefined) updateData.agreedAmount = Number(data.agreedAmount);
    if (data.currency) updateData.currency = data.currency;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status) updateData.status = data.status as SponsorshipStatus;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl;
    if (data.isPublicDisplayApproved !== undefined) updateData.isPublicDisplayApproved = Boolean(data.isPublicDisplayApproved);
    if (data.agreementReference) updateData.agreementReference = data.agreementReference;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await prisma.corporateSponsorship.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_SPONSORSHIP',
        entity: 'CorporateSponsorship',
        entityId: id,
        newData: JSON.stringify(data)
      }
    }).catch(() => {});

    return updated;
  }

  /**
   * Admin / Accountant: Record and reconcile a corporate sponsorship payment
   */
  async recordPayment(sponsorshipId: string, data: {
    amount: number;
    paymentMethod: string;
    referenceNumber: string;
    notes?: string;
  }, userId?: string) {
    const sponsorship = await prisma.corporateSponsorship.findUnique({ where: { id: sponsorshipId } });
    if (!sponsorship) throw new NotFoundError('Sponsorship record not found.');

    const receiptNumber = `MSC-SPON-REC-${Date.now().toString().slice(-6)}`;

    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.sponsorshipPayment.create({
        data: {
          sponsorshipId,
          amount: data.amount,
          currency: sponsorship.currency || 'KES',
          paymentDate: new Date(),
          paymentMethod: data.paymentMethod || 'BANK_TRANSFER',
          referenceNumber: data.referenceNumber.trim(),
          receiptNumber,
          reconciledByUserId: userId,
          notes: data.notes || ''
        }
      });

      // If sponsorship was ENQUIRY, transition to ACTIVE upon first reconciled payment
      if (sponsorship.status === SponsorshipStatus.ENQUIRY || sponsorship.status === SponsorshipStatus.UNDER_REVIEW) {
        await tx.corporateSponsorship.update({
          where: { id: sponsorshipId },
          data: { status: SponsorshipStatus.ACTIVE }
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'RECONCILE_SPONSORSHIP_PAYMENT',
          entity: 'SponsorshipPayment',
          entityId: created.id,
          newData: JSON.stringify({
            amount: data.amount,
            referenceNumber: data.referenceNumber,
            receiptNumber
          })
        }
      });

      return created;
    });

    return payment;
  }
}

export const sponsorshipService = new SponsorshipService();
