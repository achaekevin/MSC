import fs from 'fs';
import path from 'path';
import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/AppError.js';
import { ContentStatus, ContentSource, PublicationAccessType } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Default authentic MSC publications — based on Kenyan laws, policies, and MSC's mission
const DEFAULT_MSC_PUBLICATIONS = [
  {
    id: 'pub-dignified-ageing-blueprint',
    slug: 'dignified-ageing-in-kenya-strategic-blueprint',
    title: 'Advancing Dignified Ageing in Kenya: A Community-Centred Framework',
    subtitle: 'Exploring Constitutional Protections, Social Protection Mechanisms, and Grassroots Intervention Models for Older Persons',
    summary: 'This policy framework examines the constitutional, legal, and social structures that govern the welfare of older persons in Kenya. Drawing on established legislation such as Article 57 of the Constitution and the National Policy on Older Persons and Ageing, it outlines a community-centred approach to elder care and proposes practical recommendations for strengthening support systems at the county and grassroots levels.',
    category: 'Book',
    type: 'Book',
    authorName: 'MSC Research & Policy Directorate',
    authorRole: 'Policy & Social Protection Unit',
    coverImage: '/images/mwancha-facility-main.jpg',
    pdfUrl: '',
    fileSize: '3.2 MB',
    pages: 42,
    readingTime: '40 min read',
    isbn: 'Doc Ref: MSC-PB-2024-01',
    tags: ['Policy Brief', 'Elder Rights', 'Social Protection', 'Kenya', 'Constitution'],
    isFeatured: true,
    accessType: PublicationAccessType.FREE,
    price: 0.00,
    currency: 'KES',
    previewExcerpt: 'Article 57 of the Constitution of Kenya mandates that the State shall take measures to ensure the rights of older members of society to fully participate, live in dignity, and be free from abuse. This blueprint outlines practical grassroots implementation mechanisms.',
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-06-15'),
    chapters: [
      {
        title: 'Chapter 1: The Demographic Transition and Ageing in Kenya',
        body: `Kenya, like many countries across sub-Saharan Africa, is experiencing a demographic transition characterised by gradually increasing life expectancy and a growing population of persons aged 60 years and above. The Kenya National Bureau of Statistics (KNBS) has consistently documented this shift through successive national census exercises, including the 2019 Kenya Population and Housing Census. As the proportion of older persons grows, the need for targeted social protection, healthcare, and community support systems becomes increasingly urgent.\n\nHistorically, the extended family system served as the primary safety net for older persons in Kenyan communities. Grandparents, aunts, uncles, and other relatives provided mutual care, shared resources, and ensured that no elderly family member was left without support. However, accelerating urbanisation, internal labour migration, and economic pressures have significantly weakened these traditional structures. Many older persons in rural areas, including those in Nyamira County where Mwancha Senior Community operates, now find themselves living alone or heading households that include orphaned and vulnerable children (OVC).\n\nThe challenges are compounded by the fact that most older persons in rural Kenya spent their working years in the informal economy — subsistence farming, small-scale trade, and casual labour — without access to contributory pension schemes. As a result, they enter old age without savings, pension income, or health insurance. The government's Older Persons Cash Transfer programme (OPCT, commonly known as Inua Jamii) provides a lifeline for some, but coverage remains limited and the stipend may not fully address the complex needs of the most vulnerable elderly individuals.\n\nUnderstanding this demographic and socioeconomic context is essential for designing effective interventions. Any meaningful framework for supporting older persons must reckon with the realities of poverty, geographic isolation, weakened family networks, and the limitations of existing government programmes. Community-based organisations like Mwancha Senior Community are positioned to bridge some of these gaps through direct engagement, grassroots volunteer networks, and advocacy for stronger institutional responses.`
      },
      {
        title: 'Chapter 2: Constitutional and Legal Protections for Older Persons',
        body: `The Constitution of Kenya, promulgated in 2010, provides an explicit legal foundation for the rights of older persons. Article 57 of the Constitution states that the State shall take measures to ensure the rights of older members of society, including the right to participate fully in the affairs of society, to pursue their personal development, to live in dignity and respect and be free from abuse, and to receive reasonable care and assistance from the family and the State. These provisions represent a significant legal commitment and establish the basis upon which all policy and programmatic interventions for older persons should be built.\n\nBeyond Article 57, other constitutional provisions are directly relevant. Article 27 guarantees equality and freedom from discrimination, including on the basis of age. Article 43 enshrines economic and social rights, including the right to the highest attainable standard of health, accessible and adequate housing, and social security. Article 48 guarantees access to justice for all persons, which is particularly important for older persons who may face property disputes, abuse, or neglect.`
      }
    ]
  },
  {
    id: 'pub-grassroots-case-management-manual',
    slug: 'grassroots-elder-care-and-case-management-manual',
    title: 'Grassroots Elder Care & Case Management Field Guide',
    subtitle: 'A Practical Comprehensive Handbook for Ward Volunteers, Community Health Promoters, and Institutional Caregivers',
    summary: 'An operational field guide developed for use by Mwancha Senior Community\'s ward-based volunteers, community health promoters, and caregivers. Covers elder vulnerability assessment, home visits, psychosocial companionship, safeguarding against property dispossession, and medical referral protocols.',
    category: 'Field Manual',
    type: 'Field Manual',
    authorName: 'MSC Programs & Field Operations',
    authorRole: 'Care Coordination Secretariat',
    coverImage: '/images/mwancha-pavilion-gathering.jpg',
    pdfUrl: '',
    fileSize: '4.8 MB',
    pages: 68,
    readingTime: '55 min read',
    isbn: 'Doc Ref: MSC-SOP-2024-02',
    tags: ['Field Manual', 'Case Management', 'Volunteers', 'Safeguarding', 'Community Health'],
    isFeatured: true,
    accessType: PublicationAccessType.PAID,
    price: 350.00,
    currency: 'KES',
    previewExcerpt: 'Preview Sample: Module 1 covers foundational elder vulnerability identification, holistic needs assessments in rural households, and the establishment of trust between ward volunteers and vulnerable seniors.',
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-08-20'),
    chapters: [
      {
        title: 'Module 1: Understanding Elder Vulnerability and Needs Assessment (Sample Excerpt)',
        body: `The first step in any community-based elder care intervention is understanding who is most at risk and what forms their vulnerability takes. Vulnerability among older persons is multi-dimensional — it can encompass physical frailty, chronic illness, food insecurity, inadequate shelter, social isolation, psychological distress, and exposure to abuse or neglect. No single indicator can capture the full picture; rather, a comprehensive assessment must consider multiple interconnected factors.\n\nMSC's approach to needs assessment draws on principles outlined in Kenya's Community Health Strategy (CHS), which establishes the role of Community Health Promoters (CHPs, formerly Community Health Volunteers) in conducting household-level health assessments and referrals. Volunteers are trained to observe and document the overall condition of an older person's living environment, including the state of their dwelling, availability of food and clean water, the presence or absence of family caregivers, and any visible signs of physical decline or distress.`
      },
      {
        title: 'Module 2: Conducting Respectful and Effective Home Visits',
        body: `Home visits are the foundation of MSC's community-based elder care model. They provide the primary mechanism through which volunteers maintain regular contact with older persons, monitor their wellbeing, identify emerging needs, and offer companionship and emotional support. The quality and consistency of home visits directly determines the effectiveness of the entire intervention.`
      },
      {
        title: 'Module 3: Psychosocial Support and Peer Circles',
        body: `The psychosocial wellbeing of older persons is fundamental to dignified ageing. Depression, grief, anxiety, loneliness, and loss of purpose are common experiences among older persons, particularly those who have lost spouses or live alone.`
      },
      {
        title: 'Module 4: Safeguarding, Incident Response, and Legal Referral',
        body: `Safeguarding is a core responsibility. Older persons must be protected from financial exploitation, forced eviction, and harmful accusations. Legal referral pathways with the National Legal Aid Service (NLAS) and local administration provide crucial recourse.`
      }
    ]
  },
  {
    id: 'pub-handbook-senior-citizen-rights',
    slug: 'handbook-on-senior-citizen-rights-and-safeguards',
    title: 'Understanding Your Rights: A Guide for Older Persons in Kenya',
    subtitle: 'Constitutional Protections, Property Safeguards, Social Protection Entitlements, and How to Report Abuse',
    summary: 'A plain-language civic education guide explaining the legal rights and protections available to older persons under Kenyan law. Covers Article 57 guarantees, land registration cautions, succession protections, Inua Jamii social cash transfer entitlements, and legal aid channels.',
    category: 'Policy Brief',
    type: 'Policy Brief',
    authorName: 'MSC Advocacy & Civic Education Team',
    authorRole: 'Civic Education & Rights Awareness',
    coverImage: '/images/mwancha-community-grounds.jpg',
    pdfUrl: '',
    fileSize: '2.1 MB',
    pages: 28,
    readingTime: '25 min read',
    isbn: 'Doc Ref: MSC-LEG-2024-03',
    tags: ['Legal Rights', 'Constitution', 'Article 57', 'Property Rights', 'Advocacy', 'Inua Jamii'],
    isFeatured: false,
    accessType: PublicationAccessType.FREE,
    price: 0.00,
    currency: 'KES',
    previewExcerpt: 'A plain-language civic guide designed for community members and older persons explaining their constitutional entitlements, protection against unlawful disinheritance, and how to access justice.',
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-10-01'),
    chapters: [
      {
        title: 'Section 1: Your Constitutional Rights as an Older Person',
        body: `The Constitution of Kenya (2010) is the supreme law of the country. It recognises the rights of older persons in several important ways, and these rights cannot be taken away by any person, institution, or government agency.\n\nArticle 57 specifically requires the State to ensure older members of society fully participate in community life, pursue personal development, live in dignity free from abuse, and receive reasonable assistance from the family and the State.`
      },
      {
        title: 'Section 2: Protecting Your Land and Succession Rights',
        body: `Elderly widows and grandparents are sometimes targeted for fraudulent land transfers or coerced signatures. Under the Land Registration Act (No. 3 of 2012), older persons can lodge cautions at county registries to protect their interests.`
      }
    ]
  }
];

