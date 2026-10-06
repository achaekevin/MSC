import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2,
  ExternalLink
} from 'lucide-react';
import { searchService, SearchCategoryType, SearchResultItem } from '../../services/searchService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialType?: SearchCategoryType;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialType = 'all'
}) => {
  const navigate = useNavigate();
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

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults({
        programs: [],
        news: [],
        events: [],
        stories: [],
        gallery: [],
        organization: [],
        totalResults: 0
      });
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Execute live search
  const performSearch = useCallback(async (searchQuery: string, searchType: SearchCategoryType) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
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
      const res = await searchService.search(searchQuery, searchType, 8);
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
      console.warn('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(val, activeType);
    }, 250);
  };

  const handleTypeChange = (type: SearchCategoryType) => {
    setActiveType(type);
    performSearch(query, type);
  };

  const handleResultClick = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleViewAllOnPage = () => {
    onClose();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (activeType !== 'all') params.set('type', activeType);
    navigate(`/search?${params.toString()}`);
  };

  if (!isOpen) return null;

  // Filter categories to display
  const categories: Array<{ id: SearchCategoryType; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'programs', label: 'Programs' },
    { id: 'news', label: 'News' },
    { id: 'events', label: 'Events' },
    { id: 'stories', label: 'Stories' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'organization', label: 'Organization' }
  ];

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

  const items = getFilteredItems();

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'program':
        return <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'story':
        return <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'gallery':
        return <Camera className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'organization':
      default:
        return <Building className="w-4 h-4 text-forest-700 dark:text-emerald-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-charcoal-950/60 backdrop-blur-sm flex justify-center items-start animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-charcoal-900 rounded-2xl shadow-2xl border border-warm-200 dark:border-charcoal-700 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="relative border-b border-warm-200 dark:border-charcoal-800 p-4 sm:p-5 flex items-center gap-3">
          <Search className="w-5 h-5 text-forest-700 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search MSC..."
            className="w-full bg-transparent text-charcoal-900 dark:text-white placeholder-charcoal-400 dark:placeholder-charcoal-500 focus:outline-none text-base sm:text-lg font-medium"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleViewAllOnPage();
              }
            }}
          />
          {loading && <Loader2 className="w-4 h-4 text-forest-600 animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => {
                setQuery('');
                setResults({
                  programs: [],
                  news: [],
                  events: [],
                  stories: [],
                  gallery: [],
                  organization: [],
                  totalResults: 0
                });
                inputRef.current?.focus();
              }}
              className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-warm-200 rounded-full"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
            title="Close dialog"
          >
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-charcoal-400 bg-warm-100 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 rounded font-mono">
              ESC
            </kbd>
            <X className="w-5 h-5 sm:hidden" />
          </button>
        </div>

        {/* Filter Pills Header */}
        <div className="px-4 py-2.5 bg-warm-50/70 dark:bg-charcoal-950/40 border-b border-warm-200 dark:border-charcoal-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isActive = activeType === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleTypeChange(cat.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all shrink-0 ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'bg-white dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-700 border border-warm-200 dark:border-charcoal-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-warm-100 dark:divide-charcoal-800/60 p-2">
          {query.trim().length >= 2 ? (
            items.length > 0 ? (
              <div className="space-y-1">
                {items.map(item => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item.path)}
                    className="w-full text-left p-3 rounded-xl hover:bg-forest-50/70 dark:hover:bg-charcoal-800 transition-colors flex items-start gap-3 group"
                  >
                    <div className="p-2 rounded-lg bg-warm-100 dark:bg-charcoal-700 shrink-0 mt-0.5 group-hover:bg-white dark:group-hover:bg-charcoal-600 transition-colors">
                      {getCategoryIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-charcoal-900 dark:text-warm-100 group-hover:text-forest-900 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-emerald-300 border border-forest-200 dark:border-forest-800 uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-600 dark:text-warm-300 line-clamp-2 mt-0.5">
                        {item.summary}
                      </p>
                      {(item.date || item.location) && (
                        <div className="flex items-center gap-3 text-[11px] text-charcoal-400 dark:text-charcoal-400 mt-1">
                          {item.date && <span>{item.date}</span>}
                          {item.location && <span>&bull; {item.location}</span>}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-forest-700 dark:group-hover:text-emerald-400 shrink-0 mt-2 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-warm-100 dark:bg-charcoal-800 flex items-center justify-center mx-auto text-charcoal-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-900 dark:text-warm-100">
                    No results found for "{query}"
                  </h4>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 max-w-sm mx-auto">
                    Try searching for terms like "Elder rights", "Health outreaches", "Volunteers", "Nyamira", or "Dignity".
                  </p>
                </div>
              )
            )
          ) : (
            /* Suggested / Prompt View */
            <div className="py-8 px-4 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400 dark:text-charcoal-500">
                Suggested Search Topics
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  'Psychosocial Support',
                  'Health Outreaches',
                  'Ward Volunteers',
                  'Elder Rights & Advocacy',
                  'Kebirigo Center',
                  'Community Stories'
                ].map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setQuery(topic);
                      performSearch(topic, activeType);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-warm-100 dark:bg-charcoal-800 hover:bg-forest-100 dark:hover:bg-forest-950 text-xs font-semibold text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 border border-warm-200 dark:border-charcoal-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-warm-50 dark:bg-charcoal-950 border-t border-warm-200 dark:border-charcoal-800 flex items-center justify-between text-xs text-charcoal-500 dark:text-charcoal-400">
          <span className="flex items-center gap-1.5">
            {query.trim().length >= 2 && `${results.totalResults} result(s) found`}
          </span>
          <button
            type="button"
            onClick={handleViewAllOnPage}
            className="inline-flex items-center gap-1 font-bold text-forest-800 dark:text-emerald-400 hover:underline"
          >
            <span>Open Advanced Search Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
