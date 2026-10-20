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
  hasPrivatePdf?: boolean;
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
  accessType: 'FREE' | 'PAID';
  isPaid: boolean;
  price: number;
  currency: string;
  previewExcerpt?: string;
  isEntitled?: boolean;
  downloadCount?: number;
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
  description?: string;
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
  accessType?: 'FREE' | 'PAID';
  price?: number;
  currency?: string;
  previewExcerpt?: string;
  status?: string;
}

export interface CustomerPurchasedItem {
  purchaseId: string;
  publicationId: string;
  slug: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  pricePaid: number;
  currency: string;
  referenceCode: string;
  mpesaReceipt?: string;
  purchaseDate: string;
  downloadToken?: string;
  downloadsUsed: number;
  maxDownloads: number;
}

class PublicationService {
  private baseEndpoint = '/publications';

  // Public: Get all publications
  async getPublicPublications(params?: { category?: string; search?: string; accessType?: string }): Promise<PublicationItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.accessType) query.set('accessType', params.accessType);
    const qs = query.toString();
    return apiClient.get(`${this.baseEndpoint}${qs ? `?${qs}` : ''}`);
  }

  // Public: Get publication by slug for reading & export
  async getPublicPublicationBySlug(slug: string, customerEmail?: string): Promise<PublicationItem> {
    const qs = customerEmail ? `?customerEmail=${encodeURIComponent(customerEmail)}` : '';
    return apiClient.get(`${this.baseEndpoint}/${slug}${qs}`);
  }

  // Customer: Get personal purchased publications library
  async getCustomerLibrary(email: string): Promise<CustomerPurchasedItem[]> {
    return apiClient.get(`${this.baseEndpoint}/customer/library?email=${encodeURIComponent(email)}`);
  }

  // Download authenticated publication PDF
  getDownloadUrl(publicationId: string, token?: string, email?: string): string {
    const query = new URLSearchParams();
    if (token) query.set('token', token);
    if (email) query.set('email', email);
    const qs = query.toString();
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    return `${apiUrl}${this.baseEndpoint}/${publicationId}/download${qs ? `?${qs}` : ''}`;
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

  // Admin: Upload official PDF file to private storage
  async uploadPrivatePdf(id: string, file: File): Promise<PublicationItem> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${this.baseEndpoint}/admin/${id}/upload-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
