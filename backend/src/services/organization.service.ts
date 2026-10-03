import { prisma } from '../config/database.js';
import { NotFoundError } from '../errors/AppError.js';
import { ContentStatus } from '@prisma/client';

export class OrganizationService {
  async getPublicOrganization() {
    const org = await prisma.organization.findFirst({
      where: {
        status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] }
      }
    });

    if (!org) {
      throw new NotFoundError('Organization profile data is currently pending client approval');
    }

    return {
      name: org.name,
      formerName: org.formerName,
      tagline: org.tagline,
      address: org.address,
      county: org.county,
      country: org.country,
      email: org.email,
      phone: org.phone,
      helpline: org.helpline,
      vision: org.vision,
      mission: org.mission,
      values: JSON.parse(org.values || '[]'),
      history: org.history,
      geographicScope: org.geographicScope,
      legalStatus: org.legalStatus,
      coreGoal: org.coreGoal
    };
  }

  async getAdminOrganization() {
    let org = await prisma.organization.findFirst();
    if (!org) {
      // Create baseline if empty
      org = await prisma.organization.create({
        data: {
          name: 'Mwancha Senior Community',
          formerName: 'Mwancha Home for the Elderly',
          tagline: 'Dignity, Care & Wellbeing for Older Persons',
          address: 'Headquarters, Nyamira County, Kenya',
          county: 'Nyamira',
          country: 'Kenya',
          email: 'info@mwanchasenior.org',
          vision: 'A Kenyan society where senior citizens live with respect, self-reliance, physical safety, and universal community care.',
          mission: 'To restore dignity, health, and holistic wellbeing for older persons while bridging intergenerational solidarity and protecting human rights.',
          values: JSON.stringify(['Integrity', 'Compassion', 'Dignity', 'Inclusivity', 'Accountability']),
          history: 'Established in 2016 as Mwancha Home for the Elderly, progressing to Mwancha Senior Community in 2024 to advance systemic impact.',
          coreGoal: 'Safeguard vulnerable older persons against neglect, abuse, and destitution through community-centered interventions.',
          status: ContentStatus.APPROVED
        }
      });
    }

    return {
      ...org,
      values: JSON.parse(org.values || '[]')
    };
  }

  async updateOrganization(data: any, userId?: string) {
    const existing = await prisma.organization.findFirst();
    const prevValues = existing ? JSON.stringify(existing) : null;

    const valuesFormatted = data.values && Array.isArray(data.values) 
      ? JSON.stringify(data.values) 
      : data.values;

    const updated = existing
      ? await prisma.organization.update({
          where: { id: existing.id },
          data: {
            ...data,
            values: valuesFormatted || undefined
          }
        })
      : await prisma.organization.create({
          data: {
            ...data,
            values: valuesFormatted || '[]'
          }
        });

    // Record revision & audit log
    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'Organization',
          entityId: updated.id,
          previousVal: prevValues,
          newVal: JSON.stringify(updated),
          changeNote: 'Administrative profile update',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'Organization',
          entityId: updated.id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return {
      ...updated,
      values: JSON.parse(updated.values || '[]')
    };
  }

  async getStructureNodes() {
    return prisma.organizationStructureNode.findMany({
      where: { status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] } },
      orderBy: { displayOrder: 'asc' },
      include: {
        children: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
  }
}

export const organizationService = new OrganizationService();
