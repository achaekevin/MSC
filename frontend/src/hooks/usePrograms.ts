import { useState, useEffect } from 'react';
import { programService, ProgramCategory } from '../services/programService';
import { Program } from '../types';

// Hook for public programs
export const usePublicPrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await programService.getAll();
      setPrograms(data);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch programs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  return { programs, isLoading, error, refetch: fetchPrograms };
};

// Hook for single program by slug
export const useProgramBySlug = (slug: string) => {
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgram = async () => {
    if (!slug) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await programService.getBySlug(slug);
      setProgram(data);
      
      if (!data) {
        setError('Program not found');
      }
    } catch (err) {
      console.error('Failed to fetch program:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch program');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [slug]);

  return { program, isLoading, error, refetch: fetchProgram };
};

// Hook for program categories
export const useProgramCategories = () => {
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await programService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch program categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch program categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, isLoading, error, refetch: fetchCategories };
};

// Hook for organized programs by category
export const useProgramsByCategory = () => {
  const { programs, isLoading, error, refetch } = usePublicPrograms();
  const { categories } = useProgramCategories();

  const organizedPrograms = programs.reduce((acc, program) => {
    const categoryName = program.categoryId 
      ? categories.find(c => c.id === program.categoryId)?.name || 'Uncategorized'
      : 'Uncategorized';
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  // Sort programs within each category by displayOrder
  Object.keys(organizedPrograms).forEach(category => {
    organizedPrograms[category].sort((a, b) => a.displayOrder - b.displayOrder);
  });

  return {
    programs,
    organizedPrograms,
    categories,
    isLoading,
    error,
    refetch
  };
};

// Hook for featured programs
export const useFeaturedPrograms = () => {
  const { programs, isLoading, error, refetch } = usePublicPrograms();

  const featuredPrograms = programs
    .filter(program => program.featured)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return { featuredPrograms, isLoading, error, refetch };
};