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

  const refreshAll = async () => {
    await Promise.all([
      organizationData.refetch(),
      impactData.refetch(),
      programsData.refetch()
    ]);
  };

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
  const { profile, isOrganizationLoading, organizationError } = useCMS();
  return { profile, isLoading: isOrganizationLoading, error: organizationError };
};

export const useOrganizationValues = () => {
  const { values, isOrganizationLoading, organizationError } = useCMS();
  return { values, isLoading: isOrganizationLoading, error: organizationError };
};

export const useOrganizationContacts = () => {
  const { contacts, isOrganizationLoading, organizationError } = useCMS();
  return { contacts, isLoading: isOrganizationLoading, error: organizationError };
};

export const useImpactMetrics = () => {
  const { impactMetrics, organizedMetrics, impactCategories, isImpactLoading, impactError } = useCMS();
  return { 
    metrics: impactMetrics, 
    organizedMetrics, 
    categories: impactCategories, 
    isLoading: isImpactLoading, 
    error: impactError 
  };
};

export const usePrograms = () => {
  const { programs, isProgramsLoading, programsError } = useCMS();
  return { programs, isLoading: isProgramsLoading, error: programsError };
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