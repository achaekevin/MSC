import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  id: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, id, required, placeholder = 'Select an option', className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-charcoal-800 mb-1.5"
        >
          {label} {required && <span className="text-red-600 font-bold">*</span>}
        </label>
        <div className="relative">
          <select
            id={id}
            ref={ref}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-help` : undefined}
            className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl border text-base transition-colors bg-white focus:outline-none focus:ring-2 disabled:bg-warm-100 disabled:cursor-not-allowed ${
              error
                ? 'border-red-400 text-red-900 focus:border-red-500 focus:ring-red-200'
                : 'border-warm-300 text-charcoal-900 focus:border-forest-600 focus:ring-forest-100'
            } ${className}`}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal-500">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
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

Select.displayName = 'Select';
