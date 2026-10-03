import React from 'react';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  centered = false,
  className = ''
}) => {
  return (
    <div
      className={`mb-10 md:mb-14 ${
        centered ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'
      } ${className}`}
    >
      {badge && (
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 mb-3 text-xs md:text-sm font-semibold tracking-wider uppercase rounded-full bg-forest-100 text-forest-900 border border-forest-200 ${
            centered ? 'mx-auto' : ''
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-forest-600" aria-hidden="true" />
          {badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal-900 tracking-tight font-display">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-base sm:text-lg text-charcoal-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
