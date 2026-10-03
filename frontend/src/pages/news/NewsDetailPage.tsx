import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { NewsCard } from '../../components/cards/NewsCard';
import { newsService } from '../../services/newsService';
import { NewsArticle } from '../../types';
import { PageLoader } from '../../components/ui/Skeleton';
import { Calendar, User, Tag, Share2, ArrowLeft, Check } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [related, setRelated] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      newsService.getBySlug(slug || ''),
      newsService.getAll()
    ]).then(([current, all]) => {
      if (isMounted) {
        setArticle(current);
        setRelated(all.filter((a) => a.slug !== slug).slice(0, 2));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!article) {
    return (
      <div className="py-20 text-center">
        <Container>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-3">Story Not Found</h2>
          <p className="text-charcoal-600 mb-6">The requested news article does not exist or has been relocated.</p>
          <Button to="/news" variant="primary">Return to News</Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-12">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container size="md">
          <Breadcrumb
            items={[
              { label: 'News & Stories', href: '/news' },
              { label: article.title }
            ]}
          />

          <div className="mt-6 text-left space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="earth">{article.category}</Badge>
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(article.publishedAt).toLocaleDateString('en-KE', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 font-display leading-tight">
              {article.title}
            </h1>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-warm-200 text-xs sm:text-sm text-charcoal-600">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-charcoal-900 block">{article.author.name}</span>
                  <span className="text-xs text-charcoal-500">{article.author.role}</span>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warm-300 bg-white hover:bg-warm-100 transition-colors text-charcoal-700 text-xs font-semibold"
                aria-label="Copy story link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-forest-700" />
                    <span>Share Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Image & Body */}
      <section>
        <Container size="md">
          <div className="space-y-8 text-left">
            {/* Featured Image */}
            <div className="rounded-3xl overflow-hidden shadow-card border border-warm-200 aspect-[16/9] bg-warm-200">
              <img
                src={article.featuredImage}
                alt={article.imageAlt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Paragraphs */}
            <div className="prose prose-lg max-w-none text-charcoal-800 leading-relaxed space-y-5">
              <p className="text-lg sm:text-xl font-medium text-charcoal-900 leading-relaxed border-l-4 border-forest-700 pl-4 py-1 italic bg-warm-50/70">
                {article.summary}
              </p>
              {article.content.map((paragraph, index) => (
                <p key={index} className="text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
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

            {/* Back link */}
            <div className="pt-6">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800 hover:text-forest-950"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all news stories</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Stories */}
      {related.length > 0 && (
        <section className="bg-warm-100/50 py-16 border-t border-warm-200">
          <Container size="md">
            <div className="text-left mb-8">
              <h3 className="text-2xl font-bold text-charcoal-900 font-display">
                Related Stories
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {related.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
};
