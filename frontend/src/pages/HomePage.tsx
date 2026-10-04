import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Users,
  HeartHandshake,
  Sparkles,
  CheckCircle,
  Calendar,
  Globe,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Award,
  Eye,
  Activity,
  Compass
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
import { SEO } from '../components/common/SEO';

// Authentic Facilities for Interactive Showcase
const MSC_FACILITIES = [
  {
    id: 'grounds',
    title: 'Community Compound & Outreach Hub',
    category: 'Field Operations',
    description: 'The central operational grounds in Kebirigo, Nyamira County, serving as the launching pad for mobile medical outreaches and food basket distributions.',
    location: 'Kebirigo, Nyamira County',
    image: '/images/mwancha-community-grounds.jpg',
    tag: 'Verified Headquarters'
  },
  {
    id: 'residence',
    title: 'Main Center & Residence',
    category: 'Care & Respite',
    description: 'Our permanent two-story residential center providing safe shelter, case management coordination, and compassionate respite care for vulnerable seniors.',
    location: 'Kebirigo, Nyamira County',
    image: '/images/mwancha-facility-main.jpg',
    tag: 'Safe Shelter'
  },
  {
    id: 'pavilion',
    title: 'Traditional Gathering Pavilion',
    category: 'Psychosocial Circles',
    description: 'Our traditional shaded thatched gazebo where elders assemble weekly for peer fellowship, trauma counseling, and intergenerational storytelling.',
    location: 'Gathering Pavilion',
    image: '/images/mwancha-pavilion-gathering.jpg',
    tag: 'Peer Fellowship'
  },
  {
    id: 'garden',
    title: 'Botanical Wellness Garden & Trail',
    category: 'Sensory Therapy',
    description: 'Lush therapeutic green pathways planted with indigenous and medicinal flora to promote senior sensory stimulation, light mobility, and peace.',
    location: 'Wellness Trail',
    image: '/images/mwancha-garden-pathway.jpg',
    tag: 'Mental Wellbeing'
  },
  {
    id: 'farm',
    title: 'Community Food Security Orchard',
    category: 'Nutrition Security',
    description: 'Cultivating fresh organic produce and fruit trees to supply balanced daily nutrition to elder residents and destitute rural households.',
    location: 'Organic Plot',
    image: '/images/mwancha-sustainable-farm.jpg',
    tag: 'Food Security'
  }
];

// Continuous Ticker Highlights
const TICKER_ITEMS = [
  '1,203+ Vulnerable Households Supported',
  'Advancing Elder Rights Across Kenya',
  '40 Ward-Based Active Volunteers',
  'Defending Against False Accusations & Elder Abuse',
  'Holistic Geriatric Healthcare & Psychosocial Support',
  'Established 2016 in Kebirigo, Nyamira County',
  'Palliative Care & Safe Elder Shelter',
  'Intergenerational Cohesion & Community Barazas'
];

