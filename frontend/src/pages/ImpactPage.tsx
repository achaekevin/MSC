import React from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { useImpactMetrics } from '../contexts/CMSContext';
import { Button } from '../components/ui/Button';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { PageLoader } from '../components/ui/Skeleton';
import { SEO } from '../components/common/SEO';
import { ImpactDashboardSection } from '../components/impact/ImpactDashboardSection';
import { ErrorState } from '../components/ui/ErrorState';

export const ImpactPage: React.FC = () => {
  const { isLoading, error, refetch } = useImpactMetrics();

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
                Documented Impact & Community Footprint
              </h1>
            </div>
          </Container>
        </section>
        <Container className="py-12">
          <ErrorState
            title="Impact Data Temporarily Unavailable"
            description="We were unable to load the verified impact metrics. Please check your internet connection or try again."
            onRetry={refetch}
          />
        </Container>
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

      {/* Single Retained Interactive Impact Dashboard with Viewport-Animated Figures & Auditing Roll */}
      <ImpactDashboardSection className="rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-xl" />

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

                <div className="mt-6 pt-4 border-t border-forest-100 flex flex-wrap gap-4 items-center">
                  <Button to="/stories" variant="primary" size="md">
                    Explore Stories of Impact
                  </Button>
                  <span className="text-xs text-charcoal-500">
                    Client-approved accounts of transformation across our community.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
