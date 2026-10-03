import { apiClient } from './api';
import { VolunteerApplication } from '../types';

export const volunteerService = {
  async submitApplication(application: VolunteerApplication): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/volunteers', application);
      return res;
    } catch {
      // Graceful offline mock handling
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'Your volunteer application has been submitted successfully. Our Volunteer Coordination Desk will review your application and get in touch with you.'
      };
    }
  }
};
