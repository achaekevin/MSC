import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { eventService } from '../../services/eventService';
import { EventItem } from '../../types';
import { PageLoader } from '../../components/ui/Skeleton';
import { Calendar, Clock, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [registered, setRegistered] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    eventService.getBySlug(slug || '').then((data) => {
      if (isMounted) {
        setEvent(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <PageLoader />;
  }

  if (!event) {
    return (
      <div className="py-20 text-center">
        <Container>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-3">Event Not Found</h2>
          <p className="text-charcoal-600 mb-6">The requested event could not be found.</p>
          <Button to="/events" variant="primary">Return to Events</Button>
        </Container>
      </div>
    );
  }

  const isPast = event.status === 'completed';

  return (
    <div className="pb-20 space-y-12">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container size="md">
          <Breadcrumb
            items={[
              { label: 'Events', href: '/events' },
              { label: event.title }
            ]}
          />

          <div className="mt-6 text-left space-y-4">
            <Badge variant={isPast ? 'gray' : 'forest'}>
              {isPast ? 'Completed Assembly' : event.category}
            </Badge>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 font-display">
              {event.title}
            </h1>

            {/* Quick Metadata Grid */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-warm-200 text-sm text-charcoal-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-700" />
                <span>
                  {new Date(event.date).toLocaleDateString('en-KE', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-700" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-700" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Details */}
      <section>
        <Container size="md">
          <div className="space-y-8 text-left">
            {event.image && (
              <div className="rounded-3xl overflow-hidden shadow-card border border-warm-200 aspect-[16/9] bg-warm-200">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-charcoal-900 font-display">
                Event Description & Focus
              </h2>
              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
                {event.description}
              </p>

              {event.registrationOpen && !isPast && (
                <div className="pt-6 border-t border-warm-200">
                  {registered ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <span className="font-semibold text-sm">
                        Thank you! Your interest has been registered. Our Secretariat will contact you with forum logistics.
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-warm-50 border border-warm-200">
                      <div>
                        <h4 className="font-bold text-charcoal-900 text-base">Community Attendance</h4>
                        <p className="text-xs sm:text-sm text-charcoal-600">Free admission for community members and local stakeholders.</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setRegistered(true)}
                        className="font-bold whitespace-nowrap"
                      >
                        Register for Forum
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800 hover:text-forest-950"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all events</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