export class PublicationService {
  /**
   * Formats a database publication record into a clean client response
   * When `maskPaidContent` is true, the full chapters array is stripped to protect paid documents.
   */
  private formatPublication(pub: any, maskPaidContent = false) {
    let parsedTags: string[] = [];
    try {
      if (typeof pub.tags === 'string') {
        parsedTags = JSON.parse(pub.tags || '[]');
      } else if (Array.isArray(pub.tags)) {
        parsedTags = pub.tags;
      }
    } catch {
      parsedTags = [];
    }

    let parsedChapters: any[] = [];
    try {
      if (typeof pub.chapters === 'string') {
        parsedChapters = JSON.parse(pub.chapters || '[]');
      } else if (Array.isArray(pub.chapters)) {
        parsedChapters = pub.chapters;
      }
    } catch {
      parsedChapters = [];
    }

    const isPaid = pub.accessType === PublicationAccessType.PAID || (Number(pub.price) > 0);

    // If content should be masked (e.g. public viewer on a paid publication), provide only preview
    const exposedChapters = (maskPaidContent && isPaid)
      ? [
          {
            title: 'Sample Document Excerpt',
            body: pub.previewExcerpt || pub.summary
          }
        ]
      : parsedChapters.length > 0
      ? parsedChapters
      : [
          {
            title: 'Document Summary',
            body: pub.summary
          }
        ];

    return {
      id: pub.id,
      slug: pub.slug,
      title: pub.title,
      subtitle: pub.subtitle || '',
      summary: pub.summary,
      description: pub.description || pub.summary,
      content: pub.description || pub.summary,
      fullText: pub.description || pub.summary,
      category: pub.category,
      type: pub.type,
      authorName: pub.authorName,
      authorRole: pub.authorRole,
      coverImage: pub.coverImage || '/images/mwancha-facility-main.jpg',
      pdfUrl: isPaid ? '' : (pub.pdfUrl || ''), // Never expose raw URL for paid publications
      hasPrivatePdf: Boolean(pub.privateFileKey),
      fileSize: pub.fileSize || '2.5 MB',
      pages: pub.pages || 24,
      readingTime: pub.readingTime || '20 min read',
      isbn: pub.isbn || '',
      tags: parsedTags,
      isFeatured: Boolean(pub.isFeatured),
      accessType: pub.accessType || PublicationAccessType.FREE,
      isPaid,
      price: Number(pub.price || 0),
      currency: pub.currency || 'KES',
      previewExcerpt: pub.previewExcerpt || '',
      chapters: exposedChapters,
      maxDownloads: pub.maxDownloads || 10,
      downloadCount: pub.downloadCount || 0,
      status: pub.status,
      publishedAt: pub.publishedAt ? pub.publishedAt.toISOString() : pub.createdAt.toISOString(),
      createdAt: pub.createdAt.toISOString(),
      updatedAt: pub.updatedAt.toISOString()
    };
  }

