import { apiClient } from './api';
import { DonationMethod } from '../types';
import { DONATION_METHODS_CONFIG } from '../data/donationData';

export const donationService = {
  async getDonationMethods(): Promise<DonationMethod[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: DonationMethod[] }>('/donations/methods');
      return res.data && res.data.length > 0 ? res.data : DONATION_METHODS_CONFIG;
    } catch {
      return DONATION_METHODS_CONFIG;
    }
  }
};
