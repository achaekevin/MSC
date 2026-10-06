import { apiClient } from './api';
import { EventItem, ContentStatus } from '../types';
import { EVENTS_DATA } from '../data/eventsData';

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

export interface EventStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  approved: number;
  upcomingCount: number;
  pastCount: number;
}

export const eventService = {
  // Public APIs
  async getAll(params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<EventItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiClient.get<any>(`/events${qs}`);
      const items = Array.isArray(res) ? res : (res?.data || res?.items || []);
      return items.length > 0 ? items : EVENTS_DATA;
    } catch {
      return EVENTS_DATA;
    }
  },

  async getUpcoming(): Promise<EventItem[]> {
    const all = await this.getAll();
    const now = new Date();
    return all.filter((ev) => {
      if (ev.startDate) {
        return new Date(ev.startDate) >= now;
      }
      return ev.status === 'upcoming';
    });
  },

  async getPast(): Promise<EventItem[]> {
    const all = await this.getAll();
    const now = new Date();
    return all.filter((ev) => {
      if (ev.startDate) {
        return new Date(ev.startDate) < now;
      }
      return ev.status === 'completed';
    });
  },

  async getBySlug(slug: string): Promise<EventItem | null> {
    try {
      const res = await apiClient.get<any>(`/events/${slug}`);
      const item = res?.slug ? res : (res?.data || null);
      if (item) return item;
    } catch {
      // Fallback
    }
    const found = EVENTS_DATA.find((e) => e.slug === slug);
    return found || null;
  },

  async getCategories(): Promise<EventCategory[]> {
    try {
      const res = await apiClient.get<any>('/events/categories');
      const cats = Array.isArray(res) ? res : (res?.data || []);
      if (cats.length > 0) return cats;
    } catch {
      // Fallback
    }
    return [
      { id: 'cat-1', name: 'Community Outreach', slug: 'community-outreach' },
      { id: 'cat-2', name: 'Senior Engagement', slug: 'senior-engagement' },
      { id: 'cat-3', name: 'Health Outreach', slug: 'health-outreach' },
      { id: 'cat-4', name: 'Advocacy & Rights', slug: 'advocacy-rights' },
      { id: 'cat-5', name: 'Stakeholder Meeting', slug: 'stakeholder-meeting' }
    ];
  },

  // Admin APIs
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ items: EventItem[]; total: number; totalPages: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.status && params.status !== 'all') query.append('status', params.status);
      if (params?.category && params.category !== 'All') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiClient.getWithMeta<EventItem[]>(`/admin/events${qs}`);
      const items = Array.isArray(res.data) ? res.data : [];
      const total = res.pagination?.total ?? items.length;
      const totalPages = res.pagination?.totalPages ?? (total > 0 ? Math.ceil(total / (params?.limit || 10)) : 1);

      return { items, total, totalPages };
    } catch {
      // Fallback to EVENTS_DATA mapped to DRAFT/PUBLISHED
      const mapped = EVENTS_DATA.map((e) => ({
        ...e,
        status: (e.status === 'upcoming' ? 'PUBLISHED' : 'ARCHIVED') as ContentStatus,
        startDate: e.date ? new Date(e.date).toISOString() : new Date().toISOString()
      }));
      return { items: mapped, total: mapped.length, totalPages: 1 };
    }
  },

  async getEventById(id: string): Promise<EventItem | null> {
    try {
      const res = await apiClient.get<any>(`/admin/events/${id}`);
      return res?.slug ? res : (res?.data || null);
    } catch {
      const fallback = EVENTS_DATA.find((e) => e.id === id);
      return fallback || null;
    }
  },

  async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const payload = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      location: data.location,
      county: data.county || 'Nyamira',
      category: data.category || 'Community Outreach',
      startDate: data.startDate || (data.date ? new Date(data.date).toISOString() : new Date().toISOString()),
      endDate: data.endDate || null,
      timeString: data.timeString || data.time || '09:00 AM - 03:00 PM EAT',
      isRegistrationOpen: data.isRegistrationOpen ?? data.registrationOpen ?? true,
      registrationRequired: data.registrationRequired ?? false,
      registrationUrl: data.registrationUrl || null,
      image: data.image || null,
      organizer: data.organizer || 'Mwancha Senior Community',
      source: data.source || 'OFFICIAL_PROFILE',
      status: data.status || 'DRAFT'
    };

    const res = await apiClient.post<any>('/admin/events', payload);
    return res?.id ? res : (res?.data || res);
  },

  async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    const payload = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      location: data.location,
      county: data.county,
      category: data.category,
      startDate: data.startDate || (data.date ? new Date(data.date).toISOString() : undefined),
      endDate: data.endDate,
      timeString: data.timeString || data.time,
      isRegistrationOpen: data.isRegistrationOpen ?? data.registrationOpen,
      registrationRequired: data.registrationRequired,
      registrationUrl: data.registrationUrl,
      image: data.image,
      organizer: data.organizer,
      status: data.status
    };

    const res = await apiClient.put<any>(`/admin/events/${id}`, payload);
    return res?.id ? res : (res?.data || res);
  },

  async submitReview(id: string, notes?: string): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/submit-review`, { reviewNotes: notes });
    return res?.id ? res : (res?.data || res);
  },

  async approveEvent(id: string, notes?: string): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/approve`, { reviewNotes: notes });
    return res?.id ? res : (res?.data || res);
  },

  async publishEvent(id: string): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/publish`, {});
    return res?.id ? res : (res?.data || res);
  },

  async deleteEvent(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/admin/events/${id}`);
    return res?.success ?? true;
  },

  async duplicateEvent(id: string): Promise<EventItem> {
    const res = await apiClient.post<any>(`/admin/events/${id}/duplicate`, {});
    return res?.id ? res : (res?.data || res);
  },

  async bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<boolean> {
    await Promise.all(
      ids.map(async (id) => {
        if (status === 'IN_REVIEW') return this.submitReview(id);
        if (status === 'APPROVED') return this.approveEvent(id);
        if (status === 'PUBLISHED') return this.publishEvent(id);
        return this.updateEvent(id, { status });
      })
    );
    return true;
  },

  async bulkDelete(ids: string[]): Promise<boolean> {
    await Promise.all(ids.map((id) => this.deleteEvent(id)));
    return true;
  },

  async getEventStats(): Promise<EventStats> {
    const res = await this.getAllEvents({ limit: 100 });
    const items = res.items;
    const now = new Date();

    return {
      total: items.length,
      published: items.filter((e) => e.status === 'PUBLISHED' || e.status === 'upcoming').length,
      draft: items.filter((e) => e.status === 'DRAFT').length,
      inReview: items.filter((e) => e.status === 'IN_REVIEW').length,
      approved: items.filter((e) => e.status === 'APPROVED').length,
      upcomingCount: items.filter((e) => (e.startDate ? new Date(e.startDate) >= now : e.status === 'upcoming')).length,
      pastCount: items.filter((e) => (e.startDate ? new Date(e.startDate) < now : e.status === 'completed')).length
    };
  }
};
