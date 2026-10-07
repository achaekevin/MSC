import React from 'react';
import { Link } from 'react-router-dom';
import { Program } from '../../types';
import { Card } from '../ui/Card';
import { ArrowRight, HeartHandshake, Users, Megaphone, Building2, LineChart, Stethoscope, Activity } from 'lucide-react';
import { ContentStatusBadge } from '../common/ContentStatusBadge';

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-forest-800" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-forest-800" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-forest-800" />;
      case 'Users':
        return <Users className="w-6 h-6 text-forest-800" />;
      case 'Megaphone':
        return <Megaphone className="w-6 h-6 text-forest-800" />;
      case 'Building2':
        return <Building2 className="w-6 h-6 text-forest-800" />;
      case 'LineChart':
        return <LineChart className="w-6 h-6 text-forest-800" />;
      default:
        return <HeartHandshake className="w-6 h-6 text-forest-800" />;
    }
  };

  return (
    <Card className="flex flex-col h-full group hover:-translate-y-1 transition-all duration-200" padding="none">
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-forest-950">
        <img
          src={program.image}
          alt={program.imageAlt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 bg-white/95 dark:bg-charcoal-900/90 backdrop-blur-sm p-2.5 rounded-xl shadow-sm animate-float">
          {getIcon(program.iconName)}
        </div>
        {program.metadata && (
          <div className="absolute top-4 right-4">
            <ContentStatusBadge metadata={program.metadata} />
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-charcoal-950 dark:text-white group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors font-display mb-2.5">
            {program.title}
          </h3>
          <p className="text-sm sm:text-base text-charcoal-800 dark:text-warm-200 line-clamp-3 leading-relaxed mb-4 font-medium transition-colors">
            {program.shortDescription}
          </p>
        </div>

        <div className="pt-4 border-t-2 border-warm-200 dark:border-charcoal-700 flex items-center justify-between">
          <span className="text-xs font-black text-earth-800 dark:text-amber-300 uppercase tracking-wider">
            Key Program
          </span>
          <Link
            to={`/programs/${program.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-black text-forest-900 dark:text-emerald-400 hover:text-black dark:hover:text-emerald-300 transition-colors group/link"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
