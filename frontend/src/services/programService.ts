import { apiClient } from './api';
import { Program } from '../types';
import { PROGRAMS_DATA } from '../data/programsData';

export const programService = {
  async getAll(): Promise<Program[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Program[] }>('/programs');
      return res.data && res.data.length > 0 ? res.data : PROGRAMS_DATA;
    } catch {
      // Fallback to local structured data
      return PROGRAMS_DATA;
    }
  },

  async getBySlug(slug: string): Promise<Program | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: Program }>(`/programs/${slug}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const found = PROGRAMS_DATA.find((p) => p.slug === slug);
    return found || null;
  }
};
