import { apiClient } from './api';
import { Program } from '../types';
import { PROGRAMS_DATA } from '../data/programsData';

export interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

export interface ProgramsResponse {
  programs: Program[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ProgramService {
  private baseEndpoint = '/programs';

  // Public methods (no authentication required)
  
  /**
   * Get all published programs for public display
   */
  async getAll(): Promise<Program[]> {
    try {
      const res = await apiClient.get<any>(`${this.baseEndpoint}`);
      const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
      return list && list.length > 0 ? list : PROGRAMS_DATA;
    } catch {
      // Fallback to local structured data
      return PROGRAMS_DATA;
    }
  }

  /**
   * Get published program by slug for public display
   */
  async getBySlug(slug: string): Promise<Program | null> {
    try {
      const res = await apiClient.get<any>(`${this.baseEndpoint}/${slug}`);
      const item = res && res.slug ? res : (res?.data || null);
      if (item && item.slug) return item;
    } catch {
      // Fallback to static data
    }
    const found = PROGRAMS_DATA.find((p) => p.slug === slug);
    return found || null;
  }

  /**
   * Get program categories
   */
  async getCategories(): Promise<ProgramCategory[]> {
    try {
      return apiClient.get(`${this.baseEndpoint}/categories`);
    } catch {
      return []; // Fallback to empty array
    }
  }

  // Admin methods (authentication required)

  /**
   * Get programs for admin (includes drafts, pending approval, etc.)
   */
  async getAdminPrograms(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ProgramsResponse> {
    const query = new URLSearchParams();
    
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    return apiClient.get(`${this.baseEndpoint}/admin${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get program by ID for admin
   */
  async getProgramById(id: string): Promise<Program> {
    return apiClient.get(`${this.baseEndpoint}/admin/${id}`);
  }

  /**
   * Create new program
   */
  async createProgram(data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program> {
    return apiClient.post(`${this.baseEndpoint}/admin`, data);
  }

  /**
   * Update program
   */
  async updateProgram(id: string, data: Partial<Program>): Promise<Program> {
    return apiClient.put(`${this.baseEndpoint}/admin/${id}`, data);
  }

  /**
   * Delete program
   */
  async deleteProgram(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/admin/${id}`);
  }

  /**
   * Submit program for review
   */
  async submitForReview(id: string, notes?: string): Promise<Program> {
    return apiClient.post(`${this.baseEndpoint}/admin/${id}/submit`, { notes });
  }

  /**
   * Approve program
   */
  async approveProgram(id: string, notes?: string): Promise<Program> {
    return apiClient.post(`${this.baseEndpoint}/admin/${id}/approve`, { notes });
  }

  /**
   * Request changes to program
   */
  async requestChanges(id: string, notes: string): Promise<Program> {
    return apiClient.post(`${this.baseEndpoint}/admin/${id}/request-changes`, { notes });
  }

  /**
   * Publish program
   */
  async publishProgram(id: string): Promise<Program> {
    return apiClient.post(`${this.baseEndpoint}/admin/${id}/publish`, {});
  }

  /**
   * Archive program
   */
  async archiveProgram(id: string): Promise<Program> {
    return apiClient.post(`${this.baseEndpoint}/admin/${id}/archive`, {});
  }

  /**
   * Reorder programs
   */
  async reorderPrograms(programIds: string[]): Promise<void> {
    return apiClient.post(`${this.baseEndpoint}/admin/reorder`, { programIds });
  }

  /**
   * Create program category
   */
  async createCategory(data: Omit<ProgramCategory, 'id'>): Promise<ProgramCategory> {
    return apiClient.post(`${this.baseEndpoint}/admin/categories`, data);
  }

  /**
   * Update program category
   */
  async updateCategory(id: string, data: Partial<ProgramCategory>): Promise<ProgramCategory> {
    return apiClient.put(`${this.baseEndpoint}/admin/categories/${id}`, data);
  }

  /**
   * Delete program category
   */
  async deleteCategory(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/admin/categories/${id}`);
  }

  /**
   * Get program statistics
   */
  async getProgramStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    inReview: number;
    archived: number;
    byCategory: Record<string, number>;
  }> {
    return apiClient.get(`${this.baseEndpoint}/admin/stats`);
  }
}

export const programService = new ProgramService();
