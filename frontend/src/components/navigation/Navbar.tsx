import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Heart } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { NAVIGATION_LINKS, MSC_ORGANIZATION } from '../../constants';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  // Close mobile menu and dropdowns upon route navigation
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Monitor scroll for sticky navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trap escape key for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-charcoal-950/95 backdrop-blur-md shadow-elevated border-b border-warm-200 dark:border-charcoal-800'
          : 'bg-warm-50/95 dark:bg-charcoal-900/95 backdrop-blur-sm border-b border-warm-200/60 dark:border-charcoal-800/80'
      }`}
    >
      {/* Top Banner Notice for Dignity and Mandate */}
      <div className="bg-forest-900 text-warm-100 text-xs py-1.5 px-4 text-center border-b border-forest-800 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-medium truncate">
            {MSC_ORGANIZATION.name} &bull; Advocating for the rights, dignity and welfare of older persons
          </span>
          <span className="text-forest-200 text-[11px] hidden md:inline">
            P.O. Box 21–40506, Kebirigo, Nyamira County, Kenya
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[88px] sm:min-h-[105px] md:min-h-[120px] py-2 sm:py-3">
          {/* Organization Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {NAVIGATION_LINKS.map((link) => {
              if (link.dropdown) {
                const isCurrentActive =
                  activeDropdown === link.name ||
                  link.dropdown.some((sub) => location.pathname === sub.href);

                return (
                  <div key={link.name} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(link.name)}
                      onMouseEnter={() => setActiveDropdown(link.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 ${
                        isCurrentActive
                          ? 'text-forest-900 dark:text-emerald-400 bg-forest-50/80 dark:bg-forest-950/80 font-bold'
                          : 'text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-warm-100 dark:hover:bg-charcoal-800'
                      }`}
                      aria-expanded={activeDropdown === link.name}
                      aria-haspopup="true"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === link.name ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === link.name && (
                      <div
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-charcoal-900 shadow-xl border border-warm-200 dark:border-charcoal-700 py-2.5 z-50 animate-fadeIn"
                        role="menu"
                      >
                        {link.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            role="menuitem"
                            className="block px-4 py-2.5 text-sm text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-forest-50 dark:hover:bg-charcoal-800 font-medium transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-forest-700 ${
                      isActive
                        ? 'text-forest-900 dark:text-emerald-400 bg-forest-50/80 dark:bg-forest-950/80 font-bold'
                        : 'text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-warm-100 dark:hover:bg-charcoal-800'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Primary Action CTA & Theme Toggle */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Button
              to="/donate"
              variant="secondary"
              size="sm"
              icon={<Heart className="w-4 h-4 fill-white" />}
              className="font-bold shadow-sm"
            >
              Support Our Work
            </Button>
          </div>

          {/* Mobile Right Controls: Theme Toggle & Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-warm-100 dark:hover:bg-charcoal-800 focus:outline-none focus:ring-2 focus:ring-forest-700"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close primary navigation' : 'Open primary navigation'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-warm-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 shadow-2xl animate-fadeIn">
          <div className="px-4 pt-3 pb-6 space-y-1.5 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {NAVIGATION_LINKS.map((link) => {
              if (link.dropdown) {
                const isExpanded = activeDropdown === link.name;
                return (
                  <div key={link.name} className="border-b border-warm-100 dark:border-charcoal-800/80 py-1">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(link.name)}
                      className="w-full flex items-center justify-between py-2.5 text-base font-semibold text-charcoal-800 dark:text-warm-100 text-left"
                      aria-expanded={isExpanded}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 text-charcoal-500 dark:text-warm-400 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="pl-4 pb-2 space-y-1 bg-warm-50/60 dark:bg-charcoal-900/80 rounded-lg my-1">
                        {link.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className="block py-2 text-sm text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 font-medium"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({ isActive }) =>
                    `block py-2.5 text-base font-semibold border-b border-warm-100 dark:border-charcoal-800/80 ${
                      isActive ? 'text-forest-900 dark:text-emerald-400 font-bold' : 'text-charcoal-800 dark:text-warm-100'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              );
            })}

            <div className="pt-4 flex flex-col gap-2.5">
              <Button
                to="/donate"
                variant="secondary"
                size="md"
                icon={<Heart className="w-4 h-4 fill-white" />}
                className="w-full font-bold"
              >
                Support Our Work
              </Button>
              <Button
                to="/get-involved"
                variant="outline"
                size="md"
                className="w-full font-medium dark:text-warm-100 dark:border-charcoal-700 dark:hover:bg-charcoal-900"
              >
                Ways to Get Involved
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
