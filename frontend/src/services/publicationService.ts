import { apiClient } from './api';
import { ContentStatus } from '../types';

export interface PublicationChapter {
  title: string;
  body: string;
}

export interface PublicationItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  content: string;
  fullText: string;
  coverImage?: string;
  pdfUrl?: string;
  fileSize?: string;
  pages?: number;
  readingTime?: string;
  isbn?: string;
  chapters?: PublicationChapter[];
  authorName: string;
  authorRole: string;
  category: string;
  type: 'Book' | 'Policy Brief' | 'Field Manual' | 'Annual Report' | 'Research Paper' | 'Article' | string;
  tags: string[];
  isFeatured: boolean;
  status: ContentStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationInput {
  title: string;
  subtitle?: string;
  slug?: string;
  summary: string;
  content?: string;
  coverImage?: string;
  pdfUrl?: string;
  fileSize?: string;
  pages?: number;
  readingTime?: string;
  isbn?: string;
  authorName?: string;
  authorRole?: string;
  category?: string;
  type?: string;
  tags?: string[];
  chapters?: PublicationChapter[];
  isFeatured?: boolean;
  status?: string;
}

class PublicationService {
  private baseEndpoint = '/publications';

  // Public: Get all publications
  async getPublicPublications(params?: { category?: string; search?: string }): Promise<PublicationItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return apiClient.get(`${this.baseEndpoint}${qs ? `?${qs}` : ''}`);
  }

  // Public: Get publication by slug for reading & export
  async getPublicPublicationBySlug(slug: string): Promise<PublicationItem> {
    return apiClient.get(`${this.baseEndpoint}/${slug}`);
  }

  // Admin: Get all publications
  async getAdminPublications(): Promise<PublicationItem[]> {
    return apiClient.get(`${this.baseEndpoint}/admin/all`);
  }

  // Admin: Get publication by ID
  async getPublicationById(id: string): Promise<PublicationItem> {
    return apiClient.get(`${this.baseEndpoint}/admin/item/${id}`);
  }

  // Admin: Create publication / publish book
  async createPublication(data: PublicationInput): Promise<PublicationItem> {
    return apiClient.post(`${this.baseEndpoint}/admin/create`, data);
  }

  // Admin: Update publication
  async updatePublication(id: string, data: Partial<PublicationInput>): Promise<PublicationItem> {
    return apiClient.put(`${this.baseEndpoint}/admin/update/${id}`, data);
  }

  // Admin: Delete publication
  async deletePublication(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/admin/delete/${id}`);
  }

  // Admin: Publish
  async publishPublication(id: string): Promise<PublicationItem> {
    return apiClient.post(`${this.baseEndpoint}/admin/publish/${id}`, {});
  }

  // Admin: Approve
  async approvePublication(id: string): Promise<PublicationItem> {
    return apiClient.post(`${this.baseEndpoint}/admin/approve/${id}`, {});
  }
}

export const publicationService = new PublicationService();
