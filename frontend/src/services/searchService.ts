import { apiClient } from './api';
import { PROGRAMS_DATA } from '../data/programsData';
import { NEWS_ARTICLES_DATA } from '../data/newsData';
import { EVENTS_DATA } from '../data/eventsData';
import { GALLERY_DATA } from '../data/galleryData';

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

/**
 * Checks if a search term matches any of the given text fields (case-insensitive).
 */
function matchesQuery(term: string, ...fields: (string | undefined | null)[]): boolean {
  const lower = term.toLowerCase();
  return fields.some(f => f && f.toLowerCase().includes(lower));
}

/**
 * Search static/fallback data that lives in the frontend.
 * This ensures content visible on the website is always searchable,
 * even if it only exists in static data and not in the database.
 */
function searchStaticData(query: string, type: SearchCategoryType, limit: number): SearchResponse {
  const term = query.trim();
  const shouldFetch = (t: string) => type === 'all' || type === t;

  // Programs
  const staticPrograms: SearchResultItem[] = shouldFetch('programs')
    ? PROGRAMS_DATA
        .filter(p => matchesQuery(term, p.title, p.shortDescription, p.fullDescription, p.approach))
        .slice(0, limit)
        .map(p => ({
          id: `static-${p.id}`,
          title: p.title,
          summary: p.shortDescription || p.fullDescription?.slice(0, 200) || '',
          type: 'program' as const,
          path: `/programs/${p.slug}`,
          image: p.image,
          badge: p.iconName || 'Core Program'
        }))
    : [];

  // News
  const staticNews: SearchResultItem[] = shouldFetch('news')
    ? NEWS_ARTICLES_DATA
        .filter(n => matchesQuery(term, n.title, n.summary, n.category, ...(Array.isArray(n.content) ? n.content : [n.content])))
        .slice(0, limit)
        .map(n => ({
          id: `static-${n.id}`,
          title: n.title,
          summary: n.summary,
          type: 'news' as const,
          path: `/news/${n.slug}`,
          image: n.featuredImage,
          badge: n.category || 'News',
          date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
        }))
    : [];

  // Events
  const staticEvents: SearchResultItem[] = shouldFetch('events')
    ? EVENTS_DATA
        .filter(e => matchesQuery(term, e.title, e.description, e.location, e.category, e.county))
        .slice(0, limit)
        .map(e => ({
          id: `static-${e.id}`,
          title: e.title,
          summary: e.description,
          type: 'event' as const,
          path: `/events/${e.slug}`,
          location: e.location,
          badge: e.category || 'Community Event',
          date: e.date ? new Date(e.date).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
        }))
    : [];

  // Stories (news with category containing 'Story')
  const staticStories: SearchResultItem[] = shouldFetch('stories')
    ? NEWS_ARTICLES_DATA
        .filter(n => n.category?.toLowerCase().includes('story'))
        .filter(n => matchesQuery(term, n.title, n.summary, ...(Array.isArray(n.content) ? n.content : [n.content])))
        .slice(0, limit)
        .map(n => ({
          id: `static-story-${n.id}`,
          title: n.title,
          summary: n.summary,
          type: 'story' as const,
          path: `/news/${n.slug}`,
          image: n.featuredImage,
          badge: 'Community Story',
          date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
        }))
    : [];

  // Gallery
  const staticGallery: SearchResultItem[] = shouldFetch('gallery')
    ? GALLERY_DATA
        .filter(g => matchesQuery(term, g.title, g.caption, g.category, g.location))
        .slice(0, limit)
        .map(g => ({
          id: `static-${g.id}`,
          title: g.title,
          summary: g.caption || g.category,
          type: 'gallery' as const,
          path: '/gallery',
          image: g.imageUrl,
          badge: g.category || 'Gallery'
        }))
    : [];

  // Organization (static pillars)
  const orgPillars: SearchResultItem[] = [
    {
      id: 'org-vision-mission',
      title: 'Vision, Mission & Strategic Mandate',
      summary: 'To empower senior citizens through health, economic, social, and psychosocial development initiatives that enhance their dignity and quality of life.',
      type: 'organization' as const,
      path: '/about/mission',
      badge: 'Institutional Mandate'
    },
    {
      id: 'org-story-history',
      title: 'Our Journey & Founding Heritage',
      summary: 'Founded in 2016 in Ekerenyo, Nyamira County as Mwancha Home for the Elderly, transitioning in 2024 to Mwancha Senior Community.',
      type: 'organization' as const,
      path: '/about/story',
      badge: 'History & Heritage'
    },
    {
      id: 'org-values',
      title: 'Core Values & Principles',
      summary: 'Respect, Fairness, Unity, Integrity, Compassion, and Accountability guiding our grassroots elder care operations.',
      type: 'organization' as const,
      path: '/about',
      badge: 'Core Values'
    },
    {
      id: 'org-structure',
      title: 'Governance & Organizational Structure',
      summary: 'Board of Directors, Executive Management, Advisory Council, and over 40 trained ward volunteers across Nyamira County.',
      type: 'organization' as const,
      path: '/about/structure',
      badge: 'Governance'
    },
    {
      id: 'org-contact-helpline',
      title: 'Helpline, Headquarters & Contacts',
      summary: 'Helpline: +254 790 629439 | Email: mwachahomeforelderly@gmail.com | Ekerenyo, Nyamira County, Kenya.',
      type: 'organization' as const,
      path: '/contact',
      badge: 'Helpline & Office'
    },
    {
      id: 'org-volunteer-program',
      title: 'Community Volunteer Program',
      summary: 'Join over 40 dedicated ward-based volunteers providing compassionate care, home visits, and emergency support to vulnerable elders.',
      type: 'organization' as const,
      path: '/get-involved',
      badge: 'Volunteer'
    },
    {
      id: 'org-donation',
      title: 'Donate & Support Elder Welfare',
      summary: 'Support Mwancha Senior Community through monetary or in-kind donations to sustain elder care, nutrition, and shelter programs.',
      type: 'organization' as const,
      path: '/donate',
      badge: 'Donations'
    },
    {
      id: 'org-publications',
      title: 'Publications & Research Resources',
      summary: 'Policy briefs, case management manuals, and civic legal handbooks on senior citizen rights, elder care, and social protection in Kenya.',
      type: 'organization' as const,
      path: '/publications',
      badge: 'Publications'
    },
    {
      id: 'org-partners',
      title: 'Partners & Collaborations',
      summary: 'MSC collaborates with government agencies, healthcare institutions, legal aid organizations, and community partners across Kenya.',
      type: 'organization' as const,
      path: '/partners',
      badge: 'Partners'
    }
  ];

  const staticOrg: SearchResultItem[] = shouldFetch('organization')
    ? orgPillars.filter(p => matchesQuery(term, p.title, p.summary))
    : [];

  const totalResults = staticPrograms.length + staticNews.length + staticEvents.length +
    staticStories.length + staticGallery.length + staticOrg.length;

  return {
    query: term,
    type,
    totalResults,
    programs: staticPrograms,
    news: staticNews,
    events: staticEvents,
    stories: staticStories,
    gallery: staticGallery,
    organization: staticOrg
  };
}

