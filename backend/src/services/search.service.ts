import { prisma } from '../config/database.js';
import { ContentStatus } from '@prisma/client';

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

export class SearchService {
  async searchPublicContent(query: string, type = 'all', limit = 12) {
    if (!query || query.trim().length < 2) {
      return {
        query: query || '',
        totalResults: 0,
        type,
        programs: [],
        news: [],
        events: [],
        stories: [],
        gallery: [],
        organization: []
      };
    }

    const searchTerm = query.trim();
    const shouldFetch = (targetType: string) => type === 'all' || type === targetType;

    // Foundational Organization Pillars for robust keyword matching
    const staticOrgPillars: SearchResultItem[] = [
      {
        id: 'org-vision-mission',
        title: 'Vision, Mission & Strategic Mandate',
        summary: 'To empower senior citizens through health, economic, social, and psychosocial development initiatives that enhance their dignity and quality of life.',
        type: 'organization',
        path: '/about/mission',
        badge: 'Institutional Mandate'
      },
      {
        id: 'org-story-history',
        title: 'Our Journey & Founding Heritage',
        summary: 'Founded in 2016 in Kebirigo, Nyamira County as Mwancha Home for the Elderly, transitioning in 2024 to Mwancha Senior Community.',
        type: 'organization',
        path: '/about/story',
        badge: 'History & Heritage'
      },
      {
        id: 'org-values',
        title: 'Core Values & Principles',
        summary: 'Respect, Fairness, Unity, Integrity, Compassion, and Accountability guiding our grassroots elder care operations.',
        type: 'organization',
        path: '/about',
        badge: 'Core Values'
      },
      {
        id: 'org-structure',
        title: 'Governance & Organizational Structure',
        summary: 'Board of Directors, Executive Management, Advisory Council, and over 40 trained ward volunteers across Nyamira County.',
        type: 'organization',
        path: '/about/structure',
        badge: 'Governance'
      },
      {
        id: 'org-contact-helpline',
        title: 'Helpline, Headquarters & Contacts',
        summary: 'Helpline: +254 790 629439 | Email: mwachahomeforelderly@gmail.com | Kebirigo, Nyamira County, Kenya.',
        type: 'organization',
        path: '/contact',
        badge: 'Helpline & Office'
      }
    ];

    const lowerSearch = searchTerm.toLowerCase();
    const matchingOrgPillars = staticOrgPillars.filter(pillar =>
      pillar.title.toLowerCase().includes(lowerSearch) ||
      pillar.summary.toLowerCase().includes(lowerSearch)
    );

    // Batch 1: Programs, News, Events (max 3 concurrent queries to preserve connection pool)
    const [programs, news, events] = await Promise.all([
      shouldFetch('programs')
        ? prisma.program.findMany({
            where: {
              status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
              deletedAt: null,
              OR: [
                { title: { contains: searchTerm } },
                { summary: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { thematicArea: { contains: searchTerm } }
              ]
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              image: true,
              thematicArea: true
            }
          }).catch(err => {
            console.warn('Program search query failed:', err);
            return [];
          })
        : Promise.resolve([]),

      shouldFetch('news')
        ? prisma.newsArticle.findMany({
            where: {
              status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
              deletedAt: null,
              OR: [
                { title: { contains: searchTerm } },
                { summary: { contains: searchTerm } },
                { content: { contains: searchTerm } },
                { category: { contains: searchTerm } }
              ]
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              category: true,
              featuredImage: true,
              publishedAt: true
            }
          }).catch(err => {
            console.warn('News search query failed:', err);
            return [];
          })
        : Promise.resolve([]),

      shouldFetch('events')
        ? prisma.event.findMany({
            where: {
              status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
              deletedAt: null,
              OR: [
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { location: { contains: searchTerm } },
                { category: { contains: searchTerm } }
              ]
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              startDate: true,
              location: true,
              category: true
            }
          }).catch(err => {
            console.warn('Event search query failed:', err);
            return [];
          })
        : Promise.resolve([])
    ]);

    // Batch 2: Stories, Gallery, Team Members (max 3 concurrent queries)
    const [successStories, mediaItems, galleryAlbums] = await Promise.all([
      shouldFetch('stories')
        ? prisma.successStory.findMany({
            where: {
              deletedAt: null,
              OR: [
                { title: { contains: searchTerm } },
                { summary: { contains: searchTerm } },
                { story: { contains: searchTerm } },
                { location: { contains: searchTerm } }
              ]
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              title: true,
              summary: true,
              location: true,
              date: true
            }
          }).catch(() => [])
        : Promise.resolve([]),

      shouldFetch('gallery')
        ? prisma.media.findMany({
            where: {
              deletedAt: null,
              OR: [
                { title: { contains: searchTerm } },
                { caption: { contains: searchTerm } },
                { description: { contains: searchTerm } },
                { category: { contains: searchTerm } }
              ]
            },
            take: limit,
            select: {
              id: true,
              title: true,
              caption: true,
              category: true,
              url: true,
              secureUrl: true
            }
          }).catch(() => [])
        : Promise.resolve([]),

      shouldFetch('gallery')
        ? prisma.galleryAlbum.findMany({
            where: {
              deletedAt: null,
              OR: [
                { name: { contains: searchTerm } },
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } }
              ]
            },
            take: limit,
            select: {
              id: true,
              slug: true,
              name: true,
              title: true,
              description: true
            }
          }).catch(() => [])
        : Promise.resolve([])
    ]);

