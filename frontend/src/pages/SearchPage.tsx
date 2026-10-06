import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  X,
  HeartHandshake,
  Newspaper,
  Calendar,
  Sparkles,
  Camera,
  Building,
  ArrowRight,
  Filter,
  Loader2,
  SlidersHorizontal,
  Compass,
  MapPin,
  Clock
} from 'lucide-react';
import { searchService, SearchCategoryType, SearchResultItem } from '../services/searchService';
import { PageHeader } from '../components/common/PageHeader';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as SearchCategoryType) || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<SearchCategoryType>(initialType);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    programs: SearchResultItem[];
    news: SearchResultItem[];
    events: SearchResultItem[];
    stories: SearchResultItem[];
    gallery: SearchResultItem[];
    organization: SearchResultItem[];
    totalResults: number;
  }>({
    programs: [],
    news: [],
    events: [],
    stories: [],
    gallery: [],
    organization: [],
    totalResults: 0
  });

  const categories: Array<{ id: SearchCategoryType; label: string; count?: number }> = [
    { id: 'all', label: 'All', count: results.totalResults },
    { id: 'programs', label: 'Programs', count: results.programs.length },
    { id: 'news', label: 'News', count: results.news.length },
    { id: 'events', label: 'Events', count: results.events.length },
    { id: 'stories', label: 'Stories', count: results.stories.length },
    { id: 'gallery', label: 'Gallery', count: results.gallery.length },
    { id: 'organization', label: 'Organization', count: results.organization.length }
  ];

  const executeSearch = useCallback(async (q: string, type: SearchCategoryType) => {
    if (!q || q.trim().length < 2) {
      setResults({
        programs: [],
        news: [],
        events: [],
        stories: [],
        gallery: [],
        organization: [],
        totalResults: 0
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await searchService.search(q, type, 30);
      setResults({
        programs: res.programs,
        news: res.news,
        events: res.events,
        stories: res.stories,
        gallery: res.gallery,
        organization: res.organization,
        totalResults: res.totalResults
      });
    } catch (err) {
      console.warn('Search query error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update URL params when query or active type change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (activeType !== 'all') params.set('type', activeType);
    setSearchParams(params, { replace: true });

    executeSearch(query, activeType);
  }, [query, activeType, setSearchParams, executeSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, activeType);
  };

  const getFilteredItems = (): SearchResultItem[] => {
    if (activeType === 'programs') return results.programs;
    if (activeType === 'news') return results.news;
    if (activeType === 'events') return results.events;
    if (activeType === 'stories') return results.stories;
    if (activeType === 'gallery') return results.gallery;
    if (activeType === 'organization') return results.organization;

    return [
      ...results.programs,
      ...results.news,
      ...results.events,
      ...results.stories,
      ...results.gallery,
      ...results.organization
    ];
  };

  const filteredItems = useMemo(() => getFilteredItems(), [results, activeType]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'program':
        return {
          icon: <HeartHandshake className="w-3.5 h-3.5" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Program'
        };
      case 'news':
        return {
          icon: <Newspaper className="w-3.5 h-3.5" />,
          color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
          label: 'News'
        };
      case 'event':
        return {
          icon: <Calendar className="w-3.5 h-3.5" />,
          color: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          label: 'Event'
        };
      case 'story':
        return {
          icon: <Sparkles className="w-3.5 h-3.5" />,
          color: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
          label: 'Story'
        };
      case 'gallery':
        return {
          icon: <Camera className="w-3.5 h-3.5" />,
          color: 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
          label: 'Gallery'
        };
      case 'organization':
      default:
        return {
          icon: <Building className="w-3.5 h-3.5" />,
          color: 'bg-forest-50 text-forest-900 border-forest-200 dark:bg-forest-950/60 dark:text-forest-300 dark:border-forest-800',
          label: 'Organization'
        };
    }
  };

  return (
    <div className="min-h-screen bg-warm-50/60 dark:bg-charcoal-950">
      <PageHeader
        title="Global Directory & Advanced Search"
        subtitle="Search across Mwancha Senior Community programs, news dispatches, events calendar, field stories, photo archives, and organizational records."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search Input Bar */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleFormSubmit} className="relative shadow-elevated rounded-2xl overflow-hidden bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-700">
            <div className="flex items-center px-4 sm:px-6 py-3.5 sm:py-4">
              <Search className="w-6 h-6 text-forest-800 dark:text-emerald-400 shrink-0 mr-3" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search MSC..."
                className="w-full text-base sm:text-lg bg-transparent text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-warm-200 rounded-full mr-2"
                  title="Clear input"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-sm transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Filter Tabs (Requested by User) */}
          <div className="mt-6 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => {
              const isActive = activeType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveType(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-forest-800 text-white shadow-sm ring-2 ring-forest-800 ring-offset-2 dark:ring-offset-charcoal-950 font-bold'
                      : 'bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  {typeof cat.count === 'number' && query.trim().length >= 2 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-400'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Section */}
        <div className="mt-10 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-warm-200 dark:border-charcoal-800 pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-forest-700 dark:text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-charcoal-900 dark:text-warm-100">
              {query.trim().length >= 2 ? (
                <>
                  Results for <span className="text-forest-800 dark:text-emerald-400">"{query}"</span>
                  <span className="text-sm font-normal text-charcoal-500 ml-2">
                    ({filteredItems.length} found)
                  </span>
                </>
              ) : (
                'Suggested & Featured Records'
              )}
            </h2>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-800 dark:text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying database...</span>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {query.trim().length >= 2 ? (
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => {
                const badgeInfo = getTypeBadge(item.type);
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.path}
                    className="bg-white dark:bg-charcoal-900 rounded-2xl border border-warm-200 dark:border-charcoal-800 p-5 shadow-xs hover:border-forest-600 dark:hover:border-forest-700 hover:shadow-elevated transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Header: Type Badge & Custom Sub-badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeInfo.color}`}>
                          {badgeInfo.icon}
                          <span>{badgeInfo.label}</span>
                        </span>
                        {item.badge && (
                          <span className="text-[11px] font-semibold text-charcoal-500 dark:text-charcoal-400 truncate max-w-[150px]">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Image Preview if available */}
                      {item.image && (
                        <div className="mb-3 rounded-xl overflow-hidden aspect-video bg-warm-100 dark:bg-charcoal-800">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="font-bold text-base sm:text-lg text-charcoal-900 dark:text-warm-100 group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Summary */}
                      <p className="mt-2 text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Metadata Footer & Action */}
                    <div className="mt-5 pt-3 border-t border-warm-100 dark:border-charcoal-800/80 flex items-center justify-between text-xs text-charcoal-500">
                      <div className="flex items-center gap-2 truncate">
                        {item.location && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-forest-600" />
                            <span className="truncate">{item.location}</span>
                          </span>
                        )}
                        {item.date && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-forest-600" />
                            <span>{item.date}</span>
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 font-bold text-forest-800 dark:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-auto">
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            !loading && (
              <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-12 text-center border border-warm-200 dark:border-charcoal-800 max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-warm-100 dark:bg-charcoal-800 flex items-center justify-center mx-auto text-charcoal-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100">
                  No records match "{query}"
                </h3>
                <p className="text-sm text-charcoal-600 dark:text-warm-400">
                  We couldn't find matches across {activeType === 'all' ? 'the MSC directory' : activeType}. Try adjusting your keywords or switching filter categories.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setActiveType('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-warm-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 text-xs font-bold hover:bg-forest-100 transition-colors"
                  >
                    Clear Filter & Reset
                  </button>
                </div>
              </div>
            )
          )
        ) : (
          /* Empty / Default State with Topic Discovery Cards */
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 font-display">
                Browse Key Organizational Pillars
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-400">
                Type any keyword into the search bar above or choose a primary thematic area below to explore MSC records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Core Programs',
                  desc: 'Healthcare outreaches, positive parenting & elder rights advocacy.',
                  type: 'programs' as const,
                  icon: <HeartHandshake className="w-5 h-5 text-emerald-600" />
                },
                {
                  title: 'Dispatches & News',
                  desc: 'Field updates, barazas, policy dialogues & press communications.',
                  type: 'news' as const,
                  icon: <Newspaper className="w-5 h-5 text-blue-600" />
                },
                {
                  title: 'Events & Assemblies',
                  desc: 'Community consultative forums, clinics & volunteer conventions.',
                  type: 'events' as const,
                  icon: <Calendar className="w-5 h-5 text-amber-600" />
                },
                {
                  title: 'Impact Stories',
                  desc: 'Real life narratives from vulnerable elders across Nyamira County.',
                  type: 'stories' as const,
                  icon: <Sparkles className="w-5 h-5 text-purple-600" />
                }
              ].map(topic => (
                <button
                  key={topic.title}
                  type="button"
                  onClick={() => {
                    setActiveType(topic.type);
                    setQuery('community');
                  }}
                  className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 text-left hover:border-forest-600 dark:hover:border-forest-700 hover:shadow-md transition-all group"
                >
                  <div className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-800 w-fit group-hover:scale-110 transition-transform">
                    {topic.icon}
                  </div>
                  <h4 className="mt-4 font-bold text-sm text-charcoal-900 dark:text-warm-100 group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors">
                    {topic.title}
                  </h4>
                  <p className="mt-1 text-xs text-charcoal-500 dark:text-warm-400">
                    {topic.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
