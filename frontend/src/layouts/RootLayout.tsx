import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { ClientReviewBanner } from '../components/common/ClientReviewBanner';

export const RootLayout: React.FC = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-charcoal-900 selection:bg-forest-100 selection:text-forest-900">
      {/* 51.13 Development & Staging Client Review Banner */}
      <ClientReviewBanner />

      {/* Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-forest-900 text-warm-50 rounded-lg shadow-lg font-semibold"
      >
        Skip to main content
      </a>

      {/* Main Top Navigation */}
      <Navbar />

      {/* Primary Page Content */}
      <main id="main-content" className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      {/* Site Footer */}
      <Footer />
    </div>
  );
};
