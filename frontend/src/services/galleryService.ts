import { apiClient } from './api';
import { GalleryItem, ContentStatus } from '../types';
import { GALLERY_DATA } from '../data/galleryData';

export interface AlbumItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    mediaItems: number;
  };
}

export interface MediaStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  approved: number;
}

export const galleryService = {
  // Public
  async getAll(params?: { category?: string; page?: number; limit?: number }): Promise<GalleryItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiClient.get<any>(`/gallery${qs}`);
      const items = res.data?.items || res.data || [];
      return items.length > 0 ? items : GALLERY_DATA;
    } catch {
      return GALLERY_DATA;
    }
  },

  async getByCategory(category: string): Promise<GalleryItem[]> {
    const all = await this.getAll();
    if (!category || category === 'All') return all;
    return all.filter((item) => item.category === category);
  },

  async getAlbums(): Promise<AlbumItem[]> {
    try {
      const res = await apiClient.get<any>('/gallery/albums');
      const items = res.data?.data || res.data || [];
      if (items.length > 0) return items;
    } catch {
      // Fallback
    }
    return [
      { id: 'alb-1', name: 'Community Outreach', slug: 'community-outreach' },
      { id: 'alb-2', name: 'Psychosocial Sessions', slug: 'psychosocial-sessions' },
      { id: 'alb-3', name: 'Advocacy & Dialogue', slug: 'advocacy-dialogue' },
      { id: 'alb-4', name: 'Sensitization & Assemblies', slug: 'sensitization-assemblies' },
      { id: 'alb-5', name: 'Home Visits & Welfare', slug: 'home-visits-welfare' }
    ];
  },

  // Admin Media Management
  async getAdminMedia(params?: {
    page?: number;
    limit?: number;
    status?: string;
    albumId?: string;
  }): Promise<{ items: GalleryItem[]; total: number; totalPages: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.status && params.status !== 'all') query.append('status', params.status);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiClient.get<any>(`/admin/media${qs}`);
      const rawItems = res.data?.items || res.data || [];
      const total = res.data?.pagination?.total ?? rawItems.length;
      const totalPages = res.data?.pagination?.totalPages ?? 1;

      const items: GalleryItem[] = rawItems.map((m: any) => ({
        id: m.id,
        title: m.title || m.altText || 'MSC Media',
        caption: m.caption || m.description || '',
        category: m.album?.name || 'Community Outreach',
        imageUrl: m.secureUrl || m.url || '/images/mwancha-facility-main.jpg',
        secureUrl: m.secureUrl || m.url,
        date: m.createdAt ? m.createdAt.split('T')[0] : '2025-01-01',
        location: 'Nyamira County, Kenya',
        status: m.status || 'PUBLISHED',
        altText: m.altText,
        photographer: m.photographer,
        albumId: m.albumId,
        album: m.album,
        consentConfirmed: m.consentConfirmed,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      }));

      return { items, total, totalPages };
    } catch {
      const fallbackItems: GalleryItem[] = GALLERY_DATA.map((g) => ({
        ...g,
        status: 'PUBLISHED' as ContentStatus,
        consentConfirmed: true,
        createdAt: new Date().toISOString()
      }));
      return { items: fallbackItems, total: fallbackItems.length, totalPages: 1 };
    }
  },

  async uploadMedia(formData: FormData): Promise<GalleryItem> {
    const res = await apiClient.post<any>('/admin/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data?.data || res.data;
  },

  async updateMedia(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await apiClient.put<any>(`/admin/media/${id}`, data);
    return res.data?.data || res.data;
  },

  async deleteMedia(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/admin/media/${id}`);
    return res.data?.success ?? true;
  },

  async submitReview(id: string, notes?: string): Promise<GalleryItem> {
    const res = await apiClient.post<any>(`/admin/media/${id}/submit-review`, { notes });
    return res.data?.data || res.data;
  },

  async approveMedia(id: string): Promise<GalleryItem> {
    const res = await apiClient.post<any>(`/admin/media/${id}/approve`, {});
    return res.data?.data || res.data;
  },

  async publishMedia(id: string): Promise<GalleryItem> {
    const res = await apiClient.post<any>(`/admin/media/${id}/publish`, {});
    return res.data?.data || res.data;
  },

  async createAlbum(name: string, description?: string): Promise<AlbumItem> {
    const res = await apiClient.post<any>('/admin/media/albums', { name, description });
    return res.data?.data || res.data;
  },

  async bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<boolean> {
    await Promise.all(
      ids.map(async (id) => {
        if (status === 'IN_REVIEW') return this.submitReview(id);
        if (status === 'APPROVED') return this.approveMedia(id);
        if (status === 'PUBLISHED') return this.publishMedia(id);
        return this.updateMedia(id, { status });
      })
    );
    return true;
  },

  async bulkDelete(ids: string[]): Promise<boolean> {
    await Promise.all(ids.map((id) => this.deleteMedia(id)));
    return true;
  },

  async getMediaStats(): Promise<MediaStats> {
    const res = await this.getAdminMedia({ limit: 100 });
    const items = res.items;

    return {
      total: items.length,
      published: items.filter((m) => m.status === 'PUBLISHED').length,
      draft: items.filter((m) => m.status === 'DRAFT').length,
      inReview: items.filter((m) => m.status === 'IN_REVIEW').length,
      approved: items.filter((m) => m.status === 'APPROVED').length
    };
  }
};
