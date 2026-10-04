import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-600 ${
        isDark
          ? 'bg-charcoal-900 border-charcoal-700 text-amber-300 hover:bg-charcoal-800 hover:border-amber-400/50 shadow-sm'
          : 'bg-white border-warm-200 text-forest-900 hover:bg-warm-100 hover:border-forest-300 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 text-charcoal-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="text-sm font-semibold">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
