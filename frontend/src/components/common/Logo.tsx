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
    sm: 'w-11 h-11',
    md: 'w-14 h-14 md:w-16 md:h-16 lg:w-[70px] lg:h-[70px]',
    lg: 'w-20 h-20 md:w-24 md:h-24'
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:ring-offset-2 rounded-2xl py-1 transition-all duration-200 hover:opacity-95 group ${className}`}
      aria-label="Mwancha Senior Community - Return to Home"
    >
      {/* Official Brand Emblem */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center ${sizeClasses[size]} rounded-2xl bg-white p-2 shadow-md border ${
          isDark
            ? 'border-forest-200/90 shadow-forest-950/10 group-hover:border-forest-400'
            : 'border-forest-700/80 shadow-black/40 group-hover:border-forest-500'
        } transition-all duration-200 overflow-hidden`}
      >
        <img
          src="/logo.png"
          alt="Mwancha Senior Community Official Logo"
          className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-tight text-2xl md:text-3xl font-display leading-none ${
              isDark ? 'text-forest-950' : 'text-warm-50'
            }`}
          >
            MWANCHA
          </span>
          <span
            className={`px-2 py-0.5 text-[11px] font-extrabold rounded-md tracking-wider ${
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
            className={`text-xs md:text-sm font-semibold tracking-wider uppercase mt-1 ${
              isDark ? 'text-forest-800/90' : 'text-forest-200'
            }`}
          >
            Senior Community
          </span>
        )}
      </div>
    </Link>
  );
};


