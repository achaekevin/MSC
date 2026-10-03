import { prisma } from '../config/database.js';
import { ContentStatus } from '@prisma/client';

export class SearchService {
  async searchPublicContent(query: string, limit = 10) {
    if (!query || query.trim().length < 2) {
      return {
        programs: [],
        news: [],
        events: []
      };
    }

    const searchTerm = query.trim();

    const [programs, news, events] = await Promise.all([
      prisma.program.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: searchTerm } },
            { summary: { contains: searchTerm } },
            { description: { contains: searchTerm } }
          ]
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          iconName: true,
          image: true
        }
      }),

      prisma.newsArticle.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: searchTerm } },
            { summary: { contains: searchTerm } },
            { content: { contains: searchTerm } }
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
      }),

      prisma.event.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { location: { contains: searchTerm } }
          ]
        },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          startDate: true,
          location: true
        }
      })
    ]);

    return {
      query: searchTerm,
      totalResults: programs.length + news.length + events.length,
      programs: programs.map(p => ({ ...p, type: 'program', path: `/programs/${p.slug}` })),
      news: news.map(n => ({ ...n, type: 'news', path: `/news/${n.slug}` })),
      events: events.map(e => ({ ...e, type: 'event', path: `/events/${e.slug}` }))
    };
  }
}

export const searchService = new SearchService();
