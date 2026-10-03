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
    forest: 'bg-forest-100 text-forest-900 border-forest-200',
    earth: 'bg-earth-100 text-earth-900 border-earth-300',
    warm: 'bg-warm-200 text-charcoal-800 border-warm-300',
    gray: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
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
