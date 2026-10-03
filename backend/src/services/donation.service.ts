import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus } from '@prisma/client';

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
}

export const donationService = new DonationService();
