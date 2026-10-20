import { TeamMember } from '../types';

export const TEAM_STRUCTURE_CATEGORIES = [
  'Board of Management',
  'Administrative Leadership',
  'Professional Staff',
  'Support Staff',
  'Community Workforce'
] as const;

export const TEAM_DATA: TeamMember[] = [
  // Board of Management
  {
    id: 'team-board-chair',
    name: 'Chairperson, Board of Management',
    role: 'Chairperson, Board of Management',
    department: 'Board of Management',
    bio: 'Responsible for strategic governance, institutional oversight, fiduciary responsibility, and high-level stakeholder accountability for Mwancha Senior Community.',
    isPlaceholder: true
  },
  {
    id: 'team-board-treasurer',
    name: 'Treasurer, Board of Management',
    role: 'Treasurer & Fiduciary Oversight',
    department: 'Board of Management',
    bio: 'Oversees financial integrity, audit procedures, resource mobilization strategies, and compliance with statutory non-profit standards.',
    isPlaceholder: true
  },
  {
    id: 'team-board-secretary',
    name: 'Secretary, Board of Management',
    role: 'Secretary to the Board',
    department: 'Board of Management',
    bio: 'Maintains organizational governance records, board deliberations, and official regulatory filings.',
    isPlaceholder: true
  },

  // Administrative Leadership
  {
    id: 'team-center-manager',
    name: 'Center Manager / Executive Director',
    role: 'Executive & Operational Leadership',
    department: 'Administrative Leadership',
    bio: 'Directs day-to-day operations, programmatic implementation, multi-agency partnerships, and strategic alignment with MSC mission.',
    isPlaceholder: true
  },
  {
    id: 'team-admin-officer',
    name: 'Finance & Administration Officer',
    role: 'Operations & Compliance Lead',
    department: 'Administrative Leadership',
    bio: 'Coordinates operational logistics, procurement, grant accountability, and internal human resource policies.',
    isPlaceholder: true
  },

  // Professional Staff
  {
    id: 'team-dietician',
    name: 'Dietician / Nutritionist',
    role: 'Geriatric Nutrition & Dietary Planning',
    department: 'Professional Staff',
    bio: 'Designs personalized nutrition interventions, manages therapeutic dietary plans for chronic conditions, and oversees balanced meal programs.',
    isPlaceholder: true
  },
  {
    id: 'team-physiotherapist',
    name: 'Physiotherapist',
    role: 'Geriatric Rehabilitation & Mobility Care',
    department: 'Professional Staff',
    bio: 'Provides physical rehabilitation, mobility therapy, fall prevention training, and pain management for elderly beneficiaries.',
    isPlaceholder: true
  },
  {
    id: 'team-counsellor',
    name: 'Counsellor',
    role: 'Psychosocial Support & Mental Wellbeing',
    department: 'Professional Staff',
    bio: 'Delivers mental wellness counselling, trauma recovery, grief support, and cognitive wellbeing interventions for senior citizens.',
    isPlaceholder: true
  },
  {
    id: 'team-centre-nurse',
    name: 'Centre Nurse',
    role: 'Primary Nursing & Clinical Care',
    department: 'Professional Staff',
    bio: 'Manages clinical assessments, vital signs monitoring, medication reconciliation, and emergency triage at the MSC wellness centre.',
    isPlaceholder: true
  },
  {
    id: 'team-clinical-team',
    name: 'Clinical Team',
    role: 'Medical Outreach & Geriatric Consultations',
    department: 'Professional Staff',
    bio: 'Conducts medical checkups, diagnostic screenings, chronic disease management, and specialized geriatric healthcare referrals.',
    isPlaceholder: true
  },
  {
    id: 'team-medicosocial-officer',
    name: 'Medico-Social Officer',
    role: 'Medical Social Work & Patient Advocacy',
    department: 'Professional Staff',
    bio: 'Bridges clinical care and social welfare systems, coordinating health insurance, specialist hospital visits, and patient advocacy.',
    isPlaceholder: true
  },
  {
    id: 'team-social-worker',
    name: 'Senior Social Worker / Case Manager',
    role: 'Case Management & Psychosocial Lead',
    department: 'Professional Staff',
    bio: 'Oversees elderly vulnerability mapping, crisis intervention, home-based assessments, and counseling sessions.',
    isPlaceholder: true
  },

  // Support Staff
  {
    id: 'team-chaplain',
    name: 'Chaplain',
    role: 'Spiritual Care & Pastoral Support',
    department: 'Support Staff',
    bio: 'Provides holistic spiritual guidance, pastoral counseling, bereavement support, and faith-based accompaniment for elderly community members.',
    isPlaceholder: true
  },
  {
    id: 'team-legal-team',
    name: 'Legal Team',
    role: 'Legal Aid & Elder Rights Defense',
    department: 'Support Staff',
    bio: 'Protects elder rights, assists with succession, estate planning, safeguarding against exploitation, and provides paralegal advice.',
    isPlaceholder: true
  },

  // Community Workforce
  {
    id: 'team-volunteers-corps',
    name: 'Ward-Based Volunteer Cadre (40 Active Champions)',
    role: 'Grassroots Community Mobilizers',
    department: 'Community Workforce',
    bio: 'Our 40 ward-based volunteers live directly within the communities they serve, conducting daily wellness visits, rapid referral reporting, and elder accompaniment.',
    isPlaceholder: false
  }
];
