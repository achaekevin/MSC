import { ImpactMetric } from '../types';

export const VERIFIED_IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'metric-beneficiaries',
    label: 'Beneficiary Households',
    value: '1,203+',
    description: 'Elderly individuals and Orphaned & Vulnerable Children (OVC) households directly documented and supported through case management.',
    icon: 'Users',
    category: 'beneficiaries',
    metadata: {
      status: 'in_review',
      source: 'official_profile',
      notes: 'Documented in MSC profile. Client requested verification for latest 2026 Q3 figures.'
    }
  },
  {
    id: 'metric-volunteers',
    label: 'Ward-Based Volunteers',
    value: '40',
    description: 'Trained grassroots volunteers actively conducting home visits, needs mapping, and community monitoring.',
    icon: 'HeartHandshake',
    category: 'volunteers',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-20',
      approvedBy: 'MSC Volunteer Coordinator'
    }
  },
  {
    id: 'metric-mandate',
    label: 'National Scope',
    value: 'Mandate Extends Across Kenya',
    description: 'Officially mandated to advocate for senior citizen welfare nationwide, expanding from its grassroots foundation in Nyamira County.',
    icon: 'Globe',
    category: 'coverage',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-15',
      approvedBy: 'MSC Board of Management'
    }
  },
  {
    id: 'metric-founded',
    label: 'Community Service',
    value: 'Since 2016',
    description: 'Established in 2016 as Mwancha Home for the Elderly, progressing to Mwancha Senior Community in 2024 to advance systemic impact.',
    icon: 'Calendar',
    category: 'operations',
    metadata: {
      status: 'approved',
      source: 'official_profile',
      approvedAt: '2026-09-15',
      approvedBy: 'MSC Board of Management'
    }
  }
];

export const IMPACT_PILLARS = [
  {
    title: 'Dignity & Basic Needs',
    description: 'Ensuring that vulnerable elders have reliable food baskets, weatherized shelter, and essential clothing so they can live with pride and comfort.'
  },
  {
    title: 'Healthcare & Referral Systems',
    description: 'Connecting older persons to medical facilities, advocating for geriatric responsiveness, and assisting with treatment adherence.'
  },
  {
    title: 'Rights & Elder Protection',
    description: 'Defending seniors against physical and financial abuse, social isolation, and dangerous accusations of witchcraft.'
  },
  {
    title: 'Intergenerational Solidarity',
    description: 'Bridging the generational gap between youth and senior citizens to restore community respect, mutual care, and cultural wisdom.'
  }
];
