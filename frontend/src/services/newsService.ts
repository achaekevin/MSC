import { apiClient } from './api';
import { NewsArticle } from '../types';
import { NEWS_ARTICLES_DATA } from '../data/newsData';

export interface NewsArticleInput {
  title: string;
  slug?: string;
  categoryId?: string | null;
  summary: string;
  content: string[] | string;
  featuredImage: string;
  imageAlt: string;
  authorName?: string;
  authorRole?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  source?: 'OFFICIAL_PROFILE' | 'CLIENT' | 'PLACEHOLDER' | 'DEVELOPER';
  seoTitle?: string;
  seoDescription?: string;
  changeNote?: string;
  status?: 'DRAFT' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    articles: number;
  };
}

export interface NewsListResponse {
  articles: NewsArticle[];
  total: number;
  pages: number;
  currentPage: number;
}

class NewsService {
  private baseEndpoint = '/news';
  private adminEndpoint = '/admin/news';

  // ----------------------------------------------------
  // Public Methods
  // ----------------------------------------------------

  /**
   * Get all published news articles for public display
   */
  async getAll(category?: string, page = 1, limit = 10): Promise<NewsArticle[]> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (category && category !== 'All Stories' && category !== 'All') {
        params.set('category', category);
      }

      const res = await apiClient.get<any>(`${this.baseEndpoint}?${params.toString()}`);
      const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
      return list && list.length > 0 ? list : NEWS_ARTICLES_DATA;
    } catch {
      // Resilient fallback to official MSC articles
      if (category && category !== 'All Stories' && category !== 'All') {
        return NEWS_ARTICLES_DATA.filter(a => a.category === category);
      }
      return NEWS_ARTICLES_DATA;
    }
  }

  /**
   * Get published article by slug
   */
  async getBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const res = await apiClient.get<any>(`${this.baseEndpoint}/${slug}`);
      const item = res && res.slug ? res : (res?.data || null);
      if (item && item.slug) return item;
    } catch {
      // Fallback
    }
    const found = NEWS_ARTICLES_DATA.find((item) => item.slug === slug);
    return found || null;
  }

  /**
   * Get featured article or latest
   */
  async getFeatured(): Promise<NewsArticle | null> {
    const all = await this.getAll();
    const featured = all.find((item) => item.isFeatured);
    return featured || all[0] || null;
  }

  /**
   * Get news categories
   */
  async getCategories(): Promise<NewsCategory[]> {
    try {
      const res = await apiClient.get<NewsCategory[]>(`${this.baseEndpoint}/categories`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        { id: 'cat-1', name: 'Community Story', slug: 'community-story', displayOrder: 1 } as any,
        { id: 'cat-2', name: 'Organizational News', slug: 'organizational-news', displayOrder: 2 } as any,
        { id: 'cat-3', name: 'Advocacy', slug: 'advocacy', displayOrder: 3 } as any
      ];
    }
  }

  // ----------------------------------------------------
  // Admin Methods (Authentication Required)
  // ----------------------------------------------------

  /**
   * Get all news articles for administration
   */
  async getAllAdmin(
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
    category?: string
  ): Promise<NewsListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (status && status !== 'ALL') {
      params.set('status', status);
    }
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    if (category && category !== 'ALL') {
      params.set('category', category);
    }

    const res = await apiClient.getWithMeta<NewsArticle[]>(
      `${this.adminEndpoint}?${params.toString()}`
    );

    const items = Array.isArray(res.data) ? res.data : [];
    const total = res.pagination?.total ?? items.length;
    const pages = res.pagination?.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 1);
    const currentPage = res.pagination?.page ?? page;

    return {
      articles: items,
      total,
      pages,
      currentPage
    };
  }

  /**
   * Get single article by ID
   */
  async getById(id: string): Promise<NewsArticle> {
    return apiClient.get<NewsArticle>(`${this.adminEndpoint}/${id}`);
  }

  /**
   * Create new news article (saved as DRAFT)
   */
  async create(data: NewsArticleInput): Promise<NewsArticle> {
    return apiClient.post<NewsArticle>(this.adminEndpoint, data);
  }

  /**
   * Update existing article
   */
  async update(id: string, data: Partial<NewsArticleInput>): Promise<NewsArticle> {
    return apiClient.put<NewsArticle>(`${this.adminEndpoint}/${id}`, data);
  }

  /**
   * Submit article for review (DRAFT -> IN_REVIEW)
   */
  async submitReview(id: string, reviewNotes?: string): Promise<NewsArticle> {
    return apiClient.post<NewsArticle>(`${this.adminEndpoint}/${id}/submit-review`, { reviewNotes });
  }

  /**
   * Approve article (IN_REVIEW -> APPROVED)
   */
  async approve(id: string, reviewNotes?: string): Promise<NewsArticle> {
    return apiClient.post<NewsArticle>(`${this.adminEndpoint}/${id}/approve`, { reviewNotes });
  }

  /**
   * Publish article (APPROVED -> PUBLISHED)
   */
  async publish(id: string): Promise<NewsArticle> {
    return apiClient.post<NewsArticle>(`${this.adminEndpoint}/${id}/publish`, {});
  }

  /**
   * Soft delete article
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.adminEndpoint}/${id}`);
  }
}

export const newsService = new NewsService();
