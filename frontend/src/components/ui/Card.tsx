import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  bordered?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = true,
  bordered = true,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-6 sm:p-7',
    lg: 'p-8 sm:p-10'
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        bordered ? 'border border-warm-200/90' : ''
      } ${
        hoverEffect
          ? 'hover:shadow-card-hover hover:-translate-y-1 hover:border-forest-200'
          : 'shadow-card'
      } ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
