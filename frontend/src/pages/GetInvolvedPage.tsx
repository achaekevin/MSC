import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Heart, Users, Building2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export const GetInvolvedPage: React.FC = () => {
  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Get Involved' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Community Action
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Ways to Support Older Persons
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Every positive action reinforces the safety, dignity, and wellbeing of senior citizens. Choose the pathway that aligns best with your capacity.
            </p>
          </div>
        </Container>
      </section>

      {/* The 3 Main Pathways */}
      <section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Pathway 1: Donate */}
            <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-earth-300 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-earth-50 text-earth-700 flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7 fill-earth-100" />
                </div>
                <span className="text-xs font-bold text-earth-700 uppercase tracking-wider block mb-2">
                  Financial Support
                </span>
                <h2 className="text-2xl font-bold text-charcoal-900 font-display mb-3">
                  Donate to Care
                </h2>
                <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                  Direct financial support facilitates emergency food packages, urgent healthcare facility escorts, bedding, and shelter repairs for destitute elders.
                </p>
              </div>
              <Button to="/donate" variant="secondary" size="md" className="w-full font-bold">
                Explore Giving Channels
              </Button>
            </div>

            {/* Pathway 2: Volunteer */}
            <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-forest-300 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-forest-800 uppercase tracking-wider block mb-2">
                  Grassroots Service
                </span>
                <h2 className="text-2xl font-bold text-charcoal-900 font-display mb-3">
                  Volunteer With Us
                </h2>
                <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                  Join our cadre of 40 ward volunteers. Dedicate your time to home wellness visits, elder case mapping, psychosocial circles, or advocacy barazas.
                </p>
              </div>
              <Button to="/volunteer" variant="primary" size="md" className="w-full font-bold">
                Submit Volunteer Application
              </Button>
            </div>

            {/* Pathway 3: Partner */}
            <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card flex flex-col justify-between hover:shadow-card-hover hover:border-forest-300 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-warm-100 text-charcoal-800 flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block mb-2">
                  Institutional Synergies
                </span>
                <h2 className="text-2xl font-bold text-charcoal-900 font-display mb-3">
                  Partner With Us
                </h2>
                <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                  Collaborate with MSC as a government agency, health institution, NGO, academic researcher, or development partner to scale impact.
                </p>
              </div>
              <Button to="/partner" variant="outline" size="md" className="w-full font-bold">
                Initiate Institutional Dialogue
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Transparent Expectations Section */}
      <section className="bg-warm-100/50 py-16 border-y border-warm-200">
        <Container>
          <div className="max-w-3xl mx-auto text-left bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 space-y-4">
            <div className="flex items-center gap-3 text-forest-800">
              <ShieldCheck className="w-6 h-6 text-earth-600" />
              <h3 className="text-xl font-bold font-display text-charcoal-900">
                Our Pledge of Integrity & Safeguarding
              </h3>
            </div>
            <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
              Mwancha Senior Community strictly upholds the rights, autonomy, and confidential safety of every beneficiary. All volunteers and partner representatives must adhere to our zero-tolerance policy regarding elder abuse, exploitation, and unauthorized use of beneficiary identity.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
};
