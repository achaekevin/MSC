import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  compact = false,
  size = 'md'
}) => {
  const isDark = variant === 'dark';

  const sizeClasses = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-13 lg:h-13',
    lg: 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 rounded-xl py-0.5 transition-all duration-200 hover:opacity-95 group min-w-0 ${className}`}
      aria-label="Mwancha Senior Community - Return to Home"
    >
      {/* Official Brand Emblem */}
      <div
        style={{ backgroundColor: '#ffffff' }}
        className={`preserve-white relative flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} rounded-lg sm:rounded-xl p-1 shadow-sm sm:shadow-md border border-forest-200 dark:border-charcoal-700 transition-all duration-200 overflow-hidden`}
      >
        <img
          src="/logo.png"
          alt="Mwancha Senior Community Official Logo"
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight text-base sm:text-lg md:text-xl lg:text-2xl font-display leading-tight transition-colors ${
              isDark ? 'text-forest-950 dark:text-warm-50' : 'text-warm-50'
            }`}
          >
            MWANCHA
          </span>
          <span
            className={`px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black rounded tracking-wider transition-colors select-none ${
              isDark
                ? 'bg-earth-100 dark:bg-earth-900/80 text-earth-900 dark:text-amber-300 border border-earth-300 dark:border-earth-700'
                : 'bg-forest-800 text-earth-300 border border-forest-600'
            }`}
          >
            MSC
          </span>
        </div>
        {!compact && (
          <span
            className={`text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wider uppercase leading-none mt-0.5 transition-colors truncate max-w-[125px] xs:max-w-[160px] sm:max-w-none ${
              isDark ? 'text-forest-700 dark:text-emerald-400' : 'text-forest-200'
            }`}
          >
            Senior Community
          </span>
        )}
      </div>
    </Link>
  );
};


