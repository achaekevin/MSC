import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  children
}) => {
  return (
    <div className="bg-forest-900 text-white py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-850 opacity-90" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        {badge && (
          <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider uppercase rounded-full bg-forest-800 text-emerald-300 border border-forest-700">
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-warm-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-base sm:text-lg text-warm-200 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
