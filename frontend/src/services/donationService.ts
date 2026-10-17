import { apiClient } from './api';
import { DonationMethod, InKindDonationRequest } from '../types';
import { DONATION_METHODS_CONFIG } from '../data/donationData';

export const donationService = {
  async getDonationMethods(): Promise<DonationMethod[]> {
    try {
      const res = await apiClient.get<any>('/donations/methods');
      const items = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return items && items.length > 0 ? items : DONATION_METHODS_CONFIG;
    } catch {
      return DONATION_METHODS_CONFIG;
    }
  },

  async getAdminPaymentSettings(): Promise<DonationMethod[]> {
    const res = await apiClient.get<any>('/admin/donations/config');
    return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
  },

  async updatePaymentSetting(id: string, data: any): Promise<DonationMethod> {
    const res = await apiClient.put<any>(`/admin/donations/config/${id}`, data);
    return res?.data !== undefined ? res.data : res;
  },

  async togglePaymentMethodStatus(id: string, isActive?: boolean): Promise<DonationMethod> {
    const res = await apiClient.patch<any>(`/admin/donations/config/${id}/toggle`, {
      isActive
    });
    return res?.data !== undefined ? res.data : res;
  },

  async createPaymentSetting(data: any): Promise<DonationMethod> {
    const res = await apiClient.post<any>('/admin/donations/config', data);
    return res?.data !== undefined ? res.data : res;
  },

  async deletePaymentSetting(id: string): Promise<void> {
    await apiClient.delete(`/admin/donations/config/${id}`);
  },

  async submitInKindDonation(data: InKindDonationRequest): Promise<{ success: boolean; message: string; referenceNumber?: string }> {
    try {
      const {
        fullName = '',
        email = '',
        phone = '',
        donorType = 'Individual',
        donationCategory,
        itemDescription = '',
        estimatedQuantity = '',
        deliveryMethod,
        pickupAddress = '',
        preferredDate = '',
        notes = '',
        consent = true,
        ...spamFields
      } = data as any;

      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        donorType: donorType || 'Individual',
        donationCategory,
        itemDescription: itemDescription.trim(),
        estimatedQuantity: estimatedQuantity?.trim() || '',
        deliveryMethod,
        pickupAddress: pickupAddress?.trim() || '',
        preferredDate: preferredDate?.trim() || '',
        notes: notes?.trim() || '',
        consent: consent !== undefined ? consent : true,
        ...spamFields
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