  /**
   * Ensures default authentic MSC publications exist in the dedicated `publications` table
   */
  async ensureDefaultPublicationsSeeded() {
    try {
      for (const pub of DEFAULT_MSC_PUBLICATIONS) {
        const existing = await prisma.publication.findFirst({
          where: {
            OR: [{ id: pub.id }, { slug: pub.slug }]
          }
        });

        if (!existing) {
          await prisma.publication.create({
            data: {
              id: pub.id,
              title: pub.title,
              slug: pub.slug,
              subtitle: pub.subtitle,
              summary: pub.summary,
              description: pub.summary,
              category: pub.category,
              type: pub.type,
              authorName: pub.authorName,
              authorRole: pub.authorRole,
              coverImage: pub.coverImage,
              pdfUrl: pub.pdfUrl,
              fileSize: pub.fileSize,
              pages: pub.pages,
              readingTime: pub.readingTime,
              isbn: pub.isbn,
              tags: JSON.stringify(pub.tags),
              isFeatured: pub.isFeatured,
              accessType: pub.accessType,
              price: pub.price,
              currency: pub.currency,
              previewExcerpt: pub.previewExcerpt,
              chapters: JSON.stringify(pub.chapters),
              status: pub.status,
              publishedAt: pub.publishedAt
            }
          });
        }
      }
    } catch (err) {
      logger.error({ err }, 'Failed to seed default publications into publications table');
    }
  }

