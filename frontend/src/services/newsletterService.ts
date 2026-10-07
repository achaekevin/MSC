import { apiClient } from './api';

export interface SubscriberItem {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED';
  consent: boolean;
}

export const newsletterService = {
  /**
   * Public: Subscribe to newsletter
   */
  async subscribe(email: string, consent: boolean, name?: string, spamMetadata?: Record<string, any>) {
    return apiClient.post<{ message: string; isNew: boolean }>('/newsletter/subscribe', {
      email,
      consent,
      name,
      ...(spamMetadata || {})
    });
  },

  /**
   * Public: Unsubscribe from newsletter
   */
  async unsubscribe(email: string) {
    return apiClient.post<{ message: string }>('/newsletter/unsubscribe', { email });
  },

  /**
   * Admin: List subscribers
   */
  async getSubscribers(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);

    return apiClient.get<{
      subscribers: SubscriberItem[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/newsletter/admin/subscribers?${params.toString()}`);
  },

  /**
   * Admin: Remove subscriber
   */
  async deleteSubscriber(id: string) {
    return apiClient.delete<{ message: string }>(`/newsletter/admin/subscribers/${id}`);
  },

  /**
   * Admin: Export active subscribers to CSV
   */
  async exportCsv(): Promise<Blob> {
    const response = await fetch('/api/v1/newsletter/admin/export', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    return response.blob();
  }
};
