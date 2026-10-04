import React from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ProgramCard } from '../../components/cards/ProgramCard';
import { PageLoader, SkeletonCard } from '../../components/ui/Skeleton';
import { usePrograms } from '../../contexts/CMSContext';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

export const ProgramsPage: React.FC = () => {
  const { programs, isLoading, error } = usePrograms();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [searchFilter, setSearchFilter] = React.useState<string>('');

  React.useEffect(() => {
    // dynamically load categories from service
    import('../../services/programService').then(({ programService }) => {
      programService.getCategories().then(cats => {
        if (Array.isArray(cats)) setCategories(cats);
      }).catch(() => {});
    });
  }, []);

  const filteredPrograms = React.useMemo(() => {
    return programs.filter(p => {
      const matchCat =
        selectedCategory === 'ALL' ||
        p.category === selectedCategory ||
        (p as any).categoryId === selectedCategory ||
        (p as any).category?.slug === selectedCategory;

      const matchSearch =
        !searchFilter.trim() ||
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.thematicArea?.toLowerCase().includes(searchFilter.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [programs, selectedCategory, searchFilter]);

  if (isLoading) {
    return (
      <div className="pb-20 space-y-16">
        <section className="bg-warm-100/80 border-b border-warm-200 py-12">
          <Container>
            <Breadcrumb items={[{ label: 'Programs' }]} />
            <div className="max-w-3xl text-left mt-4">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </Container>
        </section>
        <section>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-20">
        <section className="bg-warm-100/80 border-b border-warm-200 py-12">
          <Container>
            <Breadcrumb items={[{ label: 'Programs' }]} />
            <div className="max-w-3xl text-left mt-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
                Programs Temporarily Unavailable
              </h1>
              <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
                We're working to restore access to our program information. Please try again later.
              </p>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Programs' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Strategic Interventions
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Our Core Program Areas
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Mwancha Senior Community implements evidence-based programs addressing the multidimensional vulnerabilities faced by older persons and Orphaned & Vulnerable Children (OVC) households.
            </p>
          </div>
        </Container>
      </section>

      {/* Dynamic Programs Grid with Category Filtering */}
      <section>
        <Container>
          {programs.length > 0 ? (
            <>
              {/* Filter Tabs & Search Header */}
              <div className="mb-10 text-left space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
                    Active Programs
                  </h2>
                  <p className="text-sm sm:text-base text-charcoal-600 mt-1">
                    Comprehensive interventions designed to restore dignity and wellbeing for Kenya's most vulnerable seniors.
                  </p>
                </div>

                {/* Filter Pills */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                        selectedCategory === 'ALL'
                          ? 'bg-forest-800 text-white shadow-sm'
                          : 'bg-warm-100 text-charcoal-700 hover:bg-warm-200'
                      }`}
                    >
                      All Pillars
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug || cat.id)}
                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                          selectedCategory === cat.slug || selectedCategory === cat.id
                            ? 'bg-forest-800 text-white shadow-sm'
                            : 'bg-warm-100 text-charcoal-700 hover:bg-warm-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredPrograms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPrograms
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-warm-50 rounded-2xl border border-warm-200">
                  <p className="text-base text-charcoal-700">No programs found for this category filter.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setSearchFilter('');
                    }}
                    className="mt-3 text-sm font-bold text-forest-800 hover:underline"
                  >
                    View All Programs
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="rounded-full bg-gray-100 p-4 w-20 h-20 mx-auto mb-6">
                  <HeartHandshake className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Programs Coming Soon
                </h3>
                <p className="text-gray-600">
                  We're preparing detailed information about our programs. Please check back soon for updates.
                </p>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Impact Statement */}
      <section>
        <Container>
          <div className="bg-forest-50 border border-forest-200 rounded-2xl p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="bg-forest-600 text-white p-4 rounded-2xl">
                  <ShieldCheck className="h-8 w-8" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">
                  Evidence-Based Programming
                </h3>
                <p className="text-charcoal-700 leading-relaxed">
                  Each program is grounded in community needs assessment and follows rigorous monitoring standards. We prioritize interventions that demonstrate measurable improvements in elder safety, health, and dignity.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
