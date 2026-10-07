import React, { useState } from 'react';
import {
  X,
  Monitor,
  Smartphone,
  Calendar,
  User,
  Tag,
  Share2,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NewsArticleInput } from '../../services/newsService';

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticleInput | null;
  scheduledDateTime?: string;
  onPublishNow?: () => void;
}

export const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({
  isOpen,
  onClose,
  article,
  scheduledDateTime,
  onPublishNow
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen || !article) return null;

  const contentParagraphs = Array.isArray(article.content)
    ? article.content.filter((p) => p && p.trim().length > 0)
    : [article.content].filter(Boolean);

  const isScheduled = !!scheduledDateTime;
  const formattedScheduledDate = isScheduled
    ? new Date(scheduledDateTime).toLocaleString('en-KE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-preview-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex flex-col justify-start p-2 sm:p-4 md:p-6"
    >
      {/* Top Floating Control Bar */}
      <div className="sticky top-2 z-10 mx-auto w-full max-w-5xl bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 id="draft-preview-title" className="text-sm font-bold text-gray-900 font-display">
              Live Draft Preview
            </h2>
          </div>

          {isScheduled ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Scheduled: {formattedScheduledDate}
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Draft / Unpublished
            </span>
          )}

          {article.isFeatured && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              <Sparkles className="w-3 h-3" /> Featured Story
            </span>
          )}
        </div>

        {/* Device Switcher & Close */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                device === 'desktop'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Desktop viewport (100% width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                device === 'mobile'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Mobile viewport (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {onPublishNow && (
            <button
              type="button"
              onClick={onPublishNow}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 flex justify-center items-start pb-8">
        <div
          className={`transition-all duration-300 w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-300 ${
            device === 'mobile'
              ? 'max-w-[400px] border-[10px] border-gray-800 rounded-[44px] shadow-2xl ring-1 ring-black/20 my-4'
              : 'max-w-4xl'
          }`}
        >
          {device === 'mobile' && (
            <div className="bg-gray-800 text-white text-[10px] py-1 px-4 flex justify-between items-center select-none">
              <span className="font-semibold">9:41</span>
              <div className="w-16 h-4 bg-black rounded-full" />
              <span>5G 100%</span>
            </div>
          )}

          {/* Live Layout Render */}
          <div className="text-left">
            {/* Header / Meta */}
            <div className="bg-warm-100/90 border-b border-warm-200 p-6 sm:p-10">
              {/* Breadcrumb Preview */}
              <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-4">
                <span>Home</span>
                <span>/</span>
                <span>News &amp; Stories</span>
                <span>/</span>
                <span className="text-charcoal-900 font-medium truncate max-w-xs">
                  {article.title || 'Untitled Article'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-100 text-forest-800 border border-forest-200">
                  {article.category || 'Community Story'}
                </span>

                <span className="text-xs text-charcoal-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {isScheduled
                    ? `Scheduled for ${formattedScheduledDate}`
                    : new Date().toLocaleDateString('en-KE', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 font-display leading-tight mb-4">
                {article.title || 'Article Headline Will Appear Here'}
              </h1>

              {/* Author & Meta Row */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-warm-200 text-xs sm:text-sm text-charcoal-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-charcoal-900 block">
                      {article.authorName || 'MSC Communications Unit'}
                    </span>
                    <span className="text-xs text-charcoal-500">
                      {article.authorRole || 'Communications & Outreach'}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-300 bg-white text-charcoal-600 text-xs font-semibold">
                  <Share2 className="w-3.5 h-3.5 text-forest-700" />
                  <span>Share Preview</span>
                </div>
              </div>
            </div>

            {/* Featured Image & Body */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Featured Image */}
              <div className="rounded-2xl overflow-hidden shadow-sm border border-warm-200 aspect-[16/9] bg-warm-200 relative">
                <img
                  src={article.featuredImage || '/images/mwancha-facility-main.jpg'}
                  alt={article.imageAlt || article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                  }}
                />
                {article.imageAlt && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 text-left">
                    {article.imageAlt}
                  </div>
                )}
              </div>

              {/* Summary / Lead */}
              {article.summary && (
                <p className="text-base sm:text-lg font-medium text-charcoal-900 leading-relaxed border-l-4 border-forest-700 pl-4 py-2 italic bg-warm-50/80 rounded-r-xl">
                  {article.summary}
                </p>
              )}

              {/* Content Paragraphs */}
              <div className="prose prose-lg max-w-none text-charcoal-800 leading-relaxed space-y-4">
                {contentParagraphs.length > 0 ? (
                  contentParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-base sm:text-lg">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    (No body paragraphs entered yet.)
                  </p>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="pt-6 border-t border-warm-200 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-forest-700" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-warm-100 border border-warm-200 text-xs font-medium text-charcoal-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* MSC Institutional Signature */}
              <div className="pt-8 border-t border-warm-200">
                <div className="bg-forest-50/70 border border-forest-200 rounded-2xl p-5 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-forest-800 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-forest-900 leading-relaxed">
                    <span className="font-bold block text-sm mb-1 text-forest-950 font-display">
                      About Mwancha Senior Community (MSC)
                    </span>
                    Registered non-profit organization dedicated to compassionate, comprehensive eldercare and dignity in aging in Kenya.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftPreviewModal;
