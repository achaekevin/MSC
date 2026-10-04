import React from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ImpactStatCard } from '../components/cards/ImpactStatCard';
import { useImpactMetrics } from '../contexts/CMSContext';
import { Button } from '../components/ui/Button';
import { ShieldCheck, HeartHandshake, FileCheck, CheckCircle } from 'lucide-react';
import { PageLoader } from '../components/ui/Skeleton';
import { SEO } from '../components/common/SEO';

export const ImpactPage: React.FC = () => {
  const { metrics, organizedMetrics, categories, isLoading, error } = useImpactMetrics();

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="pb-20">
        <section className="bg-warm-100/80 border-b border-warm-200 py-12">
          <Container>
            <Breadcrumb items={[{ label: 'Our Impact' }]} />
            <div className="max-w-3xl text-left mt-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
                Impact Data Temporarily Unavailable
              </h1>
              <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
                We're working to restore access to our impact metrics. Please try again later.
              </p>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-16">
      <SEO
        title="Documented Impact & Footprint"
        description="Verified grassroots metrics: 1,203+ elderly and vulnerable households supported across Kenya with dignified care and psychosocial support."
      />
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

      {/* Dynamic Core Metrics */}
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

          {metrics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric) => (
                <ImpactStatCard key={metric.id} metric={metric} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="rounded-full bg-gray-100 p-3 w-16 h-16 mx-auto mb-4">
                  <FileCheck className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No Impact Metrics Available</h3>
                <p className="text-gray-600 mt-2">
                  Impact metrics are being updated. Please check back soon.
                </p>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Organized Metrics by Category */}
      {categories.length > 0 && Object.keys(organizedMetrics).map(category => (
        <section key={category}>
          <Container>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-charcoal-900 font-display capitalize">
                {category} Impact
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizedMetrics[category].map((metric) => (
                <ImpactStatCard key={metric.id} metric={metric} />
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* Impact Commitment Statement */}
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
                  Commitment to Verified Reporting
                </h3>
                <p className="text-charcoal-700 leading-relaxed mb-4">
                  Every impact statistic presented above has been verified through our community-based monitoring systems. We do not inflate figures or present aspirational targets as achievements.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-forest-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Verified household registries</span>
                  </div>
                  <div className="flex items-center text-forest-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Documented volunteer rolls</span>
                  </div>
                  <div className="flex items-center text-forest-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Source attribution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
