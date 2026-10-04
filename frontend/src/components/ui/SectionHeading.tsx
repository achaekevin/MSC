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
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 mb-3.5 text-xs md:text-sm font-black tracking-wider uppercase rounded-full bg-forest-100 dark:bg-forest-900/80 text-forest-950 dark:text-emerald-300 border-2 border-forest-300 dark:border-forest-700/80 ${
            centered ? 'mx-auto' : ''
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-forest-600 dark:bg-emerald-400" aria-hidden="true" />
          {badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-charcoal-950 dark:text-white tracking-tight font-display transition-colors">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-base sm:text-lg md:text-xl text-charcoal-800 dark:text-warm-100 leading-relaxed font-medium transition-colors">
          {subtitle}
        </p>
      )}
    </div>
  );
};
