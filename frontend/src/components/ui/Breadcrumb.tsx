import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-charcoal-500 dark:text-warm-300">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-charcoal-600 dark:text-warm-300 hover:text-forest-800 dark:hover:text-emerald-400 transition-colors"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 dark:text-warm-400 flex-shrink-0" aria-hidden="true" />
              {isLast || !item.href ? (
                <span className="font-semibold text-charcoal-900 dark:text-warm-50" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-charcoal-600 dark:text-warm-300 hover:text-forest-800 dark:hover:text-emerald-400 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
