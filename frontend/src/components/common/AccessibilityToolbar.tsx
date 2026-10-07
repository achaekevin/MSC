import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Type,
  Minimize2,
  Maximize2,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  Check,
  X,
  ZapOff
} from 'lucide-react';

const STORAGE_KEY = 'msc_accessibility_preferences';

interface AccessibilityPrefs {
  textSize: 'normal' | 'lg' | 'xl';
  highContrast: boolean;
  reduceMotion: boolean;
}

const DEFAULT_PREFS: AccessibilityPrefs = {
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false
};

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const announce = useCallback((text: string) => {
    setAnnouncement(text);
    const timer = setTimeout(() => setAnnouncement(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Apply classes to documentElement
  useEffect(() => {
    const root = document.documentElement;

    // 1. Text Size
    root.classList.remove('text-size-lg', 'text-size-xl');
    if (prefs.textSize === 'lg') root.classList.add('text-size-lg');
    if (prefs.textSize === 'xl') root.classList.add('text-size-xl');

    // 2. High Contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Reduce Motion
    if (prefs.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  // Keyboard shortcut: Alt + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const setTextSize = (size: 'normal' | 'lg' | 'xl') => {
    setPrefs((prev) => ({ ...prev, textSize: size }));
    const labels = { normal: 'Standard text size', lg: 'Large text size (112%)', xl: 'Extra large text size (125%)' };
    announce(`Text size set to ${labels[size]}`);
  };

  const toggleContrast = () => {
    const nextVal = !prefs.highContrast;
    setPrefs((prev) => ({ ...prev, highContrast: nextVal }));
    announce(nextVal ? 'High contrast mode enabled' : 'High contrast mode disabled');
  };

  const toggleReduceMotion = () => {
    const nextVal = !prefs.reduceMotion;
    setPrefs((prev) => ({ ...prev, reduceMotion: nextVal }));
    announce(nextVal ? 'Reduced animations enabled' : 'Animations restored');
  };

  const handleReset = () => {
    setPrefs(DEFAULT_PREFS);
    announce('All accessibility settings restored to default');
  };

  const isCustomized =
    prefs.textSize !== 'normal' || prefs.highContrast || prefs.reduceMotion;

  return (
    <>
      {/* Screen-reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Floating Widget Trigger Button */}
      <div className="fixed bottom-5 left-5 z-40 print:hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full font-bold text-xs shadow-xl border transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-forest-500/40 ${
            isCustomized
              ? 'bg-amber-500 text-charcoal-950 border-amber-400 hover:bg-amber-400 font-extrabold ring-2 ring-amber-300'
              : 'bg-forest-900 text-warm-50 border-forest-700/80 hover:bg-forest-800'
          }`}
          aria-expanded={isOpen}
          aria-label="Open Senior Accessibility Controls (Keyboard shortcut: Alt + A)"
          title="Senior-Friendly Accessibility Controls (Alt + A)"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs">
            ♿
          </span>
          <span className="hidden sm:inline">Accessibility</span>
          {isCustomized && (
            <span className="w-2 h-2 rounded-full bg-forest-900 animate-pulse" />
          )}
        </button>
      </div>

      {/* Accessible Control Modal/Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Senior Citizen Accessibility Adjustments"
          className="fixed bottom-20 left-5 z-50 w-80 sm:w-96 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-forest-700 dark:border-emerald-500 shadow-2xl p-5 text-left text-charcoal-900 dark:text-warm-50 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-warm-200 dark:border-charcoal-700">
            <div className="flex items-center gap-2">
              <span className="text-xl">♿</span>
              <div>
                <h3 className="font-extrabold text-sm text-charcoal-900 dark:text-warm-50 font-display">
                  Senior Accessibility Controls
                </h3>
                <span className="text-[11px] text-charcoal-500 dark:text-warm-300 block">
                  Tailored for comfortable browsing &bull; Alt + A
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-warm-100 dark:hover:bg-charcoal-800 text-charcoal-500 dark:text-warm-300 transition-colors"
              aria-label="Close accessibility controls"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Text Size Control */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-200 uppercase tracking-wider mb-2">
                Reading Text Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTextSize('normal')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    prefs.textSize === 'normal'
                      ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                      : 'bg-warm-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 border-warm-200 dark:border-charcoal-700 hover:bg-warm-100'
                  }`}
                  aria-pressed={prefs.textSize === 'normal'}
                >
                  <span className="text-sm">A</span>
                  <span>Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTextSize('lg')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    prefs.textSize === 'lg'
                      ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                      : 'bg-warm-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 border-warm-200 dark:border-charcoal-700 hover:bg-warm-100'
                  }`}
                  aria-pressed={prefs.textSize === 'lg'}
                >
                  <span className="text-base font-extrabold">A+</span>
                  <span>Large</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTextSize('xl')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    prefs.textSize === 'xl'
                      ? 'bg-forest-900 text-white border-forest-900 shadow-sm'
                      : 'bg-warm-50 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 border-warm-200 dark:border-charcoal-700 hover:bg-warm-100'
                  }`}
                  aria-pressed={prefs.textSize === 'xl'}
                >
                  <span className="text-lg font-black">A++</span>
                  <span>Max Size</span>
                </button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700">
              <div className="pr-2">
                <span className="text-xs font-bold text-charcoal-900 dark:text-warm-100 block">
                  ◉ High Contrast Mode
                </span>
                <span className="text-[11px] text-charcoal-500 dark:text-warm-400">
                  Amplifies borders & text clarity for low vision
                </span>
              </div>
              <button
                type="button"
                onClick={toggleContrast}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                  prefs.highContrast ? 'bg-forest-700 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-charcoal-600'
                }`}
                role="switch"
                aria-checked={prefs.highContrast}
                aria-label="Toggle high contrast mode"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduce Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700">
              <div className="pr-2">
                <span className="text-xs font-bold text-charcoal-900 dark:text-warm-100 block">
                  ↔ Reduce Motion & Animations
                </span>
                <span className="text-[11px] text-charcoal-500 dark:text-warm-400">
                  Stops sliding effects for vestibular comfort
                </span>
              </div>
              <button
                type="button"
                onClick={toggleReduceMotion}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                  prefs.reduceMotion ? 'bg-forest-700 dark:bg-emerald-500' : 'bg-gray-300 dark:bg-charcoal-600'
                }`}
                role="switch"
                aria-checked={prefs.reduceMotion}
                aria-label="Toggle reduced motion"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    prefs.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Reset & Shortcut Info */}
          <div className="pt-3 border-t border-warm-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-charcoal-600 dark:text-warm-300 hover:text-forest-900 dark:hover:text-emerald-400 font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <span className="text-[10px] text-charcoal-400 dark:text-warm-400">
              Settings saved locally
            </span>
          </div>
        </div>
      )}
    </>
  );
};
