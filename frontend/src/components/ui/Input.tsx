import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  id: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-charcoal-800 mb-1.5"
        >
          {label} {required && <span className="text-red-600 font-bold">*</span>}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
            className={`w-full px-4 py-3 rounded-xl border text-base transition-colors bg-white placeholder-charcoal-400 focus:outline-none focus:ring-2 disabled:bg-warm-100 disabled:cursor-not-allowed ${
              error
                ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-200'
                : 'border-warm-300 text-charcoal-900 focus:border-forest-600 focus:ring-forest-100'
            } ${className}`}
            {...props}
          />
          {error && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-red-500">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
        </div>
        {error ? (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1">
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

Input.displayName = 'Input';
