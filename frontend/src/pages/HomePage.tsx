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
  Pause,
  Play,
  Stethoscope,
  Wheat,
  Building2,
  Handshake,
  Activity
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
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { ImpactDashboardSection } from '../components/impact/ImpactDashboardSection';


// Authentic Facilities for Full-Screen Cinematic Showcase
const MSC_FACILITIES = [
  {
    id: 'grounds',
    title: 'Community Compound & Outreach Hub',
    category: 'Field Operations',
    description: 'The central operational grounds in Ekerenyo, Nyamira County, serving as the launching pad for mobile medical outreaches, stakeholder assemblies, and emergency food distributions.',
    location: 'Ekerenyo, Nyamira County',
    image: '/images/mwancha-community-grounds.jpg',
    tag: 'Verified Headquarters'
  },
  {
    id: 'residence',
    title: 'Main Care Center & Residence',
    category: 'Care & Respite',
    description: 'Our permanent two-story residential center providing safe shelter, case management coordination, and compassionate respite care for vulnerable seniors.',
    location: 'Ekerenyo, Nyamira County',
    image: '/images/mwancha-facility-main.jpg',
    tag: 'Safe Elder Shelter'
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
  'Established 2016 in Ekerenyo, Nyamira County',
  'Palliative Care & Safe Elder Shelter',
  'Intergenerational Cohesion & Community Barazas'
];

export const HomePage: React.FC = () => {
  const featuredPrograms = PROGRAMS_DATA.slice(0, 3);
  const latestArticles = NEWS_ARTICLES_DATA.slice(0, 3);

  // Full-Screen Facility Carousel State
  const [activeFacilityIndex, setActiveFacilityIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mandate tab state & continuous auto-rotation
  const mandateTabs: Array<'vision' | 'mission' | 'values'> = ['vision', 'mission', 'values'];
  const [activeMandateTab, setActiveMandateTab] = useState<'vision' | 'mission' | 'values'>('vision');
  const [mandateProgress, setMandateProgress] = useState(0);
  const MANDATE_DURATION = 4600; // 4.6 seconds per tab auto-advance

  const SLIDE_DURATION = 4200; // Snappy 4.2 seconds per slide

  // Preload all facility images immediately on mount so animations run instantly
  useEffect(() => {
    MSC_FACILITIES.forEach((fac) => {
      const img = new Image();
      img.src = fac.image;
    });
  }, []);

  // Continuous auto-advance facility showcase with smooth timer progress bar
  useEffect(() => {
    if (isPaused) return;

    const interval = 40; // update progress every 40ms for 60fps smoothness
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, activeFacilityIndex]);

  useEffect(() => {
    if (progress >= 100) {
      setActiveFacilityIndex((prev) => (prev + 1) % MSC_FACILITIES.length);
      setProgress(0);
    }
  }, [progress]);

  // Continuous auto-advance for mandate tabs (Vision -> Mission -> Values)
  useEffect(() => {
    const interval = 40;
    const step = (interval / MANDATE_DURATION) * 100;

    const timer = setInterval(() => {
      setMandateProgress((prev) => {
        if (prev + step >= 100) {
          setActiveMandateTab((curr) => {
            const nextIdx = (mandateTabs.indexOf(curr) + 1) % mandateTabs.length;
            return mandateTabs[nextIdx];
          });
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const selectMandateTab = (tab: 'vision' | 'mission' | 'values') => {
    setActiveMandateTab(tab);
    setMandateProgress(0);
  };

  const selectFacility = (index: number) => {
    setActiveFacilityIndex(index);
    setProgress(0);
  };

  const nextFacility = () => {
    setActiveFacilityIndex((prev) => (prev + 1) % MSC_FACILITIES.length);
    setProgress(0);
  };

  const prevFacility = () => {
    setActiveFacilityIndex((prev) => (prev - 1 + MSC_FACILITIES.length) % MSC_FACILITIES.length);
    setProgress(0);
  };

  const activeFacility = MSC_FACILITIES[activeFacilityIndex];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      <SEO
        title="Home"
        description="Mwancha Senior Community (MSC) is dedicated to advancing elder rights, holistic healthcare, social protection, and dignity for older persons across Kenya."
      />

      {/* =========================================================================
          FULL-PAGE IMMERSIVE CINEMATIC HERO (Continuous Non-Stop Animation & Fast Responsive UI)
          ========================================================================= */}
      <section
        className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between overflow-hidden bg-charcoal-950 text-white select-none border-b-2 border-forest-900 transition-colors"
      >
        {/* Full-Bleed Animated Facility Background Carousel with Continuous Ken Burns Float */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeFacility.id}
              src={activeFacility.image}
              alt={activeFacility.title}
              initial={{ opacity: 0, scale: 1.0 }}
              animate={{ opacity: 1, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.65, ease: 'easeInOut' },
                scale: { duration: 4.8, ease: 'linear' }
              }}
              className="absolute inset-0 w-full h-full object-cover object-center filter contrast-110 saturate-110 will-change-transform"
              loading="eager"
            />
          </AnimatePresence>

          {/* Solid Uniform Dark Scrim: Ensures crystal-clear text readability */}
          <div className="absolute inset-0 bg-charcoal-950/70 sm:bg-black/65 z-10 pointer-events-none" />
        </div>

        {/* Top Header / Verified Organization Status Area */}
        <div className="relative z-20 pt-6 sm:pt-10">
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Verified Organization Emblem */}
              <div className="bg-charcoal-900/90 backdrop-blur-md rounded-2xl px-3.5 py-2 border-2 border-charcoal-700 flex items-center gap-3 shadow-xl">
                <div
                  style={{ backgroundColor: '#ffffff' }}
                  className="preserve-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl p-1 border-2 border-warm-200 shadow-xs flex items-center justify-center flex-shrink-0 animate-pulse-glow"
                >
                  <img src="/logo.png" alt="MSC Emblem" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-white leading-tight">
                    Mwancha Senior Community
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-amber-300 font-black uppercase tracking-wider">
                    Ekerenyo, Nyamira County, Kenya
                  </p>
                </div>
              </div>

              {/* Mission Active Status Beacon */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-950/90 backdrop-blur-md border-2 border-emerald-500/70 text-xs font-black text-emerald-300 shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span>Active Grassroots Mission Across Kenya</span>
              </div>
            </div>
          </Container>
        </div>

        {/* Central Core: High-Contrast Headline, Mission & Actions */}
        <div className="relative z-20 py-8 sm:py-12 my-auto">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl text-left space-y-6"
            >
              {/* Active Facility Tag Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span>Community Facility: {activeFacility.title}</span>
              </div>

              {/* Main Headline (Unified One Font Color, Simple Vocabulary, No Dashes) */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.15] font-display tracking-tight drop-shadow-md">
                Dignity and Care for Older Persons
              </h1>

              {/* Clear, Strong Descriptive Statement of MSC Work */}
              <p className="text-base sm:text-xl text-white leading-relaxed font-medium max-w-3xl drop-shadow-xs">
                We provide free medical care, nutritious food, safe shelter, and protection against abuse for vulnerable older persons, ensuring every elder lives with dignity and respect.
              </p>

              {/* High-Contrast Action Buttons (Unified Fast-Action Green Palette) */}
              <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-150 border-2 border-emerald-400"
                >
                  <Heart className="w-5 h-5 fill-white text-white animate-float" />
                  <span>Support Our Work</span>
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-150 border-2 border-emerald-400"
                >
                  <span>Explore Our Story</span>
                  <ArrowRight className="w-5 h-5 text-white" />
                </Link>

                <a
                  href={`https://wa.me/254790629439?text=${encodeURIComponent('Hello Mwancha Senior Community, I would like to inquire about your programs and support services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-150 border-2 border-emerald-400"
                  aria-label="Direct WhatsApp inquiry with MSC"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-white animate-float" />
                  <span>WhatsApp Helpdesk</span>
                </a>
              </div>

              {/* 3 High-Contrast Impact Metrics Chips with Animated Counters & Floating Icons */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-xl pt-2">
                <div className="bg-charcoal-950/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-white/20 text-left shadow-xl group hover:-translate-y-0.5 transition-transform duration-150">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-float" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 truncate">Beneficiaries</span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display">
                    <AnimatedCounter value="1,203+" durationMs={1200} />
                  </p>
                  <p className="text-xs text-warm-200 font-bold truncate">Households</p>
                </div>

                <div className="bg-charcoal-950/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-white/20 text-left shadow-xl group hover:-translate-y-0.5 transition-transform duration-150">
                  <div className="flex items-center gap-1.5 mb-1">
                    <HeartHandshake className="w-4 h-4 text-amber-400 flex-shrink-0 animate-float" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 truncate">Volunteers</span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display">
                    <AnimatedCounter value="40" durationMs={900} />
                  </p>
                  <p className="text-xs text-warm-200 font-bold truncate">Coordinators</p>
                </div>

                <div className="bg-charcoal-950/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-white/20 text-left shadow-xl group hover:-translate-y-0.5 transition-transform duration-150">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-float" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 truncate">Founded</span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display">
                    <AnimatedCounter value="2016" durationMs={1100} />
                  </p>
                  <p className="text-xs text-warm-200 font-bold truncate">Rooted</p>
                </div>
              </div>
            </motion.div>
          </Container>
        </div>

        {/* Bottom Control Deck: Interactive Facility Switcher & Live Progress */}
        <div className="relative z-20 pb-4 sm:pb-8">
          <Container>
            <div className="bg-charcoal-950/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-5 border-2 border-charcoal-700 shadow-2xl text-white">
              {/* Glowing High-Contrast Progress Bar */}
              <div className="w-full bg-charcoal-800 h-2 sm:h-2.5 rounded-full mb-3 sm:mb-4 overflow-hidden border border-charcoal-600">
                <motion.div
                  className="bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-400 h-full rounded-full shadow-[0_0_12px_#10b981]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                {/* Current Location Caption */}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-black text-white tracking-wide">
                      {activeFacility.title}
                    </span>
                    <span className="text-[11px] sm:text-xs text-charcoal-950 bg-amber-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex-shrink-0">
                      {activeFacility.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-warm-200 mt-1 line-clamp-1 font-semibold">
                    {activeFacility.description}
                  </p>
                </div>

                {/* Interactive Facility Thumbnail & Control Switcher */}
                <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto">
                  {/* Slide Selector Buttons with Mini Thumbnails */}
                  <div className="flex-1 lg:flex-none overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 bg-charcoal-900/95 p-1.5 rounded-xl sm:rounded-2xl border border-charcoal-700 touch-pan-x flex-nowrap">
                    {MSC_FACILITIES.map((fac, idx) => (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => selectFacility(idx)}
                        aria-label={`Switch background to ${fac.title}`}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex-shrink-0 ${
                          activeFacilityIndex === idx
                            ? 'bg-amber-400 text-charcoal-950 shadow-md ring-2 ring-amber-300 scale-105'
                            : 'text-warm-200 hover:text-white hover:bg-charcoal-800'
                        }`}
                      >
                        <img
                          src={fac.image}
                          alt=""
                          className="w-5 h-5 rounded-md object-cover flex-shrink-0 border border-white/20"
                        />
                        <span>{fac.category}</span>
                      </button>
                    ))}
                  </div>

                  {/* Play/Pause & Arrows */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPaused(!isPaused)}
                      aria-label={isPaused ? "Play background rotation" : "Pause background rotation"}
                      className="w-9 h-9 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white flex items-center justify-center border border-charcoal-700 transition-colors shadow-sm"
                    >
                      {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={prevFacility}
                      aria-label="Previous facility photo"
                      className="w-9 h-9 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white flex items-center justify-center border border-charcoal-700 transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextFacility}
                      aria-label="Next facility photo"
                      className="w-9 h-9 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white flex items-center justify-center border border-charcoal-700 transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* =========================================================================
          ANIMATED LIVE COMMUNITY TICKER (Modern High-Contrast Marquee)
          ========================================================================= */}
      <div className="border-y-2 border-forest-800 bg-forest-950 text-white py-3.5 sm:py-4 overflow-hidden select-none shadow-md">
        <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-extrabold tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span className="text-white drop-shadow-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC IDENTITY & STATED MANDATE (Vision, Mission & Core Values Hub)
          ========================================================================= */}
      <section className="py-12 sm:py-16 bg-warm-50 dark:bg-charcoal-950 transition-colors">
        <Container>
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-12 border-2 border-warm-300 dark:border-charcoal-700 shadow-card transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
              {/* Left Column: Organization Evolution */}
              <div className="lg:col-span-6 text-left space-y-4">
                <span className="text-xs font-black text-earth-900 dark:text-amber-300 uppercase tracking-wider bg-earth-100 dark:bg-amber-400/20 px-3.5 py-1.5 rounded-full border border-earth-400 dark:border-amber-400/50 inline-block">
                  Authentic Background
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-charcoal-950 dark:text-white font-display transition-colors">
                  From Grassroots Compassion in Ekerenyo to a National Movement
                </h2>
                <div className="text-charcoal-800 dark:text-warm-100 space-y-3.5 text-base sm:text-lg leading-relaxed font-medium transition-colors">
                  <p>
                    <strong className="text-forest-900 dark:text-emerald-400 font-bold">Mwancha Senior Community (MSC)</strong> was originally founded in <strong>2016</strong> as <strong>Mwancha Home for the Elderly</strong> in Ekerenyo, Nyamira County, Kenya. It began as an urgent community response to the heartbreaking neglect, physical frailty, and abandonment experienced by older citizens.
                  </p>
                  <p>
                    In <strong>2024</strong>, the organization formally transitioned its name to <strong>Mwancha Senior Community</strong>. This evolution marks an expansion from localized welfare sheltering to a rights-based, community-driven institution advocating for senior citizen dignity across Kenya.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button to="/about/story" variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Read Full MSC History
                  </Button>
                  <Button to="/about/structure" variant="ghost" size="sm">
                    View Governance Roster
                  </Button>
                </div>
              </div>

              {/* Right Column: Dynamic Auto-Advancing Mandate Switcher */}
              <div className="lg:col-span-6 bg-warm-50 dark:bg-charcoal-950 rounded-xl sm:rounded-2xl p-4 sm:p-8 border-2 border-warm-200 dark:border-charcoal-700 shadow-sm text-left transition-colors">
                {/* Continuous Progress Bar Indicator */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-forest-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    Continuous Showcase
                  </span>
                  <span className="text-[10px] text-charcoal-500 dark:text-warm-300 font-bold">
                    Auto-Cycling
                  </span>
                </div>
                <div className="w-full bg-warm-200 dark:bg-charcoal-800 h-1.5 rounded-full mb-5 overflow-hidden border border-warm-300 dark:border-charcoal-700">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-75"
                    style={{ width: `${mandateProgress}%` }}
                  />
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl bg-warm-200 dark:bg-charcoal-800 p-1 mb-6 border border-warm-300 dark:border-charcoal-700">
                  <button
                    type="button"
                    onClick={() => selectMandateTab('vision')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all duration-150 active:scale-95 ${
                      activeMandateTab === 'vision'
                        ? 'bg-forest-900 text-white dark:bg-amber-400 dark:text-charcoal-950 shadow-md ring-2 ring-emerald-500/50'
                        : 'text-charcoal-800 dark:text-warm-200 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Stated Vision
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMandateTab('mission')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all duration-150 active:scale-95 ${
                      activeMandateTab === 'mission'
                        ? 'bg-forest-900 text-white dark:bg-amber-400 dark:text-charcoal-950 shadow-md ring-2 ring-emerald-500/50'
                        : 'text-charcoal-800 dark:text-warm-200 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Stated Mission
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMandateTab('values')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-black rounded-lg transition-all duration-150 active:scale-95 ${
                      activeMandateTab === 'values'
                        ? 'bg-forest-900 text-white dark:bg-amber-400 dark:text-charcoal-950 shadow-md ring-2 ring-emerald-500/50'
                        : 'text-charcoal-800 dark:text-warm-200 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    6 Core Values
                  </button>
                </div>

                {/* Animated Tab Contents */}
                <AnimatePresence mode="wait">
                  {activeMandateTab === 'vision' && (
                    <motion.div
                      key="vision"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-forest-900 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-float" />
                        <span>The Vision of Mwancha Senior Community</span>
                      </div>
                      <blockquote className="text-charcoal-950 dark:text-white text-base sm:text-lg italic font-medium leading-relaxed pl-4 border-l-4 border-forest-600 dark:border-emerald-400 bg-white dark:bg-charcoal-900 p-5 rounded-r-xl border border-warm-200 dark:border-charcoal-700 shadow-sm transition-colors">
                        "{MSC_ORGANIZATION.vision}"
                      </blockquote>
                      <p className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 font-semibold">
                        Guiding every intervention toward regional and global leadership in senior citizen rights and welfare.
                      </p>
                    </motion.div>
                  )}

                  {activeMandateTab === 'mission' && (
                    <motion.div
                      key="mission"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 text-forest-900 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 animate-float" />
                        <span>Our Operational Mission</span>
                      </div>
                      <blockquote className="text-charcoal-950 dark:text-white text-base sm:text-lg italic font-medium leading-relaxed pl-4 border-l-4 border-emerald-600 dark:border-emerald-400 bg-white dark:bg-charcoal-900 p-5 rounded-r-xl border border-warm-200 dark:border-charcoal-700 shadow-sm transition-colors">
                        "{MSC_ORGANIZATION.mission}"
                      </blockquote>
                      <p className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 font-semibold">
                        Fostering health, economic empowerment, and psychosocial support to preserve dignity in later life.
                      </p>
                    </motion.div>
                  )}

                  {activeMandateTab === 'values' && (
                    <motion.div
                      key="values"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      <p className="text-xs font-black text-forest-900 dark:text-emerald-400 uppercase tracking-wider">
                        Official Ethical Core Values:
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {MSC_ORGANIZATION.coreValues.map((val) => (
                          <div
                            key={val.title}
                            className="p-3.5 bg-white dark:bg-charcoal-900 rounded-xl border border-warm-200 dark:border-charcoal-700 text-left shadow-xs hover:-translate-y-0.5 transition-transform duration-150"
                          >
                            <p className="font-black text-sm text-forest-950 dark:text-emerald-400">{val.title}</p>
                            <p className="text-xs text-charcoal-700 dark:text-warm-200 font-medium line-clamp-2 mt-1">{val.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          AUTHENTIC HEADQUARTERS & FACILITY SHOWCASE
          ========================================================================= */}
      <section className="py-12 bg-white dark:bg-charcoal-950 border-y-2 border-warm-200 dark:border-charcoal-800 transition-colors">
        <Container>
          <SectionHeading
            centered
            badge="Verified Field Operations"
            title="Our Community Headquarters & Grounds"
            subtitle="Authentic photographs of Mwancha Senior Community in Ekerenyo, Nyamira County, Kenya. Here, vulnerable elders find safe shelter, communal warmth, and therapeutic green spaces."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {MSC_FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="group rounded-3xl overflow-hidden bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-warm-200 dark:bg-charcoal-800 relative">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-110 saturate-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-forest-950/90 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
                    {facility.category}
                  </div>
                </div>
                <div className="p-6 text-left">
                  <h3 className="font-black text-charcoal-950 dark:text-white text-lg sm:text-xl font-display mb-2 group-hover:text-forest-800 dark:group-hover:text-emerald-400 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium transition-colors">
                    {facility.description}
                  </p>
                  <p className="text-xs sm:text-sm text-earth-800 dark:text-amber-400 font-bold mt-3 flex items-center gap-1.5 transition-colors">
                    <MapPin className="w-4 h-4 text-earth-700 dark:text-amber-400" />
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
      <section className="bg-warm-100/70 dark:bg-charcoal-900/60 py-16 sm:py-20 border-b-2 border-warm-200 dark:border-charcoal-800 transition-colors">
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
                className="bg-white dark:bg-charcoal-950 rounded-2xl p-6 sm:p-7 border-2 border-warm-200 dark:border-charcoal-700 text-left shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center text-amber-950 dark:text-amber-300 font-black text-sm mb-4">
                  0{idx + 1}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-charcoal-950 dark:text-white font-display mb-2.5 transition-colors">
                  {challenge.title}
                </h3>
                <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium transition-colors">
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
      <section className="py-12 transition-colors">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 text-left">
            <div>
              <span className="text-xs font-black text-forest-900 dark:text-emerald-300 uppercase tracking-wider bg-forest-100 dark:bg-forest-900/80 px-3.5 py-1.5 rounded-full border border-forest-300 dark:border-forest-700/80 inline-block mb-3">
                Core Interventions & Services
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-charcoal-950 dark:text-white font-display transition-colors">
                Responsive Elder Programs & Free Medical Services
              </h2>
              <p className="mt-2 text-base sm:text-lg text-charcoal-800 dark:text-warm-200 max-w-2xl font-medium transition-colors">
                Structured to address immediate vulnerability, geriatric healthcare needs, and long-term systemic protection for older citizens across Kenya.
              </p>
            </div>
            <Button to="/programs" variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View All Programs
            </Button>
          </div>

          {/* Free Medical Outreach Camps & Health Training Spotlight */}
          <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-forest-900 to-forest-950 text-white border-2 border-emerald-800/60 shadow-lg text-left flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Stethoscope className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Flagship Community Health Service
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                Free Medical Camps & Caregiver Health Forums
              </h3>
              <p className="text-sm sm:text-base text-forest-100 leading-relaxed font-medium">
                We organize decentralized Free Medical Outreach Camps bringing licensed clinicians directly to rural elders. Services include 100% free geriatric checkups, hypertension and diabetes screening, free prescription medications, eye tests with reading glasses, and health training forums for family caregivers and Community Health Promoters (CHPs).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
              <Button
                to="/programs/health-training-medical-camps"
                variant="secondary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                className="font-bold shadow"
              >
                Explore Medical Camps
              </Button>
              <Button
                to="/partner"
                variant="outline"
                size="md"
                className="border-emerald-400 text-white hover:bg-forest-850"
              >
                Partner on Medical Camps
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          MEASURABLE VERIFIED IMPACT (Interactive Dashboard Section)
          ========================================================================= */}
      <ImpactDashboardSection />

      {/* =========================================================================
          OUR METHODOLOGY & COMMITMENTS
          ========================================================================= */}
      <section className="py-12 transition-colors">
        <Container>
          <SectionHeading
            centered
            badge="Methodology"
            title="Our Community-Centered Approach"
            subtitle="We believe older citizens should not be passive recipients of pity, but empowered rights-holders who live with respect and autonomy."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left mt-10">
            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center mb-4 border border-forest-200 dark:border-forest-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-charcoal-950 dark:text-white mb-2 font-display">Dignity & Safety</h3>
              <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                Prioritizing personal physical safety, shelter weatherization, and defense against domestic exploitation and accusations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center mb-4 border border-forest-200 dark:border-forest-700">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-charcoal-950 dark:text-white mb-2 font-display">Psychosocial Wellbeing</h3>
              <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                Combating loneliness through peer support circles, storytelling barazas, and trauma counseling for elder-headed households.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center mb-4 border border-forest-200 dark:border-forest-700">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-charcoal-950 dark:text-white mb-2 font-display">Health & Nutrition</h3>
              <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                Facilitating healthcare facility referrals, medical triage, and distributing emergency food baskets for destitute elders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center mb-4 border border-forest-200 dark:border-forest-700">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-charcoal-950 dark:text-white mb-2 font-display">Partnership Networks</h3>
              <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                Mobilizing county administration, faith leaders, health centers, and development partners for durable public safety nets.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          PARTNERSHIPS SECTION (For Anyone Ready to Partner with MSC)
          ========================================================================= */}
      <section id="partnerships" className="py-16 sm:py-20 bg-gradient-to-b from-white via-warm-50 to-warm-100/60 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950 border-t-2 border-warm-200 dark:border-charcoal-800 transition-colors">
        <Container>
          <div className="max-w-4xl mx-auto text-left mb-12">
            <span className="text-xs font-black text-forest-900 dark:text-emerald-300 uppercase tracking-widest bg-forest-100 dark:bg-forest-900/80 px-3.5 py-1.5 rounded-full border border-forest-300 dark:border-forest-700/80 inline-block mb-3">
              Strategic Alliances & Coalitions
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-950 dark:text-white font-display">
              Partner With Mwancha Senior Community
            </h2>
            <p className="mt-4 text-base sm:text-lg text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
              Transforming the landscape of rural aging requires multi-sectoral synergy. We warmly invite healthcare providers, corporate CSR foundations, government agencies, universities, and civil society organizations ready to co-create lasting impact and restore dignity to older persons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
            {/* Pillar 1: Healthcare & Medical Outreach */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-700">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-charcoal-950 dark:text-white font-display mb-2">
                  Free Medical Camps & Clinical Outreach
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                  Partner with our medical team to co-host rural Free Medical Outreach Camps, provide diagnostic equipment, supply prescription medicines, or conduct eye screening and cataract surgeries for vulnerable seniors.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-warm-200 dark:border-charcoal-700">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  Healthcare Providers & Labs
                </span>
              </div>
            </div>

            {/* Pillar 2: Corporate CSR & Supply Chains */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-700">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-charcoal-950 dark:text-white font-display mb-2">
                  Corporate CSR & Food Relief
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                  Channel corporate philanthropy toward our verified emergency food supply chains (maize flour, beans, rice), warm fleece bedding, or iron sheet weatherization materials for dilapidated elder homes.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-warm-200 dark:border-charcoal-700">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  CSR & Business Foundations
                </span>
              </div>
            </div>

            {/* Pillar 3: Government & Social Protection */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center mb-4 border border-forest-200 dark:border-forest-700">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-charcoal-950 dark:text-white font-display mb-2">
                  Government & Social Protection
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                  Collaborating with National and County Departments of Health, the Social Health Authority (SHA), and grassroots administration to enroll elders in welfare cash transfers and enforce protections against abuse.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-warm-200 dark:border-charcoal-700">
                <span className="text-[11px] font-bold text-forest-800 dark:text-emerald-400 uppercase tracking-wider">
                  Public Ministries & Agencies
                </span>
              </div>
            </div>

            {/* Pillar 4: Academic Research & Civil Society */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-700">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-charcoal-950 dark:text-white font-display mb-2">
                  Academic Research & Legal Aid
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                  Co-developing evidence-based geriatric research, conducting policy advocacy, and providing pro-bono legal defense for senior citizens facing land dispossession or false cultural allegations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-warm-200 dark:border-charcoal-700">
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                  Universities & Legal Societies
                </span>
              </div>
            </div>
          </div>

          {/* Action Callout Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-forest-950 text-white text-left shadow-xl border border-forest-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                Ready to Join Forces?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
                Let's Build Sustainable Solutions Together
              </h3>
              <p className="text-sm sm:text-base text-forest-100 leading-relaxed font-medium">
                Whether you want to sponsor a Free Medical Camp, supply bulk food staples, or initiate institutional joint programming, our Systems Strengthening & Partnerships office is ready to engage.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto flex-shrink-0">
              <Button
                to="/partner"
                variant="secondary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                className="font-black shadow-lg"
              >
                Submit Partnership Proposal
              </Button>
              <Button
                to="/donate"
                variant="outline"
                size="lg"
                icon={<Wheat className="w-4 h-4 text-amber-400" />}
                className="border-forest-600 text-white hover:bg-forest-900"
              >
                Pledge Food & In-Kind Supplies
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          LATEST NEWS & STORIES
          ========================================================================= */}
      <section className="bg-warm-100/50 dark:bg-charcoal-900/50 py-16 border-t-2 border-warm-200 dark:border-charcoal-800 transition-colors">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
            <div>
              <span className="text-xs font-black text-earth-900 dark:text-amber-300 uppercase tracking-wider bg-earth-100 dark:bg-amber-400/20 px-3.5 py-1.5 rounded-full border border-earth-400 dark:border-amber-400/50 inline-block mb-3">
                News & Field Updates
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-charcoal-950 dark:text-white font-display transition-colors">
                Stories from the Community
              </h2>
              <p className="mt-2 text-base sm:text-lg text-charcoal-800 dark:text-warm-200 max-w-2xl font-medium transition-colors">
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
