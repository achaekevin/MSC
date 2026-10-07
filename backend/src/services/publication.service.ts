import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

// Default authentic MSC seed publications
const DEFAULT_MSC_PUBLICATIONS = [
  {
    id: 'pub-dignified-ageing-blueprint',
    slug: 'dignified-ageing-in-kenya-strategic-blueprint',
    title: 'Advancing Dignified Ageing in Kenya: Strategic Policy Framework & Community Blueprint',
    subtitle: 'A Grassroots Perspective on Social Protection, Healthcare Access, and Intergenerational Equity',
    summary: 'A comprehensive institutional policy brief and strategic blueprint documenting the lived realities of vulnerable older persons in Kenya. Explores systemic gaps in social protection, grassroots respite care models, and recommendations for national policy alignment.',
    category: 'Book',
    type: 'Book',
    authorName: 'MSC Research & Policy Directorate',
    authorRole: 'Policy & Social Protection Unit',
    coverImage: '/images/mwancha-facility-main.jpg',
    pdfUrl: '/documents/dignified-ageing-kenya-blueprint.pdf',
    fileSize: '3.2 MB',
    pages: 44,
    readingTime: '35 min read',
    isbn: 'ISBN 978-9966-821-04-1',
    tags: ['Policy Brief', 'Elder Rights', 'National Mandate', 'Social Protection', 'Kenya'],
    isFeatured: true,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-06-15'),
    chapters: [
      {
        title: 'Chapter 1: The Landscape of Ageing in Kenya',
        body: `Kenya's demographic landscape is undergoing a critical demographic transition. With improvements in life expectancy and medical care, the population of persons aged 60 and above is expanding rapidly. Yet, customary communal safety nets—historically anchored within extended family structures—are under severe strain due to rapid urbanization, economic hardship, and generational poverty.\n\nOlder persons in rural and peri-urban settlements frequently encounter extreme isolation, multidimensional poverty, and total exclusion from formal social security systems. According to grassroots assessments conducted across Nyamira County and neighboring regions, over 70% of senior-headed households lack predictable income or comprehensive medical insurance coverage.`
      },
      {
        title: 'Chapter 2: The Core Vulnerabilities: Health, Nutrition & Shelter',
        body: `Chronic health challenges, particularly hypertension, diabetes, arthritis, and cognitive decline, disproportionately afflict older citizens. In many rural dispensaries, essential geriatric medicines are chronically stock-depleted, requiring vulnerable elders to travel vast distances on foot or forgo treatment entirely.\n\nSimultaneously, severe food insecurity and dilapidated mud-walled shelters exacerbate physical frailty. Mwancha Senior Community's case management intervention confirms that targeted nutritional supplementation and home weatherization produce an immediate 60% reduction in acute health distress among supported elders.`
      },
      {
        title: 'Chapter 3: Defense Against Abuse & Witchcraft Accusations',
        body: `One of the most harrowing perils confronting vulnerable elders in Western Kenya is the weaponization of witchcraft allegations. Land dispossession, greed, and cultural scapegoating frequently lead to horrifying violence against defenceless elderly men and women.\n\nMSC's community mobilization model pairs legal sensitization with local administrative barazas (Chifs, Nyumba Kumi, and religious leaders) to actively de-escalate community paranoia, defend property rights, and protect elders from violent eviction.`
      },
      {
        title: 'Chapter 4: The Grassroots Respite Care Model (The Ekerenyo Approach)',
        body: `Established in 2016 in Ekerenyo, MSC’s dual approach combines center-based respite care with ward-based mobile volunteer rolls. Rather than institutionalizing older citizens away from their ancestral homes, the Ekerenyo Model empowers trained community volunteers who reside within the same village to deliver weekly home check-ins, medication adherence monitoring, and psychosocial fellowship.\n\nThis preservation of familial continuity combined with structured professional oversight represents a cost-effective, culturally resonant blueprint for scale throughout Kenya.`
      },
      {
        title: 'Chapter 5: Policy Recommendations for National Stakeholders',
        body: `To achieve genuine social equity for senior citizens, MSC recommends:\n1. Universal, non-contributory social pension coverage for all Kenyans aged 65 and above, disbursed through accessible local channels without digital exclusion.\n2. Dedicated geriatric healthcare desks and subsidized chronic disease medications across all Level 3 and Level 4 county health facilities.\n3. Robust legal aid and swift prosecution frameworks for elder property dispossession and abuse.\n4. Formal county government budgetary allocation and technical partnership with community-based elder welfare organizations.`
      }
    ]
  },
  {
    id: 'pub-grassroots-case-management-manual',
    slug: 'grassroots-elder-care-and-case-management-manual',
    title: 'Grassroots Elder Care & Case Management Manual: The MSC Ekerenyo Model',
    subtitle: 'Standard Operating Procedures for Ward Volunteers, Community Health Promoters & Social Workers',
    summary: 'The operational manual utilized by Mwancha Senior Community’s 40 ward volunteers. Contains field screening checklists, psychosocial counseling guidelines, safeguarding protocols, and intergenerational referral pathways.',
    category: 'Field Manual',
    type: 'Field Manual',
    authorName: 'MSC Programs & Field Operations',
    authorRole: 'Care Coordination Secretariat',
    coverImage: '/images/mwancha-pavilion-gathering.jpg',
    pdfUrl: '/documents/msc-case-management-manual.pdf',
    fileSize: '2.8 MB',
    pages: 36,
    readingTime: '25 min read',
    isbn: 'MSC-SOP-2024-V2',
    tags: ['Field Manual', 'Case Management', 'Volunteers', 'Safeguarding', 'Mental Health'],
    isFeatured: true,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-08-20'),
    chapters: [
      {
        title: 'Module 1: Intake & Vulnerability Scoring',
        body: `Every elder referred to MSC undergoes a standardized 5-point vulnerability assessment evaluating: (a) physical mobility, (b) caregiver availability, (c) nutritional security, (d) shelter integrity, and (e) immediate psychological safety. Field workers must prioritize category 1 and 2 individuals living alone without relatives.`
      },
      {
        title: 'Module 2: Conducting Compassionate Home Visits',
        body: `Home visits must be conducted with the deepest cultural respect. Volunteers listen attentively without judgment, inspect living quarters for trip hazards or leaking roofs, verify that clean drinking water is accessible, and record any emerging physical symptoms.`
      },
      {
        title: 'Module 3: Psychosocial Fellowship & Healing Circles',
        body: `Loneliness is a profound contributor to rapid cognitive and physical decline. Group storytelling, barazas in shaded gathering pavilions, and intergenerational youth engagement restore purpose and vital social bonds for isolated seniors.`
      },
      {
        title: 'Module 4: Incident Escalation & Legal Protection',
        body: `Whenever suspected neglect, sexual violence, or property dispossession is identified, the volunteer must activate the MSC Emergency Protection Protocol within 4 hours, informing the MSC Secretariat and local government authorities simultaneously.`
      }
    ]
  },
  {
    id: 'pub-handbook-senior-citizen-rights',
    slug: 'handbook-on-senior-citizen-rights-and-safeguards',
    title: 'Handbook on Senior Citizen Rights & Safeguards in Kenya',
    subtitle: 'A Citizen’s Guide to the Kenyan Constitution (Article 57), Succession Law, and Human Rights',
    summary: 'An accessible legal and civic handbook explaining constitutional protections for older persons under Kenyan law, succession procedures, defense against unfair property seizure, and grievance reporting mechanisms.',
    category: 'Policy Brief',
    type: 'Policy Brief',
    authorName: 'MSC Legal & Advocacy Committee',
    authorRole: 'Civic Education & Rights Advocacy',
    coverImage: '/images/mwancha-fellowship-gathering.jpg',
    pdfUrl: '/documents/senior-citizen-rights-handbook.pdf',
    fileSize: '1.9 MB',
    pages: 28,
    readingTime: '20 min read',
    isbn: 'ISBN 978-9966-821-08-9',
    tags: ['Legal Rights', 'Constitution', 'Article 57', 'Property Rights', 'Advocacy'],
    isFeatured: false,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-10-01'),
    chapters: [
      {
        title: 'Section 1: Article 57 of the Constitution of Kenya',
        body: `Article 57 specifically commands the State to take legislative and policy measures ensuring older persons: (a) participate fully in society, (b) pursue personal development, (c) live in dignity, respect, and free from abuse, and (d) receive reasonable care and assistance from family and the State.`
      },
      {
        title: 'Section 2: Safeguarding Land & Family Inheritance',
        body: `Elderly widows and frail grandparents are most vulnerable to fraudulent land transfers and coerced signatures. This guide outlines how title deeds can be registered with family cautions and caveats at county land registries to prevent illegal dispossession.`
      },
      {
        title: 'Section 3: Reporting Abuse & Accessing Emergency Relief',
        body: `Provides emergency hotline numbers, police gender & vulnerable persons desks, and MSC field coordination hotlines for immediate community response.`
      }
    ]
  }
];

