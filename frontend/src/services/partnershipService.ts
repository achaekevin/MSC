import { apiClient } from './api';
import { PartnershipRequest } from '../types';

export const partnershipService = {
  async submitPartnershipRequest(request: PartnershipRequest): Promise<{ success: boolean; message: string; applicationId?: string }> {
    try {
      const {
        organizationName = '',
        organization = '',
        contactPerson = '',
        email = '',
        phone = '',
        organizationType = '',
        partnershipInterests = '',
        areaOfInterest = '',
        message: msg = '',
        website = '',
        consent = true,
        ...spamFields
      } = request as any;

      const payload = {
        organizationName: (organizationName || organization || '').trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organizationType: organizationType.trim(),
        partnershipInterests: (partnershipInterests || areaOfInterest || '').trim(),
        message: msg.trim(),
        website: website ? website.trim() : '',
        consent: consent !== undefined ? consent : true,
        ...spamFields
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
