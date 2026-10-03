// Mwancha Senior Community (MSC) - Core Type Definitions

// 51.1 Content Status System
export type ContentStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published';

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
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  category?: 'beneficiaries' | 'volunteers' | 'coverage' | 'operations';
  metadata?: ContentMetadata;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string[];
  category: 'Community Story' | 'Organizational News' | 'Advocacy' | 'Events & Outreaches' | 'Partnerships';
  featuredImage: string;
  imageAlt: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
  isFeatured?: boolean;
  metadata?: ContentMetadata;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  county?: string;
  category: 'Community Sensitization' | 'Health Outreach' | 'Stakeholder Meeting' | 'Training';
  status: 'upcoming' | 'completed' | 'ongoing';
  image?: string;
  registrationOpen?: boolean;
  metadata?: ContentMetadata;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: 'Board of Management' | 'Administrative Leadership' | 'Professional Staff' | 'Support Staff' | 'Community Workforce';
  bio?: string;
  image?: string;
  isPlaceholder?: boolean;
  metadata?: ContentMetadata;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: 'Community Outreach' | 'Psychosocial Sessions' | 'Advocacy' | 'Home Visits' | 'Sensitization';
  imageUrl: string;
  date: string;
  location: string;
  isPlaceholderNotice?: boolean;
  metadata?: ContentMetadata;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt?: string;
}

export interface VolunteerApplication {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  county: string;
  subCounty?: string;
  areaOfInterest: string;
  availability: string;
  message: string;
  createdAt?: string;
}

export interface PartnershipRequest {
  id?: string;
  organization: string;
  contactPerson: string;
  email: string;
  phone: string;
  organizationType: string;
  areaOfInterest: string;
  message: string;
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
