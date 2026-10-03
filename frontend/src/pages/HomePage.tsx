import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Users,
  HeartHandshake,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Container } from '../components/ui/Container';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ProgramCard } from '../components/cards/ProgramCard';
import { ImpactStatCard } from '../components/cards/ImpactStatCard';
import { NewsCard } from '../components/cards/NewsCard';
import { MSC_ORGANIZATION } from '../constants';
import { PROGRAMS_DATA } from '../data/programsData';
import { VERIFIED_IMPACT_METRICS } from '../data/impactData';
import { NEWS_ARTICLES_DATA } from '../data/newsData';
import { fadeIn, fadeInUp, staggerContainer } from '../animations';

export const HomePage: React.FC = () => {
  const featuredPrograms = PROGRAMS_DATA.slice(0, 3);
  const latestArticles = NEWS_ARTICLES_DATA.slice(0, 3);

  return (
    <div className="space-y-20 sm:space-y-24 pb-16">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-warm-100 via-warm-50 to-warm-50 pt-10 pb-16 sm:py-20 lg:py-24 border-b border-warm-200/80">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Column: Copy & CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="lg:col-span-7 text-left space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100/90 text-forest-900 border border-forest-200 text-xs sm:text-sm font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-forest-700 animate-pulse" />
                <span>Grassroots Care & Advocacy Across Kenya</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-charcoal-900 leading-[1.15] font-display tracking-tight">
                Dignity, Care & a Better Life for{' '}
                <span className="text-forest-800 underline decoration-earth-400 decoration-wavy decoration-2 underline-offset-8">
                  Older Persons
                </span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed max-w-2xl font-normal">
                {MSC_ORGANIZATION.mission}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  to="/donate"
                  variant="secondary"
                  size="lg"
                  icon={<Heart className="w-5 h-5 fill-white" />}
                  className="font-bold shadow-md hover:shadow-lg"
                >
                  Support Our Work
                </Button>
                <Button
                  to="/about"
                  variant="outline"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Learn About MSC
                </Button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-warm-200 max-w-xl">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-forest-900 font-display">1,203+</p>
                  <p className="text-xs text-charcoal-600 font-medium">Beneficiary Homes</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-forest-900 font-display">40</p>
                  <p className="text-xs text-charcoal-600 font-medium">Ward Volunteers</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-forest-900 font-display">2016</p>
                  <p className="text-xs text-charcoal-600 font-medium">Serving Seniors</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Right Column: High Quality African Elder Care Imagery */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative Earth Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-forest-700 to-earth-500 rounded-3xl opacity-20 blur-xl -z-10" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-warm-200">
                  <img
                    src="/images/mwancha-community-grounds.jpg"
                    alt="Mwancha Senior Community headquarters and grounds in Kebirigo, Nyamira County"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />

                  {/* Official Emblem Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-warm-200/90 flex items-center gap-3.5 z-10">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white p-1.5 border border-warm-200 shadow-sm flex items-center justify-center flex-shrink-0">
                      <img src="/logo.png" alt="Mwancha Senior Community Official Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left pr-2">
                      <p className="text-sm font-extrabold text-forest-900 leading-tight">Mwancha Senior Community</p>
                      <p className="text-[11px] text-earth-700 font-bold uppercase tracking-wider mt-0.5">Verified Headquarters</p>
                    </div>
                  </div>

                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-6 text-white text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-900/80 border border-forest-600/50 text-[11px] font-bold text-earth-300 mb-2">
                      <span className="w-2 h-2 rounded-full bg-forest-400" />
                      <span>Official Community Compound & Facility</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold leading-snug text-warm-50">
                      "To become a leading regional and global organization in spearheading the rights, welfare and wellbeing of the elderly in society."
                    </p>
                    <p className="text-xs text-forest-200/90 mt-2 font-medium">
                      P.O. Box 21–40506, Kebirigo &bull; Nyamira County, Kenya
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          WHO WE ARE (Official Background & Profile)
          ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-warm-200/90 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 text-left space-y-4">
                <span className="text-xs font-bold text-earth-700 uppercase tracking-wider bg-earth-50 px-3 py-1 rounded-full border border-earth-200 inline-block">
                  Who We Are
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 font-display">
                  From Grassroots Compassion in Nyamira to a National Movement for Elder Dignity
                </h2>
                <div className="text-charcoal-700 space-y-3.5 text-base sm:text-lg leading-relaxed">
                  <p>
                    <strong>Mwancha Senior Community (MSC)</strong> was originally established in <strong>2016</strong> as <strong>Mwancha Home for the Elderly</strong> in Kebirigo, Nyamira County, Kenya. It began as a localized community response to the heartbreaking neglect, physical frailty, and social isolation experienced by older citizens.
                  </p>
                  <p>
                    In <strong>2024</strong>, the organization formally transitioned its name to <strong>Mwancha Senior Community</strong>. This name change reflects a decisive evolution: expanding from an immediate local welfare center into a comprehensive, community-driven, and rights-focused institution with an active national scope and regional vision.
                  </p>
                  <p className="text-sm text-forest-800 font-medium">
                    &bull; Non-profit &bull; Non-political &bull; Community-based &bull; Governed by accountability & respect
                  </p>
                </div>
                <div className="pt-3">
                  <Button to="/about/story" variant="outline" size="sm">
                    Read Our Full History
                  </Button>
                </div>
              </div>

              {/* Mission & Vision Quick Card */}
              <div className="lg:col-span-5 bg-warm-50 rounded-2xl p-6 sm:p-8 border border-warm-200 space-y-6 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-forest-800 font-bold text-sm uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-earth-600" />
                    <span>Our Stated Vision</span>
                  </div>
                  <blockquote className="text-charcoal-800 text-sm sm:text-base italic leading-relaxed pl-3 border-l-2 border-forest-600">
                    "{MSC_ORGANIZATION.vision}"
                  </blockquote>
                </div>

                <div className="space-y-2 pt-4 border-t border-warm-200">
                  <div className="flex items-center gap-2 text-forest-800 font-bold text-sm uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-earth-600" />
                    <span>Our Stated Mission</span>
                  </div>
                  <blockquote className="text-charcoal-800 text-sm sm:text-base italic leading-relaxed pl-3 border-l-2 border-earth-600">
                    "{MSC_ORGANIZATION.mission}"
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          WHY OUR WORK MATTERS: DOCUMENTED CHALLENGES FACED BY OLDER PERSONS
          ========================================================================= */}
      <section className="bg-warm-100/70 py-16 sm:py-20 border-y border-warm-200/80">
        <Container>
          <SectionHeading
            centered
            badge="The Reality in Our Communities"
            title="Why Our Work Matters"
            subtitle="Older persons in Kenya encounter complex vulnerabilities that threaten their health, safety, and human dignity. Sourced directly from our field assessments, these challenges guide every intervention we undertake."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {MSC_ORGANIZATION.documentedChallenges.map((challenge, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-warm-200 text-left shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 font-display mb-2.5">
                  {challenge.title}
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  {challenge.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button to="/programs" variant="primary" size="md">
              Explore Our Responsive Interventions
            </Button>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          KEY PROGRAM AREAS (The 5 Documented Programs)
          ========================================================================= */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
            <div>
              <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
                Core Interventions
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal-900 font-display">
                Our Five Documented Program Areas
              </h2>
              <p className="mt-2 text-base text-charcoal-600 max-w-2xl">
                Structured to address both emergency vulnerability and long-term systemic reforms for the aging population.
              </p>
            </div>
            <Button to="/programs" variant="outline" size="sm">
              View All 5 Programs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          MEASURABLE VERIFIED IMPACT (Strict Source of Truth)
          ========================================================================= */}
      <section className="bg-forest-900 text-warm-50 py-16 sm:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-xl">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-earth-300 text-xs font-semibold tracking-wider uppercase border border-forest-700 mb-3">
              Source of Truth
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-white">
              Documented Ground Impact
            </h2>
            <p className="mt-3 text-base text-forest-200">
              Verified programmatic milestones from Mwancha Senior Community's field operations. We report documented facts without embellishment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VERIFIED_IMPACT_METRICS.map((metric) => (
              <ImpactStatCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-forest-850/80 border border-forest-700/60 max-w-3xl mx-auto text-center text-xs sm:text-sm text-forest-200">
            <p>
              * In adherence to our organizational core value of <strong>Accountability</strong>, figures reflect verified beneficiary records and trained volunteer registries. Broader national impact datasets will be updated continuously.
            </p>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          OUR APPROACH (Dignity, Health, Psychosocial & Partnerships)
          ========================================================================= */}
      <section>
        <Container>
          <SectionHeading
            centered
            badge="Methodology"
            title="Our Community-Centered Approach"
            subtitle="We believe older citizens should not be passive recipients of pity, but empowered rights-holders who live with respect and autonomy."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-white border border-warm-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Dignity & Safety</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Prioritizing personal physical safety, shelter weatherization, and defense against domestic exploitation and accusations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-warm-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Psychosocial Wellbeing</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Combating loneliness through peer support circles, storytelling barazas, and trauma counseling for elder-headed households.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-warm-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Health & Nutrition</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Facilitating healthcare facility referrals, medical triage, and distributing emergency food baskets for destitute elders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-warm-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Partnership Networks</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Mobilizing county administration, faith leaders, health centers, and development partners for durable public safety nets.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          LATEST NEWS & STORIES
          ========================================================================= */}
      <section className="bg-warm-100/50 py-16 border-t border-warm-200/80">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
            <div>
              <span className="text-xs font-bold text-earth-700 uppercase tracking-wider bg-earth-100 px-3 py-1 rounded-full border border-earth-300 inline-block mb-3">
                News & Field Updates
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal-900 font-display">
                Stories from the Community
              </h2>
              <p className="mt-2 text-base text-charcoal-600 max-w-2xl">
                Read about our advocacy barazas, volunteer field experiences, and institutional milestones.
              </p>
            </div>
            <Button to="/news" variant="outline" size="sm">
              View All Articles
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          CALL TO ACTION (Respectful, dignified mobilization)
          ========================================================================= */}
      <section>
        <Container>
          <div className="bg-forest-800 rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center shadow-xl relative overflow-hidden">
            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-earth-300 bg-forest-900 px-3.5 py-1.5 rounded-full border border-forest-700 inline-block">
                Take Action Today
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display leading-tight">
                Help Us Support Older Persons in Kenya
              </h2>
              <p className="text-base sm:text-lg text-forest-100 max-w-2xl mx-auto leading-relaxed">
                Whether through donating to sustain emergency food and medical assistance, joining our 40 ward volunteers, or creating an institutional partnership, your involvement directly touches the life of a vulnerable elder.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Button to="/donate" variant="secondary" size="lg" className="font-bold">
                  Donate
                </Button>
                <Button to="/partner" variant="outline" size="lg" className="border-forest-400 text-white hover:bg-forest-700">
                  Partner With Us
                </Button>
                <Button to="/volunteer" variant="ghost" size="lg" className="text-white hover:bg-forest-700">
                  Volunteer
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
