import { z } from 'zod';

// Reusable Content Status and Source enums
export const contentStatusEnum = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED'
]);

export const contentSourceEnum = z.enum([
  'OFFICIAL_PROFILE',
  'CLIENT',
  'PLACEHOLDER',
  'DEVELOPER'
]);

// Organization update schema
export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  formerName: z.string().max(150).optional().nullable(),
  tagline: z.string().max(250).optional(),
  address: z.string().min(5).optional(),
  county: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  helpline: z.string().optional().nullable(),
  vision: z.string().min(10).optional(),
  mission: z.string().min(10).optional(),
  values: z.string().optional(), // JSON string array
  history: z.string().min(10).optional(),
  geographicScope: z.string().min(5).optional(),
  legalStatus: z.string().min(5).optional(),
  coreGoal: z.string().min(10).optional()
});

// Program creation and update
export const createProgramSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  summary: z.string().min(10).max(1000).optional(),
  shortDescription: z.string().min(10).max(1000).optional(),
  description: z.string().min(20).optional(),
  fullDescription: z.string().min(20).optional(),
  objectives: z.array(z.string()).min(1),
  activities: z.array(z.string()).min(1),
  targetPopulation: z.array(z.string()).min(1).optional(),
  targetBeneficiaries: z.array(z.string()).min(1).optional(),
  thematicArea: z.string().optional().nullable(),
  approach: z.string().optional().nullable(),
  iconName: z.string().default('HeartHandshake'),
  image: z.string().min(1, 'Image path or URL is required'),
  imageAlt: z.string().min(3).max(200),
  metricsHighlight: z.string().optional().nullable(),
  relatedSlugs: z.array(z.string()).optional(),
  relatedProgramSlugs: z.array(z.string()).optional(),
  displayOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  source: contentSourceEnum.default('OFFICIAL_PROFILE'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable()
}).refine(data => data.summary || data.shortDescription, {
  message: 'Summary or shortDescription is required',
  path: ['summary']
}).refine(data => data.description || data.fullDescription, {
  message: 'Description or fullDescription is required',
  path: ['description']
});

export const updateProgramSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  summary: z.string().min(10).max(1000).optional(),
  shortDescription: z.string().min(10).max(1000).optional(),
  description: z.string().min(20).optional(),
  fullDescription: z.string().min(20).optional(),
  objectives: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  targetPopulation: z.array(z.string()).optional(),
  targetBeneficiaries: z.array(z.string()).optional(),
  thematicArea: z.string().optional().nullable(),
  approach: z.string().optional().nullable(),
  iconName: z.string().optional(),
  image: z.string().min(1).optional(),
  imageAlt: z.string().min(3).max(200).optional(),
  metricsHighlight: z.string().optional().nullable(),
  relatedSlugs: z.array(z.string()).optional(),
  relatedProgramSlugs: z.array(z.string()).optional(),
  displayOrder: z.number().int().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  source: contentSourceEnum.optional(),
  changeNote: z.string().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable()
});

// News article creation and update
export const createNewsSchema = z.object({
  title: z.string().min(5).max(250),
  slug: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  summary: z.string().min(10).max(1000),
  content: z.union([z.string().min(20), z.array(z.string()).min(1)]),
  featuredImage: z.string().min(1, 'Featured image is required'),
  imageAlt: z.string().min(3).max(200),
  authorName: z.string().default('MSC Communications Unit'),
  authorRole: z.string().default('Communications & Outreach'),
  category: z.string().default('Community Story'),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  source: contentSourceEnum.default('OFFICIAL_PROFILE'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable()
});

export const updateNewsSchema = createNewsSchema.partial().extend({
  changeNote: z.string().optional()
});

// Event creation and update
export const createEventSchema = z.object({
  title: z.string().min(3).max(255),
  slug: z.string().optional(),
  description: z.string().min(10),
  location: z.string().min(3).max(255),
  county: z.string().default('Nyamira'),
  category: z.string().default('Community Outreach'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start date format'),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end date format').optional().nullable(),
  timeString: z.string().default('09:00 AM - 03:00 PM EAT'),
  isRegistrationOpen: z.boolean().default(true),
  registrationRequired: z.boolean().default(false),
  registrationUrl: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  organizer: z.string().default('Mwancha Senior Community'),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
  source: contentSourceEnum.default('OFFICIAL_PROFILE')
});

export const updateEventSchema = createEventSchema.partial();

// Team member creation and update
export const createTeamMemberSchema = z.object({
  name: z.string().min(2).max(100),
  position: z.string().min(2).max(150),
  department: z.string().min(2).max(100),
  biography: z.string().max(2000).optional(),
  photo: z.string().url().optional().or(z.literal('')),
  responsibilities: z.string().max(1000).optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isPlaceholder: z.boolean().default(true),
  source: contentSourceEnum.default('PLACEHOLDER')
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();

// Impact metric creation and update
export const createImpactMetricSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  label: z.string().min(1).max(150).optional(),
  value: z.string().min(1).max(50),
  unit: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  category: z.string().default('beneficiaries'),
  icon: z.string().default('Users'),
  source: contentSourceEnum.default('OFFICIAL_PROFILE'),
  sourceDocument: z.string().default('MSC Organizational Profile 2024'),
  reportingPeriod: z.string().default('2024-2026'),
  displayOrder: z.number().int().default(0),
  status: contentStatusEnum.optional()
}).refine(data => data.name || data.label, {
  message: 'Either name or label must be provided'
});

export const updateImpactMetricSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  label: z.string().min(1).max(150).optional(),
  value: z.string().min(1).max(50).optional(),
  unit: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  category: z.string().optional(),
  icon: z.string().optional(),
  source: contentSourceEnum.optional(),
  sourceDocument: z.string().optional(),
  reportingPeriod: z.string().optional(),
  displayOrder: z.number().int().optional(),
  status: contentStatusEnum.optional(),
  changeNote: z.string().optional()
});

// Testimonial creation and update schemas
export const createTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  roleRelationship: z.string().min(2).max(100),
  quote: z.string().min(10).max(1000),
  photo: z.string().url().optional().or(z.literal('')),
  source: contentSourceEnum.default('CLIENT'),
  consentGiven: z.boolean().default(false),
  displayOrder: z.number().int().default(0)
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

// Success story creation and update schemas
export const createStorySchema = z.object({
  title: z.string().min(3, 'Title is required').max(255),
  summary: z.string().max(1000).optional(),
  story: z.string().optional(),
  coverImage: z.string().optional(),
  situation: z.string().optional(),
  intervention: z.string().optional(),
  outcome: z.string().optional(),
  relatedProgram: z.string().optional(),
  media: z.array(z.string()).optional(),
  images: z.array(z.string()).optional().default([]),
  beneficiaryConsent: z.boolean().default(false),
  privacyStatus: z.enum(['anonymized', 'identified_with_consent']).default('anonymized'),
  location: z.string().default('Nyamira County'),
  date: z.string().optional(),
  source: contentSourceEnum.default('OFFICIAL_PROFILE')
});

export const updateStorySchema = createStorySchema.partial();

