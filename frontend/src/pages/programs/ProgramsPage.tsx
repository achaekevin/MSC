import React, { useState, useEffect } from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ProgramCard } from '../../components/cards/ProgramCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { programService } from '../../services/programService';
import { Program } from '../../types';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, HeartHandshake } from 'lucide-react';

export const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    programService.getAll().then((data) => {
      if (isMounted) {
        setPrograms(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
              Mwancha Senior Community delivers five coordinated, documented program pillars that unite emergency survival support with community-wide human rights defense.
            </p>
          </div>
        </Container>
      </section>

      {/* Programs Grid */}
      <section>
        <Container>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((prog) => (
                <ProgramCard key={prog.id} program={prog} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Methodology Highlight */}
      <section className="bg-warm-100/50 py-16 border-y border-warm-200">
        <Container>
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-sm text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-bold text-earth-700 uppercase tracking-wider bg-earth-50 px-3 py-1 rounded-full border border-earth-200 inline-block">
                  Integrated Methodology
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
                  How Our Five Programs Intersect
                </h2>
                <p className="text-base text-charcoal-700 leading-relaxed">
                  No program operates in isolation. When a ward-based volunteer identifies a neglected elder through <strong>Case Management</strong>, the individual also receives mental wellness accompaniment through <strong>Psychosocial Support</strong>. Concurrently, if the elder faces violence or property dispossession, our <strong>Advocacy Unit</strong> mobilizes chiefs and local administrators, while our <strong>MEAL Desk</strong> logs the household into confidential tracking.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <Button to="/contact" variant="primary" size="md">
                  Inquire About Programs
                </Button>
                <Button to="/partner" variant="outline" size="md">
                  Partner On Program Delivery
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
