import { useState, useEffect } from 'react';
import { impactService, ImpactMetric } from '../services/impactService';

// Hook for public impact metrics
export const usePublicImpactMetrics = () => {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await impactService.getPublicMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch impact metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch impact metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, isLoading, error, refetch: fetchMetrics };
};

// Hook for metrics by category
export const useImpactMetricsByCategory = (category: string) => {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await impactService.getMetricsByCategory(category);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch impact metrics by category:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch impact metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [category]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
};

// Hook for organizing metrics by category
export const useOrganizedImpactMetrics = () => {
  const { metrics, isLoading, error, refetch } = usePublicImpactMetrics();

  const organizedMetrics = metrics.reduce((acc, metric) => {
    const cat = metric.category || 'general';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(metric);
    return acc;
  }, {} as Record<string, ImpactMetric[]>);

  // Sort metrics within each category by displayOrder
  Object.keys(organizedMetrics).forEach(category => {
    organizedMetrics[category].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  });

  return { 
    metrics,
    organizedMetrics, 
    isLoading, 
    error, 
    refetch,
    categories: Object.keys(organizedMetrics)
  };
};