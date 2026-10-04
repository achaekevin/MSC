import { apiClient } from './api';

export interface WorkflowAction {
  action: 'SUBMIT' | 'APPROVE' | 'REQUEST_CHANGES' | 'PUBLISH';
  notes?: string;
  timestamp: string;
  performedBy: string;
}

export interface ReviewHistory {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  previousStatus: string;
  currentStatus: string;
  notes?: string;
  reviewedBy?: string;
  createdAt: string;
}

class ContentWorkflowService {
  private baseEndpoint = '/api/admin';

  /**
   * Submit content for review (DRAFT → IN_REVIEW)
   */
  async submitForReview(
    entityType: string,
    entityId: string,
    notes?: string
  ): Promise<void> {
    return apiClient.post(
      `${this.baseEndpoint}/${entityType.toLowerCase()}/${entityId}/submit-review`,
      { notes }
    );
  }

  /**
   * Approve content (IN_REVIEW → APPROVED)
   */
  async approveContent(
    entityType: string,
    entityId: string,
    notes?: string
  ): Promise<void> {
    return apiClient.post(
      `${this.baseEndpoint}/review/${entityType}/${entityId}/approve`,
      { notes }
    );
  }

  /**
   * Request changes (IN_REVIEW → DRAFT with message)
   */
  async requestChanges(
    entityType: string,
    entityId: string,
    message: string
  ): Promise<void> {
    return apiClient.post(
      `${this.baseEndpoint}/review/${entityType}/${entityId}/request-changes`,
      { message }
    );
  }

  /**
   * Publish content (APPROVED → PUBLISHED)
   */
  async publishContent(
    entityType: string,
    entityId: string,
    notes?: string
  ): Promise<void> {
    return apiClient.post(
      `${this.baseEndpoint}/review/${entityType}/${entityId}/publish`,
      { notes }
    );
  }

  /**
   * Get review history for an entity
   */
  async getReviewHistory(
    entityType: string,
    entityId: string
  ): Promise<ReviewHistory[]> {
    return apiClient.get(
      `${this.baseEndpoint}/review/${entityType}/${entityId}/history`
    );
  }

  /**
   * Get pending approvals count
   */
  async getPendingApprovalsCount(): Promise<{ total: number; byType: Record<string, number> }> {
    return apiClient.get(`${this.baseEndpoint}/review/pending-count`);
  }

  /**
   * Get pending approvals (paginated)
   */
  async getPendingApprovals(
    page: number = 1,
    limit: number = 20,
    entityType?: string
  ): Promise<{
    items: Array<{ id: string; entityType: string; entityId: string; title: string; status: string; submittedAt: string }>;
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(entityType && { entityType })
    });

    return apiClient.get(`${this.baseEndpoint}/review/pending?${params}`);
  }

  /**
   * Get content status
   */
  async getContentStatus(entityType: string, entityId: string): Promise<{
    id: string;
    status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  }> {
    return apiClient.get(
      `${this.baseEndpoint}/${entityType.toLowerCase()}/${entityId}/status`
    );
  }
}

export const contentWorkflowService = new ContentWorkflowService();
