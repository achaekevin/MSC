import { apiClient } from './api';
import { DonationMethod, InKindDonationRequest } from '../types';
import { DONATION_METHODS_CONFIG } from '../data/donationData';

export const donationService = {
  async getDonationMethods(): Promise<DonationMethod[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: DonationMethod[] }>('/donations/methods');
      return res.data && res.data.length > 0 ? res.data : DONATION_METHODS_CONFIG;
    } catch {
      return DONATION_METHODS_CONFIG;
    }
  },

  async getAdminPaymentSettings(): Promise<DonationMethod[]> {
    const res = await apiClient.get<{ success: boolean; data: DonationMethod[] }>('/admin/donations/config');
    return res.data || [];
  },

  async updatePaymentSetting(id: string, data: any): Promise<DonationMethod> {
    const res = await apiClient.put<{ success: boolean; data: DonationMethod }>(`/admin/donations/config/${id}`, data);
    return res.data;
  },

  async togglePaymentMethodStatus(id: string, isActive?: boolean): Promise<DonationMethod> {
    const res = await apiClient.patch<{ success: boolean; data: DonationMethod }>(`/admin/donations/config/${id}/toggle`, {
      isActive
    });
    return res.data;
  },

  async createPaymentSetting(data: any): Promise<DonationMethod> {
    const res = await apiClient.post<{ success: boolean; data: DonationMethod }>('/admin/donations/config', data);
    return res.data;
  },

  async deletePaymentSetting(id: string): Promise<void> {
    await apiClient.delete(`/admin/donations/config/${id}`);
  },

  async submitInKindDonation(data: InKindDonationRequest): Promise<{ success: boolean; message: string; referenceNumber?: string }> {
    try {
      const payload = {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        donorType: data.donorType || 'Individual',
        donationCategory: data.donationCategory,
        itemDescription: data.itemDescription.trim(),
        estimatedQuantity: data.estimatedQuantity?.trim() || '',
        deliveryMethod: data.deliveryMethod,
        pickupAddress: data.pickupAddress?.trim() || '',
        preferredDate: data.preferredDate?.trim() || '',
        notes: data.notes?.trim() || '',
        consent: data.consent !== undefined ? data.consent : true
      };

      const res = await apiClient.post<any>('/donations/in-kind', payload);
      return {
        success: true,
        message: res?.message || 'Thank you for your generous in-kind donation pledge! Our team will get in touch to coordinate logistics.',
        referenceNumber: res?.referenceNumber
      };
    } catch (error: any) {
      console.error('In-kind donation submission error:', error);
      return {
        success: false,
        message: error.message || 'Unable to submit your pledge at this time. Please contact us directly at +254 790 629439 or mwanchacommunity.seniors@gmail.com.'
      };
    }
  }
};

