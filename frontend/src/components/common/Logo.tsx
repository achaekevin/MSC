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
    sm: 'w-14 h-14',
    md: 'w-18 h-18 sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 rounded-2xl py-1.5 transition-all duration-200 hover:opacity-95 group ${className}`}
      aria-label="Mwancha Senior Community - Return to Home"
    >
      {/* Official Brand Emblem */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} rounded-2xl bg-white p-2 shadow-lg border-2 ${
          isDark
            ? 'border-forest-200 shadow-forest-950/15 group-hover:border-forest-500'
            : 'border-forest-600/80 shadow-black/50 group-hover:border-forest-400'
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
        <div className="flex items-center gap-2">
          <span
            className={`font-black tracking-tight text-2xl sm:text-3xl lg:text-3xl font-display leading-none ${
              isDark ? 'text-forest-950' : 'text-warm-50'
            }`}
          >
            MWANCHA
          </span>
          <span
            className={`px-2.5 py-0.5 text-xs font-black rounded-md tracking-wider ${
              isDark
                ? 'bg-earth-100 text-earth-800 border border-earth-300 shadow-xs'
                : 'bg-forest-800 text-earth-300 border border-forest-600'
            }`}
          >
            MSC
          </span>
        </div>
        {!compact && (
          <span
            className={`text-xs sm:text-sm font-bold tracking-wider uppercase mt-1 ${
              isDark ? 'text-forest-800' : 'text-forest-200'
            }`}
          >
            Senior Community
          </span>
        )}
      </div>
    </Link>
  );
};


