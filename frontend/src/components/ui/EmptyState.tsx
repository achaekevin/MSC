import React from 'react';
import { FolderSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  action?: EmptyStateAction;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  action,
  className = ''
}) => {
  const effectiveLabel = action?.label || actionText;
  const effectiveHref = action?.href || actionHref;
  const effectiveOnClick = action?.onClick || onAction;

  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl bg-white border border-dashed border-warm-300 max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-14 h-14 mx-auto rounded-full bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
        {icon || <FolderSearch className="w-7 h-7 text-forest-700" />}
      </div>
      <h3 className="text-lg font-bold text-charcoal-900 mb-2 font-display">
        {title}
      </h3>
      <p className="text-sm text-charcoal-600 mb-6 leading-relaxed max-w-md mx-auto">
        {description}
      </p>
      {effectiveLabel && (
        <Button
          variant="outline"
          size="sm"
          to={effectiveHref}
          onClick={effectiveOnClick}
        >
          {effectiveLabel}
        </Button>
      )}
    </div>
  );
};
