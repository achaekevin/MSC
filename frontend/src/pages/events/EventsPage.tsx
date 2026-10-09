import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { EventCard } from '../../components/cards/EventCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { eventService } from '../../services/eventService';
import { EventItem } from '../../types';
import { Calendar, Search } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Community Outreach', 'Senior Engagement', 'Health Outreach', 'Stakeholder Meeting']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, catsData] = await Promise.all([
        eventService.getAll(),
        eventService.getCategories().catch(() => [])
      ]);
      setEvents(eventsData);
      if (catsData && catsData.length > 0) {
        const names = Array.from(new Set(['All', ...catsData.map(c => c.name)]));
        setCategories(names);
      }
    } catch (err: any) {
      setError(
        err?.message || 'Unable to retrieve community events right now. Please verify your connection or try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const now = new Date();
  const isUpcoming = (e: EventItem) => {
    if (e.startDate) return new Date(e.startDate) >= now;
    if (e.date) return new Date(e.date) >= now;
    return e.status === 'upcoming' || e.status === 'PUBLISHED';
  };

  const upcomingEvents = events.filter(isUpcoming);
  const completedEvents = events.filter((e) => !isUpcoming(e));

  const tabEvents = activeTab === 'upcoming' ? upcomingEvents : completedEvents;

  const filteredEvents = tabEvents.filter((ev) => {
    const matchesCat = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pb-20 space-y-16">
      <SEO
        title="Events & Community Barazas"
        description="Stay informed about upcoming community sensitization dialogues, elder medical screenings, and stakeholder consultative assemblies."
      />
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Events & Forums' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Community Assemblies & Outreaches
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Events & Community Barazas
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Stay informed about upcoming community sensitization dialogues, elder medical screenings, and stakeholder consultative assemblies.
            </p>
          </div>
        </Container>
      </section>

      {/* Tabs & Filters */}
      <section>
        <Container>
          {/* Main Upcoming vs Completed Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-warm-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-forest-800 text-warm-50 shadow-sm'
                    : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
                }`}
              >
                Upcoming Forums ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-forest-800 text-warm-50 shadow-sm'
                    : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
                }`}
              >
                Past Assemblies ({completedEvents.length})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search event or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-forest-800 text-warm-50'
                    : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Community Events Temporarily Unavailable"
              description="We encountered a temporary delay loading community events. Please try again."
              onRetry={fetchEvents}
            />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-forest-700" />}
              title={`No ${activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Events Match Filters`}
              description={`There are currently no events matching your selected category and search criteria. Please adjust your filters or check back later.`}
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};
