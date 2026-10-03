import { ReviewableContentItem } from '../types';

export const INITIAL_REVIEW_REGISTRY: ReviewableContentItem[] = [
  // ORGANIZATION & BRAND
  {
    id: 'rev-org-name',
    title: 'Organization Identity: Mwancha Senior Community',
    contentType: 'Organization Information',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-15',
      approvedBy: 'MSC Board of Management',
      notes: 'Transitioned in 2024 from Mwancha Home for the Elderly.'
    },
    summary: 'Official registration name, former name, and national NGO mandate.',
    author: 'Official MSC Profile',
    reviewer: 'MSC Executive Director',
    path: '/about'
  },
  {
    id: 'rev-org-mission',
    title: 'Organizational Mission & Vision Statements',
    contentType: 'Organization Information',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-15',
      approvedBy: 'MSC Board of Management',
      notes: 'Aligned with constitution and national strategic framework.'
    },
    summary: 'Core mission, vision, and values supporting senior citizen dignity in Kenya.',
    author: 'Official MSC Profile',
    reviewer: 'MSC Board Chair',
    path: '/about/mission-vision'
  },
  // IMPACT STATISTICS
  {
    id: 'rev-impact-households',
    title: 'Beneficiary Count: 1,203+ Elderly & OVC Households',
    contentType: 'Impact Statistic',
    metadata: {
      status: 'in_review',
      source: 'official_profile',
      lastUpdated: '2026-10-03',
      notes: 'Directly documented in 2024 profile. Client requested verification for latest 2026 Q3 figures.'
    },
    summary: '1,203+ elderly and orphaned/vulnerable children households supported across grassroots areas.',
    author: 'MSC Programs Unit',
    reviewer: 'Client Monitoring Officer',
    path: '/impact'
  },
  {
    id: 'rev-impact-volunteers',
    title: 'Grassroots Workforce: 40 Ward-Based Volunteers',
    contentType: 'Impact Statistic',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-20',
      approvedBy: 'MSC Volunteer Coordinator',
      notes: 'Active volunteers conducting community outreach and elderly monitoring.'
    },
    summary: 'Trained local volunteer network across Nyamira County wards.',
    author: 'MSC Volunteer Office',
    reviewer: 'MSC Operations Lead',
    path: '/impact'
  },
  // PROGRAMS
  {
    id: 'rev-prog-dignity',
    title: 'Elder Care & Humanitarian Dignity Program',
    contentType: 'Program',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-22',
      approvedBy: 'Programs Director',
      notes: 'Essential nutritional baskets, emergency assistance, and dignity support.'
    },
    summary: 'Direct humanitarian relief and protective living environment for vulnerable seniors.',
    author: 'MSC Programs Department',
    reviewer: 'MSC Board Representative',
    path: '/programs/elder-care-dignity'
  },
  {
    id: 'rev-prog-advocacy',
    title: 'Elder Rights & Protection Advocacy',
    contentType: 'Program',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-22',
      approvedBy: 'Programs Director',
      notes: 'Anti-witchcraft accusation advocacy and legal protection pathways.'
    },
    summary: 'Systemic defense against elder abuse and harmful traditional accusations.',
    author: 'Legal & Advocacy Unit',
    reviewer: 'MSC Legal Counsel',
    path: '/programs/elder-rights-protection'
  },
  {
    id: 'rev-prog-health',
    title: 'Community Health & Geriatric Support',
    contentType: 'Program',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-22',
      approvedBy: 'Programs Director',
      notes: 'Health screenings, NHIF/SHA navigation, and chronic illness support.'
    },
    summary: 'Mobile community medical clinics and healthcare accompaniment.',
    author: 'Community Health Officer',
    reviewer: 'MSC Medical Partner Liaison',
    path: '/programs/health-geriatric-support'
  },
  // DONATIONS & FINANCE (HIGH RISK - SECTION 51.9)
  {
    id: 'rev-donate-mpesa',
    title: 'M-Pesa Mobile Giving Coordinates',
    contentType: 'Donation Information',
    metadata: {
      status: 'changes_requested',
      source: 'placeholder',
      lastUpdated: '2026-10-03',
      notes: 'NEVER invent payment coordinates. Awaiting client formal submission of statutory Paybill/Till number.'
    },
    summary: 'Official M-Pesa channels pending client sign-off and banking verification.',
    author: 'Technical Team (Placeholder Flag)',
    reviewer: 'MSC Treasurer',
    path: '/donate'
  },
  {
    id: 'rev-donate-bank',
    title: 'Direct Bank Wire Coordinates',
    contentType: 'Donation Information',
    metadata: {
      status: 'changes_requested',
      source: 'placeholder',
      lastUpdated: '2026-10-03',
      notes: 'Institutional bank coordinates will only be published after formal MSC board resolution.'
    },
    summary: 'Bank details placeholder flagged for client submission and review.',
    author: 'Technical Team (Placeholder Flag)',
    reviewer: 'MSC Board of Management',
    path: '/donate'
  },
  // TEAM MEMBERS
  {
    id: 'rev-team-board',
    title: 'Board of Management & Leadership Directory',
    contentType: 'Team Member',
    metadata: {
      status: 'in_review',
      source: 'client',
      lastUpdated: '2026-10-01',
      notes: 'Pending final bio updates and high-resolution official headshots from leadership.'
    },
    summary: 'Executive team and advisory board directory.',
    author: 'MSC Secretariat',
    reviewer: 'Client Executive',
    path: '/team'
  },
  // NEWS & EVENTS
  {
    id: 'rev-news-annual',
    title: 'News Article: International Day of Older Persons Outreach',
    contentType: 'News Article',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-28',
      approvedBy: 'Communications Lead',
      notes: 'Verified field report from Nyamira County community celebration.'
    },
    summary: 'Outreach recap highlighting psychosocial support and community gathering.',
    author: 'Communications Department',
    reviewer: 'MSC Communications Director',
    path: '/news/international-day-older-persons'
  },
  {
    id: 'rev-event-upcoming',
    title: 'Community Health Camp & Geriatric Screening',
    contentType: 'Event',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-29',
      approvedBy: 'Outreach Coordinator',
      notes: 'Scheduled community event in collaboration with local health partners.'
    },
    summary: 'Upcoming free medical checkup and nutrition sensitization event.',
    author: 'Field Operations Team',
    reviewer: 'Operations Lead',
    path: '/events/geriatric-health-camp'
  },
  // GALLERY
  {
    id: 'rev-gallery-consents',
    title: 'Field Photographs & Beneficiary Consent Registry',
    contentType: 'Gallery Item',
    metadata: {
      status: 'in_review',
      source: 'client',
      lastUpdated: '2026-10-02',
      notes: 'Beneficiary safeguarding consent protocols must be documented for all displayed images.'
    },
    summary: 'Community gallery images undergoing dignity and child/elder safeguarding checks.',
    author: 'Media Team',
    reviewer: 'Safeguarding Officer',
    path: '/gallery'
  },
  // CONTACT & LOCATION
  {
    id: 'rev-contact-details',
    title: 'Official Head Office Coordinates & Phone Numbers',
    contentType: 'Contact Information',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-18',
      approvedBy: 'MSC Secretariat',
      notes: 'Verified headquarters in Nyamira County with official postal and electronic contacts.'
    },
    summary: 'Physical address, support phone numbers, and official contact email.',
    author: 'MSC Secretariat',
    reviewer: 'Operations Lead',
    path: '/contact'
  }
];
