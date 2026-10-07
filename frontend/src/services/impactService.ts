import { apiClient } from './api';

export interface ImpactMetric {
  id: string;
  organizationId?: string;
  label: string;
  name?: string;
  value: string;
  unit?: string;
  description?: string;
  category?: 'beneficiaries' | 'volunteers' | 'coverage' | 'operations' | string;
  icon?: string;
  source?: string;
  sourceDocument?: string;
  reportingPeriod?: string;
  status?: string;
  approvalRequired?: boolean;
  displayOrder?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  metadata?: any;
}

export interface ImpactMetricsResponse {
  metrics: ImpactMetric[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ImpactService {
  private baseEndpoint = '/impact';

  /**
   * Get published impact metrics for public display
   */
  async getPublicMetrics(): Promise<ImpactMetric[]> {
    return apiClient.get(`${this.baseEndpoint}/metrics`);
  }

  /**
   * Get impact metrics by category (public)
   */
  async getMetricsByCategory(category: string): Promise<ImpactMetric[]> {
    return apiClient.get(`${this.baseEndpoint}/metrics?category=${category}`);
  }

  // Admin methods (protected)

  /**
   * Get all impact metrics for admin (includes drafts, pending approval, etc.)
   */
  async getAdminMetrics(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ImpactMetric[]> {
    const query = new URLSearchParams();
    
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString();
    const res = await apiClient.get<any>(`${this.baseEndpoint}/admin/metrics${queryString ? `?${queryString}` : ''}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.metrics)) return res.metrics;
    return [];
  }

  /**
   * Get impact metric by ID (admin)
   */
  async getMetricById(id: string): Promise<ImpactMetric> {
    return apiClient.get(`${this.baseEndpoint}/admin/metrics/${id}`);
  }

  /**
   * Create new impact metric (admin)
   */
  async createMetric(data: Omit<ImpactMetric, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImpactMetric> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics`, data);
  }

  /**
   * Update impact metric (admin)
   */
  async updateMetric(id: string, data: Partial<ImpactMetric>): Promise<ImpactMetric> {
    return apiClient.put(`${this.baseEndpoint}/admin/metrics/${id}`, data);
  }

  /**
   * Delete impact metric (admin)
   */
  async deleteMetric(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/admin/metrics/${id}`);
  }

  /**
   * Submit metric for review (admin)
   */
  async submitForReview(id: string, notes?: string): Promise<ImpactMetric> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics/${id}/submit`, { notes });
  }

  /**
   * Approve metric (admin with permission)
   */
  async approveMetric(id: string, notes?: string): Promise<ImpactMetric> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics/${id}/approve`, { notes });
  }

  /**
   * Request changes to metric (admin with permission)
   */
  async requestChanges(id: string, notes: string): Promise<ImpactMetric> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics/${id}/request-changes`, { notes });
  }

  /**
   * Publish metric (admin with permission)
   */
  async publishMetric(id: string): Promise<ImpactMetric> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics/${id}/publish`, {});
  }

  /**
   * Archive metric (admin with permission)
   */
  async archiveMetric(id: string): Promise<ImpactMetric> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics/${id}/archive`, {});
  }

  /**
   * Reorder metrics (admin)
   */
  async reorderMetrics(metricIds: string[]): Promise<void> {
    return apiClient.post(`${this.baseEndpoint}/admin/metrics/reorder`, { metricIds });
  }

  /**
   * Get impact metrics statistics (admin)
   */
  async getMetricsStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    inReview: number;
    archived: number;
    byCategory: Record<string, number>;
  }> {
    return apiClient.get(`${this.baseEndpoint}/admin/metrics/stats`);
  }
}

export const impactService = new ImpactService();
export default impactService;