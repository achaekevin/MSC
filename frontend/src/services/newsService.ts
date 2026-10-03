import { apiClient } from './api';
import { NewsArticle } from '../types';
import { NEWS_ARTICLES_DATA } from '../data/newsData';

export const newsService = {
  async getAll(): Promise<NewsArticle[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: NewsArticle[] }>('/news');
      return res.data && res.data.length > 0 ? res.data : NEWS_ARTICLES_DATA;
    } catch {
      return NEWS_ARTICLES_DATA;
    }
  },

  async getBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: NewsArticle }>(`/news/${slug}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const found = NEWS_ARTICLES_DATA.find((item) => item.slug === slug);
    return found || null;
  },

  async getFeatured(): Promise<NewsArticle | null> {
    const all = await this.getAll();
    const featured = all.find((item) => item.isFeatured);
    return featured || all[0] || null;
  }
};
