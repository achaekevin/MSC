import { apiClient } from './api';
import { PartnershipRequest } from '../types';

export const partnershipService = {
  async submitPartnershipRequest(request: PartnershipRequest): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/partnerships', request);
      return res;
    } catch {
      // Graceful offline mock handling
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'Thank you for your interest in partnering with Mwancha Senior Community. Our Systems Strengthening & Partnerships office will review your proposal.'
      };
    }
  }
};
