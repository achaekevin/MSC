import { useState, useCallback } from 'react';
import {
  programManagementService,
  ProgramInput,
  ProgramWithStatus,
  ProgramsListResponse
} from '../services/programManagementService';

interface UseProgramManagementReturn {
  // List operations
  programs: ProgramWithStatus[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoadingList: boolean;
  errorList: string | null;
  
  // Single program operations
  program: ProgramWithStatus | null;
  isLoadingProgram: boolean;
  errorProgram: string | null;

  // Action states
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;

  // List actions
  fetchPrograms: (page?: number, limit?: number, status?: string) => Promise<void>;
  
  // Single program actions
  fetchProgram: (id: string) => Promise<void>;
  saveProgram: (id: string | null, data: ProgramInput) => Promise<ProgramWithStatus>;
  deleteProgram: (id: string) => Promise<void>;
  duplicateProgram: (id: string) => Promise<ProgramWithStatus>;
  
  // Bulk actions
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  // Utilities
  checkSlugAvailability: (slug: string, excludeId?: string) => Promise<boolean>;
}

export const useProgramManagement = (): UseProgramManagementReturn => {
  // List state
  const [programs, setPrograms] = useState<ProgramWithStatus[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  // Single program state
  const [program, setProgram] = useState<ProgramWithStatus | null>(null);
  const [isLoadingProgram, setIsLoadingProgram] = useState(false);
  const [errorProgram, setErrorProgram] = useState<string | null>(null);

  // Action state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all programs
  const fetchPrograms = useCallback(
    async (page = 1, limit = 20, status?: string) => {
      setIsLoadingList(true);
      setErrorList(null);
      try {
        const response = await programManagementService.getAllPrograms(page, limit, status);
        setPrograms(response.programs);
        setTotal(response.total);
        setCurrentPage(page);
        setTotalPages(response.pages);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch programs';
        setErrorList(message);
        throw err;
      } finally {
        setIsLoadingList(false);
      }
    },
    []
  );

  // Fetch single program
  const fetchProgram = useCallback(async (id: string) => {
    setIsLoadingProgram(true);
    setErrorProgram(null);
    try {
      const data = await programManagementService.getProgram(id);
      setProgram(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch program';
      setErrorProgram(message);
      throw err;
    } finally {
      setIsLoadingProgram(false);
    }
  }, []);

  // Save program (create or update)
  const saveProgram = useCallback(
    async (id: string | null, data: ProgramInput): Promise<ProgramWithStatus> => {
      setIsSaving(true);
      setError(null);
      try {
        let result: ProgramWithStatus;
        
        if (id) {
          result = await programManagementService.updateProgram(id, data);
          setProgram(result);
        } else {
          result = await programManagementService.createProgram(data);
        }
        
        // Refresh list
        await fetchPrograms(currentPage);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save program';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [currentPage, fetchPrograms]
  );

  // Delete program
  const deleteProgram = useCallback(async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await programManagementService.deleteProgram(id);
      setProgram(null);
      // Refresh list
      await fetchPrograms(currentPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete program';
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [currentPage, fetchPrograms]);

  // Duplicate program
  const duplicateProgram = useCallback(
    async (id: string): Promise<ProgramWithStatus> => {
      setIsSaving(true);
      setError(null);
      try {
        const result = await programManagementService.duplicateProgram(id);
        await fetchPrograms(currentPage);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to duplicate program';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [currentPage, fetchPrograms]
  );

  // Bulk update status
  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: string) => {
      setIsSaving(true);
      setError(null);
      try {
        await programManagementService.bulkUpdateStatus(ids, status);
        await fetchPrograms(currentPage);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update programs';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [currentPage, fetchPrograms]
  );

  // Bulk delete
  const bulkDelete = useCallback(
    async (ids: string[]) => {
      setIsDeleting(true);
      setError(null);
      try {
        await programManagementService.bulkDelete(ids);
        await fetchPrograms(currentPage);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete programs';
        setError(message);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [currentPage, fetchPrograms]
  );

  // Check slug availability
  const checkSlugAvailability = useCallback(
    async (slug: string, excludeId?: string): Promise<boolean> => {
      try {
        const result = await programManagementService.checkSlugAvailability(slug, excludeId);
        return result.available;
      } catch (err) {
        console.error('Failed to check slug availability:', err);
        return false;
      }
    },
    []
  );

  return {
    // List
    programs,
    total,
    currentPage,
    totalPages,
    isLoadingList,
    errorList,
    
    // Single program
    program,
    isLoadingProgram,
    errorProgram,

    // Actions
    isSaving,
    isDeleting,
    error,

    // Methods
    fetchPrograms,
    fetchProgram,
    saveProgram,
    deleteProgram,
    duplicateProgram,
    bulkUpdateStatus,
    bulkDelete,
    checkSlugAvailability
  };
};
