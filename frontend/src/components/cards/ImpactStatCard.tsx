import React from 'react';
import { ImpactMetric } from '../../types';
import { Users, HeartHandshake, Globe, Calendar } from 'lucide-react';
import { ContentStatusBadge } from '../common/ContentStatusBadge';

interface ImpactStatCardProps {
  metric: ImpactMetric;
}

export const ImpactStatCard: React.FC<ImpactStatCardProps> = ({ metric }) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-6 h-6 text-earth-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-forest-700" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-forest-700" />;
      case 'Calendar':
        return <Calendar className="w-6 h-6 text-earth-600" />;
      default:
        return <Users className="w-6 h-6 text-forest-700" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-warm-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 text-left flex flex-col justify-between relative">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center">
            {getIcon(metric.icon)}
          </div>
          {metric.metadata && (
            <ContentStatusBadge metadata={metric.metadata} />
          )}
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-forest-900 font-display tracking-tight mb-2">
          {metric.value}
        </div>
        <h4 className="text-base font-bold text-charcoal-900 mb-2">
          {metric.label}
        </h4>
      </div>

      {metric.description && (
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed pt-3 border-t border-warm-100">
          {metric.description}
        </p>
      )}
    </div>
  );
};
