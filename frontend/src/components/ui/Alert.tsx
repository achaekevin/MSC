import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = ''
}) => {
  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-950',
      icon: <Info className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
    }
  };

  const { bg, icon } = configs[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-left ${bg} ${className}`}
    >
      {icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