export const HomePage: React.FC = () => {
  const featuredPrograms = PROGRAMS_DATA.slice(0, 3);
  const latestArticles = NEWS_ARTICLES_DATA.slice(0, 3);

  // Facility carousel state
  const [activeFacilityIndex, setActiveFacilityIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Mandate tab state
  const [activeMandateTab, setActiveMandateTab] = useState<'vision' | 'mission' | 'values'>('vision');

  // Interactive Program Filter
  const [selectedProgramPillar, setSelectedProgramPillar] = useState<string>('all');

  // Auto-advance facility showcase every 5.5s unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveFacilityIndex((prev) => (prev + 1) % MSC_FACILITIES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const activeFacility = MSC_FACILITIES[activeFacilityIndex];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      <SEO
        title="Home"
        description="Mwancha Senior Community (MSC) is dedicated to advancing elder rights, holistic healthcare, social protection, and dignity for older persons across Kenya."
      />

      {/* =========================================================================
          HERO SECTION (Modern, Dynamic, Glassmorphic & Alive)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 lg:py-24 border-b border-warm-200/80 bg-gradient-to-b from-warm-100 via-warm-50/70 to-warm-50">
        {/* Soft Ambient Light Glows */}
        <div className="ambient-glow -top-24 -left-20 w-96 h-96 bg-emerald-400/20" />
        <div className="ambient-glow top-40 -right-20 w-96 h-96 bg-amber-400/20" />

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Hero Left Column: Copy & CTAs */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="lg:col-span-7 text-left space-y-6 relative z-10"
            >
              {/* Dynamic Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-forest-900 border border-forest-200/80 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
                <span className="font-bold">National Mandate</span>
                <span className="text-forest-400">&bull;</span>
                <span className="text-charcoal-700">Rooted in Kebirigo, Nyamira County</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-charcoal-950 leading-[1.12] font-display tracking-tight">
                Dignity, Care & a Flourishing Life for{' '}
                <span className="relative inline-block text-forest-800">
                  <span className="relative z-10">Older Persons</span>
                  <span className="absolute bottom-1.5 left-0 w-full h-3 bg-amber-200/60 -rotate-1 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-700 leading-relaxed max-w-2xl font-normal">
                {MSC_ORGANIZATION.mission}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Button
                  to="/donate"
                  variant="secondary"
                  size="lg"
                  icon={<Heart className="w-5 h-5 fill-white" />}
                  className="font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform duration-200"
                >
                  Support Our Work
                </Button>
                <Button
                  to="/about"
                  variant="outline"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                  className="bg-white/80 hover:bg-white border-forest-300 hover:border-forest-600 shadow-sm"
                >
                  Explore Our Story
                </Button>
                <a
                  href={`https://wa.me/254790629439?text=${encodeURIComponent('Hello Mwancha Senior Community, I would like to inquire about your programs.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  aria-label="Direct WhatsApp inquiry with MSC"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Helpdesk</span>
                </a>
              </div>

              {/* Dynamic Animated Impact Metric Chips */}
              <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-4 border-t border-warm-200/80 max-w-xl">
                <div className="glass-card rounded-2xl p-3 sm:p-4 border border-warm-200/90 text-left shadow-xs transition-transform hover:-translate-y-1 duration-200">
                  <div className="flex items-center gap-1.5 text-forest-700 mb-1">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Beneficiaries</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-forest-900 font-display">1,203+</p>
                  <p className="text-xs text-charcoal-600 font-medium">Households Served</p>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-4 border border-warm-200/90 text-left shadow-xs transition-transform hover:-translate-y-1 duration-200">
                  <div className="flex items-center gap-1.5 text-forest-700 mb-1">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Volunteers</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-forest-900 font-display">40</p>
                  <p className="text-xs text-charcoal-600 font-medium">Ward Coordinators</p>
                </div>

                <div className="glass-card rounded-2xl p-3 sm:p-4 border border-warm-200/90 text-left shadow-xs transition-transform hover:-translate-y-1 duration-200">
                  <div className="flex items-center gap-1.5 text-forest-700 mb-1">
                    <Calendar className="w-4 h-4 text-forest-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Established</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-forest-900 font-display">2016</p>
                  <p className="text-xs text-charcoal-600 font-medium">Community Rooted</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Right Column: Interactive Compound & Facility Showcase */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:col-span-5 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glowing Outer Aura */}
                <div className="absolute -inset-2 bg-gradient-to-r from-forest-600 via-emerald-500 to-amber-500 rounded-3xl opacity-25 blur-xl -z-10 animate-pulse" />

                {/* Primary Visual Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-warm-200">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeFacility.id}
                      src={activeFacility.image}
                      alt={activeFacility.title}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full object-cover object-center"
                      loading="eager"
                    />
                  </AnimatePresence>

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/30 to-transparent" />

                  {/* Official Verified Emblem */}
                  <div className="absolute top-4 left-4 glass-card rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/80 flex items-center gap-3 z-20">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white p-1 border border-warm-200 shadow-xs flex items-center justify-center flex-shrink-0">
                      <img src="/logo.png" alt="Mwancha Senior Community Official Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left pr-1">
                      <p className="text-xs sm:text-sm font-black text-forest-950 leading-tight">Mwancha Senior Community</p>
                      <p className="text-[10px] sm:text-xs text-earth-700 font-bold uppercase tracking-wider mt-0.5">
                        {activeFacility.tag}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Arrows for Facility */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={() => setActiveFacilityIndex((prev) => (prev - 1 + MSC_FACILITIES.length) % MSC_FACILITIES.length)}
                      aria-label="Previous facility photo"
                      className="w-8 h-8 rounded-full bg-forest-950/60 hover:bg-forest-950 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFacilityIndex((prev) => (prev + 1) % MSC_FACILITIES.length)}
                      aria-label="Next facility photo"
                      className="w-8 h-8 rounded-full bg-forest-950/60 hover:bg-forest-950 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Slide Content Caption */}
                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white text-left z-20">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/90 border border-forest-600/60 text-xs font-bold text-amber-300 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{activeFacility.category}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-display text-white leading-snug">
                      {activeFacility.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-forest-100/90 mt-1 line-clamp-2 leading-relaxed">
                      {activeFacility.description}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-forest-700/60 text-xs text-forest-200">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {activeFacility.location}
                      </span>
                      <span className="font-semibold text-amber-300">
                        {activeFacilityIndex + 1} of {MSC_FACILITIES.length}
                      </span>
                    </div>

                    {/* Interactive Slide Selector Pills */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {MSC_FACILITIES.map((fac, idx) => (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => setActiveFacilityIndex(idx)}
                          aria-label={`View ${fac.title}`}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            activeFacilityIndex === idx
                              ? 'w-8 bg-amber-400'
                              : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          ANIMATED LIVE COMMUNITY TICKER (Modern Marquee)
          ========================================================================= */}
      <div className="border-y border-forest-900/10 bg-forest-900 text-warm-50 py-3.5 overflow-hidden select-none shadow-inner">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC IDENTITY & STATED MANDATE (Vision, Mission & Core Values Hub)
          ========================================================================= */}
      <section className="relative">
        <Container>
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200/90 shadow-card">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Organization Evolution */}
              <div className="lg:col-span-6 text-left space-y-4">
                <span className="text-xs font-bold text-earth-800 uppercase tracking-wider bg-earth-100 px-3.5 py-1.5 rounded-full border border-earth-300 inline-block">
                  Authentic Background
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 font-display">
                  From Grassroots Compassion in Kebirigo to a National Movement
                </h2>
                <div className="text-charcoal-700 space-y-3.5 text-base sm:text-lg leading-relaxed">
                  <p>
                    <strong>Mwancha Senior Community (MSC)</strong> was originally founded in <strong>2016</strong> as <strong>Mwancha Home for the Elderly</strong> in Kebirigo, Nyamira County, Kenya. It began as an urgent community response to the heartbreaking neglect, physical frailty, and abandonment experienced by older citizens.
                  </p>
                  <p>
                    In <strong>2024</strong>, the organization formally transitioned its name to <strong>Mwancha Senior Community</strong>. This evolution marks an expansion from localized welfare sheltering to a rights-based, community-driven institution advocating for senior citizen dignity across Kenya.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <Button to="/about/story" variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Read Full MSC History
                  </Button>
                  <Button to="/about/structure" variant="ghost" size="sm">
                    View Governance Roster
                  </Button>
                </div>
              </div>

              {/* Right Column: Interactive Mandate Switcher */}
              <div className="lg:col-span-6 bg-warm-50 rounded-2xl p-6 sm:p-8 border border-warm-200 shadow-sm text-left">
                {/* Tabs */}
                <div className="flex rounded-xl bg-warm-200/80 p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setActiveMandateTab('vision')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                      activeMandateTab === 'vision'
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'text-charcoal-700 hover:text-charcoal-950'
                    }`}
                  >
                    Stated Vision
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMandateTab('mission')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                      activeMandateTab === 'mission'
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'text-charcoal-700 hover:text-charcoal-950'
                    }`}
                  >
                    Stated Mission
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMandateTab('values')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                      activeMandateTab === 'values'
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'text-charcoal-700 hover:text-charcoal-950'
                    }`}
                  >
                    6 Core Values
                  </button>
                </div>

                {/* Tab Contents */}
                {activeMandateTab === 'vision' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 text-forest-800 font-bold text-sm uppercase tracking-wide">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <span>The Vision of Mwancha Senior Community</span>
                    </div>
                    <blockquote className="text-charcoal-900 text-base sm:text-lg italic leading-relaxed pl-4 border-l-4 border-forest-600 bg-white p-4 rounded-r-xl border border-warm-200/60 shadow-xs">
                      "{MSC_ORGANIZATION.vision}"
                    </blockquote>
                    <p className="text-xs text-charcoal-600">
                      Guiding every intervention toward regional and global leadership in senior citizen rights and welfare.
                    </p>
                  </motion.div>
                )}

                {activeMandateTab === 'mission' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 text-forest-800 font-bold text-sm uppercase tracking-wide">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Our Operational Mission</span>
                    </div>
                    <blockquote className="text-charcoal-900 text-base sm:text-lg italic leading-relaxed pl-4 border-l-4 border-emerald-600 bg-white p-4 rounded-r-xl border border-warm-200/60 shadow-xs">
                      "{MSC_ORGANIZATION.mission}"
                    </blockquote>
                    <p className="text-xs text-charcoal-600">
                      Fostering health, economic empowerment, and psychosocial support to preserve dignity in later life.
                    </p>
                  </motion.div>
                )}

                {activeMandateTab === 'values' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <p className="text-xs font-bold text-forest-800 uppercase tracking-wider">
                      Official Ethical Core Values:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {MSC_ORGANIZATION.coreValues.map((val) => (
                        <div key={val.title} className="p-3 bg-white rounded-xl border border-warm-200 text-left shadow-xs">
                          <p className="font-bold text-xs text-forest-900">{val.title}</p>
                          <p className="text-[11px] text-charcoal-600 line-clamp-2 mt-0.5">{val.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          AUTHENTIC HEADQUARTERS & FACILITY SHOWCASE
          ========================================================================= */}
      <section className="py-12 bg-white border-y border-warm-200/80">
        <Container>
          <SectionHeading
            centered
            badge="Verified Field Operations"
            title="Our Community Headquarters & Grounds"
            subtitle="Authentic photographs of Mwancha Senior Community in Kebirigo, Nyamira County, Kenya. Here, vulnerable elders find safe shelter, communal warmth, and therapeutic green spaces."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {MSC_FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="group rounded-3xl overflow-hidden bg-white border border-warm-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-warm-200 relative">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-forest-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {facility.category}
                  </div>
                </div>
                <div className="p-6 text-left">
                  <h3 className="font-extrabold text-charcoal-900 text-lg font-display mb-1.5 group-hover:text-forest-800 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {facility.description}
                  </p>
                  <p className="text-xs text-earth-700 font-semibold mt-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-earth-600" />
                    <span>{facility.location}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          WHY OUR WORK MATTERS: DOCUMENTED CHALLENGES FACED BY OLDER PERSONS
          ========================================================================= */}
      <section className="bg-warm-100/70 py-16 sm:py-20 border-b border-warm-200/80">
        <Container>
          <SectionHeading
            centered
            badge="The Reality in Our Communities"
            title="Why Our Work Matters"
            subtitle="Older persons in Kenya encounter complex vulnerabilities that threaten their health, safety, and human dignity. Sourced directly from our field assessments, these challenges guide every intervention we undertake."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {MSC_ORGANIZATION.documentedChallenges.map((challenge, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-warm-200 text-left shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
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
            <Button to="/programs" variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
              Explore Our Responsive Interventions
            </Button>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          KEY PROGRAM AREAS (The 5 Core Pillars)
          ========================================================================= */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
            <div>
              <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
                Core Interventions
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-charcoal-900 font-display">
                Our Five Core Program Areas
              </h2>
              <p className="mt-2 text-base text-charcoal-600 max-w-2xl">
                Structured to address both immediate vulnerability and long-term systemic protection for older citizens across Kenya.
              </p>
            </div>
            <Button to="/programs" variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
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
      <section className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 text-warm-50 py-16 sm:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Light Radial */}
        <div className="ambient-glow top-0 right-1/4 w-80 h-80 bg-emerald-500/20" />

        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-amber-300 text-xs font-bold tracking-wider uppercase border border-forest-700 mb-3 shadow-xs">
              Strict Source of Truth
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white">
              Documented Ground Impact
            </h2>
            <p className="mt-3 text-base text-forest-100 max-w-2xl mx-auto">
              Verified programmatic milestones from Mwancha Senior Community's field operations. We report documented facts without embellishment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {VERIFIED_IMPACT_METRICS.map((metric) => (
              <ImpactStatCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="mt-12 p-5 rounded-2xl bg-forest-850/80 border border-forest-700/60 max-w-3xl mx-auto text-center text-xs sm:text-sm text-forest-200 relative z-10">
            <p>
              * In adherence to our organizational core value of <strong>Accountability</strong>, figures reflect verified beneficiary records and trained volunteer registries. Broader national impact datasets will be updated continuously.
            </p>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          OUR METHODOLOGY & COMMITMENTS
          ========================================================================= */}
      <section>
        <Container>
          <SectionHeading
            centered
            badge="Methodology"
            title="Our Community-Centered Approach"
            subtitle="We believe older citizens should not be passive recipients of pity, but empowered rights-holders who live with respect and autonomy."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left mt-10">
            <div className="p-6 rounded-2xl bg-white border border-warm-200 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Dignity & Safety</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Prioritizing personal physical safety, shelter weatherization, and defense against domestic exploitation and accusations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-warm-200 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Psychosocial Wellbeing</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Combating loneliness through peer support circles, storytelling barazas, and trauma counseling for elder-headed households.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-warm-200 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-charcoal-900 mb-2 font-display">Health & Nutrition</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Facilitating healthcare facility referrals, medical triage, and distributing emergency food baskets for destitute elders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-warm-200 shadow-card hover:shadow-card-hover transition-all duration-200">
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
            <Button to="/news" variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
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
          <div className="bg-gradient-to-r from-forest-800 to-forest-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center shadow-xl relative overflow-hidden">
            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-forest-950/80 px-4 py-1.5 rounded-full border border-forest-700 inline-block">
                Take Action Today
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display leading-tight">
                Help Us Safeguard Older Persons Across Kenya
              </h2>
              <p className="text-base sm:text-lg text-forest-100 max-w-2xl mx-auto leading-relaxed">
                Whether through donating to sustain emergency nutrition and healthcare referrals, volunteering across our 40 ward networks, or establishing an institutional partnership, your action directly restores dignity to a senior citizen.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Button to="/donate" variant="secondary" size="lg" className="font-bold shadow-lg">
                  Donate Now
                </Button>
                <Button to="/partner" variant="outline" size="lg" className="border-forest-400 text-white hover:bg-forest-700">
                  Partner With Us
                </Button>
                <Button to="/volunteer" variant="ghost" size="lg" className="text-white hover:bg-forest-700">
                  Volunteer With Us
                </Button>
                <a
                  href={`https://wa.me/254790629439?text=${encodeURIComponent('Hello MSC, I would like to inquire about partnering or supporting your mission.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
