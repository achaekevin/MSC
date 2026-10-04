import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'earth';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  to?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  external?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      to,
      icon,
      iconPosition = 'left',
      external = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-sm px-3.5 py-2 gap-1.5 min-h-[38px]',
      md: 'text-base px-5 py-2.5 gap-2 min-h-[46px]',
      lg: 'text-lg px-6 py-3.5 gap-2.5 min-h-[52px]',
    };

    const variantStyles = {
      primary:
        'bg-forest-800 hover:bg-forest-700 text-warm-50 shadow-sm hover:shadow focus-visible:ring-forest-700',
      secondary:
        'bg-earth-600 hover:bg-earth-700 text-white shadow-sm hover:shadow focus-visible:ring-earth-600',
      outline:
        'border-2 border-forest-800 dark:border-emerald-400 text-forest-900 dark:text-emerald-300 hover:bg-forest-50 dark:hover:bg-forest-950/80 focus-visible:ring-forest-800',
      ghost:
        'text-charcoal-700 dark:text-warm-200 hover:bg-warm-200/70 dark:hover:bg-charcoal-800 hover:text-charcoal-900 dark:hover:text-warm-50 focus-visible:ring-charcoal-400',
      earth:
        'bg-warm-100 dark:bg-charcoal-800 text-earth-900 dark:text-amber-300 border border-warm-300 dark:border-charcoal-700 hover:bg-warm-200 dark:hover:bg-charcoal-700 focus-visible:ring-earth-500'
    };

    const content = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && icon && iconPosition === 'left' && icon}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && icon}
      </>
    );

    const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    if (to) {
      if (external) {
        return (
          <a
            href={to}
            className={combinedClassName}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content}
          </a>
        );
      }
      return (
        <Link to={to} className={combinedClassName}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