export class PublicationService {
  // Format database record into clean publication response
  private formatPublication(article: any) {
    let structured: any = {};
    let narrative = article.content;

    try {
      if (typeof article.content === 'string' && article.content.trim().startsWith('{')) {
        structured = JSON.parse(article.content);
        narrative = structured.narrative || structured.fullText || article.summary;
      }
    } catch {
      narrative = article.content;
    }

    let parsedTags: string[] = [];
    try {
      if (typeof article.tags === 'string') {
        parsedTags = JSON.parse(article.tags || '[]');
      } else if (Array.isArray(article.tags)) {
        parsedTags = article.tags;
      }
    } catch {
      parsedTags = [];
    }

    const chapters = structured.chapters && Array.isArray(structured.chapters) && structured.chapters.length > 0
      ? structured.chapters
      : [
          {
            title: 'Full Document Narrative',
            body: typeof narrative === 'string' ? narrative : article.summary
          }
        ];

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      subtitle: structured.subtitle || '',
      summary: article.summary,
      content: typeof narrative === 'string' ? narrative : article.summary,
      fullText: typeof narrative === 'string' ? narrative : article.summary,
      coverImage: article.featuredImage || '/images/mwancha-facility-main.jpg',
      pdfUrl: structured.pdfUrl || '',
      fileSize: structured.fileSize || '2.4 MB',
      pages: structured.pages || (chapters.length * 6),
      readingTime: structured.readingTime || `${Math.max(5, Math.ceil((article.summary?.length || 200) / 100) * 3)} min read`,
      isbn: structured.isbn || '',
      chapters,
      authorName: article.authorName || 'MSC Editorial & Research Unit',
      authorRole: article.authorRole || 'Research & Knowledge Hub',
      category: article.category || 'Book',
      type: structured.type || article.category || 'Book',
      tags: parsedTags,
      isFeatured: article.isFeatured,
      status: article.status,
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : article.createdAt.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    };
  }

  // Get all public publications
  async getPublicPublications(params?: { category?: string; search?: string }) {
    const publicationCategories = [
      'Book',
      'Policy Brief',
      'Field Manual',
      'Annual Report',
      'Research Paper',
      'Publication',
      'Article',
      'Guide'
    ];

    const where: any = {
      status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
      deletedAt: null,
      OR: [
        { category: { in: publicationCategories } },
        { tags: { contains: 'Publication' } },
        { tags: { contains: 'Book' } },
        { tags: { contains: 'Resource' } }
      ]
    };

    if (params?.category && params.category !== 'all') {
      where.category = params.category;
    }

    if (params?.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: params.search } },
            { summary: { contains: params.search } },
            { authorName: { contains: params.search } }
          ]
        }
      ];
    }

    const records = await prisma.newsArticle.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }]
    });

    if (records.length === 0 && (!params?.category || params.category === 'all') && !params?.search) {
      return DEFAULT_MSC_PUBLICATIONS.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.publishedAt.toISOString(),
        updatedAt: p.publishedAt.toISOString()
      }));
    }

    const formatted = records.map((r) => this.formatPublication(r));

    // If query matches some defaults, append unique ones
    if (formatted.length === 0 && !params?.category) {
      return DEFAULT_MSC_PUBLICATIONS.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.publishedAt.toISOString(),
        updatedAt: p.publishedAt.toISOString()
      }));
    }

    return formatted;
  }

  // Get public publication by slug
  async getPublicPublicationBySlug(slug: string) {
    const record = await prisma.newsArticle.findUnique({
      where: { slug }
    });

    if (record && !record.deletedAt && (record.status === ContentStatus.APPROVED || record.status === ContentStatus.PUBLISHED)) {
      return this.formatPublication(record);
    }

    // Check defaults
    const fallback = DEFAULT_MSC_PUBLICATIONS.find((p) => p.slug === slug);
    if (fallback) {
      return {
        ...fallback,
        publishedAt: fallback.publishedAt.toISOString(),
        createdAt: fallback.publishedAt.toISOString(),
        updatedAt: fallback.publishedAt.toISOString()
      };
    }

    throw new NotFoundError('Publication or book not found.');
  }

  // Get all admin publications
  async getAdminPublications() {
    const publicationCategories = [
      'Book',
      'Policy Brief',
      'Field Manual',
      'Annual Report',
      'Research Paper',
      'Publication',
      'Article',
      'Guide'
    ];

    const records = await prisma.newsArticle.findMany({
      where: {
        deletedAt: null,
        OR: [
          { category: { in: publicationCategories } },
          { tags: { contains: 'Publication' } },
          { tags: { contains: 'Book' } },
          { tags: { contains: 'Resource' } }
        ]
      },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }]
    });

    const dbPublications = records.map((r) => this.formatPublication(r));

    // Merge default seeds if database has no publications
    if (dbPublications.length === 0) {
      return DEFAULT_MSC_PUBLICATIONS.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.publishedAt.toISOString(),
        updatedAt: p.publishedAt.toISOString()
      }));
    }

    return dbPublications;
  }

  // Get single publication by ID for admin
  async getPublicationById(id: string) {
    const record = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (record && !record.deletedAt) {
      return this.formatPublication(record);
    }

    const fallback = DEFAULT_MSC_PUBLICATIONS.find((p) => p.id === id);
    if (fallback) {
      return {
        ...fallback,
        publishedAt: fallback.publishedAt.toISOString(),
        createdAt: fallback.publishedAt.toISOString(),
        updatedAt: fallback.publishedAt.toISOString()
      };
    }

    throw new NotFoundError('Publication not found.');
  }

  // Create new publication or book
  async createPublication(data: any, userId?: string) {
    const slug = data.slug || await generateUniqueSlug(data.title, async (candidate) => {
      const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });

    const structuredPayload = JSON.stringify({
      type: data.type || data.category || 'Book',
      subtitle: data.subtitle || '',
      pdfUrl: data.pdfUrl || '',
      fileSize: data.fileSize || '2.4 MB',
      pages: Number(data.pages) || 24,
      readingTime: data.readingTime || '20 min read',
      isbn: data.isbn || '',
      chapters: Array.isArray(data.chapters) ? data.chapters : [],
      narrative: typeof data.content === 'string' ? data.content : data.summary
    });

    const tagsArray = Array.isArray(data.tags)
      ? data.tags
      : ['Publication', 'Resource', data.category || 'Book'];

    const article = await prisma.newsArticle.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: structuredPayload,
        featuredImage: data.coverImage || '/images/mwancha-facility-main.jpg',
        imageAlt: data.title,
        authorName: data.authorName || 'MSC Editorial & Research Unit',
        authorRole: data.authorRole || 'Research & Knowledge Hub',
        category: data.category || 'Book',
        tags: JSON.stringify(tagsArray),
        isFeatured: Boolean(data.isFeatured),
        status: (data.status as ContentStatus) || ContentStatus.APPROVED,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : new Date(),
        createdById: userId,
        updatedById: userId
      } as any
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Publication',
        entityId: article.id,
        newData: JSON.stringify(data)
      }
    });

    return this.formatPublication(article);
  }

  // Update existing publication
  async updatePublication(id: string, data: any, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Publication not found.');
    }

    let existingStructured: any = {};
    try {
      if (typeof existing.content === 'string' && existing.content.trim().startsWith('{')) {
        existingStructured = JSON.parse(existing.content);
      }
    } catch {}

    const updatedStructured = JSON.stringify({
      ...existingStructured,
      type: data.type || data.category || existingStructured.type || 'Book',
      subtitle: data.subtitle !== undefined ? data.subtitle : existingStructured.subtitle,
      pdfUrl: data.pdfUrl !== undefined ? data.pdfUrl : existingStructured.pdfUrl,
      fileSize: data.fileSize || existingStructured.fileSize || '2.4 MB',
      pages: data.pages !== undefined ? Number(data.pages) : existingStructured.pages || 24,
      readingTime: data.readingTime || existingStructured.readingTime || '20 min read',
      isbn: data.isbn !== undefined ? data.isbn : existingStructured.isbn,
      chapters: data.chapters !== undefined ? data.chapters : existingStructured.chapters || [],
      narrative: data.content !== undefined ? data.content : existingStructured.narrative || existing.summary
    });

    const updateData: any = {
      updatedById: userId
    };

    if (data.title) updateData.title = data.title;
    if (data.summary) updateData.summary = data.summary;
    if (data.coverImage) updateData.featuredImage = data.coverImage;
    if (data.authorName) updateData.authorName = data.authorName;
    if (data.authorRole) updateData.authorRole = data.authorRole;
    if (data.category) updateData.category = data.category;
    if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
    if (data.status) updateData.status = data.status as ContentStatus;
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    updateData.content = updatedStructured;

    if (data.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: updateData
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'Publication',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Publication details updated by admin',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'Publication',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return this.formatPublication(updated);
  }

  // Publish publication
  async publishPublication(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: userId
      }
    });

    return this.formatPublication(updated);
  }

  // Approve publication
  async approvePublication(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        updatedById: userId
      }
    });

    return this.formatPublication(updated);
  }

  // Soft-delete publication
  async deletePublication(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    await prisma.newsArticle.update({
      where: { id },
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
        entityId: id
      }
    });

    return true;
  }
}

export const publicationService = new PublicationService();
