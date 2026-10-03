import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, UserCheck, Users, ArrowDown, ChevronRight } from 'lucide-react';

export const StructurePage: React.FC = () => {
  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb
            items={[
              { label: 'About Us', href: '/about' },
              { label: 'Organizational Structure' }
            ]}
          />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Governance & Operational Lineage
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Organizational Hierarchy
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Mwancha Senior Community maintains a transparent, accountable governance framework that connects strategic trustees with grassroots volunteer action.
            </p>
          </div>
        </Container>
      </section>

      {/* Visual Hierarchy Diagram / Responsive Cards */}
      <section>
        <Container>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* TIER 1: Board of Management */}
            <div className="bg-forest-900 text-white rounded-3xl p-6 sm:p-8 border border-forest-800 shadow-lg text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-earth-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-earth-300 uppercase tracking-widest block">
                    Tier 1: Strategic Governance
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    Board of Management
                  </h2>
                </div>
              </div>
              <p className="text-sm sm:text-base text-forest-100 leading-relaxed max-w-2xl">
                The supreme governing organ of MSC, responsible for policy formulation, institutional oversight, fiduciary stewardship, regulatory adherence, and strategic alignment with Kenyan statutory frameworks.
              </p>
              <div className="mt-4 pt-4 border-t border-forest-800 flex flex-wrap gap-2 text-xs text-forest-200">
                <span className="bg-forest-850 px-2.5 py-1 rounded-md border border-forest-700">Chairperson</span>
                <span className="bg-forest-850 px-2.5 py-1 rounded-md border border-forest-700">Secretary</span>
                <span className="bg-forest-850 px-2.5 py-1 rounded-md border border-forest-700">Treasurer</span>
                <span className="bg-forest-850 px-2.5 py-1 rounded-md border border-forest-700">Trustees</span>
              </div>
            </div>

            {/* Connecting Flow Arrow */}
            <div className="flex justify-center" aria-hidden="true">
              <div className="w-9 h-9 rounded-full bg-earth-500 text-white flex items-center justify-center shadow-md">
                <ArrowDown className="w-5 h-5" />
              </div>
            </div>

            {/* TIER 2: Center Management & Executive Leadership */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-forest-700/80 shadow-card text-left max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center text-forest-800">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-forest-700 uppercase tracking-widest block">
                    Tier 2: Executive Management
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                    Center Manager / Executive Director
                  </h3>
                </div>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Appointed by the Board to supervise operational execution, partner coordination, grant compliance, staff leadership, and day-to-day community program delivery.
              </p>
            </div>

            {/* Connecting Flow Arrow */}
            <div className="flex justify-center" aria-hidden="true">
              <div className="w-9 h-9 rounded-full bg-earth-500 text-white flex items-center justify-center shadow-md">
                <ArrowDown className="w-5 h-5" />
              </div>
            </div>

            {/* TIER 3: Operational Units (Professional Staff, Support Staff, Community Volunteers) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Professional Staff */}
              <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-forest-700 uppercase tracking-wider block mb-1">
                    Core Technical Desk
                  </span>
                  <h4 className="text-lg font-bold text-charcoal-900 font-display mb-2">
                    Professional Staff
                  </h4>
                  <ul className="text-xs sm:text-sm text-charcoal-600 space-y-2 mt-3">
                    <li className="flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                      <span>MEAL Coordinator (Accountability & Surveys)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                      <span>Social Worker / Senior Case Manager</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                      <span>Advocacy & Community Sensitization Lead</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Support Staff */}
              <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-earth-700 uppercase tracking-wider block mb-1">
                    Administration & Field Operations
                  </span>
                  <h4 className="text-lg font-bold text-charcoal-900 font-display mb-2">
                    Support Staff
                  </h4>
                  <ul className="text-xs sm:text-sm text-charcoal-600 space-y-2 mt-3">
                    <li className="flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-earth-700 flex-shrink-0 mt-0.5" />
                      <span>Finance & Administrative Officer</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-earth-700 flex-shrink-0 mt-0.5" />
                      <span>Community Liaison & Logistics Officer</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <ChevronRight className="w-4 h-4 text-earth-700 flex-shrink-0 mt-0.5" />
                      <span>Front Office & Records Assistant</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Community Volunteers */}
              <div className="bg-forest-50/70 rounded-2xl p-6 border-2 border-forest-300 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Frontline Grassroots Network
                  </span>
                  <h4 className="text-lg font-bold text-forest-950 font-display mb-2">
                    Ward Volunteers (40 Cadres)
                  </h4>
                  <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed mb-3">
                    Resident community focal persons conducting daily home monitoring, early distress detection, nutritional tracking, and health facility escorts.
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-forest-800">
                  40 Active Ward Champions
                </div>
              </div>
            </div>

            <div className="pt-6 text-center">
              <Button to="/team" variant="primary" size="md">
                View Our Team Directory
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
