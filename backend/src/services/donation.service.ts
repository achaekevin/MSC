import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus, ContactStatus } from '@prisma/client';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export class DonationService {
  private formatDetails(provider: string | null | undefined, detailsRaw: string | null): Record<string, any> {
    let parsed: any = {};
    if (detailsRaw) {
      try {
        parsed = JSON.parse(detailsRaw);
      } catch {
        parsed = {};
      }
    }

    if (Array.isArray(parsed)) {
      parsed = {};
    }

    if (provider === 'mpesa') {
      return {
        paybillNumber: parsed.paybillNumber || '',
        tillNumber: parsed.tillNumber || '',
        mpesaPhoneNumber: parsed.mpesaPhoneNumber || '',
        accountReference: parsed.accountReference || 'MWANCHA',
        instructions: parsed.instructions || ''
      };
    }

    if (provider === 'bank') {
      return {
        bankName: parsed.bankName || '',
        accountName: parsed.accountName || 'Mwancha Senior Community',
        accountNumber: parsed.accountNumber || '',
        branch: parsed.branch || '',
        swiftCode: parsed.swiftCode || '',
        instructions: parsed.instructions || ''
      };
    }

    if (provider === 'other') {
      return {
        methodTitle: parsed.methodTitle || 'Other Approved Methods',
        clientApprovedInstructions: parsed.clientApprovedInstructions || parsed.instructions || '',
        instructions: parsed.instructions || parsed.clientApprovedInstructions || '',
        notes: parsed.notes || ''
      };
    }

    return parsed;
  }

  async ensureDefaultMethods() {
    const existingOther = await prisma.donationConfiguration.findFirst({
      where: { paymentProvider: 'other' }
    });

    if (!existingOther) {
      await prisma.donationConfiguration.create({
        data: {
          paymentProvider: 'other',
          provider: 'other',
          name: 'Other Methods',
          instructions: 'Client-approved payment instructions for offline or institutional contributions.',
          details: JSON.stringify({
            methodTitle: 'Alternative and In-Person Contributions',
            clientApprovedInstructions: 'Contact the Mwancha Senior Community Secretariat for approved alternative donation options and fiduciary receipts.'
          }),
          isConfigured: false,
          isActive: false,
          statusMessage: 'Client-approved instructions to be configured by the administrator',
          status: ContentStatus.PUBLISHED,
          source: 'CUSTOM' as any,
          approvalRequired: false
        }
      });
    }
  }

  async getPublicMethods() {
    await this.ensureDefaultMethods();

    const methods = await prisma.donationConfiguration.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return methods.map(m => ({
      id: m.id,
      name: m.name,
      type: m.paymentProvider,
      paymentProvider: m.paymentProvider,
      details: this.formatDetails(m.paymentProvider, m.details),
      instructions: m.instructions,
      isConfigured: m.isConfigured,
      isActive: m.isActive,
      statusMessage: m.statusMessage,
      currency: m.currency,
      minimumAmount: m.minimumAmount,
      updatedAt: m.updatedAt
    }));
  }

  async getAdminConfigs() {
    await this.ensureDefaultMethods();

    const configs = await prisma.donationConfiguration.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return configs.map(c => ({
      ...c,
      details: this.formatDetails(c.paymentProvider, c.details)
    }));
  }

  async toggleStatus(id: string, isActive?: boolean, userId?: string) {
    const existing = await prisma.donationConfiguration.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Payment method not found');

    const newActive = isActive !== undefined ? isActive : !existing.isActive;

    const updated = await prisma.donationConfiguration.update({
      where: { id },
      data: {
        isActive: newActive,
        updatedById: userId,
        status: newActive ? ContentStatus.PUBLISHED : existing.status
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: newActive ? 'ACTIVATE_PAYMENT_METHOD' : 'DEACTIVATE_PAYMENT_METHOD',
        entity: 'DonationConfiguration',
        entityId: id,
        newData: JSON.stringify({
          isActive: newActive,
          provider: existing.paymentProvider,
          name: existing.name
        })
      }
    });

    return {
      ...updated,
      details: this.formatDetails(updated.paymentProvider, updated.details)
    };
  }

  async updateConfig(id: string, data: any, userId?: string) {
    const existing = await prisma.donationConfiguration.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Payment method not found');

    const updateData: any = {
      updatedById: userId
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.paymentProvider !== undefined) updateData.paymentProvider = data.paymentProvider;
    if (data.instructions !== undefined) updateData.instructions = data.instructions;
    if (data.statusMessage !== undefined) updateData.statusMessage = data.statusMessage;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.status !== undefined) updateData.status = data.status;

    if (data.details !== undefined) {
      const detailsObj = typeof data.details === 'string' ? JSON.parse(data.details || '{}') : data.details;
      updateData.details = JSON.stringify(detailsObj);

      const hasPaybill = Boolean(detailsObj.paybillNumber?.trim());
      const hasTill = Boolean(detailsObj.tillNumber?.trim());
      const hasPhone = Boolean(detailsObj.mpesaPhoneNumber?.trim());
      const hasBank = Boolean(detailsObj.accountNumber?.trim() || detailsObj.bankName?.trim());
      const hasOther = Boolean(detailsObj.clientApprovedInstructions?.trim());

      updateData.isConfigured = hasPaybill || hasTill || hasPhone || hasBank || hasOther;
    }

    if (data.isConfigured !== undefined) {
      updateData.isConfigured = Boolean(data.isConfigured);
    }

    const updated = await prisma.donationConfiguration.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_DONATION_CONFIG',
        entity: 'DonationConfiguration',
        entityId: id,
        newData: JSON.stringify({
          name: updated.name,
          isActive: updated.isActive,
          isConfigured: updated.isConfigured,
          provider: updated.paymentProvider
        })
      }
    });

    return {
      ...updated,
      details: this.formatDetails(updated.paymentProvider, updated.details)
    };
  }

  async createConfig(data: any, userId?: string) {
    const detailsObj = typeof data.details === 'string' ? JSON.parse(data.details || '{}') : (data.details || {});
    const detailsStr = JSON.stringify(detailsObj);

    const hasPaybill = Boolean(detailsObj.paybillNumber?.trim());
    const hasTill = Boolean(detailsObj.tillNumber?.trim());
    const hasPhone = Boolean(detailsObj.mpesaPhoneNumber?.trim());
    const hasBank = Boolean(detailsObj.accountNumber?.trim() || detailsObj.bankName?.trim());
    const hasOther = Boolean(detailsObj.clientApprovedInstructions?.trim());

    const created = await prisma.donationConfiguration.create({
      data: {
        name: data.name || 'Payment Method',
        paymentProvider: data.paymentProvider || 'other',
        provider: data.paymentProvider || 'other',
        instructions: data.instructions || '',
        details: detailsStr,
        currency: data.currency || 'KES',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : false,
        isConfigured: hasPaybill || hasTill || hasPhone || hasBank || hasOther,
        statusMessage: data.statusMessage || '',
        status: ContentStatus.PUBLISHED,
        createdById: userId,
        approvalRequired: false
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_DONATION_CONFIG',
        entity: 'DonationConfiguration',
        entityId: created.id,
        newData: JSON.stringify({
          name: created.name,
          provider: created.paymentProvider,
          isActive: created.isActive
        })
      }
    });

    return {
      ...created,
      details: this.formatDetails(created.paymentProvider, created.details)
    };
  }

  async deleteConfig(id: string, userId?: string) {
    const existing = await prisma.donationConfiguration.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Payment method not found');

    await prisma.donationConfiguration.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE_DONATION_CONFIG',
        entity: 'DonationConfiguration',
        entityId: id,
        newData: JSON.stringify({
          provider: existing.paymentProvider,
          name: existing.name
        })
      }
    });

    return { success: true, message: 'Payment method removed' };
  }

  async submitInKindDonation(data: any) {
    const referenceNumber = `INKIND-${Date.now().toString().slice(-6)}`;
    const categoryLabel = data.donationCategory || 'Food & Donation Materials';
    const deliveryMethodLabel = data.deliveryMethod === 'DROP_OFF_EKERENYO' 
      ? 'Drop-off at Mwancha House - Ekerenyo' 
      : 'Request Field Volunteer Collection';

    const submission = await prisma.contactSubmission.create({
      data: {
        referenceNumber,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        subject: `[IN-KIND DONATION]: ${categoryLabel} (${deliveryMethodLabel})`,
        message: `Donor Type: ${data.donorType || 'Individual'}\nCategory: ${categoryLabel}\nItems Description: ${data.itemDescription}\nEstimated Quantity: ${data.estimatedQuantity || 'Not specified'}\nDelivery Method: ${deliveryMethodLabel}\nPickup/Dropoff Address: ${data.pickupAddress || 'Mwancha House - Ekerenyo, Ekerenyo-Obwari-Magwagwa Road'}\nPreferred Date: ${data.preferredDate || 'Flexible'}\nNotes: ${data.notes || 'None'}`,
        consent: data.consent ?? true,
        status: ContactStatus.NEW
      }
    });

    await mailService.sendEmail({
      to: data.email,
      subject: `Mwancha Senior Community: In-Kind Donation Pledge Received [${referenceNumber}]`,
      html: emailTemplates.inKindDonationReceived(data.fullName, categoryLabel, data.deliveryMethod, referenceNumber)
    });

    await mailService.sendEmail({
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: `[IN-KIND DONATION PLEDGE]: ${categoryLabel} from ${data.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h3 style="color: #1E3A2F;">New Food & Material Donation Pledge Registered</h3>
          <ul>
            <li><strong>Donor Name:</strong> ${data.fullName}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Phone:</strong> ${data.phone}</li>
            <li><strong>Category:</strong> ${categoryLabel}</li>
            <li><strong>Items:</strong> ${data.itemDescription}</li>
            <li><strong>Quantity:</strong> ${data.estimatedQuantity || 'N/A'}</li>
            <li><strong>Delivery Method:</strong> ${deliveryMethodLabel}</li>
            <li><strong>Pickup Address / Notes:</strong> ${data.pickupAddress || data.notes || 'N/A'}</li>
            <li><strong>Reference ID:</strong> ${referenceNumber}</li>
          </ul>
        </div>
      `
    });

    await prisma.notification.create({
      data: {
        title: `In-Kind Donation: ${categoryLabel}`,
        message: `Pledged by ${data.fullName} (${deliveryMethodLabel})`,
        type: 'DONATION',
        link: `/admin/forms/contacts/${submission.id}`
      }
    });

    return {
      success: true,
      message: 'Thank you for your generous in-kind contribution! Your pledge has been registered and our team will coordinate the handover.',
      referenceNumber,
      submissionId: submission.id
    };
  }
}

export const donationService = new DonationService();
