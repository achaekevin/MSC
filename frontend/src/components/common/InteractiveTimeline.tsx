import React, { useState } from 'react';
import { Calendar, CheckCircle2, ChevronRight, MapPin, Sparkles, Building, ArrowRight, ShieldCheck } from 'lucide-react';

export interface TimelineMilestone {
  year: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  achievements: string[];
  location: string;
  image?: string;
  highlightStat?: string;
}

const APPROVED_MILESTONES: TimelineMilestone[] = [
  {
    year: '2016',
    badge: 'Foundation',
    title: 'Founded as Mwancha Home for the Elderly',
    subtitle: 'Grassroots Community Mobilization in Kebirigo',
    description: 'In response to acute elder neglect, food insecurity, and the erosion of rural family safety nets, community leaders in Kebirigo, Nyamira County established Mwancha Home for the Elderly as a compassionate grassroots sanctuary.',
    achievements: [
      'Established original care center and headquarters in Kebirigo',
      'Launched emergency nutrition and warm blanket distributions',
      'Initiated home visits for bedridden and abandoned older persons'
    ],
    location: 'Kebirigo, Nyamira County',
    image: '/images/mwancha-facility-main.jpg',
    highlightStat: '1st Grassroots Elder Sanctuary in Kebirigo'
  },
  {
    year: '2018',
    badge: 'Field Network',
    title: 'Decentralized Community Outreach',
    subtitle: 'Mobile Health Escorts & Basic Care Kits',
    description: 'Recognizing that frail elders in remote villages could not travel to central facilities, MSC initiated decentralized mobile outreach camps, providing home-delivered medicines, mobility aids, and nutritional porridge.',
    achievements: [
      'Expanded outreach across initial 10 administrative wards',
      'Partnered with local dispensaries for medication management',
      'Trained initial cohort of 15 village elder companions'
    ],
    location: 'Nyamira & Surrounding Sub-Counties',
    image: '/images/mwancha-pavilion-gathering.jpg',
    highlightStat: '400+ Vulnerable Elders Reached'
  },
  {
    year: '2020',
    badge: 'Standardization',
    title: 'Case Management & Safeguarding SOPs',
    subtitle: 'Institutionalizing Grassroots Protection Protocols',
    description: 'Formalized structured case management standard operating procedures to document elder abuse, land dispossessions, and wrongful witchcraft allegations, ensuring dignified referral pathways.',
    achievements: [
      'Published MSC Grassroots Case Management Standard Operating Procedures',
      'Mobilized ward-based alert networks for elder emergency response',
      'Established legal mediation desks with local barazas and chiefs'
    ],
    location: 'Western Kenya Regional Coordination',
    image: '/images/mwancha-fellowship-gathering.jpg',
    highlightStat: '100% Documented Case Tracking'
  },
  {
    year: '2022',
    badge: 'Community Cohesion',
    title: 'Intergenerational & Psychosocial Expansion',
    subtitle: 'Youth-Elder Fellowships & Mental Wellness Circles',
    description: 'Addressed severe social isolation through structured intergenerational mentorship barazas, connecting orphaned children and youth with elder wisdom-keepers to rebuild mutual community solidarity.',
    achievements: [
      'Weekly storytelling and psychosocial peer counseling circles',
      'Kitchen garden nutrition projects for elderly-headed households',
      'Scale-up to 40 verified ward-based community volunteers'
    ],
    location: 'Community Outposts across Nyamira',
    image: '/images/mwancha-community-grounds.jpg',
    highlightStat: '40 Ward Volunteers Mobilized'
  },
  {
    year: '2024',
    badge: 'Milestone Evolution',
    title: 'Renamed Mwancha Senior Community (MSC)',
    subtitle: 'Expanded National Mandate & Regional Scope',
    description: 'To reflect our transition from a single residential home into a comprehensive community-based social protection and advocacy organization, our official name was updated to Mwancha Senior Community, with an expanded national scope across Kenya.',
    achievements: [
      'Official institutional transition to Mwancha Senior Community (MSC)',
      '1,203+ elder and OVC households supported to date',
      'Policy advocacy aligned with Article 57 of the Constitution of Kenya',
      'Launch of research publications and civic rights handbooks'
    ],
    location: 'National Scope & Kenya-wide Mandate',
    image: '/images/mwancha-facility-main.jpg',
    highlightStat: '1,203+ Households Supported'
  }
];

