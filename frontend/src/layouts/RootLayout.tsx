import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { AccessibilityToolbar } from '../components/common/AccessibilityToolbar';
import { PrivacyConsentBanner } from '../components/common/PrivacyConsentBanner';

export const RootLayout: React.FC = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-warm-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 transition-colors duration-200 selection:bg-forest-100 selection:text-forest-900 relative">

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

      {/* Senior Accessibility Floating Controls */}
      <AccessibilityToolbar />

      {/* Direct WhatsApp Contact Floating Action */}
      <WhatsAppButton phoneNumber="+254 790 629439" />

      {/* Privacy and Cookie Consent Banner */}
      <PrivacyConsentBanner />

      {/* Site Footer */}
      <Footer />
    </div>
  );
};
