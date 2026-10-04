import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'earth' | 'warm' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    forest: 'bg-forest-100 dark:bg-forest-900/60 text-forest-900 dark:text-emerald-300 border-forest-200 dark:border-forest-700/60',
    earth: 'bg-earth-100 dark:bg-earth-900/60 text-earth-900 dark:text-amber-300 border-earth-300 dark:border-earth-700/60',
    warm: 'bg-warm-200 dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 border-warm-300 dark:border-charcoal-700',
    gray: 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-300 border-charcoal-200 dark:border-charcoal-700'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs md:text-sm px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
