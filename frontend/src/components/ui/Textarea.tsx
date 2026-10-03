import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  id: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, required, rows = 4, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-charcoal-800 mb-1.5"
        >
          {label} {required && <span className="text-red-600 font-bold">*</span>}
        </label>
        <div className="relative">
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
            className={`w-full px-4 py-3 rounded-xl border text-base transition-colors bg-white placeholder-charcoal-400 focus:outline-none focus:ring-2 disabled:bg-warm-100 disabled:cursor-not-allowed resize-y ${
              error
                ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-200'
                : 'border-warm-300 text-charcoal-900 focus:border-forest-600 focus:ring-forest-100'
            } ${className}`}
            {...props}
          />
          {error && (
            <div className="absolute right-3.5 top-3.5 pointer-events-none text-red-500">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${id}-help`} className="mt-1.5 text-xs text-charcoal-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
