import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, X } from 'lucide-react';

const PRIVACY_CONSENT_KEY = 'msc_privacy_consent_decision';

export const PrivacyConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(PRIVACY_CONSENT_KEY);
      if (!consent) {
        // Small delay so page renders smoothly first
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(false);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        PRIVACY_CONSENT_KEY,
        JSON.stringify({ status: 'ACCEPTED_ALL', date: new Date().toISOString() })
      );
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(
        PRIVACY_CONSENT_KEY,
        JSON.stringify({ status: 'ESSENTIAL_ONLY', date: new Date().toISOString() })
      );
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and Consent Notice"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md border-t border-warm-300 dark:border-charcoal-700 shadow-2xl transition-all animate-fadeIn print:hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Explanation text */}
        <div className="flex items-start gap-3 flex-1 text-left">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-950 text-forest-800 dark:text-emerald-400 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 leading-relaxed">
            <span className="font-bold text-charcoal-900 dark:text-warm-50 block sm:inline mr-1">
              Data Privacy & Beneficiary Safeguards:
            </span>
            <span>
              Mwancha Senior Community upholds the Kenya Data Protection Act (2019). We collect minimal contact and application information solely to fulfill elder care inquiries, volunteer mobilization, and partnerships. We never monetize or sell personal information.
            </span>
            <Link
              to="/privacy"
              className="ml-1 text-forest-800 dark:text-emerald-400 font-bold underline hover:text-forest-950 dark:hover:text-emerald-300"
            >
              Read our Privacy & Retention Policy &rarr;
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
