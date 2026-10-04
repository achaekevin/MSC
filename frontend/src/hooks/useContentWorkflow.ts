import { useState, useCallback } from 'react';
import { contentWorkflowService, ReviewHistory } from '../services/contentWorkflowService';

export type ContentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';

interface ContentWorkflowState {
  status: ContentStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseContentWorkflowReturn {
  status: ContentStatus | null;
  history: ReviewHistory[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  submitForReview: (notes?: string) => Promise<void>;
  approveContent: (notes?: string) => Promise<void>;
  requestChanges: (message: string) => Promise<void>;
  publishContent: (notes?: string) => Promise<void>;
  
  // Utils
  refetch: () => Promise<void>;
  canSubmit: boolean;
  canApprove: boolean;
  canPublish: boolean;
}

export const useContentWorkflow = (
  entityType: string,
  entityId: string,
  userPermissions: string[] = []
): UseContentWorkflowReturn => {
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [history, setHistory] = useState<ReviewHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current status
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contentWorkflowService.getContentStatus(entityType, entityId);
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content status');
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  // Fetch review history
  const fetchHistory = useCallback(async () => {
    try {
      const data = await contentWorkflowService.getReviewHistory(entityType, entityId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch review history:', err);
    }
  }, [entityType, entityId]);

  // Submit for review (DRAFT → IN_REVIEW)
  const submitForReview = useCallback(
    async (notes?: string) => {
      setIsSubmitting(true);
      try {
        setError(null);
        await contentWorkflowService.submitForReview(entityType, entityId, notes);
        setStatus('IN_REVIEW');
        await fetchHistory();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit for review';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityType, entityId, fetchHistory]
  );

  // Approve content (IN_REVIEW → APPROVED)
  const approveContent = useCallback(
    async (notes?: string) => {
      setIsSubmitting(true);
      try {
        setError(null);
        await contentWorkflowService.approveContent(entityType, entityId, notes);
        setStatus('APPROVED');
        await fetchHistory();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to approve content';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityType, entityId, fetchHistory]
  );

  // Request changes (IN_REVIEW → DRAFT with message)
  const requestChanges = useCallback(
    async (message: string) => {
      setIsSubmitting(true);
      try {
        setError(null);
        await contentWorkflowService.requestChanges(entityType, entityId, message);
        setStatus('DRAFT');
        await fetchHistory();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to request changes';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityType, entityId, fetchHistory]
  );

  // Publish content (APPROVED → PUBLISHED)
  const publishContent = useCallback(
    async (notes?: string) => {
      setIsSubmitting(true);
      try {
        setError(null);
        await contentWorkflowService.publishContent(entityType, entityId, notes);
        setStatus('PUBLISHED');
        await fetchHistory();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to publish content';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [entityType, entityId, fetchHistory]
  );

  // Permission checks
  const canSubmit = status === 'DRAFT';
  const canApprove = status === 'IN_REVIEW' && userPermissions.includes('CONTENT_APPROVE');
  const canPublish = status === 'APPROVED' && userPermissions.includes('CONTENT_PUBLISH');

  return {
    status,
    history,
    isLoading,
    isSubmitting,
    error,
    submitForReview,
    approveContent,
    requestChanges,
    publishContent,
    refetch: async () => {
      await Promise.all([fetchStatus(), fetchHistory()]);
    },
    canSubmit,
    canApprove,
    canPublish
  };
};
