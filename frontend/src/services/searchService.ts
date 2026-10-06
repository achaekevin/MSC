import { apiClient } from './api';

export type SearchCategoryType = 'all' | 'programs' | 'news' | 'events' | 'stories' | 'gallery' | 'organization';

export interface SearchResultItem {
  id: string;
  title: string;
  summary: string;
  type: 'program' | 'news' | 'event' | 'story' | 'gallery' | 'organization';
  path: string;
  image?: string | null;
  badge?: string;
  date?: string | null;
  location?: string | null;
}

export interface SearchResponse {
  query: string;
  type: SearchCategoryType;
  totalResults: number;
  programs: SearchResultItem[];
  news: SearchResultItem[];
  events: SearchResultItem[];
  stories: SearchResultItem[];
  gallery: SearchResultItem[];
  organization: SearchResultItem[];
}

export const searchService = {
  async search(query: string, type: SearchCategoryType = 'all', limit = 16): Promise<SearchResponse> {
    if (!query || query.trim().length < 2) {
      return {
        query: '',
        type,
        totalResults: 0,
        programs: [],
        news: [],
        events: [],
        stories: [],
        gallery: [],
        organization: []
      };
    }

    const params = new URLSearchParams({
      q: query.trim(),
      type,
      limit: limit.toString()
    });

    const res = await apiClient.get<SearchResponse>(`/search?${params.toString()}`);
    return res.data;
  }
};
