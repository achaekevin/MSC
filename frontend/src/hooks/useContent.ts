import { useState, useEffect } from 'react';
import { contentService, ContentStats, ContentReview } from '../services/contentService';

// Hook for content dashboard stats
export const useContentStats = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contentService.getContentStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch content stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchStats };
};

// Hook for content requiring review
export const useContentForReview = (entityType?: string) => {
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await contentService.getContentForReview({ entityType });
      setReviews(response.items);
    } catch (err) {
      console.error('Failed to fetch content for review:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content for review');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [entityType]);

  return { reviews, isLoading, error, refetch: fetchReviews };
};

// Hook for recent content activity
export const useRecentActivity = (limit = 10) => {
  const [activity, setActivity] = useState<{
    reviews: ContentReview[];
    revisions: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contentService.getRecentActivity(limit);
      setActivity(data);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activity');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [limit]);

  return { activity, isLoading, error, refetch: fetchActivity };
};

// Hook for content workflow settings
export const useContentWorkflow = () => {
  const [settings, setSettings] = useState<{
    requireReview: Record<string, boolean>;
    autoPublish: Record<string, boolean>;
    reviewerRoles: string[];
    approverRoles: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await contentService.getWorkflowSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch workflow settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch workflow settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<{
    requireReview: Record<string, boolean>;
    autoPublish: Record<string, boolean>;
    reviewerRoles: string[];
    approverRoles: string[];
  }>) => {
    try {
      await contentService.updateWorkflowSettings(newSettings);
      await fetchSettings(); // Refresh after update
    } catch (err) {
      console.error('Failed to update workflow settings:', err);
      throw err;
    }
  };

  return { settings, isLoading, error, refetch: fetchSettings, updateSettings };
};