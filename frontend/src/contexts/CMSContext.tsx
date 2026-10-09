import React, { createContext, useContext, ReactNode } from 'react';
import { useOrganizationData } from '../hooks/useOrganization';
import { useOrganizedImpactMetrics } from '../hooks/useImpact';
import { usePublicPrograms } from '../hooks/usePrograms';
import { OrganizationProfile, OrganizationValue, OrganizationHistory, OrganizationContact } from '../services/organizationService';
import { ImpactMetric } from '../services/impactService';
import { Program } from '../types';

interface CMSContextType {
  // Organization data
  profile: OrganizationProfile | null;
  values: OrganizationValue[];
  history: OrganizationHistory[];
  contacts: OrganizationContact[];

  // Impact metrics
  impactMetrics: ImpactMetric[];
  organizedMetrics: Record<string, ImpactMetric[]>;
  impactCategories: string[];

  // Programs
  programs: Program[];

  // Loading states
  isOrganizationLoading: boolean;
  isImpactLoading: boolean;
  isProgramsLoading: boolean;
  isLoading: boolean;

  // Error states
  organizationError: string[];
  impactError: string | null;
  programsError: string | null;
  hasError: boolean;

  // Refresh functions
  refreshOrganization: () => Promise<void>;
  refreshImpact: () => Promise<void>;
  refreshPrograms: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

interface CMSProviderProps {
  children: ReactNode;
}

export const CMSProvider: React.FC<CMSProviderProps> = ({ children }) => {
  const organizationData = useOrganizationData();
  const impactData = useOrganizedImpactMetrics();
  const programsData = usePublicPrograms();

  const isLoading = organizationData.isLoading || impactData.isLoading || programsData.isLoading;
  const hasError = organizationData.hasError || !!impactData.error || !!programsData.error;

  const refreshAll = React.useCallback(async () => {
    await Promise.all([
      organizationData.refetch(),
      impactData.refetch(),
      programsData.refetch()
    ]);
  }, [organizationData.refetch, impactData.refetch, programsData.refetch]);

  React.useEffect(() => {
    const handleContentUpdated = () => {
      refreshAll();
    };
    window.addEventListener('msc_content_updated', handleContentUpdated);
    window.addEventListener('focus', handleContentUpdated);
    return () => {
      window.removeEventListener('msc_content_updated', handleContentUpdated);
      window.removeEventListener('focus', handleContentUpdated);
    };
  }, [refreshAll]);

  const value: CMSContextType = {
    // Organization data
    profile: organizationData.profile,
    values: organizationData.values,
    history: organizationData.history,
    contacts: organizationData.contacts,

    // Impact metrics
    impactMetrics: impactData.metrics,
    organizedMetrics: impactData.organizedMetrics,
    impactCategories: impactData.categories,

    // Programs
    programs: programsData.programs,

    // Loading states
    isOrganizationLoading: organizationData.isLoading,
    isImpactLoading: impactData.isLoading,
    isProgramsLoading: programsData.isLoading,
    isLoading,

    // Error states
    organizationError: organizationData.errors.filter((err): err is string => err !== null),
    impactError: impactData.error,
    programsError: programsData.error,
    hasError,

    // Refresh functions
    refreshOrganization: organizationData.refetch,
    refreshImpact: impactData.refetch,
    refreshPrograms: programsData.refetch,
    refreshAll
  };

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

// Utility hooks for common CMS operations

export const useOrganizationProfile = () => {
  const { profile, isOrganizationLoading, organizationError, refreshOrganization } = useCMS();
  return { profile, isLoading: isOrganizationLoading, error: organizationError, refetch: refreshOrganization };
};

export const useOrganizationValues = () => {
  const { values, isOrganizationLoading, organizationError, refreshOrganization } = useCMS();
  return { values, isLoading: isOrganizationLoading, error: organizationError, refetch: refreshOrganization };
};

export const useOrganizationContacts = () => {
  const { contacts, isOrganizationLoading, organizationError, refreshOrganization } = useCMS();
  return { contacts, isLoading: isOrganizationLoading, error: organizationError, refetch: refreshOrganization };
};

export const useImpactMetrics = () => {
  const { impactMetrics, organizedMetrics, impactCategories, isImpactLoading, impactError, refreshImpact } = useCMS();
  return { 
    metrics: impactMetrics, 
    organizedMetrics, 
    categories: impactCategories, 
    isLoading: isImpactLoading, 
    error: impactError,
    refetch: refreshImpact
  };
};

export const usePrograms = () => {
  const { programs, isProgramsLoading, programsError, refreshPrograms } = useCMS();
  return { programs, isLoading: isProgramsLoading, error: programsError, refetch: refreshPrograms };
};

export const useFeaturedPrograms = () => {
  const { programs } = useCMS();
  const featuredPrograms = programs
    .filter(program => program.featured)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  
  return { featuredPrograms };
};

export const useMissionVisionValues = () => {
  const { profile, values, isOrganizationLoading, organizationError } = useCMS();
  
  return {
    mission: profile?.mission,
    vision: profile?.vision,
    values,
    isLoading: isOrganizationLoading,
    error: organizationError
  };
};

export default CMSContext;