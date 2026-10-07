import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus, ContactStatus } from '@prisma/client';
import { mailService, emailTemplates } from '../config/mail.js';
import { env } from '../config/env.js';

export class DonationService {
  async getPublicMethods() {
    const methods = await prisma.donationConfiguration.findMany({
      where: {
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED, ContentStatus.CHANGES_REQUESTED] }
      },
      orderBy: { createdAt: 'asc' }
    });

    return methods.map(m => ({
      id: m.id,
      name: m.name,
      type: m.paymentProvider,
      details: JSON.parse(m.details || '[]'),
      instructions: m.instructions,
      isConfigured: m.isConfigured, // Kept false until client credentials supplied
      statusMessage: m.statusMessage
    }));
  }

  async getAdminConfigs() {
    const configs = await prisma.donationConfiguration.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return configs.map(c => ({
      ...c,
      details: JSON.parse(c.details || '[]')
    }));
  }

  async updateConfig(id: string, data: any, userId?: string) {
    const existing = await prisma.donationConfiguration.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Donation channel not found');

    const updated = await prisma.donationConfiguration.update({
      where: { id },
      data: {
        ...data,
        details: data.details ? JSON.stringify(data.details) : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_DONATION_CONFIG',
        entity: 'DonationConfiguration',
        entityId: id,
        newData: JSON.stringify(data)
      }
    });

    return {
      ...updated,
      details: JSON.parse(updated.details || '[]')
    };
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
