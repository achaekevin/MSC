import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storyService, StoryItem } from '../../services/storyService';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/common/SEO';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  HeartHandshake,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowRight,
  Search,
  Sparkles,
  FileCheck2,
  Users,
  AlertCircle,
  PlusCircle,
  Eye,
  CheckCircle2,
  Lock
} from 'lucide-react';

const PROGRAM_FILTERS = [
  'All Programs',
  'Case Management',
  'Psychosocial Support',
  'Advocacy & Sensitization',
  'Systems Strengthening',
  'Nutrition & Healthcare'
];

export const StoriesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_ADMIN');

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');

  const fetchStories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storyService.getPublicStories(1, 24);
      setStories(res.items || []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load impact stories from case archives.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchSearch =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.situation && s.situation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.intervention && s.intervention.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.outcome && s.outcome.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchProgram =
        selectedProgram === 'All Programs' ||
        (s.relatedProgram && s.relatedProgram.toLowerCase().includes(selectedProgram.toLowerCase()));

      return matchSearch && matchProgram;
    });
  }, [stories, searchQuery, selectedProgram]);

  return (
    <div className="min-h-screen bg-warm-50/70 dark:bg-charcoal-950 pb-20">
      <SEO
        title="Stories of Impact | Mwancha Senior Community"
        description="Authentic, verified case management stories documenting the life transformations, elder rights restorations, and community care delivered by Mwancha Senior Community."
      />

      {/* Header Banner */}
      <PageHeader
        badge="Grassroots Evidence & Human Dignity"
        title="Stories of Impact"
        subtitle="Documented accounts of restoration, elder rights protection, and life transformation across rural households in Kenya."
      />

      <Container className="pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Stories of Impact' }
          ]}
        />

        {/* Beneficiary Dignity & Ethical Safeguarding Protocol Notice */}
        <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-forest-700 dark:bg-emerald-500" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 dark:text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
                <span>Beneficiary Safeguarding & Authentic Consent Protocol</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-charcoal-900 dark:text-warm-50">
                Ethical Documentation Policy: Zero Fabricated Accounts
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed max-w-4xl">
                At Mwancha Senior Community, elder dignity, safety, and informed consent are non-negotiable. In strict compliance with the Kenya Data Protection Act 2019 and MSC Safeguarding Guidelines, all stories published represent genuine, client-verified case management records. Where safety or domestic confidentiality is essential, identities are respectfully anonymized. Fabricated testimonies or simulated elder distress are strictly prohibited.
              </p>
            </div>

            {isAdmin && (
              <div className="shrink-0">
                <Button
                  to="/admin/stories"
                  variant="primary"
                  size="sm"
                  icon={<PlusCircle className="w-4 h-4" />}
                  className="whitespace-nowrap font-bold"
                >
                  Manage Stories
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          {/* Program Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {PROGRAM_FILTERS.map((prog) => (
              <button
                key={prog}
                onClick={() => setSelectedProgram(prog)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedProgram === prog
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-charcoal-700'
                }`}
              >
                {prog}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Stories Grid */}
        <div className="mt-8">
          {error ? (
            <ErrorState
              title="Failed to Load Stories of Impact"
              description={error}
              onRetry={fetchStories}
            />
          ) : loading ? (
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-3 border-forest-700 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-charcoal-500 dark:text-warm-400">Loading verified impact stories...</p>
            </div>
          ) : filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredStories.map((story) => (
                <article
                  key={story.id}
                  className="flex flex-col bg-white dark:bg-charcoal-900 rounded-2xl overflow-hidden border border-warm-200 dark:border-charcoal-800 shadow-sm hover:shadow-elevated transition-all duration-300 group"
                >
                  {/* Cover Media */}
                  <div className="relative aspect-16/10 overflow-hidden bg-forest-950">
                    <img
                      src={story.coverImage || story.images?.[0] || '/images/mwancha-pavilion-gathering.jpg'}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />

                    {/* Program Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-forest-800/90 text-emerald-200 backdrop-blur-xs border border-forest-700/60 shadow-xs">
                        {story.relatedProgram || 'Holistic Elder Welfare'}
                      </span>
                    </div>

                    {/* Consent status */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-warm-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{story.privacyStatus === 'identified_with_consent' ? 'Documented Consent' : 'Anonymized Safeguard'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Meta dates and location */}
                      <div className="flex items-center gap-3 text-xs text-charcoal-500 dark:text-warm-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                          <span>{new Date(story.date || story.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                          <span>{story.location || 'Nyamira County'}</span>
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-charcoal-900 dark:text-warm-50 font-display group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        <Link to={`/stories/${story.slug}`}>
                          {story.title}
                        </Link>
                      </h3>

                      <p className="mt-2.5 text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 line-clamp-3 leading-relaxed">
                        {story.summary}
                      </p>

                      {/* Structured 3-Tier Snapshot (Challenge -> Intervention -> Outcome) */}
                      {(story.situation || story.intervention || story.outcome) && (
                        <div className="mt-4 pt-3.5 border-t border-warm-100 dark:border-charcoal-800 space-y-2 text-xs">
                          {story.situation && (
                            <div className="flex items-start gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 shrink-0">
                                Challenge
                              </span>
                              <span className="text-charcoal-700 dark:text-warm-300 line-clamp-1">{story.situation}</span>
                            </div>
                          )}
                          {story.intervention && (
                            <div className="flex items-start gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 shrink-0">
                                MSC Action
                              </span>
                              <span className="text-charcoal-700 dark:text-warm-300 line-clamp-1">{story.intervention}</span>
                            </div>
                          )}
                          {story.outcome && (
                            <div className="flex items-start gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 shrink-0">
                                Outcome
                              </span>
                              <span className="text-charcoal-800 dark:text-emerald-300 font-medium line-clamp-1">{story.outcome}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-warm-100 dark:border-charcoal-800 flex items-center justify-between">
                      <Link
                        to={`/stories/${story.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 dark:text-emerald-400 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Read Full Impact Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Dignified Empty / Verification in Progress State */
            <div className="py-16 px-6 sm:px-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-forest-200 dark:border-forest-800">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 mb-2">
                Field Case Verification in Progress
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900 dark:text-warm-50 font-display">
                Documented Client Testimonials Pending Verification
              </h3>
              <p className="mt-2.5 text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed max-w-xl mx-auto">
                In strict adherence to our ethical policy prohibiting simulated or unverified beneficiary accounts, MSC publishes stories only after formal field verification, guardian sign-off, and legal consent are completed by our case managers.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button to="/programs" variant="outline" size="sm">
                  Explore Active Programs
                </Button>
                <Button to="/donate" variant="primary" size="sm">
                  Support Our Fieldwork
                </Button>
                {isAdmin && (
                  <Button to="/admin/stories" variant="secondary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                    Open Admin Story Publisher
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ways to Support Callout Banner */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-forest-900 via-forest-850 to-charcoal-900 text-white shadow-elevated relative overflow-hidden">
          <div className="relative max-w-3xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              Be Part of the Next Life Transformed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-warm-50">
              Help MSC Restore Health, Dignity, and Safe Shelter for Kenya's Elders
            </h2>
            <p className="mt-3 text-sm text-warm-200 leading-relaxed">
              Every story published represents an older person whose dignity was upheld through collaborative community action. Your partnership funds critical respite care, hot meals, legal defense, and home repairs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/donate" variant="secondary" size="md">
                Donate to MSC Relief Fund
              </Button>
              <Button to="/partner" variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10">
                Partner as an Institution
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default StoriesPage;
