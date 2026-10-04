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
    id: 'team-meal-officer',
    name: 'MEAL Coordinator',
    role: 'Monitoring, Evaluation, Accountability & Learning',
    department: 'Professional Staff',
    bio: 'Leads beneficiary data management, longitudinal surveys, program monitoring frameworks, and organizational learning outputs.',
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
    id: 'team-community-liaison',
    name: 'Community Liaison & Logistics Officer',
    role: 'Field Coordination & Outreach Support',
    department: 'Support Staff',
    bio: 'Coordinates community barazas, distribution logistics for relief provisions, and emergency response escorts.',
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
