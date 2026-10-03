import { apiClient } from './api';
import { EventItem } from '../types';
import { EVENTS_DATA } from '../data/eventsData';

export const eventService = {
  async getAll(): Promise<EventItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: EventItem[] }>('/events');
      return res.data && res.data.length > 0 ? res.data : EVENTS_DATA;
    } catch {
      return EVENTS_DATA;
    }
  },

  async getUpcoming(): Promise<EventItem[]> {
    const all = await this.getAll();
    return all.filter((ev) => ev.status === 'upcoming');
  },

  async getPast(): Promise<EventItem[]> {
    const all = await this.getAll();
    return all.filter((ev) => ev.status === 'completed');
  },

  async getBySlug(slug: string): Promise<EventItem | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: EventItem }>(`/events/${slug}`);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const found = EVENTS_DATA.find((e) => e.slug === slug);
    return found || null;
  }
};
