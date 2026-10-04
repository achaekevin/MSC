import { useState, useEffect } from 'react';
import { organizationService, OrganizationProfile, OrganizationValue, OrganizationHistory, OrganizationContact } from '../services/organizationService';

// Hook for organization profile
export const useOrganizationProfile = () => {
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch organization profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const refetch = async () => {
    await fetchProfile();
  };

  return { profile, isLoading, error, refetch };
};

// Hook for organization values
export const useOrganizationValues = () => {
  const [values, setValues] = useState<OrganizationValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchValues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationService.getValues();
      setValues(data);
    } catch (err) {
      console.error('Failed to fetch organization values:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization values');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  return { values, isLoading, error, refetch: fetchValues };
};

// Hook for organization history
export const useOrganizationHistory = () => {
  const [history, setHistory] = useState<OrganizationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch organization history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, isLoading, error, refetch: fetchHistory };
};

// Hook for organization contacts
export const useOrganizationContacts = () => {
  const [contacts, setContacts] = useState<OrganizationContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationService.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to fetch organization contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization contacts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, isLoading, error, refetch: fetchContacts };
};

// Combined hook for all organization data
export const useOrganizationData = () => {
  const profile = useOrganizationProfile();
  const values = useOrganizationValues();
  const history = useOrganizationHistory();
  const contacts = useOrganizationContacts();

  const isLoading = profile.isLoading || values.isLoading || history.isLoading || contacts.isLoading;
  const hasError = !!(profile.error || values.error || history.error || contacts.error);
  const errors = [profile.error, values.error, history.error, contacts.error].filter(Boolean);

  const refetch = async () => {
    await Promise.all([
      profile.refetch(),
      values.refetch(),
      history.refetch(),
      contacts.refetch()
    ]);
  };

  return {
    profile: profile.profile,
    values: values.values,
    history: history.history,
    contacts: contacts.contacts,
    isLoading,
    hasError,
    errors,
    refetch
  };
};