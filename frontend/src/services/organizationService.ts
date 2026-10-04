import { apiClient } from './api';

export interface OrganizationProfile {
  id: string;
  name: string;
  formerName?: string;
  tagline: string;
  description?: string;
  legalStatus: string;
  address: string;
  postalCode?: string;
  county: string;
  country: string;
  email: string;
  phone?: string;
  helpline?: string;
  vision: string;
  mission: string;
  values?: string;
  history?: string;
  coreGoal: string;
  geographicScope: string;
  isActive: boolean;
  status: string;
  source: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationValue {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  status: string;
}

export interface OrganizationHistory {
  id: string;
  year: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface OrganizationContact {
  id: string;
  type: string; // EMAIL, PHONE, ADDRESS, SOCIAL, WEBSITE
  label: string;
  value: string;
  isPrimary: boolean;
  isPublic: boolean;
}

export interface OrganizationStructureNode {
  id: string;
  parentId?: string;
  name?: string;
  title: string;
  roleType?: string;
  description?: string;
  displayOrder: number;
  status: string;
  children?: OrganizationStructureNode[];
}

class OrganizationService {
  private baseEndpoint = '/organization';

  /**
   * Get the main organization profile (public)
   */
  async getProfile(): Promise<OrganizationProfile> {
    return apiClient.get(`${this.baseEndpoint}/profile`);
  }

  /**
   * Get organization values (public)
   */
  async getValues(): Promise<OrganizationValue[]> {
    return apiClient.get(`${this.baseEndpoint}/values`);
  }

  /**
   * Get organization history timeline (public)
   */
  async getHistory(): Promise<OrganizationHistory[]> {
    return apiClient.get(`${this.baseEndpoint}/history`);
  }

  /**
   * Get public contact information
   */
  async getContacts(): Promise<OrganizationContact[]> {
    return apiClient.get(`${this.baseEndpoint}/contacts`);
  }

  /**
   * Get organizational structure/governance (public)
   */
  async getStructure(): Promise<OrganizationStructureNode[]> {
    return apiClient.get(`${this.baseEndpoint}/structure`);
  }

  // Admin methods (protected)
  
  /**
   * Update organization profile (admin only)
   */
  async updateProfile(data: Partial<OrganizationProfile>): Promise<OrganizationProfile> {
    return apiClient.put(`${this.baseEndpoint}/profile`, data);
  }

  /**
   * Create organization value (admin only)
   */
  async createValue(data: Omit<OrganizationValue, 'id'>): Promise<OrganizationValue> {
    return apiClient.post(`${this.baseEndpoint}/values`, data);
  }

  /**
   * Update organization value (admin only)
   */
  async updateValue(id: string, data: Partial<OrganizationValue>): Promise<OrganizationValue> {
    return apiClient.put(`${this.baseEndpoint}/values/${id}`, data);
  }

  /**
   * Delete organization value (admin only)
   */
  async deleteValue(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/values/${id}`);
  }

  /**
   * Create history entry (admin only)
   */
  async createHistoryEntry(data: Omit<OrganizationHistory, 'id'>): Promise<OrganizationHistory> {
    return apiClient.post(`${this.baseEndpoint}/history`, data);
  }

  /**
   * Update history entry (admin only)
   */
  async updateHistoryEntry(id: string, data: Partial<OrganizationHistory>): Promise<OrganizationHistory> {
    return apiClient.put(`${this.baseEndpoint}/history/${id}`, data);
  }

  /**
   * Delete history entry (admin only)
   */
  async deleteHistoryEntry(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/history/${id}`);
  }

  /**
   * Update contact information (admin only)
   */
  async updateContact(id: string, data: Partial<OrganizationContact>): Promise<OrganizationContact> {
    return apiClient.put(`${this.baseEndpoint}/contacts/${id}`, data);
  }

  /**
   * Create contact entry (admin only)
   */
  async createContact(data: Omit<OrganizationContact, 'id'>): Promise<OrganizationContact> {
    return apiClient.post(`${this.baseEndpoint}/contacts`, data);
  }

  /**
   * Delete contact entry (admin only)
   */
  async deleteContact(id: string): Promise<void> {
    return apiClient.delete(`${this.baseEndpoint}/contacts/${id}`);
  }
}

export const organizationService = new OrganizationService();
export default organizationService;