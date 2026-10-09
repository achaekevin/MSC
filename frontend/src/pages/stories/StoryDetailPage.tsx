import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storyService, StoryItem } from '../../services/storyService';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/common/SEO';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Copy,
  Check,
  Building,
  Sparkles,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import { ErrorState } from '../../components/ui/ErrorState';

export const StoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<StoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStory = React.useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await storyService.getPublicStoryBySlug(slug);
      setStory(data);
    } catch (err: any) {
      setError(err?.message || 'Story details could not be retrieved from the archive.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 bg-warm-50/70 dark:bg-charcoal-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-forest-800 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-charcoal-600 dark:text-warm-300">Loading documented case study...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-24 bg-warm-50/70 dark:bg-charcoal-950">
        <Container size="md">
          <ErrorState
            title="Impact Story Temporarily Unavailable"
            description={error}
            onRetry={fetchStory}
            secondaryAction={{
              label: 'Return to Stories of Impact',
              href: '/stories'
            }}
          />
        </Container>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen py-24 bg-warm-50/70 dark:bg-charcoal-950">
        <Container>
          <div className="max-w-xl mx-auto text-center p-8 bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-forest-700 dark:text-emerald-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-charcoal-900 dark:text-warm-50 font-display">
              Story Awaiting Publication Approval
            </h2>
            <p className="mt-2 text-sm text-charcoal-600 dark:text-warm-300">
              This case record has either not been published yet or is undergoing client approval and consent auditing.
            </p>
            <div className="mt-6">
              <Button to="/stories" variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Return to Stories of Impact
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const allMedia = Array.isArray(story.media)
    ? story.media
    : Array.isArray(story.images)
    ? story.images
    : [];

  const mainCover = story.coverImage || allMedia[0] || '/images/mwancha-pavilion-gathering.jpg';
  const additionalGallery = allMedia.filter(m => m !== mainCover);

  return (
    <div className="min-h-screen bg-warm-50/70 dark:bg-charcoal-950 pb-24">
      <SEO
        title={`${story.title} | Stories of Impact | Mwancha Senior Community`}
        description={story.summary}
      />

      {/* Breadcrumb Navigation */}
      <section className="bg-white dark:bg-charcoal-900 border-b border-warm-200 dark:border-charcoal-800 py-4">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Stories of Impact', href: '/stories' },
              { label: story.title }
            ]}
          />
        </Container>
      </section>

      <Container className="pt-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-300 border border-forest-200 dark:border-forest-800">
                {story.relatedProgram || 'Community Care Program'}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Client Case Study</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-charcoal-600 dark:text-warm-300 bg-warm-100 dark:bg-charcoal-800">
                <span>Consent Status: {story.privacyStatus === 'identified_with_consent' ? 'Documented Consent' : 'Anonymized for Safeguarding'}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display leading-tight">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-warm-200 dark:border-charcoal-800 text-xs sm:text-sm text-charcoal-500 dark:text-warm-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                  <span>{new Date(story.date || story.createdAt).toLocaleDateString('en-KE', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                  <span>{story.location || 'Nyamira County, Kenya'}</span>
                </span>
              </div>

              {/* Share & Copy Link */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-warm-200 hover:bg-warm-100 text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Share Story'}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${story.title} - Read this inspiring story from Mwancha Senior Community: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Main Cover Image */}
          <div className="rounded-3xl overflow-hidden border border-warm-200 dark:border-charcoal-800 shadow-elevated bg-forest-950 aspect-16/9 relative">
            <img
              src={mainCover}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Executive Summary */}
          {story.summary && (
            <div className="p-6 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-200/80 dark:border-forest-800/50">
              <h2 className="text-xs font-bold uppercase tracking-wider text-forest-800 dark:text-emerald-400 mb-2">
                Executive Case Summary
              </h2>
              <p className="text-base sm:text-lg text-charcoal-800 dark:text-warm-100 font-medium leading-relaxed">
                "{story.summary}"
              </p>
            </div>
          )}

          {/* Structured 3-Column Impact Breakdown */}
          {(story.situation || story.intervention || story.outcome) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Challenge / Baseline Situation */}
              {story.situation && (
                <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-rose-200 dark:border-rose-950/80 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50 font-display">
                    The Challenge / Situation
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed">
                    {story.situation}
                  </p>
                </div>
              )}

              {/* 2. MSC Care Intervention */}
              {story.intervention && (
                <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-blue-200 dark:border-blue-950/80 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50 font-display">
                    MSC Intervention & Actions
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed">
                    {story.intervention}
                  </p>
                </div>
              )}

              {/* 3. Measured Transformation & Outcome */}
              {story.outcome && (
                <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-emerald-200 dark:border-emerald-950/80 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50 font-display">
                    Outcome & Lasting Impact
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed">
                    {story.outcome}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Extended Narrative Body */}
          {story.narrative && story.narrative !== story.summary && (
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-charcoal-900 dark:text-warm-50 font-display">
                Field Case Narrative
              </h2>
              <div className="prose prose-forest dark:prose-invert max-w-none text-charcoal-700 dark:text-warm-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {story.narrative}
              </div>
            </div>
          )}

          {/* Additional Photographic Media Gallery */}
          {additionalGallery.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-charcoal-900 dark:text-warm-50 font-display">
                Documented Field Media & Verification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {additionalGallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-warm-200 dark:border-charcoal-800 aspect-4/3 bg-forest-950 shadow-xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`Case documentation photo ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safeguarding Legal Verification Footer Note */}
          <div className="p-5 rounded-2xl bg-warm-100/70 dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 flex items-start gap-3 text-xs text-charcoal-600 dark:text-warm-300">
            <ShieldCheck className="w-5 h-5 text-forest-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-charcoal-900 dark:text-warm-50">Safeguarding & Informed Consent Compliance: </span>
              This case documentation has been vetted by Mwancha Senior Community's Field Safeguarding Officer. Client identities and sensitive familial details are anonymized in accordance with Kenya's Data Protection Act 2019 to protect the dignity and legal safety of older beneficiaries.
            </div>
          </div>

          {/* Next Steps / Engagement Band */}
          <div className="pt-6 border-t border-warm-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 dark:text-emerald-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Stories of Impact</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button to="/donate" variant="primary" size="sm" icon={<Heart className="w-4 h-4 fill-white" />}>
                Support Our Work
              </Button>
              <Button to="/partner" variant="outline" size="sm">
                Partner With MSC
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default StoryDetailPage;
