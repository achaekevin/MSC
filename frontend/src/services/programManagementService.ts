import { apiClient } from './api';
import { Program } from '../types';

export interface ProgramInput {
  title: string;
  slug?: string;
  shortDescription?: string;
  summary?: string;
  fullDescription?: string;
  description?: string;
  objectives: string[];
  activities: string[];
  targetBeneficiaries?: string[];
  targetPopulation?: string[];
  thematicArea?: string;
  approach?: string;
  iconName?: string;
  image: string;
  imageAlt: string;
  metricsHighlight?: string;
  relatedProgramSlugs?: string[];
  relatedSlugs?: string[];
  featured?: boolean;
  displayOrder?: number;
  categoryId?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  changeNote?: string;
}

export interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  _count?: {
    programs: number;
  };
}

export interface ProgramWithStatus extends Program {
  status: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  source?: 'OFFICIAL_PROFILE' | 'CLIENT' | 'PLACEHOLDER' | 'DEVELOPER';
  category?: ProgramCategory;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdById?: string;
  updatedById?: string;
}

export interface ProgramsListResponse {
  programs: ProgramWithStatus[];
  total: number;
  pages: number;
  currentPage: number;
}

class ProgramManagementService {
  private baseEndpoint = '/admin/programs';

  /**
   * Get all programs (admin view - all statuses with search and category filtering)
   */
  async getAllPrograms(
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
    categoryId?: string
  ): Promise<ProgramsListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (status && status !== 'ALL') {
      params.set('status', status);
    }
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    if (categoryId && categoryId !== 'ALL') {
      params.set('categoryId', categoryId);
    }

    const res = await apiClient.getWithMeta<ProgramWithStatus[]>(
      `${this.baseEndpoint}?${params.toString()}`
    );

    const items = Array.isArray(res.data) ? res.data : [];
    const total = res.pagination?.total ?? items.length;
    const pages = res.pagination?.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 1);
    const currentPage = res.pagination?.page ?? page;

    return {
      programs: items,
      total,
      pages,
      currentPage
    };
  }

  /**
   * Get all program categories
   */
  async getCategories(): Promise<ProgramCategory[]> {
    try {
      const res = await apiClient.get<ProgramCategory[]>(`${this.baseEndpoint}/categories`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  /**
   * Get single program for editing
   */
  async getProgram(id: string): Promise<ProgramWithStatus> {
    return apiClient.get<ProgramWithStatus>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create new program (saves as DRAFT)
   */
  async createProgram(data: ProgramInput): Promise<ProgramWithStatus> {
    const payload = {
      ...data,
      summary: data.summary || data.shortDescription,
      description: data.description || data.fullDescription,
      targetPopulation: data.targetPopulation || data.targetBeneficiaries || [],
      relatedSlugs: data.relatedSlugs || data.relatedProgramSlugs || []
    };
    return apiClient.post<ProgramWithStatus>(this.baseEndpoint, payload);
  }

  /**
   * Update existing program
   */
  async updateProgram(id: string, data: Partial<ProgramInput>): Promise<ProgramWithStatus> {
    const payload = {
      ...data,
      summary: data.summary || data.shortDescription,
      description: data.description || data.fullDescription,
      targetPopulation: data.targetPopulation || data.targetBeneficiaries,
      relatedSlugs: data.relatedSlugs || data.relatedProgramSlugs
    };
    return apiClient.put<ProgramWithStatus>(`${this.baseEndpoint}/${id}`, payload);
  }

  /**
   * Submit program for review (DRAFT -> IN_REVIEW)
   */
  async submitReview(id: string, reviewNotes?: string): Promise<ProgramWithStatus> {
    return apiClient.post<ProgramWithStatus>(`${this.baseEndpoint}/${id}/submit-review`, { reviewNotes });
  }

  /**
   * Approve program (IN_REVIEW -> APPROVED)
   */
  async approveProgram(id: string, reviewNotes?: string): Promise<ProgramWithStatus> {
    return apiClient.post<ProgramWithStatus>(`${this.baseEndpoint}/${id}/approve`, { reviewNotes });
  }

  /**
   * Publish program (APPROVED -> PUBLISHED)
   */
  async publishProgram(id: string): Promise<ProgramWithStatus> {
    return apiClient.post<ProgramWithStatus>(`${this.baseEndpoint}/${id}/publish`, {});
  }

  /**
   * Soft delete program
   */
  async deleteProgram(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Duplicate program
   */
  async duplicateProgram(id: string): Promise<ProgramWithStatus> {
    const existing = await this.getProgram(id);
    const newTitle = `${existing.title} (Copy)`;
    const newSlug = `${existing.slug}-copy-${Date.now()}`;
    return this.createProgram({
      ...existing,
      title: newTitle,
      slug: newSlug,
      displayOrder: (existing.displayOrder || 0) + 1
    });
  }

  /**
   * Get program statistics
   */
  async getProgramStats(): Promise<{
    total: number;
    draft: number;
    inReview: number;
    approved: number;
    published: number;
  }> {
    const res = await this.getAllPrograms(1, 100);
    const programs = res.programs || [];
    return {
      total: programs.length,
      draft: programs.filter(p => p.status === 'DRAFT').length,
      inReview: programs.filter(p => p.status === 'IN_REVIEW').length,
      approved: programs.filter(p => p.status === 'APPROVED').length,
      published: programs.filter(p => p.status === 'PUBLISHED').length
    };
  }

  /**
   * Bulk operations
   */
  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    for (const id of ids) {
      if (status === 'IN_REVIEW') {
        await this.submitReview(id);
      } else if (status === 'APPROVED') {
        await this.approveProgram(id);
      } else if (status === 'PUBLISHED') {
        await this.publishProgram(id);
      }
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteProgram(id);
    }
  }

  /**
   * Validate program slug uniqueness
   */
  async checkSlugAvailability(slug: string, excludeId?: string): Promise<{ available: boolean }> {
    try {
      const res = await this.getAllPrograms(1, 100);
      const exists = (res.programs || []).some(
        p => p.slug.toLowerCase() === slug.toLowerCase() && p.id !== excludeId
      );
      return { available: !exists };
    } catch {
      return { available: true };
    }
  }
}

export const programManagementService = new ProgramManagementService();
