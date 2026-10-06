import React from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../../types';
import { Card } from '../ui/Card';
import { Calendar, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ContentStatusBadge } from '../common/ContentStatusBadge';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <Card className="flex flex-col h-full group hover:-translate-y-1 transition-all duration-200" padding="none">
      <div className="relative h-48 w-full overflow-hidden bg-warm-200">
        <img
          src={article.featuredImage}
          alt={article.imageAlt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge variant="earth">{article.category}</Badge>
          {article.metadata && (
            <ContentStatusBadge metadata={article.metadata} />
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700 dark:text-warm-300 mb-2.5">
            <Calendar className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>
          <h3 className="text-lg font-black text-charcoal-950 dark:text-white group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors font-display line-clamp-2 mb-2.5">
            {article.title}
          </h3>
          <p className="text-sm sm:text-base text-charcoal-800 dark:text-warm-200 line-clamp-3 leading-relaxed mb-4 font-medium transition-colors">
            {article.summary}
          </p>
        </div>

        <div className="pt-4 border-t-2 border-warm-200 dark:border-charcoal-700 flex items-center justify-between">
          <span className="text-xs font-semibold text-charcoal-700 dark:text-warm-300">By {article.author.name}</span>
          <Link
            to={`/news/${article.slug}`}
            className="inline-flex items-center gap-1 text-sm font-black text-forest-900 dark:text-emerald-400 hover:text-black dark:hover:text-emerald-300 transition-colors group/link"
          >
            <span>Read Story</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
