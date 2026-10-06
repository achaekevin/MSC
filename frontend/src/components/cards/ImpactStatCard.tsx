import React from 'react';
import { ImpactMetric } from '../../types';
import { Users, HeartHandshake, Globe, Calendar } from 'lucide-react';
import { ContentStatusBadge } from '../common/ContentStatusBadge';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface ImpactStatCardProps {
  metric: ImpactMetric;
}

export const ImpactStatCard: React.FC<ImpactStatCardProps> = ({ metric }) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-6 h-6 text-earth-600 dark:text-amber-400" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-forest-700 dark:text-emerald-400" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-forest-700 dark:text-emerald-400" />;
      case 'Calendar':
        return <Calendar className="w-6 h-6 text-earth-600 dark:text-amber-400" />;
      default:
        return <Users className="w-6 h-6 text-forest-700 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-6 sm:p-7 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200 text-left flex flex-col justify-between relative group hover:-translate-y-1">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-warm-100 dark:bg-charcoal-800 flex items-center justify-center border border-warm-200 dark:border-charcoal-700 animate-float shadow-xs">
            {getIcon(metric.icon)}
          </div>
          {metric.metadata && (
            <ContentStatusBadge metadata={metric.metadata} />
          )}
        </div>
        <div className="text-3xl sm:text-4xl font-black text-forest-950 dark:text-emerald-400 font-display tracking-tight mb-2">
          <AnimatedCounter value={metric.value} durationMs={1400} />
        </div>
        <h4 className="text-base font-black text-charcoal-950 dark:text-white mb-2">
          {metric.label}
        </h4>
      </div>

      {metric.description && (
        <p className="text-xs sm:text-sm text-charcoal-800 dark:text-warm-200 leading-relaxed pt-3 border-t-2 border-warm-100 dark:border-charcoal-700 font-medium">
          {metric.description}
        </p>
      )}
    </div>
  );
};
