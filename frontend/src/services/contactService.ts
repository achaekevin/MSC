import { apiClient } from './api';
import { ContactMessage } from '../types';

export const contactService = {
  async submitContactMessage(message: ContactMessage): Promise<{ success: boolean; message: string; referenceId?: string }> {
    try {
      const payload = {
        name: message.name.trim(),
        email: message.email.trim(),
        phone: message.phone ? message.phone.trim() : '',
        subject: message.subject.trim(),
        message: message.message.trim(),
        consent: message.consent !== undefined ? message.consent : true
      };

      const res = await apiClient.post<any>('/contact', payload);
      
      const successMessage =
        (typeof res === 'object' && res?.message) ||
        'Thank you for reaching out to Mwancha Senior Community. Your message has been received by our Secretariat and will be attended to promptly.';

      return {
        success: true,
        message: successMessage,
        referenceId: res?.referenceId
      };
    } catch (error: any) {
      console.error('Contact submission error:', error);
      return {
        success: false,
        message: error.message || 'Unable to deliver your message at this time. Please try again or write directly to mwachahomeforelderly@gmail.com.'
      };
    }
  }
};
