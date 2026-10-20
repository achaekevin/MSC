import { apiClient } from './api';
import { VolunteerApplication } from '../types';

export const volunteerService = {
  async submitApplication(application: VolunteerApplication): Promise<{ success: boolean; message: string; applicationId?: string }> {
    try {
      const {
        fullName = '',
        email = '',
        phone = '',
        county = '',
        subCounty = '',
        areaOfInterest = '',
        availability = '',
        experience = '',
        message = '',
        consent = true,
        ...spamFields
      } = application as any;

      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        county: county.trim(),
        subCounty: subCounty ? subCounty.trim() : '',
        areaOfInterest: areaOfInterest.trim(),
        availability: availability.trim(),
        experience: experience ? experience.trim() : '',
        message: message.trim(),
        consent: consent !== undefined ? consent : true,
        ...spamFields
      };

      const res = await apiClient.post<any>('/volunteers/apply', payload);

      const successMessage =
        (typeof res === 'object' && res?.message) ||
        'Your volunteer application has been submitted successfully. Our Volunteer Coordination Desk will review your application and get in touch with you.';

      return {
        success: true,
        message: successMessage,
        applicationId: res?.applicationId
      };
    } catch (error: any) {
      console.error('Volunteer application submission error:', error);
      return {
        success: false,
        message: error.message || 'Unable to submit your application right now. Please try again or write to mwanchaseniorcommunity@gmail.com.'
      };
    }
  }
};
