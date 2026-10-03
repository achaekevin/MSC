import { apiClient } from './api';
import { GalleryItem } from '../types';
import { GALLERY_DATA } from '../data/galleryData';

export const galleryService = {
  async getAll(): Promise<GalleryItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: GalleryItem[] }>('/gallery');
      return res.data && res.data.length > 0 ? res.data : GALLERY_DATA;
    } catch {
      return GALLERY_DATA;
    }
  },

  async getByCategory(category: string): Promise<GalleryItem[]> {
    const all = await this.getAll();
    if (!category || category === 'All') return all;
    return all.filter((item) => item.category === category);
  }
};