  /**
   * Retrieves all public publications with filtering
   */
  async getPublicPublications(params?: { category?: string; search?: string; accessType?: string }) {
    await this.ensureDefaultPublicationsSeeded();

    const where: any = {
      status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
      deletedAt: null
    };

    if (params?.category && params.category !== 'all') {
      where.category = params.category;
    }

    if (params?.accessType && params.accessType !== 'all') {
      where.accessType = params.accessType as PublicationAccessType;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { summary: { contains: params.search } },
        { authorName: { contains: params.search } }
      ];
    }

    const records = await prisma.publication.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }]
    });

    // Mask full content on collection listing
    return records.map((r) => this.formatPublication(r, true));
  }

  /**
   * Retrieves single public publication by slug
   * Protects paid document chapters by returning only approved preview unless free.
   */
  async getPublicPublicationBySlug(slug: string, customerEmail?: string) {
    await this.ensureDefaultPublicationsSeeded();

    const record = await prisma.publication.findUnique({
      where: { slug }
    });

    if (!record || record.deletedAt || (record.status !== ContentStatus.APPROVED && record.status !== ContentStatus.PUBLISHED)) {
      throw new NotFoundError('Publication not found.');
    }

    const isPaid = record.accessType === PublicationAccessType.PAID || Number(record.price) > 0;

    // Check if customer has a confirmed purchase entitlement
    let hasAccess = !isPaid;
    if (isPaid && customerEmail) {
      const entitlement = await prisma.purchaseEntitlement.findFirst({
        where: {
          publicationId: record.id,
          customerEmail: customerEmail.toLowerCase().trim(),
          isActive: true
        }
      });
      if (entitlement) hasAccess = true;
    }

    // If paid and not entitled, mask content
    const formatted = this.formatPublication(record, !hasAccess);
    return {
      ...formatted,
      isEntitled: hasAccess
    };
  }

  /**
   * Admin: Get all publications for management
   */
  async getAdminPublications() {
    await this.ensureDefaultPublicationsSeeded();

    const records = await prisma.publication.findMany({
      where: { deletedAt: null },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }]
    });

    return records.map((r) => this.formatPublication(r, false));
  }

  /**
   * Admin: Get publication by ID
   */
  async getPublicationById(id: string) {
    const record = await prisma.publication.findUnique({ where: { id } });
    if (!record || record.deletedAt) {
      throw new NotFoundError('Publication not found.');
    }
    return this.formatPublication(record, false);
  }

  /**
   * Admin: Create a new publication
   */
  async createPublication(data: any, userId?: string) {
    const slug = data.slug
      ? data.slug
      : await generateUniqueSlug(data.title, async (candidate) => {
          const exists = await prisma.publication.findUnique({ where: { slug: candidate } });
          return Boolean(exists);
        });
    const accessType = data.accessType === 'PAID' ? PublicationAccessType.PAID : PublicationAccessType.FREE;
    const price = accessType === PublicationAccessType.PAID ? Number(data.price || 0) : 0;

    const created = await prisma.publication.create({
      data: {
        title: data.title,
        slug,
        subtitle: data.subtitle || '',
        summary: data.summary,
        description: data.content || data.description || data.summary,
        category: data.category || 'Book',
        type: data.type || data.category || 'Book',
        authorName: data.authorName || 'MSC Editorial & Research Unit',
        authorRole: data.authorRole || 'Research & Knowledge Hub',
        coverImage: data.coverImage || '/images/mwancha-facility-main.jpg',
        pdfUrl: data.pdfUrl || '',
        fileSize: data.fileSize || '2.5 MB',
        pages: data.pages ? Number(data.pages) : 24,
        readingTime: data.readingTime || '20 min read',
        isbn: data.isbn || '',
        tags: JSON.stringify(data.tags || ['Publication', 'Resource']),
        isFeatured: Boolean(data.isFeatured),
        accessType,
        price,
        currency: data.currency || env.DEFAULT_CURRENCY || 'KES',
        previewExcerpt: data.previewExcerpt || data.summary.slice(0, 300),
        chapters: JSON.stringify(data.chapters || []),
        status: data.status || ContentStatus.APPROVED,
        publishedAt: data.status === ContentStatus.PUBLISHED ? new Date() : null,
        createdById: userId,
        updatedById: userId
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Publication',
        entityId: created.id,
        newData: JSON.stringify({ title: created.title, accessType, price })
      }
    }).catch(() => {});

    return this.formatPublication(created, false);
  }

  /**
   * Admin: Update existing publication
   */
  async updatePublication(id: string, data: any, userId?: string) {
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Publication not found.');
    }

    const updateData: any = {
      updatedById: userId
    };

    if (data.title) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.slug && data.slug !== existing.slug) updateData.slug = data.slug;
    if (data.summary) updateData.summary = data.summary;
    if (data.content !== undefined || data.description !== undefined) {
      updateData.description = data.content || data.description;
    }
    if (data.coverImage) updateData.coverImage = data.coverImage;
    if (data.authorName) updateData.authorName = data.authorName;
    if (data.authorRole) updateData.authorRole = data.authorRole;
    if (data.category) updateData.category = data.category;
    if (data.type) updateData.type = data.type;
    if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
    if (data.pages !== undefined) updateData.pages = Number(data.pages);
    if (data.readingTime) updateData.readingTime = data.readingTime;
    if (data.isbn !== undefined) updateData.isbn = data.isbn;
    if (data.fileSize) updateData.fileSize = data.fileSize;
    if (data.pdfUrl !== undefined) updateData.pdfUrl = data.pdfUrl;
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    if (data.chapters !== undefined) updateData.chapters = JSON.stringify(data.chapters);
    if (data.previewExcerpt !== undefined) updateData.previewExcerpt = data.previewExcerpt;

    if (data.accessType) {
      updateData.accessType = data.accessType === 'PAID' ? PublicationAccessType.PAID : PublicationAccessType.FREE;
      if (updateData.accessType === PublicationAccessType.FREE) {
        updateData.price = 0;
      }
    }

    if (data.price !== undefined) {
      updateData.price = Number(data.price);
    }

    if (data.currency) updateData.currency = data.currency;
    if (data.status) updateData.status = data.status;

    if (data.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.publication.update({
      where: { id: existing.id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'Publication',
        entityId: existing.id,
        newData: JSON.stringify(data)
      }
    }).catch(() => {});

    return this.formatPublication(updated, false);
  }

  /**
   * Admin: Publish publication
   */
  async publishPublication(id: string, userId?: string) {
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    const updated = await prisma.publication.update({
      where: { id: existing.id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: userId
      }
    });

    return this.formatPublication(updated, false);
  }

  /**
   * Admin: Approve publication
   */
  async approvePublication(id: string, userId?: string) {
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    const updated = await prisma.publication.update({
      where: { id: existing.id },
      data: {
        status: ContentStatus.APPROVED,
        updatedById: userId
      }
    });

    return this.formatPublication(updated, false);
  }

  /**
   * Admin: Soft-delete publication
   */
  async deletePublication(id: string, userId?: string) {
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    await prisma.publication.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        updatedById: userId
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Publication',
        entityId: existing.id
      }
    }).catch(() => {});

    return true;
  }

  /**
   * Saves a private PDF file to non-public server storage
   */
  async savePrivatePdf(publicationId: string, fileBuffer: Buffer, fileName: string) {
    const publication = await prisma.publication.findUnique({ where: { id: publicationId } });
    if (!publication) throw new NotFoundError('Publication not found.');

    const storageDir = path.resolve(process.cwd(), env.PRIVATE_STORAGE_PATH || './storage/private_publications');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const safeFileKey = `pub_${publication.id}_${Date.now()}.pdf`;
    const targetPath = path.join(storageDir, safeFileKey);

    fs.writeFileSync(targetPath, fileBuffer);

    const fileSizeFormatted = `${(fileBuffer.length / (1024 * 1024)).toFixed(1)} MB`;

    const updated = await prisma.publication.update({
      where: { id: publication.id },
      data: {
        privateFileKey: safeFileKey,
        fileSize: fileSizeFormatted
      }
    });

    return this.formatPublication(updated, false);
  }

  /**
   * Gated and authorized PDF streaming download
   * Verifies that the publication is either FREE or the user possesses an active entitlement.
   */
  async getDownloadStream(publicationIdOrSlug: string, downloadToken?: string, customerEmail?: string) {
    const publication = await prisma.publication.findFirst({
      where: {
        OR: [{ id: publicationIdOrSlug }, { slug: publicationIdOrSlug }],
        deletedAt: null
      }
    });

    if (!publication) {
      throw new NotFoundError('Publication not found.');
    }

    // 1. If publication is FREE, allow instant download
    if (publication.accessType === PublicationAccessType.FREE || Number(publication.price) === 0) {
      return this.resolveFileStream(publication);
    }

    // 2. For PAID publications, enforce purchase entitlement validation
    let entitlement = null;

    if (downloadToken) {
      entitlement = await prisma.purchaseEntitlement.findUnique({
        where: { downloadToken },
        include: { purchase: true }
      });
    } else if (customerEmail) {
      entitlement = await prisma.purchaseEntitlement.findFirst({
        where: {
          publicationId: publication.id,
          customerEmail: customerEmail.toLowerCase().trim(),
          isActive: true
        },
        include: { purchase: true }
      });
    }

    if (!entitlement || !entitlement.isActive) {
      throw new ForbiddenError('Unauthorized: A valid purchase entitlement or download token is required to access this publication.');
    }

    if (entitlement.publicationId !== publication.id) {
      throw new ForbiddenError('Token mismatch: This download token was issued for a different publication.');
    }

    if (entitlement.expiresAt && entitlement.expiresAt < new Date()) {
      throw new ForbiddenError('Download access has expired. Please contact MSC support.');
    }

    if (entitlement.downloadCount >= entitlement.maxDownloads) {
      throw new ForbiddenError(`Download limit of ${entitlement.maxDownloads} downloads exceeded for this purchase.`);
    }

    // Increment download counts
    await prisma.$transaction([
      prisma.purchaseEntitlement.update({
        where: { id: entitlement.id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadedAt: new Date()
        }
      }),
      prisma.publication.update({
        where: { id: publication.id },
        data: {
          downloadCount: { increment: 1 }
        }
      })
    ]);

    return this.resolveFileStream(publication);
  }

  /**
   * Internal helper to resolve file stream or throw informative error
   */
  private resolveFileStream(publication: any) {
    const storageDir = path.resolve(process.cwd(), env.PRIVATE_STORAGE_PATH || './storage/private_publications');

    if (publication.privateFileKey) {
      const filePath = path.join(storageDir, publication.privateFileKey);
      if (fs.existsSync(filePath)) {
        return {
          type: 'stream' as const,
          stream: fs.createReadStream(filePath),
          fileName: `${publication.slug}.pdf`,
          mimeType: 'application/pdf'
        };
      }
    }

    // If PDF was a direct URL
    if (publication.pdfUrl && publication.pdfUrl.startsWith('http')) {
      return {
        type: 'redirect' as const,
        redirectUrl: publication.pdfUrl
      };
    }

    throw new NotFoundError('The electronic PDF document for this publication is currently being finalized in the archives. Please contact support.');
  }

  /**
   * Retrieves all confirmed purchases for a customer email
   */
  async getCustomerLibrary(customerEmail: string) {
    const normalizedEmail = customerEmail.toLowerCase().trim();

    const purchases = await prisma.publicationPurchase.findMany({
      where: {
        customerEmail: normalizedEmail,
        accessGranted: true
      },
      include: {
        publication: true,
        entitlements: {
          where: { isActive: true }
        },
        transaction: {
          select: {
            referenceCode: true,
            providerReference: true,
            completedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return purchases.map((p) => {
      const ent = p.entitlements[0];
      return {
        purchaseId: p.id,
        publicationId: p.publication.id,
        slug: p.publication.slug,
        title: p.publication.title,
        subtitle: p.publication.subtitle,
        coverImage: p.publication.coverImage,
        pricePaid: Number(p.pricePaid),
        currency: p.currency,
        referenceCode: p.transaction.referenceCode,
        mpesaReceipt: p.transaction.providerReference,
        purchaseDate: p.transaction.completedAt || p.createdAt,
        downloadToken: ent?.downloadToken || null,
        downloadsUsed: ent?.downloadCount || 0,
        maxDownloads: ent?.maxDownloads || 10
      };
    });
  }
}

export const publicationService = new PublicationService();
