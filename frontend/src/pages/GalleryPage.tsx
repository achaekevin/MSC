import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { galleryService } from '../services/galleryService';
import { GalleryItem } from '../types';
import { SkeletonGallery } from '../components/ui/Skeleton';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { SEO } from '../components/common/SEO';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const [categories, setCategories] = useState<string[]>([
    'All',
    'Community Outreach',
    'Psychosocial Sessions',
    'Advocacy',
    'Home Visits',
    'Sensitization'
  ]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      galleryService.getAll(),
      galleryService.getAlbums().catch(() => [])
    ]).then(([galleryData, albumsData]) => {
      if (isMounted) {
        setItems(galleryData);
        if (albumsData && albumsData.length > 0) {
          const names = Array.from(new Set(['All', ...albumsData.map(a => a.name)]));
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

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item.category === selectedCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeItemIndex === null) return;
      if (e.key === 'Escape') setActiveItemIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveItemIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : null
        );
      }
      if (e.key === 'ArrowLeft') {
        setActiveItemIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemIndex, filteredItems.length]);

  const activeItem = activeItemIndex !== null ? filteredItems[activeItemIndex] : null;

  return (
    <div className="pb-20 space-y-16">
      <SEO
        title="Field Media & Gallery"
        description="Authentic photographic documentation of Mwancha Senior Community's community outreaches, elder psychosocial support sessions, and home visits."
      />
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Field Gallery' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Field Documentation
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Photo Gallery & Community Moments
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Visual snapshots from our community barazas, psychosocial circles, and grassroots case mapping across Kenya.
            </p>
          </div>
        </Container>
      </section>

      {/* Categories & Grid */}
      <section>
        <Container>
          {/* Verified Field Photography Notice */}
          <div className="mb-8 p-4 rounded-2xl bg-forest-50/90 border border-forest-200 text-left flex items-start gap-3 max-w-4xl shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-forest-900 leading-relaxed font-medium">
              <strong>Verified Field Documentation:</strong> Photographic records depicting official Mwancha Senior Community infrastructure, residential care center, traditional gathering pavilion, wellness garden trail, and sustainable food plots in Kebirigo, Nyamira County.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
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

          {/* Gallery Grid */}
          {loading ? (
            <SkeletonGallery />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItemIndex(index)}
                  className="group relative rounded-2xl overflow-hidden bg-warm-200 border border-warm-200 cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col text-left"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-forest-950">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="earth">{item.category}</Badge>
                    </div>
                  </div>

                  <div className="p-5 bg-white flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-charcoal-900 font-display mb-1.5 group-hover:text-forest-800 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-between text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-forest-700" />
                        {item.location}
                      </span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveItemIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-charcoal-950 rounded-3xl overflow-hidden border border-charcoal-800 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveItemIndex(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-forest-500"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={() =>
                setActiveItemIndex((prev) =>
                  prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-forest-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                setActiveItemIndex((prev) =>
                  prev !== null ? (prev + 1) % filteredItems.length : null
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-forest-500"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Lightbox Caption */}
            <div className="p-6 bg-charcoal-900 text-white space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="earth">{activeItem.category}</Badge>
                <span className="text-xs text-charcoal-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {activeItem.location}
                </span>
                <span className="text-xs text-charcoal-400">&bull; {activeItem.date}</span>
              </div>
              <h3 className="text-lg font-bold font-display text-warm-50">
                {activeItem.title}
              </h3>
              <p className="text-sm text-charcoal-300 leading-relaxed">
                {activeItem.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