export const InteractiveTimeline: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number>(APPROVED_MILESTONES.length - 1); // default to 2024
  const activeMilestone = APPROVED_MILESTONES[selectedIdx];

  return (
    <section className="py-12 bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 p-6 sm:p-10 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 dark:bg-forest-950/80 text-forest-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-forest-200 dark:border-forest-800">
          <Sparkles className="w-3.5 h-3.5 text-earth-600 dark:text-emerald-400" />
          <span>Interactive Journey &bull; 2016 to 2024</span>
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display mt-3">
          Our Evolutionary Milestone Timeline
        </h3>
        <p className="text-sm sm:text-base text-charcoal-600 dark:text-warm-200 max-w-2xl mx-auto mt-2 leading-relaxed">
          Explore the key milestones in our approved history, starting from our founding as Mwancha Home for the Elderly in 2016 to our expanded mandate as Mwancha Senior Community in 2024.
        </p>
      </div>

      {/* Horizontal Interactive Rail */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="relative px-4 sm:px-8">
          {/* Connecting track line */}
          <div className="absolute top-1/2 left-6 right-6 sm:left-12 sm:right-12 h-1 bg-warm-200 dark:bg-charcoal-700 -translate-y-1/2 rounded-full pointer-events-none" />

          {/* Active Progress fill */}
          <div
            className="absolute top-1/2 left-6 sm:left-12 h-1 bg-forest-700 dark:bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500 pointer-events-none"
            style={{
              width: `${(selectedIdx / (APPROVED_MILESTONES.length - 1)) * 88}%`
            }}
          />

          {/* Milestones Nodes */}
          <div className="relative flex items-center justify-between z-10">
            {APPROVED_MILESTONES.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              const isPassed = selectedIdx >= idx;

              return (
                <button
                  key={item.year}
                  onClick={() => setSelectedIdx(idx)}
                  className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 rounded-xl p-1.5 transition-all"
                  aria-label={`Milestone year ${item.year}: ${item.title}`}
                  aria-pressed={isSelected}
                >
                  {/* Node Circle */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 shadow-sm ${
                      isSelected
                        ? 'bg-forest-900 dark:bg-emerald-600 text-white ring-4 ring-forest-200 dark:ring-emerald-950 scale-110 shadow-md'
                        : isPassed
                        ? 'bg-forest-700 dark:bg-emerald-700 text-white hover:scale-105'
                        : 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300 hover:bg-warm-200 border-2 border-warm-300 dark:border-charcoal-700'
                    }`}
                  >
                    {item.year.slice(-2)}
                  </div>

                  {/* Year Label */}
                  <span
                    className={`mt-2 text-xs sm:text-sm font-extrabold transition-colors ${
                      isSelected
                        ? 'text-forest-900 dark:text-emerald-400 font-black'
                        : 'text-charcoal-600 dark:text-warm-300 group-hover:text-charcoal-900'
                    }`}
                  >
                    {item.year}
                  </span>

                  {/* Short badge */}
                  <span className="hidden sm:block text-[11px] text-charcoal-600 dark:text-warm-300 mt-0.5 opacity-90 max-w-[80px] text-center truncate">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Milestone Detail Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-warm-50 dark:bg-charcoal-800/80 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-700 shadow-sm transition-all animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Context & Achievements */}
            <div className="lg:col-span-7 text-left space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900 text-forest-900 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-forest-200 dark:border-forest-700">
                  {activeMilestone.year} Milestone &bull; {activeMilestone.badge}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-charcoal-600 dark:text-warm-300 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                  <span>{activeMilestone.location}</span>
                </span>
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-warm-50 font-display leading-tight">
                  {activeMilestone.title}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-forest-800 dark:text-emerald-400 mt-1 italic">
                  {activeMilestone.subtitle}
                </p>
              </div>

              <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed">
                {activeMilestone.description}
              </p>

              {/* Key Achievements */}
              <div className="pt-2">
                <h5 className="text-xs font-black text-charcoal-900 dark:text-warm-100 uppercase tracking-wider mb-2.5">
                  Approved Institutional Outcomes:
                </h5>
                <ul className="space-y-2">
                  {activeMilestone.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-charcoal-700 dark:text-warm-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {activeMilestone.highlightStat && (
                <div className="pt-3 border-t border-warm-200 dark:border-charcoal-700">
                  <span className="text-xs font-bold text-charcoal-500 dark:text-warm-400 uppercase tracking-wider block">
                    Verified Benchmark
                  </span>
                  <span className="text-lg font-black text-forest-900 dark:text-emerald-400 font-display">
                    {activeMilestone.highlightStat}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Verified Site Image Spotlight */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-warm-200 dark:border-charcoal-700 shadow-md bg-white dark:bg-charcoal-900">
                <div className="aspect-[4/3] overflow-hidden bg-warm-200 dark:bg-charcoal-800 relative">
                  <img
                    src={activeMilestone.image || '/images/mwancha-facility-main.jpg'}
                    alt={`Mwancha history: ${activeMilestone.title}`}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-charcoal-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-black">
                    {activeMilestone.year}
                  </div>
                </div>
                <div className="p-3.5 text-left bg-white dark:bg-charcoal-900">
                  <p className="text-xs font-bold text-charcoal-900 dark:text-warm-100 truncate">
                    {activeMilestone.location}
                  </p>
                  <p className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-0.5">
                    Continuous community elder welfare & social protection
                  </p>
                </div>
              </div>

              {/* Navigation controls below card */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-2">
                <button
                  onClick={() => setSelectedIdx((prev) => Math.max(0, prev - 1))}
                  disabled={selectedIdx === 0}
                  className="px-3 py-1.5 rounded-xl border border-warm-300 dark:border-charcoal-700 text-xs font-bold text-charcoal-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  &larr; Earlier Milestone
                </button>
                <span className="text-xs font-bold text-charcoal-500 dark:text-warm-400">
                  {selectedIdx + 1} of {APPROVED_MILESTONES.length}
                </span>
                <button
                  onClick={() => setSelectedIdx((prev) => Math.min(APPROVED_MILESTONES.length - 1, prev + 1))}
                  disabled={selectedIdx === APPROVED_MILESTONES.length - 1}
                  className="px-3 py-1.5 rounded-xl border border-warm-300 dark:border-charcoal-700 text-xs font-bold text-charcoal-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next Milestone &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
