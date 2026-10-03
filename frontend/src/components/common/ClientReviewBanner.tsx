import React, { useState, useEffect } from 'react';
import { isContentReviewMode } from '../../utils/contentReview';
import { ContentApprovalDrawer } from '../admin/ContentApprovalDrawer';
import { AlertCircle, X, ShieldAlert, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const ClientReviewBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('msc_review_banner_dismissed') === 'true';
    setIsDismissed(dismissed);
  }, []);

  // CRITICAL REQUIREMENT 51.13:
  // Must never appear in production.
  if (!isContentReviewMode()) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('msc_review_banner_dismissed', 'true');
  };

  const handleReopenBanner = () => {
    setIsDismissed(false);
    sessionStorage.removeItem('msc_review_banner_dismissed');
  };

  return (
    <>
      {/* Minimized Floating Pill when dismissed */}
      {isDismissed && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-charcoal-950 font-bold text-xs rounded-full shadow-lg border border-amber-300 transition-all transform hover:scale-105"
            title="Open Content Approval & Verification Registry"
          >
            <ShieldAlert className="w-4 h-4 text-charcoal-950" />
            <span>Content Review Mode</span>
          </button>
          <button
            onClick={handleReopenBanner}
            className="p-2 bg-charcoal-800 text-warm-200 hover:text-white rounded-full shadow-md text-xs hover:bg-charcoal-700 transition-colors"
            title="Expand Review Mode Banner"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Review Banner (Section 51.13) */}
      {!isDismissed && (
        <div 
          role="region" 
          aria-label="Content review status banner"
          className="bg-amber-500 text-charcoal-950 px-4 py-2.5 shadow-md border-b border-amber-600 relative z-40 transition-all text-xs sm:text-sm font-medium"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-1.5 bg-amber-600/30 rounded-lg text-charcoal-950">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              </span>
              <div>
                <div className="font-extrabold tracking-wide uppercase text-xs flex items-center gap-2">
                  <span>MSC Website — Client Review Version</span>
                  <span className="px-2 py-0.5 bg-charcoal-900 text-amber-300 text-[10px] rounded font-mono font-semibold">
                    DEV / STAGING ONLY
                  </span>
                </div>
                <p className="text-xs text-charcoal-900 font-normal">
                  Some content is pending client approval. Do not treat this version as final.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-3 py-1 bg-charcoal-900 hover:bg-charcoal-800 text-amber-300 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify Content Status</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 text-charcoal-800 hover:text-charcoal-950 hover:bg-amber-600/20 rounded transition-colors"
                title="Dismiss banner for this session"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Approval Drawer Modal */}
      <ContentApprovalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
