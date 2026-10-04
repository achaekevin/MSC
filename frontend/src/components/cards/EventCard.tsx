import React from 'react';
import { Link } from 'react-router-dom';
import { EventItem } from '../../types';
import { Card } from '../ui/Card';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ContentStatusBadge } from '../common/ContentStatusBadge';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDateStr = event.startDate || event.date;
  const isPast = event.status === 'completed' || (eventDateStr ? new Date(eventDateStr) < new Date() : false);
  const formattedDate = eventDateStr
    ? new Date(eventDateStr).toLocaleDateString('en-KE', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Date TBD';

  return (
    <Card className="flex flex-col h-full group" padding="none">
      {event.image && (
        <div className="relative h-44 w-full overflow-hidden bg-warm-200">
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/mwancha-pavilion-gathering.jpg';
            }}
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant={isPast ? 'gray' : 'forest'}>
              {isPast ? 'Past Event' : event.category}
            </Badge>
            {event.metadata && (
              <ContentStatusBadge metadata={event.metadata} />
            )}
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="space-y-1.5 text-xs text-charcoal-600 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-forest-700" />
              <span>{event.timeString || event.time || '09:00 AM - 03:00 PM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-forest-700" />
              <span>{event.location}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-charcoal-900 group-hover:text-forest-800 transition-colors font-display line-clamp-2 mb-2">
            {event.title}
          </h3>
          <p className="text-sm text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
            {event.description}
          </p>
        </div>

        <div className="pt-4 border-t border-warm-100 flex items-center justify-between">
          <span
            className={`text-xs font-semibold ${
              isPast ? 'text-charcoal-400' : 'text-emerald-700'
            }`}
          >
            {isPast ? 'Completed' : 'Registration Open'}
          </span>
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest-800 hover:text-forest-950 transition-colors group/link"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