/**
 * Merge API results with static fallback results, deduplicating by title.
 */
function mergeResults(apiResults: SearchResponse, staticResults: SearchResponse): SearchResponse {
  const mergeCategory = (apiItems: SearchResultItem[], staticItems: SearchResultItem[]): SearchResultItem[] => {
    const seenTitles = new Set(apiItems.map(item => item.title.toLowerCase()));
    const uniqueStatic = staticItems.filter(item => !seenTitles.has(item.title.toLowerCase()));
    return [...apiItems, ...uniqueStatic];
  };

  const programs = mergeCategory(apiResults.programs, staticResults.programs);
  const news = mergeCategory(apiResults.news, staticResults.news);
  const events = mergeCategory(apiResults.events, staticResults.events);
  const stories = mergeCategory(apiResults.stories, staticResults.stories);
  const gallery = mergeCategory(apiResults.gallery, staticResults.gallery);
  const organization = mergeCategory(apiResults.organization, staticResults.organization);

  const totalResults = programs.length + news.length + events.length +
    stories.length + gallery.length + organization.length;

  return {
    query: apiResults.query || staticResults.query,
    type: apiResults.type || staticResults.type,
    totalResults,
    programs,
    news,
    events,
    stories,
    gallery,
    organization
  };
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

    // Always compute static/fallback results as a safety net
    const staticResults = searchStaticData(query, type, limit);

    // Try API search, and merge with static results
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type,
        limit: limit.toString()
      });

      const apiResults = await apiClient.get<SearchResponse>(`/search?${params.toString()}`);
      return mergeResults(apiResults, staticResults);
    } catch (err) {
      // If the API is unreachable or fails, return static results only
      console.warn('Search API call failed, using static data fallback:', err);
      return staticResults;
    }
  }
};