    // Format Programs
    const formattedPrograms: SearchResultItem[] = programs.map(p => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      type: 'program',
      path: `/programs/${p.slug}`,
      image: p.image,
      badge: p.thematicArea || 'Core Program'
    }));

    // Format News
    const formattedNews: SearchResultItem[] = news.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      type: 'news',
      path: `/news/${n.slug}`,
      image: n.featuredImage,
      badge: n.category || 'News',
      date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
    }));

    // Format Events
    const formattedEvents: SearchResultItem[] = events.map(e => ({
      id: e.id,
      title: e.title,
      summary: e.description,
      type: 'event',
      path: `/events/${e.slug}`,
      location: e.location,
      badge: e.category || 'Community Event',
      date: e.startDate ? new Date(e.startDate).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
    }));

    // Format Stories (check success stories or news articles with 'Story' in category)
    const storyFromNews = news
      .filter(n => n.category?.toLowerCase().includes('story'))
      .map(n => ({
        id: `story-${n.id}`,
        title: n.title,
        summary: n.summary,
        type: 'story' as const,
        path: `/news/${n.slug}`,
        badge: 'Community Story',
        image: n.featuredImage,
        date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
      }));

    const formattedStories: SearchResultItem[] = [
      ...successStories.map(s => ({
        id: s.id,
        title: s.title,
        summary: s.summary,
        type: 'story' as const,
        path: `/about/story`,
        location: s.location,
        badge: 'Impact Narrative',
        date: s.date ? new Date(s.date).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : null
      })),
      ...storyFromNews
    ];

    // Format Gallery (albums and media photos)
    const formattedGallery: SearchResultItem[] = [
      ...galleryAlbums.map(a => ({
        id: a.id,
        title: a.title || a.name,
        summary: a.description || 'Community outreach photo collection and archive.',
        type: 'gallery' as const,
        path: `/gallery`,
        badge: 'Gallery Album'
      })),
      ...mediaItems.map(m => ({
        id: m.id,
        title: m.title || `${m.category.toUpperCase()} Photo Archive`,
        summary: m.caption || m.category,
        type: 'gallery' as const,
        path: `/gallery`,
        image: m.secureUrl || m.url,
        badge: m.category || 'Media'
      }))
    ];

    // Format Organization information
    const formattedOrg: SearchResultItem[] = [...matchingOrgPillars];

    const totalResults =
      formattedPrograms.length +
      formattedNews.length +
      formattedEvents.length +
      formattedStories.length +
      formattedGallery.length +
      formattedOrg.length;

    return {
      query: searchTerm,
      type,
      totalResults,
      programs: formattedPrograms,
      news: formattedNews,
      events: formattedEvents,
      stories: formattedStories,
      gallery: formattedGallery,
      organization: formattedOrg
    };
  }
}

export const searchService = new SearchService();
