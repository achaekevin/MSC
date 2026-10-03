import React from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ImpactStatCard } from '../components/cards/ImpactStatCard';
import { VERIFIED_IMPACT_METRICS, IMPACT_PILLARS } from '../data/impactData';
import { Button } from '../components/ui/Button';
import { ShieldCheck, HeartHandshake, FileCheck, CheckCircle } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Our Impact' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Transparency & Accountability
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Documented Impact & Community Footprint
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              At Mwancha Senior Community, we adhere to strict verification standards. We report verified household registries and operational milestones without fabrication.
            </p>
          </div>
        </Container>
      </section>

      {/* Verified Core Metrics */}
      <section>
        <Container>
          <div className="mb-10 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
              Verified Institutional Indicators
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 mt-1">
              Data points documented through our grassroots case management registries and volunteer rosters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERIFIED_IMPACT_METRICS.map((metric) => (
              <ImpactStatCard key={metric.id} metric={metric} />
            ))}
          </div>
        </Container>
      </section>

      {/* Programmatic Impact Pillars */}
      <section className="bg-warm-100/50 py-16 border-y border-warm-200">
        <Container>
          <SectionHeading
            centered
            badge="Longitudinal Transformation"
            title="Pillars of Dignified Transformation"
            subtitle="How our interventions produce tangible improvements in the daily lives of older persons and OVC households."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
            {IMPACT_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm mb-4">
                    0{idx + 1}
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 font-display mb-2.5">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Dynamic Data Notice / Client Placeholder */}
      <section>
        <Container>
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-card text-left max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-3 text-forest-800">
              <FileCheck className="w-6 h-6 text-earth-600" />
              <h3 className="text-xl font-bold text-charcoal-900 font-display">
                Data Integrity & MEAL Architecture
              </h3>
            </div>
            <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
              Mwancha Senior Community deploys a rigorous Monitoring, Evaluation, Accountability & Learning (MEAL) framework. Detailed disaggregated statistics (such as county distribution, gender metrics, and longitudinal healthcare adherence rates) are reviewed periodically with local authorities and will be updated here as subsequent field evaluation rounds conclude.
            </p>
            <div className="p-4 rounded-xl bg-warm-100 border border-warm-300 text-xs sm:text-sm text-charcoal-600 italic">
              "Impact data will be updated here following verified MEAL quarterly survey publication."
            </div>
            <div className="pt-2">
              <Button to="/partner" variant="outline" size="sm">
                Request Programmatic MEAL Brief
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
