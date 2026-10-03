import React from 'react';
import { ContentMetadata, ContentStatus, ContentSource } from '../../types';
import { isContentReviewMode, getStatusBadgeConfig } from '../../utils/contentReview';

interface ContentStatusBadgeProps {
  metadata?: ContentMetadata;
  status?: ContentStatus;
  source?: ContentSource;
  size?: 'xs' | 'sm';
  className?: string;
  showDetails?: boolean;
}

export const ContentStatusBadge: React.FC<ContentStatusBadgeProps> = ({
  metadata,
  status = metadata?.status || 'draft',
  source = metadata?.source,
  size = 'xs',
  className = '',
  showDetails = false
}) => {
  // CRITICAL REQUIREMENT 51.3:
  // These indicators must NEVER appear in the production build or when Review Mode is disabled.
  if (!isContentReviewMode()) {
    return null;
  }

  const config = getStatusBadgeConfig(status, source);
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider rounded border shadow-2xs select-none ${config.className} ${sizeClass} ${className}`}
      title={`${config.label}: ${config.description} ${metadata?.notes ? `| Note: ${metadata.notes}` : ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      <span>{config.label}</span>
      {showDetails && metadata?.approvedBy && (
        <span className="text-[9px] opacity-75 normal-case border-l border-current/30 pl-1 ml-0.5">
          by {metadata.approvedBy}
        </span>
      )}
    </span>
  );
};
