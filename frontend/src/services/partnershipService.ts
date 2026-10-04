import { apiClient } from './api';
import { PartnershipRequest } from '../types';

export const partnershipService = {
  async submitPartnershipRequest(request: PartnershipRequest): Promise<{ success: boolean; message: string; applicationId?: string }> {
    try {
      const payload = {
        organizationName: (request.organizationName || request.organization || '').trim(),
        contactPerson: request.contactPerson.trim(),
        email: request.email.trim(),
        phone: request.phone.trim(),
        organizationType: request.organizationType.trim(),
        partnershipInterests: (request.partnershipInterests || request.areaOfInterest || '').trim(),
        message: request.message.trim(),
        website: request.website ? request.website.trim() : '',
        consent: true
      };

      const res = await apiClient.post<any>('/partnerships/apply', payload);

      const successMessage =
        (typeof res === 'object' && res?.message) ||
        'Thank you for your interest in partnering with Mwancha Senior Community. Our Systems Strengthening & Partnerships office will review your proposal.';

      return {
        success: true,
        message: successMessage,
        applicationId: res?.applicationId
      };
    } catch (error: any) {
      console.error('Partnership request submission error:', error);
      return {
        success: false,
        message: error.message || 'Unable to submit your proposal at this time. Please try again or write directly to mwachahomeforelderly@gmail.com.'
      };
    }
  }
};
