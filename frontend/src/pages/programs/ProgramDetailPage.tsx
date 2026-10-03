import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { ProgramCard } from '../../components/cards/ProgramCard';
import { programService } from '../../services/programService';
import { Program } from '../../types';
import { PageLoader } from '../../components/ui/Skeleton';
import { CheckCircle2, Target, HeartHandshake, ArrowRight, ArrowLeft } from 'lucide-react';

export const ProgramDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      programService.getBySlug(slug || ''),
      programService.getAll()
    ]).then(([current, all]) => {
      if (isMounted) {
        setProgram(current);
        setAllPrograms(all);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return <PageLoader />;
  }

  if (!program) {
    return (
      <div className="py-20 text-center">
        <Container>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-3">Program Not Found</h2>
          <p className="text-charcoal-600 mb-6">The requested program could not be located in the MSC directory.</p>
          <Button to="/programs" variant="primary">Return to Programs</Button>
        </Container>
      </div>
    );
  }

  // Related programs
  const relatedPrograms = allPrograms.filter(
    (p) => p.slug !== program.slug && (program.relatedProgramSlugs?.includes(p.slug) || true)
  ).slice(0, 2);

  return (
    <div className="pb-20 space-y-16">
      {/* Program Hero */}
      <section className="bg-warm-100/90 border-b border-warm-200 py-12 lg:py-16">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Programs', href: '/programs' },
              { label: program.title }
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mt-6 text-left">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block">
                Core Program Pillar
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-900 font-display">
                {program.title}
              </h1>
              <p className="text-lg text-charcoal-700 leading-relaxed">
                {program.shortDescription}
              </p>

              {program.metricsHighlight && (
                <div className="p-4 rounded-xl bg-forest-900 text-warm-50 text-sm font-semibold flex items-center gap-2.5 max-w-xl">
                  <CheckCircle2 className="w-5 h-5 text-earth-300 flex-shrink-0" />
                  <span>{program.metricsHighlight}</span>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-card border-4 border-white aspect-[4/3] bg-warm-200">
                <img
                  src={program.image}
                  alt={program.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Program Details Content */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-12">
              {/* Overview */}
              <div>
                <h2 className="text-2xl font-bold text-charcoal-900 font-display mb-4">
                  Program Overview
                </h2>
                <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed">
                  {program.fullDescription}
                </p>
              </div>

              {/* Objectives */}
              <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6 text-forest-800">
                  <Target className="w-6 h-6" />
                  <h3 className="text-xl font-bold font-display text-charcoal-900">
                    Strategic Objectives
                  </h3>
                </div>
                <ul className="space-y-4">
                  {program.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-base text-charcoal-700 leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documented Activities */}
              <div>
                <h3 className="text-2xl font-bold text-charcoal-900 font-display mb-6">
                  Documented Key Activities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {program.activities.map((act, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white border border-warm-200 shadow-subtle flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-charcoal-800 leading-snug">
                        {act}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approach & Methodology */}
              <div className="p-8 rounded-3xl bg-warm-100/70 border border-warm-200 space-y-3">
                <h3 className="text-xl font-bold text-charcoal-900 font-display">
                  Our Grounded Approach
                </h3>
                <p className="text-base text-charcoal-700 leading-relaxed">
                  {program.approach}
                </p>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Target Beneficiaries Card */}
              <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-card space-y-4">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-sm uppercase tracking-wide">
                  <HeartHandshake className="w-5 h-5" />
                  <span>Target Beneficiaries</span>
                </div>
                <ul className="space-y-2.5 text-sm text-charcoal-700">
                  {program.targetBeneficiaries.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-forest-700 font-bold">&bull;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Box */}
              <div className="bg-forest-900 text-white rounded-3xl p-7 space-y-4">
                <h4 className="text-lg font-bold font-display text-white">
                  Support This Program
                </h4>
                <p className="text-xs sm:text-sm text-forest-200 leading-relaxed">
                  Your donation or technical partnership helps expand direct interventions for vulnerable elders under this pillar.
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <Button to="/donate" variant="secondary" size="sm" className="w-full font-bold">
                    Donate to This Work
                  </Button>
                  <Button to="/partner" variant="outline" size="sm" className="w-full border-forest-600 text-white hover:bg-forest-800">
                    Partner With Us
                  </Button>
                </div>
              </div>

              {/* Back to all programs */}
              <div>
                <Link
                  to="/programs"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-600 hover:text-forest-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to all 5 programs</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Programs */}
      {relatedPrograms.length > 0 && (
        <section className="bg-warm-100/50 py-16 border-t border-warm-200">
          <Container>
            <div className="text-left mb-8">
              <h3 className="text-2xl font-bold text-charcoal-900 font-display">
                Complementary Programs
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
};
