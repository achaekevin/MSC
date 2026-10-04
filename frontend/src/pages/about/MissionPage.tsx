import React from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { MSC_ORGANIZATION } from '../../constants';
import { Sparkles, ShieldCheck, HeartHandshake, Scale, Users2, Lock, Eye } from 'lucide-react';

export const MissionPage: React.FC = () => {
  const getCoreValueIcon = (title: string) => {
    switch (title) {
      case 'Respect':
        return <Eye className="w-6 h-6 text-forest-700" />;
      case 'Fairness':
        return <Scale className="w-6 h-6 text-earth-700" />;
      case 'Unity':
        return <Users2 className="w-6 h-6 text-forest-700" />;
      case 'Integrity':
        return <Lock className="w-6 h-6 text-earth-700" />;
      case 'Compassion':
        return <HeartHandshake className="w-6 h-6 text-forest-700" />;
      case 'Accountability':
        return <ShieldCheck className="w-6 h-6 text-earth-700" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-forest-700" />;
    }
  };

  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb
            items={[
              { label: 'About Us', href: '/about' },
              { label: 'Mission & Vision' }
            ]}
          />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Guiding Institutional Creed
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Mission, Vision & Core Values
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Every initiative, partnership, and outreach carried out by Mwancha Senior Community is governed by our foundational charter.
            </p>
          </div>
        </Container>
      </section>

      {/* Vision & Mission Cards */}
      <section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Vision */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-card flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-forest-800 uppercase tracking-widest block mb-2">
                  Official Organizational Vision
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display mb-4">
                  Where We Are Heading
                </h2>
                <blockquote className="text-lg sm:text-xl text-forest-950 font-medium italic border-l-4 border-forest-700 pl-4 py-1 leading-relaxed bg-forest-50/50 rounded-r-lg">
                  "{MSC_ORGANIZATION.vision}"
                </blockquote>
              </div>
              <p className="mt-6 text-sm text-charcoal-600 leading-relaxed">
                We aspire to a society where older citizens, irrespective of economic standing or physical frailty, are cherished, legally defended, and empowered to live purposeful lives.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-card flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-earth-100 text-earth-800 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-earth-800 uppercase tracking-widest block mb-2">
                  Official Organizational Mission
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display mb-4">
                  What We Do Every Day
                </h2>
                <blockquote className="text-lg sm:text-xl text-earth-950 font-medium italic border-l-4 border-earth-600 pl-4 py-1 leading-relaxed bg-earth-50/50 rounded-r-lg">
                  "{MSC_ORGANIZATION.mission}"
                </blockquote>
              </div>
              <p className="mt-6 text-sm text-charcoal-600 leading-relaxed">
                By mobilizing grassroots volunteer networks, delivering emergency nutrition and shelter aid, providing counseling, and leading legislative advocacy, we translate our mission into measurable daily outcomes.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Values */}
      <section id="values" className="bg-warm-100/50 py-16 border-y border-warm-200">
        <Container>
          <SectionHeading
            centered
            badge="Institutional Ethics"
            title="Our Six Core Values"
            subtitle="The fundamental beliefs that dictate our ethical standards, operational decisions, and engagement with communities."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {MSC_ORGANIZATION.coreValues.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-7 border border-warm-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center mb-4">
                    {getCoreValueIcon(v.title)}
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 font-display mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};
