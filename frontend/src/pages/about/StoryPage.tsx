import React from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { MSC_ORGANIZATION } from '../../constants';
import { Calendar, History, ArrowRight } from 'lucide-react';

export const StoryPage: React.FC = () => {
  const timelineMilestones = [
    {
      year: '2016',
      title: 'Founding as Mwancha Home for the Elderly',
      badge: 'Establishment',
      description:
        'Founded in Kebirigo, Nyamira County, as Mwancha Home for the Elderly. The initiative arose from direct grassroots witness to the extreme vulnerability, isolation, malnutrition, and abuse suffered by older persons living in rural households.'
    },
    {
      year: '2016 – 2023',
      title: 'Localized Operational Period in Nyamira County',
      badge: 'Grassroots Direct Welfare',
      description:
        'During this initial seven-year period, the organization focused on localized direct assistance: mapping bedridden seniors, providing food parcels, clothing, and shelter repairs, mediating domestic neglect cases, and coordinating with local chiefs and clinics.'
    },
    {
      year: '2024',
      title: 'Institutional Evolution to Mwancha Senior Community (MSC)',
      badge: 'Strategic Name Transition',
      description:
        'In 2024, the organization formally changed its name to Mwancha Senior Community. The shift reflected lessons learned from years of grassroots fieldwork: that caring for older persons requires an active, community-wide ecosystem rather than an isolated institutional sanctuary.'
    },
    {
      year: '2024 Onward',
      title: 'Broader National, Regional & Global Mandate',
      badge: 'Expanding Scope',
      description:
        'With its mandate extending across Kenya, MSC is scaling its five-pillar model (Systems Strengthening, Case Management, Psychosocial Support, Advocacy, and MEAL), forging institutional alliances with public health agencies, and championing elderly human rights.'
    }
  ];

  return (
    <div className="pb-20 space-y-16">
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb
            items={[
              { label: 'About Us', href: '/about' },
              { label: 'Our Story' }
            ]}
          />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Organizational History
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              The Mwancha Senior Community Story
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              How a compassionate grassroots response in Kebirigo grew into a community-based organization championing senior rights across Kenya.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Narrative */}
      <section>
        <Container>
          <div className="max-w-4xl mx-auto text-left space-y-8">
            <div className="prose prose-lg text-charcoal-700 space-y-5 leading-relaxed">
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
                Born Out of a Urgent Community Need
              </h2>
              <p>
                In many rural communities across Kenya, the traditional family safety net has experienced severe strain due to economic migration, disease burdens, and shifting social dynamics. Older persons—who once enjoyed veneration and assured communal care—frequently find themselves left behind, frail, and forgotten.
              </p>
              <p>
                In 2016, a collective of concerned community leaders in Kebirigo, Nyamira County, came together to confront this reality. The organization was founded as <strong>Mwancha Home for the Elderly</strong>, dedicated to reaching out to abandoned, bedridden, and destitute elders.
              </p>
              <p>
                Over seven years of frontline intervention, our field workers encountered the complex realities of elderly vulnerability: not only hunger and chronic diseases, but psychological trauma, property dispossession by relatives, and perilous violence triggered by false accusations of witchcraft.
              </p>
            </div>

            {/* Real Facility Image Spotlight */}
            <div className="rounded-3xl overflow-hidden border border-warm-200 shadow-card bg-white">
              <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-warm-200">
                <img
                  src="/images/mwancha-facility-main.jpg"
                  alt="Mwancha Senior Community original headquarters and residential facility in Kebirigo, established in 2016"
                  className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-300"
                />
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <p className="text-sm font-bold text-charcoal-900">
                    Mwancha Senior Community Headquarters & Center
                  </p>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    Kebirigo, Nyamira County, Western Kenya &bull; Operating continuously since 2016
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-xs font-bold border border-forest-200 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                  <span>Verified Field Site</span>
                </span>
              </div>
            </div>

            {/* Official Timeline */}
            <div className="pt-8">
              <h3 className="text-2xl font-bold text-charcoal-900 font-display mb-8">
                Chronological Milestones
              </h3>

              <div className="space-y-8 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-forest-200">
                {timelineMilestones.map((m, idx) => (
                  <div key={idx} className="relative flex items-start gap-6 group">
                    {/* Timeline Node */}
                    <div className="w-10 h-10 rounded-full bg-forest-800 text-warm-50 flex items-center justify-center font-bold text-xs shadow-md border-4 border-white flex-shrink-0 z-10 group-hover:bg-earth-600 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-warm-200 shadow-sm flex-1 text-left">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-50 px-2.5 py-0.5 rounded border border-forest-200">
                          {m.badge}
                        </span>
                        <span className="text-sm font-extrabold text-earth-700">
                          {m.year}
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-charcoal-900 font-display mb-2">
                        {m.title}
                      </h4>
                      <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source of Truth Disclaimer Box */}
            <div className="p-6 rounded-2xl bg-warm-100 border border-warm-200 text-xs sm:text-sm text-charcoal-600">
              <p className="font-semibold text-charcoal-800 mb-1">
                Transparency & Source of Truth Note:
              </p>
              <p>
                This historical narrative is documented strictly from the Mwancha Senior Community institutional profile. MSC does not fabricate statistics or embellish organizational milestones.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <Button to="/about/mission" variant="primary" size="md">
                Read Mission, Vision & Values
              </Button>
              <Button to="/programs" variant="outline" size="md">
                Explore Our Programs
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
