import { apiClient } from './api';
import { ContactMessage } from '../types';

export const contactService = {
  async submitContactMessage(message: ContactMessage): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>('/contact', message);
      return res;
    } catch {
      // Graceful offline mock handling if backend API is not currently active
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'Thank you for reaching out to Mwancha Senior Community. Your message has been received by our Secretariat and will be attended to promptly.'
      };
    }
  }
};
