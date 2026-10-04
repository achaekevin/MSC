import { apiClient } from './api';

// Base content interface that all content types extend
export interface BaseContent {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  source: 'OFFICIAL_PROFILE' | 'CLIENT' | 'PLACEHOLDER' | 'DEVELOPER';
  approvalRequired: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdById?: string;
  updatedById?: string;
}

// Content review interface
export interface ContentReview {
  id: string;
  entityType: string;
  entityId: string;
  submittedById?: string;
  reviewedById?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  currentStatus?: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  previousStatus?: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  requestedAction?: string;
  notes?: string;
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Content revision interface
export interface ContentRevision {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  previousData?: string;
  newData?: string;
  changeNote?: string;
  changedById?: string;
  createdAt: string;
}

export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  changesRequested: number;
  approved: number;
  archived: number;
}

export interface ContentListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: ContentStats;
}

class ContentService {
  private baseEndpoint = '/admin/content';

  /**
   * Get content dashboard stats
   */
  async getContentStats(): Promise<ContentStats> {
    return apiClient.get(`${this.baseEndpoint}/stats`);
  }

  /**
   * Get content requiring review
   */
  async getContentForReview(params?: {
    page?: number;
    limit?: number;
    entityType?: string;
  }): Promise<ContentListResponse<ContentReview>> {
    const query = new URLSearchParams();
    
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.entityType) query.set('entityType', params.entityType);

    const queryString = query.toString();
    return apiClient.get(`${this.baseEndpoint}/reviews${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Submit content for review
   */
  async submitForReview(entityType: string, entityId: string, notes?: string): Promise<ContentReview> {
    return apiClient.post(`${this.baseEndpoint}/submit`, {
      entityType,
      entityId,
      notes
    });
  }

  /**
   * Review content (approve/request changes)
   */
  async reviewContent(reviewId: string, action: 'approve' | 'request_changes', notes?: string): Promise<ContentReview> {
    return apiClient.post(`${this.baseEndpoint}/reviews/${reviewId}/${action}`, { notes });
  }

  /**
   * Get content revision history
   */
  async getRevisions(entityType: string, entityId: string): Promise<ContentRevision[]> {
    return apiClient.get(`${this.baseEndpoint}/revisions/${entityType}/${entityId}`);
  }

  /**
   * Get content by status across all types
   */
  async getContentByStatus(status: string, params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    search?: string;
  }): Promise<ContentListResponse<BaseContent>> {
    const query = new URLSearchParams();
    query.set('status', status);
    
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.entityType) query.set('entityType', params.entityType);
    if (params?.search) query.set('search', params.search);

    return apiClient.get(`${this.baseEndpoint}?${query.toString()}`);
  }

  /**
   * Bulk update content status
   */
  async bulkUpdateStatus(contentIds: { entityType: string; entityId: string }[], status: string, notes?: string): Promise<void> {
    return apiClient.post(`${this.baseEndpoint}/bulk-update`, {
      contentIds,
      status,
      notes
    });
  }

  /**
   * Search content across all types
   */
  async searchContent(query: string, filters?: {
    entityType?: string;
    status?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ContentListResponse<BaseContent>> {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (filters?.entityType) params.set('entityType', filters.entityType);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.source) params.set('source', filters.source);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);

    return apiClient.get(`${this.baseEndpoint}/search?${params.toString()}`);
  }

  /**
   * Get recent content activity
   */
  async getRecentActivity(limit = 10): Promise<{
    reviews: ContentReview[];
    revisions: ContentRevision[];
  }> {
    return apiClient.get(`${this.baseEndpoint}/activity?limit=${limit}`);
  }

  /**
   * Clone content item
   */
  async cloneContent(entityType: string, entityId: string, newTitle?: string): Promise<BaseContent> {
    return apiClient.post(`${this.baseEndpoint}/clone`, {
      entityType,
      entityId,
      newTitle
    });
  }

  /**
   * Archive content
   */
  async archiveContent(entityType: string, entityId: string, reason?: string): Promise<void> {
    return apiClient.post(`${this.baseEndpoint}/archive`, {
      entityType,
      entityId,
      reason
    });
  }

  /**
   * Restore archived content
   */
  async restoreContent(entityType: string, entityId: string): Promise<void> {
    return apiClient.post(`${this.baseEndpoint}/restore`, {
      entityType,
      entityId
    });
  }

  /**
   * Get content workflow settings
   */
  async getWorkflowSettings(): Promise<{
    requireReview: Record<string, boolean>;
    autoPublish: Record<string, boolean>;
    reviewerRoles: string[];
    approverRoles: string[];
  }> {
    return apiClient.get(`${this.baseEndpoint}/workflow/settings`);
  }

  /**
   * Update content workflow settings (super admin only)
   */
  async updateWorkflowSettings(settings: {
    requireReview?: Record<string, boolean>;
    autoPublish?: Record<string, boolean>;
    reviewerRoles?: string[];
    approverRoles?: string[];
  }): Promise<void> {
    return apiClient.put(`${this.baseEndpoint}/workflow/settings`, settings);
  }
}

export const contentService = new ContentService();
export default contentService;