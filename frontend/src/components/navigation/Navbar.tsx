import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Heart, Phone, MessageCircle, Lock, Shield, Search, LogOut } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { SearchModal } from '../search/SearchModal';
import { NAVIGATION_LINKS, MSC_ORGANIZATION } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_ADMIN');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  // Trap escape key & Ctrl/Cmd + K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveDropdown(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
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
      {/* Top Banner Notice for Dignity and Mandate & Direct Contacts */}
      <div className="bg-forest-950 text-warm-100 text-xs py-1 px-3 sm:px-4 border-b border-forest-800 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <span className="font-medium truncate hidden xl:inline text-[11px] sm:text-xs">
            {MSC_ORGANIZATION.name} &bull; Advocating for elder rights, healthcare & welfare
          </span>
          <div className="flex items-center justify-between sm:justify-end w-full xl:w-auto xl:ml-auto gap-2 sm:gap-3 text-[11px] font-medium whitespace-nowrap">
            <a
              href="tel:+254790629439"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-warm-200 hover:text-white transition-colors flex-shrink-0"
              aria-label="Call MSC Helpline at +254 790 629439"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span><span className="hidden sm:inline">Helpline: </span><strong className="text-white">+254 790 629439</strong></span>
            </a>
            <span className="text-forest-700 select-none">|</span>
            <a
              href="https://wa.me/254790629439?text=Hello%20Mwancha%20Senior%20Community%2C%20I%20would%20like%20to%20inquire%20about%20your%20programs%20and%20support%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold shadow-xs transition-colors flex-shrink-0"
              aria-label="Direct WhatsApp inquiry with MSC at +254 790 629439"
            >
              <MessageCircle className="w-3 h-3 fill-current flex-shrink-0" />
              <span>WhatsApp</span>
            </a>
            <span className="text-forest-700 select-none">|</span>
            {isAdmin ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-emerald-300 hover:text-white hover:bg-forest-900 transition-colors font-medium border border-forest-800 flex-shrink-0"
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                  className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-warm-300 hover:text-white hover:bg-red-900/60 transition-colors font-medium border border-red-800/50 flex-shrink-0 text-xs cursor-pointer"
                  title="Sign out of admin session"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-warm-200 hover:text-white hover:bg-forest-900 transition-colors font-medium border border-forest-800 flex-shrink-0"
                title="Administrator & Staff Sign In"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between min-h-[56px] sm:min-h-[70px] py-1 sm:py-2 gap-2">
          {/* Organization Logo */}
          <div className="min-w-0 flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-shrink" aria-label="Main Navigation">
            {NAVIGATION_LINKS.map((link) => {
              if (link.dropdown) {
                const isCurrentActive =
                  activeDropdown === link.name ||
                  link.dropdown.some((sub) => location.pathname === sub.href);

                return (
                  <div key={link.name} className="relative group">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(link.name)}
                      onMouseEnter={() => setActiveDropdown(link.name)}
                      className={`inline-flex items-center gap-1 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-forest-700 ${
                        isCurrentActive
                          ? 'text-forest-900 dark:text-emerald-400 bg-forest-50/80 dark:bg-forest-950/80 font-bold'
                          : 'text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-warm-100 dark:hover:bg-charcoal-800'
                      }`}
                      aria-expanded={activeDropdown === link.name}
                      aria-haspopup="true"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          activeDropdown === link.name ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === link.name && (
                      <div
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-white dark:bg-charcoal-900 shadow-xl border border-warm-200 dark:border-charcoal-700 py-2 z-50 animate-fadeIn"
                        role="menu"
                      >
                        {link.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            role="menuitem"
                            className="block px-4 py-2 text-xs xl:text-sm text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-forest-50 dark:hover:bg-charcoal-800 font-medium transition-colors"
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
                    `px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-forest-700 ${
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

          {/* Desktop Primary Action CTA, Search & Theme Toggle */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-shrink-0">
            {/* Global Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-warm-100 dark:bg-charcoal-800 hover:bg-forest-50 dark:hover:bg-charcoal-700 hover:text-forest-900 dark:hover:text-emerald-400 border border-warm-200 dark:border-charcoal-700 transition-all cursor-pointer group shadow-2xs whitespace-nowrap"
              title="Global Search (Ctrl + K)"
              aria-label="Global Search across MSC"
            >
              <Search className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline">Search MSC...</span>
              <span className="inline xl:hidden">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-charcoal-400 bg-white dark:bg-charcoal-900 border border-warm-300 dark:border-charcoal-700 rounded">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <Button
              to="/donate"
              variant="secondary"
              size="sm"
              icon={<Heart className="w-3.5 h-3.5 fill-white" />}
              className="font-bold shadow-sm whitespace-nowrap px-3 text-xs xl:text-sm"
            >
              Support Our Work
            </Button>
          </div>

          {/* Mobile Right Controls: Search, Theme Toggle & Mobile Menu Hamburger */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Open search dialog"
              title="Search MSC"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-forest-800 dark:text-emerald-400" />
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 sm:p-2.5 rounded-xl text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 hover:bg-warm-100 dark:hover:bg-charcoal-800 focus:outline-none focus:ring-2 focus:ring-forest-700"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close primary navigation' : 'Open primary navigation'}
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
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

              <div className="pt-2 grid grid-cols-2 gap-2">
                <a
                  href="tel:+254790629439"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-sm transition-colors text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Helpline</span>
                </a>
                <a
                  href="https://wa.me/254790629439?text=Hello%20Mwancha%20Senior%20Community%2C%20I%20would%20like%20to%20inquire%20about%20your%20programs%20and%20support%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Mobile Admin Sign In / Log Out Link */}
              <div className="pt-2 border-t border-warm-100 dark:border-charcoal-800/80">
                {isAdmin ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-forest-900 text-white text-xs font-semibold transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                      }}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out Admin</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/admin/login"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-warm-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:text-forest-900 dark:hover:text-emerald-400 text-xs font-semibold transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                    <span>Staff & Admin Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Dialog */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};
