import { apiClient } from './api';
import { VolunteerApplication } from '../types';

export const volunteerService = {
  async submitApplication(application: VolunteerApplication): Promise<{ success: boolean; message: string; applicationId?: string }> {
    try {
      const payload = {
        fullName: application.fullName.trim(),
        email: application.email.trim(),
        phone: application.phone.trim(),
        county: application.county.trim(),
        subCounty: application.subCounty ? application.subCounty.trim() : '',
        areaOfInterest: application.areaOfInterest.trim(),
        availability: application.availability.trim(),
        experience: application.experience ? application.experience.trim() : '',
        message: application.message.trim(),
        consent: true
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
        message: error.message || 'Unable to submit your application right now. Please try again or write to mwachahomeforelderly@gmail.com.'
      };
    }
  }
};
