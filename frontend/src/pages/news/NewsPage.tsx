import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { NewsCard } from '../../components/cards/NewsCard';
import { SkeletonArticle } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { newsService } from '../../services/newsService';
import { NewsArticle } from '../../types';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/common/SEO';

export const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Community Story', 'Organizational News', 'Advocacy']);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      newsService.getAll(),
      newsService.getCategories().catch(() => [])
    ]).then(([newsData, catData]) => {
      if (isMounted) {
        setArticles(newsData);
        if (catData && catData.length > 0) {
          const names = Array.from(new Set(['All', ...catData.map(c => c.name)]));
          setCategories(names);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const getArticleCategoryName = (art: NewsArticle): string => {
    if (!art.category) return '';
    if (typeof art.category === 'string') return art.category;
    return (art.category as any).name || '';
  };

  const filteredArticles = articles.filter((art) => {
    const catName = getArticleCategoryName(art);
    const matchesCat = selectedCategory === 'All' || catName === selectedCategory || (art as any).categoryName === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.summary && art.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id || selectedCategory !== 'All' || searchQuery !== '');

  return (
    <div className="pb-20 space-y-16">
      <SEO
        title="News & Field Stories"
        description="Read verified reports, advocacy updates, and grassroots stories from Mwancha Senior Community's work with older citizens."
      />
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'News & Field Stories' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Media & Updates
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              News & Community Stories
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Read verified reports from our grassroots interventions, advocacy dialogues, and institutional milestones.
            </p>
          </div>
        </Container>
      </section>

      {/* Featured Story Banner (Shown when no search query active) */}
      {!searchQuery && selectedCategory === 'All' && featuredArticle && !loading && (
        <section>
          <Container>
            <div className="bg-white rounded-3xl overflow-hidden border border-warm-200 shadow-card grid grid-cols-1 lg:grid-cols-12 text-left">
              <div className="lg:col-span-7 h-72 sm:h-96 lg:h-auto relative bg-forest-950">
                <img
                  src={featuredArticle.featuredImage}
                  alt={featuredArticle.imageAlt}
                  className="w-full h-full object-cover opacity-95"
                />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="forest">Featured Story</Badge>
                    <span className="text-xs text-charcoal-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featuredArticle.publishedAt).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display mb-3 hover:text-forest-800 transition-colors">
                    <Link to={`/news/${featuredArticle.slug}`}>
                      {featuredArticle.title}
                    </Link>
                  </h2>
                  <p className="text-charcoal-600 text-sm sm:text-base leading-relaxed mb-6">
                    {featuredArticle.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-warm-100 flex items-center justify-between">
                  <span className="text-xs text-charcoal-500">By {featuredArticle.author.name}</span>
                  <Link
                    to={`/news/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-800 hover:text-forest-950"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Filter and Search Bar */}
      <section>
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-warm-200">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-forest-800 text-warm-50'
                      : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
              />
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Stories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonArticle key={i} />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <EmptyState
              title="No Stories Found"
              description="No news articles or community stories match your search criteria. Please adjust your filters."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
};
