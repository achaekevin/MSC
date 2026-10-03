import { EventItem } from '../types';

export const EVENTS_DATA: EventItem[] = [
  {
    id: 'event-1',
    slug: 'community-elder-rights-sensitization-forum',
    title: 'Ward-Level Elder Rights & Safeguarding Sensitization Forum',
    description: 'A community consultative assembly convening local administration, community elders, family caregivers, and youth to address elder neglect, property rights, and eradication of ageist stereotypes.',
    date: '2025-04-18',
    time: '09:30 AM - 01:30 PM EAT',
    location: 'Kebirigo Community Hall, Nyamira County',
    county: 'Nyamira County',
    category: 'Community Sensitization',
    status: 'upcoming',
    image: '/images/mwancha-pavilion-gathering.jpg',
    registrationOpen: true
  },
  {
    id: 'event-2',
    slug: 'geriatric-health-outreach-and-screening',
    title: 'Multi-Stakeholder Geriatric Health Outreach & Case Referral Camp',
    description: 'In partnership with local health practitioners, this outreach offers preliminary health screening, hypertension checks, mobility aid reviews, and clinical referrals for registered senior community members.',
    date: '2025-05-22',
    time: '08:30 AM - 04:00 PM EAT',
    location: 'Nyamira Sub-County Health Center Grounds',
    county: 'Nyamira County',
    category: 'Health Outreach',
    status: 'upcoming',
    image: '/images/mwancha-garden-pathway.jpg',
    registrationOpen: true
  },
  {
    id: 'event-3',
    slug: 'annual-stakeholder-accountability-assembly-2024',
    title: 'Annual Stakeholder & Volunteer Accountability Assembly (2024)',
    description: 'Review of the 2024 organizational transition to Mwancha Senior Community, presentation of field MEAL findings across 1,203+ households, and recognition of the 40 ward volunteers.',
    date: '2024-11-28',
    time: '10:00 AM - 03:00 PM EAT',
    location: 'Kebirigo Training Center, Nyamira',
    county: 'Nyamira County',
    category: 'Stakeholder Meeting',
    status: 'completed',
    image: '/images/mwancha-community-grounds.jpg',
    registrationOpen: false
  }
];
