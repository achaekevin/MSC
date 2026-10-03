import React, { useState, useEffect } from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { EventCard } from '../../components/cards/EventCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { eventService } from '../../services/eventService';
import { EventItem } from '../../types';
import { Calendar, Users } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    let isMounted = true;
    eventService.getAll().then((data) => {
      if (isMounted) {
        setEvents(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const completedEvents = events.filter((e) => e.status === 'completed');
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : completedEvents;

  return (
    <div className="pb-20 space-y-16">
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

      {/* Tabs & Event Cards */}
      <section>
        <Container>
          <div className="flex items-center gap-3 mb-10 border-b border-warm-200 pb-4">
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : displayedEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-forest-700" />}
              title={`No ${activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Events Scheduled`}
              description={`There are currently no ${activeTab} community barazas or public forums on the MSC calendar. Please check back regularly or subscribe to updates.`}
              actionText="Contact Us for Inquiries"
              actionHref="/contact"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};
