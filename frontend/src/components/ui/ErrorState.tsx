import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateSecondaryAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  retryText?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  secondaryAction?: ErrorStateSecondaryAction;
  icon?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Information Temporarily Unavailable',
  description = 'We encountered an unexpected issue while retrieving this information. Please refresh or try again in a few moments.',
  onRetry,
  retryText = 'Try Again',
  secondaryActionText,
  secondaryActionHref,
  onSecondaryAction,
  secondaryAction,
  icon,
  compact = false,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const effectiveSecLabel = secondaryAction?.label || secondaryActionText;
  const effectiveSecHref = secondaryAction?.href || secondaryActionHref;
  const effectiveSecOnClick = secondaryAction?.onClick || onSecondaryAction;

  const handleRetry = async () => {
    if (!onRetry) return;
    try {
      setIsRetrying(true);
      await Promise.resolve(onRetry());
    } finally {
      setIsRetrying(false);
    }
  };

  if (compact) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className={`p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left max-w-xl mx-auto my-4 ${className}`}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            {icon || <AlertCircle className="w-5 h-5 text-amber-700" />}
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-bold text-charcoal-900 font-display">
              {title}
            </h4>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              {description}
            </p>
            {onRetry && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  isLoading={isRetrying}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="bg-white text-xs"
                >
                  {retryText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`text-center py-12 px-6 rounded-3xl bg-white border border-warm-200 shadow-card max-w-xl mx-auto my-8 space-y-6 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
        {icon || <AlertCircle className="w-8 h-8 text-amber-700" />}
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200 inline-block">
          Notice
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 font-display">
          {title}
        </h3>
        <p className="text-sm text-charcoal-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleRetry}
            isLoading={isRetrying}
            icon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold shadow-sm"
          >
            {retryText}
          </Button>
        )}

        {effectiveSecLabel && (effectiveSecHref || effectiveSecOnClick) && (
          <Button
            type="button"
            variant="outline"
            size="md"
            to={effectiveSecHref}
            onClick={effectiveSecOnClick}
            className="w-full sm:w-auto"
          >
            {effectiveSecLabel}
          </Button>
        )}

        {!effectiveSecLabel && (
          <Button
            variant="outline"
            size="md"
            to="/"
            icon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Return Home
          </Button>
        )}
      </div>

      <div className="pt-4 border-t border-warm-100 text-xs text-charcoal-500 flex items-center justify-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-forest-700" />
        <span>Need further assistance? </span>
        <a href="/contact" className="text-forest-800 font-bold hover:underline">
          Contact Secretariat
        </a>
      </div>
    </div>
  );
};
