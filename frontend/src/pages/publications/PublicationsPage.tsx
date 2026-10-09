import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { publicationService, PublicationItem } from '../../services/publicationService';
import { downloadPublicationPdf } from '../../utils/pdfGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/common/SEO';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Eye,
  Bookmark,
  Share2,
  CheckCircle2,
  Printer
} from 'lucide-react';

const CATEGORY_TABS = [
  'All Publications',
  'Book',
  'Field Manual',
  'Policy Brief',
  'Annual Report',
  'Research Paper'
];

export const PublicationsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_ADMIN');

  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Publications');

  const fetchPublications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicationService.getPublicPublications();
      setPublications(data || []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load official publications and research materials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const filteredPublications = useMemo(() => {
    return publications.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All Publications' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase() ||
        item.type.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [publications, searchQuery, selectedCategory]);

  return (
    <div className="pb-20 space-y-12 text-left">
      <SEO
        title="Publications, Books & Research Library"
        description="Access and download official Mwancha Senior Community books, policy briefs, case management field manuals, and research publications on elder care in Kenya."
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white py-16 sm:py-20 border-b border-forest-800 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Container className="relative z-10">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Publications & Books' }
            ]}
          />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-800/80 text-amber-300 text-xs font-bold uppercase tracking-wider border border-forest-700/80 mb-3 shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
                Knowledge Hub & Research Archive
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white">
                Publications, Books & Resources
              </h1>
              <p className="mt-3 text-base sm:text-lg text-forest-100/90 leading-relaxed max-w-2xl font-medium">
                Official books, field manuals, policy briefs, and research reports produced by Mwancha Senior Community. Read online with our interactive reader or export and download directly as PDF.
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">
                <Button
                  to="/admin/publications"
                  variant="secondary"
                  size="md"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Publish New Book / Article
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content & Filter Toolbar */}
      <Container>
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, author, topic, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
              />
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 text-xs font-bold text-charcoal-600 dark:text-warm-300">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{filteredPublications.length} Documents Available for Download & Reading</span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-warm-100 dark:border-charcoal-800">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  selectedCategory === tab
                    ? 'bg-forest-900 text-white dark:bg-emerald-600 shadow-sm'
                    : 'bg-warm-100 text-charcoal-700 hover:bg-warm-200 dark:bg-charcoal-800 dark:text-warm-300 dark:hover:bg-charcoal-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Publications Grid */}
        {error ? (
          <ErrorState
            title="Failed to Load Publications Catalogue"
            description={error}
            onRetry={fetchPublications}
          />
        ) : loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-charcoal-600 dark:text-warm-300">
              Loading library catalogue...
            </p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20 bg-warm-50 dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 p-8">
            <BookOpen className="w-12 h-12 mx-auto text-charcoal-400 mb-3" />
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">
              No Publications Found
            </h3>
            <p className="text-sm text-charcoal-600 dark:text-warm-300 mt-1 max-w-sm mx-auto">
              We couldn't find any documents matching your search. Try resetting your query or category filters.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Publications');
              }}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPublications.map((pub) => (
              <div
                key={pub.id}
                className="group bg-white dark:bg-charcoal-900 rounded-3xl border-2 border-warm-200 dark:border-charcoal-800 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 text-left"
              >
                <div>
                  {/* Book Cover Thumbnail with Aspect Ratio */}
                  <div className="aspect-[16/10] bg-warm-100 dark:bg-charcoal-800 relative overflow-hidden border-b border-warm-200 dark:border-charcoal-800">
                    <img
                      src={pub.coverImage || '/images/mwancha-facility-main.jpg'}
                      alt={pub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-forest-950/90 text-amber-300 border border-white/20 shadow-xs">
                        {pub.category || pub.type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1 drop-shadow-md">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        {pub.readingTime || '15 min read'}
                      </span>
                      {pub.pages && (
                        <span className="bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] drop-shadow-md">
                          {pub.pages} Pages
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-black font-display text-charcoal-950 dark:text-white group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
                      {pub.title}
                    </h3>

                    {pub.subtitle && (
                      <p className="text-xs text-charcoal-500 dark:text-warm-300 font-semibold mt-1 line-clamp-1 italic">
                        {pub.subtitle}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-xs text-charcoal-600 dark:text-warm-300 font-medium">
                      <User className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{pub.authorName}</span>
                    </div>

                    <p className="mt-3 text-sm text-charcoal-700 dark:text-warm-200 line-clamp-3 leading-relaxed">
                      {pub.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-6 pt-0 border-t border-warm-100 dark:border-charcoal-800/80 mt-4 flex items-center gap-3">
                  <Link
                    to={`/publications/${pub.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Online</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => downloadPublicationPdf(pub)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-warm-100 dark:bg-charcoal-800 hover:bg-forest-100 hover:text-forest-900 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-warm-100 font-bold text-xs transition-all border border-warm-200 dark:border-charcoal-700 cursor-pointer active:scale-95"
                    title="Download publication as PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-forest-800 dark:text-emerald-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default PublicationsPage;
