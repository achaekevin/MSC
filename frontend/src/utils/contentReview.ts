import { ContentStatus, ContentSource, ContentMetadata, ReviewableContentItem } from '../types';

/**
 * 51.3 CONTENT REVIEW MODE DETECTION
 * Strictly checks whether Content Review Mode is enabled.
 * Critical safety rule: Returns false if in a production build.
 */
export const isContentReviewMode = (): boolean => {
  // If Vite is running in production mode, never allow review indicators
  if (import.meta.env.PROD) {
    return false;
  }
  return import.meta.env.VITE_CONTENT_REVIEW_MODE === 'true';
};

/**
 * 51.12 PUBLISHING SAFETY RULE
 * Enforces that unapproved content cannot be published or displayed in production.
 */
export const isPublishSafe = (status?: ContentStatus): boolean => {
  if (!status) return true; // Default fallback for untagged legacy items
  return status === 'approved' || status === 'published';
};

/**
 * Visual badge config for Content Review indicators
 */
export interface BadgeConfig {
  label: string;
  className: string;
  description: string;
}

export const getStatusBadgeConfig = (status: ContentStatus, source?: ContentSource): BadgeConfig => {
  if (source === 'placeholder') {
    return {
      label: '[PLACEHOLDER]',
      className: 'bg-amber-100 text-amber-900 border-amber-300 font-mono',
      description: 'Temporary placeholder content awaiting official client assets/data.'
    };
  }

  switch (status) {
    case 'draft':
      return {
        label: '[DRAFT]',
        className: 'bg-stone-100 text-stone-700 border-stone-300 font-mono',
        description: 'Internal draft not yet submitted for client review.'
      };
    case 'in_review':
      return {
        label: '[CLIENT REVIEW]',
        className: 'bg-blue-100 text-blue-900 border-blue-300 font-mono',
        description: 'Submitted to MSC leadership; pending formal verification.'
      };
    case 'changes_requested':
      return {
        label: '[CHANGES REQUESTED]',
        className: 'bg-rose-100 text-rose-900 border-rose-300 font-mono',
        description: 'Feedback received from client; amendments required before approval.'
      };
    case 'approved':
      return {
        label: '[APPROVED]',
        className: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-mono',
        description: 'Formally approved by client authority; eligible for production release.'
      };
    case 'published':
      return {
        label: '[PUBLISHED]',
        className: 'bg-forest-100 text-forest-900 border-forest-300 font-mono',
        description: 'Final published production content.'
      };
    default:
      return {
        label: '[UNSPECIFIED]',
        className: 'bg-warm-100 text-warm-800 border-warm-300 font-mono',
        description: 'Status unassigned.'
      };
  }
};
