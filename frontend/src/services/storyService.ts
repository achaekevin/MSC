import { apiClient } from './api';
import { ContentStatus } from '../types';

export interface StoryItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  story?: string;
  narrative?: string;
  situation?: string;
  intervention?: string;
  outcome?: string;
  relatedProgram?: string;
  coverImage?: string;
  media?: string[];
  images?: string[];
  location?: string;
  date?: string;
  storyDate?: string;
  publishedAt?: string;
  beneficiaryConsent?: boolean;
  privacyStatus?: 'anonymized' | 'identified_with_consent';
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoryInput {
  title: string;
  summary?: string;
  story?: string;
  narrative?: string;
  situation?: string;
  intervention?: string;
  outcome?: string;
  relatedProgram?: string;
  coverImage?: string;
  media?: string[];
  images?: string[];
  location?: string;
  date?: string;
  beneficiaryConsent?: boolean;
  privacyStatus?: 'anonymized' | 'identified_with_consent';
}

export interface StoryResponse {
  items: StoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const storyService = {
  // Public APIs
  async getPublicStories(page = 1, limit = 12): Promise<StoryResponse> {
    try {
      const res = await apiClient.get<any>(`/stories?page=${page}&limit=${limit}`);
      const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
      const pagination = res?.pagination || {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit) || 1
      };
      return { items, pagination };
    } catch (err) {
      console.warn('Failed to fetch public stories:', err);
      return {
        items: [],
        pagination: { page: 1, limit, total: 0, totalPages: 1 }
      };
    }
  },

  async getPublicStoryBySlug(slug: string): Promise<StoryItem> {
    const res = await apiClient.get<any>(`/stories/${slug}`);
    return res?.data || res;
  },

  // Admin APIs
  async getAdminStories(page = 1, limit = 20, status = 'all'): Promise<StoryResponse> {
    const res = await apiClient.get<any>(`/admin/stories?page=${page}&limit=${limit}&status=${status}`);
    const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
    const pagination = res?.pagination || {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit) || 1
    };
    return { items, pagination };
  },

  async createStory(data: StoryInput): Promise<StoryItem> {
    const res = await apiClient.post<any>('/admin/stories', data);
    return res?.data || res;
  },

  async updateStory(id: string, data: Partial<StoryInput>): Promise<StoryItem> {
    const res = await apiClient.put<any>(`/admin/stories/${id}`, data);
    return res?.data || res;
  },

  async deleteStory(id: string): Promise<void> {
    await apiClient.delete(`/admin/stories/${id}`);
  },

  async approveStory(id: string): Promise<StoryItem> {
    const res = await apiClient.post<any>(`/admin/stories/${id}/approve`, {});
    return res?.data || res;
  },

  async publishStory(id: string): Promise<StoryItem> {
    const res = await apiClient.post<any>(`/admin/stories/${id}/publish`, {});
    return res?.data || res;
  }
};
