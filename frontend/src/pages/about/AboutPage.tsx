import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { MSC_ORGANIZATION } from '../../constants';
import { InteractiveTimeline } from '../../components/common/InteractiveTimeline';
import { ShieldCheck, Heart, Sparkles, MapPin, Users, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pb-20 space-y-16">
      {/* Page Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'About Us' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              About Mwancha Senior Community
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Championing the Rights & Welfare of Older Persons
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Mwancha Senior Community (MSC) is a community-based, non-political, and non-profit organization dedicated to empowering senior citizens through health, economic, social, and psychosocial development initiatives.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Narrative & Organizational Identity */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
                Dedicated to Dignity, Grounded in Compassion
              </h2>
              <div className="text-charcoal-700 space-y-4 text-base sm:text-lg leading-relaxed">
                <p>
                  Established in <strong>2016</strong> as <em>Mwancha Home for the Elderly</em>, our work began in Kebirigo, Nyamira County, out of a pressing need to protect older community members facing acute malnutrition, social neglect, and perilous cultural stigmatization.
                </p>
                <p>
                  In <strong>2024</strong>, our organization formally changed its name to <strong>Mwancha Senior Community (MSC)</strong>. This evolution marks our expansion from a localized direct-support center to a nationwide community-driven catalyst that defends elder rights, facilitates multi-agency partnerships, and addresses geriatric health needs across Kenya.
                </p>
                <p>
                  Our mandate is anchored in human rights, dignity, and intergenerational unity. We actively reject pity and paternalism, striving instead to ensure older citizens are recognized as valued contributors to cultural heritage and community resilience.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Button to="/about/story" variant="primary" size="md">
                  View Our Story & Timeline
                </Button>
                <Button to="/about/structure" variant="outline" size="md">
                  Organizational Structure
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-warm-200 shadow-card space-y-6">
              <div className="flex items-center gap-4 border-b border-warm-200 pb-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white p-2 border border-warm-200 shadow-md flex items-center justify-center flex-shrink-0">
                  <img
                    src="/logo.png"
                    alt="Mwancha Senior Community Official Emblem"
                    className="w-full h-full object-contain drop-shadow-xs"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-forest-900 text-lg font-display tracking-tight">
                    Mwancha Senior Community
                  </h3>
                  <span className="text-xs text-earth-700 font-semibold bg-earth-50 px-2 py-0.5 rounded border border-earth-200">
                    Official Organization Emblem
                  </span>
                </div>
              </div>

              <div className="border-b border-warm-200 pb-5">
                <div className="flex items-center gap-2.5 text-forest-800 font-bold text-base mb-2">
                  <Sparkles className="w-5 h-5 text-earth-600" />
                  <span>Official Vision</span>
                </div>
                <p className="text-charcoal-800 italic leading-relaxed text-sm sm:text-base">
                  "{MSC_ORGANIZATION.vision}"
                </p>
              </div>

              <div className="border-b border-warm-200 pb-5">
                <div className="flex items-center gap-2.5 text-forest-800 font-bold text-base mb-2">
                  <ShieldCheck className="w-5 h-5 text-earth-600" />
                  <span>Official Mission</span>
                </div>
                <p className="text-charcoal-800 italic leading-relaxed text-sm sm:text-base">
                  "{MSC_ORGANIZATION.mission}"
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2.5 text-forest-800 font-bold text-base mb-2">
                  <MapPin className="w-5 h-5 text-earth-600" />
                  <span>Geographic Scope</span>
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">
                  Headquartered in Kebirigo, Nyamira County, with a verified community workforce of 40 ward volunteers and an operational mandate that extends across Kenya.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values Section */}
      <section className="bg-warm-100/60 py-16 border-y border-warm-200">
        <Container>
          <SectionHeading
            centered
            badge="Ethical Foundation"
            title="Our Core Values"
            subtitle="These six principles govern our decisions, our fieldwork, and our institutional stewardship."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {MSC_ORGANIZATION.coreValues.map((val) => (
              <div
                key={val.title}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-warm-200 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold mb-3">
                  <ShieldCheck className="w-5 h-5 text-forest-700" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 font-display mb-1.5">
                  {val.title}
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/about/mission"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-800 hover:text-forest-950 underline underline-offset-4"
            >
              <span>Explore our Mission, Vision & Values in detail</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Interactive Milestone Timeline */}
      <section className="py-4">
        <Container>
          <InteractiveTimeline />
        </Container>
      </section>

      {/* Physical Center & Grounds Photo Showcase */}
      <section className="py-6">
        <Container>
          <SectionHeading
            centered
            badge="Field Infrastructure"
            title="Our Community Center & Grounds"
            subtitle="Anchored at our physical headquarters in Kebirigo, Nyamira County, providing compassionate shelter, communal spaces, and agricultural sustainability."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8">
            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-card transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-warm-200">
                <img
                  src="/images/mwancha-facility-main.jpg"
                  alt="Mwancha Senior Community Main Care Center"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 uppercase tracking-wider">
                  Care & Shelter
                </span>
                <h4 className="font-bold text-charcoal-900 text-base mt-2 mb-1 font-display">
                  Main Center & Residence
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Two-story residential and case administration facility with daylight suites and accessible stone pathways.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-card transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-warm-200">
                <img
                  src="/images/mwancha-pavilion-gathering.jpg"
                  alt="Traditional Thatched Pavilion"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold text-earth-800 bg-earth-50 px-2 py-0.5 rounded border border-earth-200 uppercase tracking-wider">
                  Psychosocial Space
                </span>
                <h4 className="font-bold text-charcoal-900 text-base mt-2 mb-1 font-display">
                  Traditional Gathering Pavilion
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Shaded thatched gazebo for psychosocial circles, intergenerational storytelling, and elder companionship.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 shadow-sm hover:shadow-card transition-shadow">
              <div className="aspect-[4/3] overflow-hidden bg-warm-200">
                <img
                  src="/images/mwancha-sustainable-farm.jpg"
                  alt="Sustainable Agricultural Plot"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200 uppercase tracking-wider">
                  Livelihoods & Nutrition
                </span>
                <h4 className="font-bold text-charcoal-900 text-base mt-2 mb-1 font-display">
                  Sustainable Food Security Farm
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  On-site community crops and fruit trees cultivating fresh, nutritious feeding for vulnerable senior households.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quick Navigation Cards */}
      <section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Link
              to="/about/story"
              className="group bg-white p-7 rounded-2xl border border-warm-200 shadow-card hover:shadow-card-hover hover:border-forest-200 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-earth-700 uppercase tracking-wider block mb-2">History & Rebranding</span>
                <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-forest-800 transition-colors font-display mb-2">
                  Our Story
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Explore how MSC grew from a localized home in 2016 into a community-based organization championing senior citizens.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-forest-800 group-hover:translate-x-1 transition-transform">
                <span>View Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              to="/about/structure"
              className="group bg-white p-7 rounded-2xl border border-warm-200 shadow-card hover:shadow-card-hover hover:border-forest-200 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-earth-700 uppercase tracking-wider block mb-2">Governance</span>
                <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-forest-800 transition-colors font-display mb-2">
                  Organizational Structure
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Learn about our Board of Management, Center Leadership, professional staff, and 40 ward volunteers.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-forest-800 group-hover:translate-x-1 transition-transform">
                <span>View Structure</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              to="/team"
              className="group bg-white p-7 rounded-2xl border border-warm-200 shadow-card hover:shadow-card-hover hover:border-forest-200 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-earth-700 uppercase tracking-wider block mb-2">People & Cadres</span>
                <h3 className="text-xl font-bold text-charcoal-900 group-hover:text-forest-800 transition-colors font-display mb-2">
                  Our Team & Volunteers
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  Meet the governing bodies, administrative coordinators, and ward champions executing daily elderly care.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-forest-800 group-hover:translate-x-1 transition-transform">
                <span>Meet The Team</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};
