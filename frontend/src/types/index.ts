// Mwancha Senior Community (MSC) - Core Type Definitions

// 51.1 Content Status System
export type ContentStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

// 51.2 Development Content vs Approved Content
export type ContentSource =
  | 'official_profile'
  | 'client'
  | 'placeholder'
  | 'developer';

export interface ContentMetadata {
  status: ContentStatus;
  source: ContentSource;
  lastUpdated?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export interface ReviewableContentItem {
  id: string;
  title: string;
  contentType:
    | 'News Article'
    | 'Program'
    | 'Event'
    | 'Team Member'
    | 'Gallery Item'
    | 'Impact Statistic'
    | 'Testimonial'
    | 'Success Story'
    | 'Donation Information'
    | 'Organization Information'
    | 'Contact Information'
    | 'Homepage Content';
  metadata: ContentMetadata;
  summary?: string;
  author?: string;
  reviewer?: string;
  path?: string;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  summary?: string;
  description?: string;
  thematicArea?: string;
  objectives: string[];
  activities: string[];
  targetBeneficiaries: string[];
  approach: string;
  iconName: string;
  image: string;
  imageAlt: string;
  metricsHighlight?: string;
  relatedProgramSlugs?: string[];
  metadata?: ContentMetadata;
  featured: boolean;
  displayOrder: number;
  categoryId?: string | null;
  category?: any;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  category?: 'beneficiaries' | 'volunteers' | 'coverage' | 'operations' | string;
  metadata?: ContentMetadata;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string[];
  category: string;
  categoryId?: string | null;
  categoryRelation?: any;
  featuredImage: string;
  imageAlt: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
  isFeatured?: boolean;
  status?: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  source?: 'OFFICIAL_PROFILE' | 'CLIENT' | 'PLACEHOLDER' | 'DEVELOPER';
  seoTitle?: string;
  seoDescription?: string;
  metadata?: ContentMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  date?: string;
  time?: string;
  startDate?: string;
  endDate?: string | null;
  timeString?: string;
  location: string;
  county?: string;
  category: string;
  status: ContentStatus | 'upcoming' | 'completed' | 'ongoing' | string;
  image?: string | null;
  isRegistrationOpen?: boolean;
  registrationOpen?: boolean;
  registrationRequired?: boolean;
  registrationUrl?: string | null;
  organizer?: string;
  source?: ContentSource;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  metadata?: ContentMetadata;
  registrations?: any[];
}

export type Event = EventItem;

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: 'Board of Management' | 'Administrative Leadership' | 'Professional Staff' | 'Support Staff' | 'Community Workforce' | string;
  bio?: string;
  image?: string;
  responsibilities?: string;
  displayOrder?: number;
  isActive?: boolean;
  isPlaceholder?: boolean;
  status?: ContentStatus;
  metadata?: ContentMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  secureUrl?: string;
  url?: string;
  date?: string;
  location?: string;
  isPlaceholderNotice?: boolean;
  metadata?: ContentMetadata;
  status?: ContentStatus;
  altText?: string;
  photographer?: string;
  albumId?: string | null;
  album?: { id: string; name: string; slug: string } | null;
  consentConfirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type MediaItem = GalleryItem;

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: string;
  internalNotes?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface VolunteerApplication {
  id?: string;
  referenceNumber?: string;
  fullName: string;
  email: string;
  phone: string;
  county: string;
  subCounty?: string;
  areaOfInterest: string;
  availability: string;
  experience?: string;
  message: string;
  status?: string;
  reviewNotes?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface PartnershipRequest {
  id?: string;
  organization: string;
  organizationName?: string;
  contactPerson: string;
  email: string;
  phone: string;
  organizationType: string;
  areaOfInterest?: string;
  partnershipInterests?: string;
  website?: string;
  message: string;
  status?: string;
  reviewNotes?: string;
  submittedAt?: string;
  createdAt?: string;
}

export interface DonationMethod {
  id: string;
  name: string;
  type: 'mpesa' | 'bank' | 'online' | 'cheque';
  details: string[];
  instructions: string;
  isConfigured: boolean; // Set to false until official client accounts are attached
  statusMessage?: string;
  metadata?: ContentMetadata;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
