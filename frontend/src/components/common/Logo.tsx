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
    sm: 'w-16 h-16 sm:w-20 sm:h-20',
    md: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36',
    lg: 'w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44'
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-4 sm:gap-5 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 rounded-2xl py-1.5 transition-all duration-200 hover:opacity-95 group ${className}`}
      aria-label="Mwancha Senior Community - Return to Home"
    >
      {/* Official Brand Emblem */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} rounded-2xl bg-white p-1 sm:p-1.5 shadow-xl border-2 ${
          isDark
            ? 'border-forest-200 shadow-forest-950/20 group-hover:border-forest-500'
            : 'border-forest-600/80 shadow-black/60 group-hover:border-forest-400'
        } transition-all duration-200 overflow-hidden`}
      >
        <img
          src="/logo.png"
          alt="Mwancha Senior Community Official Logo"
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2.5">
          <span
            className={`font-black tracking-tight text-2xl sm:text-3xl lg:text-4xl font-display leading-none ${
              isDark ? 'text-forest-950 dark:text-warm-50' : 'text-warm-50'
            }`}
          >
            MWANCHA
          </span>
          <span
            className={`px-2.5 py-0.5 text-xs sm:text-sm font-black rounded-lg tracking-wider ${
              isDark
                ? 'bg-earth-100 dark:bg-earth-900/60 text-earth-900 dark:text-earth-300 border border-earth-300 dark:border-earth-700/60 shadow-xs'
                : 'bg-forest-800 text-earth-300 border border-forest-600'
            }`}
          >
            MSC
          </span>
        </div>
        {!compact && (
          <span
            className={`text-xs sm:text-sm font-extrabold tracking-widest uppercase mt-1 ${
              isDark ? 'text-forest-800 dark:text-forest-300' : 'text-forest-200'
            }`}
          >
            Senior Community
          </span>
        )}
      </div>
    </Link>
  );
};


