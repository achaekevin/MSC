import { Program } from '../types';

export const PROGRAMS_DATA: Program[] = [
  {
    id: 'prog-1',
    slug: 'case-management',
    title: 'Case Management',
    shortDescription: 'Holistic assessment, individual case profiling, and direct vital support for vulnerable older persons and OVC households.',
    fullDescription: 'Our Case Management model provides individual-level and household-level support to frail and marginalized older persons. We conduct systematic mapping and needs assessments, linking elders with emergency nutritional support, clothing, shelter assistance, and life-saving medical referrals.',
    objectives: [
      'Conduct rigorous mapping and vulnerability profiling of elderly persons within local communities.',
      'Facilitate access to emergency food baskets, clothing, and shelter repairs for neglected elders.',
      'Establish dependable referral pathways to healthcare facilities, specialized geriatric clinics, and social safety nets.',
      'Track individual recovery and safety progress through dedicated ward-based volunteer check-ins.'
    ],
    activities: [
      'Elderly community mapping and multi-indicator vulnerability assessments',
      'Direct provision of emergency food rations and nutritional supplements',
      'Shelter rehabilitation and weatherproofing support for dilapidated dwellings',
      'Distribution of warm clothing, blankets, and essential household items',
      'Medical triage, healthcare facility escort, and specialized health referrals',
      'Continuous home-based case monitoring by trained ward volunteers'
    ],
    targetBeneficiaries: [
      'Bedridden and frail older persons living alone without family support',
      'Elderly heads of households caring for Orphans and Vulnerable Children (OVC)',
      'Older persons suffering from chronic illnesses or acute neglect',
      'Destitute elderly facing acute food insecurity'
    ],
    approach: 'Grassroots, human-rights based case support that restores immediate safety while connecting the individual to enduring community and public health mechanisms.',
    iconName: 'HeartHandshake',
    image: '/images/mwancha-facility-main.jpg',
    imageAlt: 'Mwancha Senior Community headquarters and residential facility in Kebirigo, Nyamira',
    metricsHighlight: 'Direct relief and case mapping across 1,203+ households',
    relatedProgramSlugs: ['psychosocial-support', 'systems-strengthening'],
    featured: true,
    displayOrder: 1
  },
  {
    id: 'prog-2',
    slug: 'psychosocial-support',
    title: 'Psychosocial Support & Positive Parenting',
    shortDescription: 'Promoting mental wellbeing, counseling, intergenerational cohesion, and positive parenting for elder-headed households.',
    fullDescription: 'Older persons in our communities frequently suffer severe loneliness, bereavement, depression, trauma from abuse, and the heavy emotional weight of raising grandchildren as OVC heads. This program provides professional counseling, peer support circles, and positive parenting training.',
    objectives: [
      'Alleviate chronic loneliness and psychological distress among isolated elders.',
      'Provide trauma-informed counseling for survivors of emotional, physical, and financial elder abuse.',
      'Equip elderly caregivers with positive parenting and intergenerational communication techniques.',
      'Reintegrate older persons as respected community storytellers and cultural mentors.'
    ],
    activities: [
      'Individual psychosocial counseling sessions and home grief visits',
      'Weekly or bi-weekly peer socialization circles for elderly community members',
      'Positive parenting workshops for elderly guardians caring for grandchildren',
      'Intergenerational dialogue forums connecting senior citizens with youth',
      'Recreational gatherings, storytelling circles, and mental stimulation activities',
      'Community caregiver training on mental wellness and gentle dementia care'
    ],
    targetBeneficiaries: [
      'Widowed, abandoned, or isolated senior citizens',
      'Elderly grandmothers and grandfathers heading OVC households',
      'Elders recovering from trauma, domestic hostility, or social ostracization',
      'Family caregivers seeking guidance on managing geriatric mental health'
    ],
    approach: 'Compassionate, culturally grounded, intergenerational therapy and solidarity that re-establishes dignity, self-worth, and social connection.',
    iconName: 'Users',
    image: '/images/mwancha-pavilion-gathering.jpg',
    imageAlt: 'Mwancha traditional thatched gathering pavilion for communal socialization and elder counseling',
    metricsHighlight: 'Regular counseling circles and family mediation sessions',
    relatedProgramSlugs: ['case-management', 'advocacy-sensitization'],
    featured: true,
    displayOrder: 2
  },
  {
    id: 'prog-3',
    slug: 'advocacy-sensitization',
    title: 'Advocacy, Communication & Community Sensitization',
    shortDescription: 'Defending elderly human rights, eradicating harmful cultural accusations, and sensitizing society against elder abuse.',
    fullDescription: 'Deep-rooted misconceptions, discriminatory cultural practices, and false accusations of witchcraft disproportionately target vulnerable elderly people, especially widows. MSC spearheads grassroots and national campaigns to protect senior citizens from persecution, abuse, and systemic exclusion.',
    objectives: [
      'Eliminate harmful stereotypes and perilous witchcraft allegations against older women and men.',
      'Sensitize local leaders, law enforcement, and judicial authorities on elder rights and legal protection.',
      'Advocate for elderly inclusion in county and national disaster risk reduction and humanitarian aid.',
      'Empower older persons to understand their constitutional rights and voice community concerns.'
    ],
    activities: [
      'Grassroots barazas and community sensitization forums against elder abuse',
      'Workshops with local administration (Chiefs, Assistant County Commissioners, Police)',
      'Dissemination of accessible elder rights information in local languages',
      'Rapid community intervention to protect elders threatened by property dispossession or violence',
      'Advocacy for social protection policies that protect older persons from being left out of public relief',
      'Commemoration of World Elder Abuse Awareness Day and national elder rights forums'
    ],
    targetBeneficiaries: [
      'Older women at risk of witchcraft-related violence and land dispossession',
      'Local administrators, judicial officers, and police in rural communities',
      'Youth and intergenerational community groups',
      'Policy makers and humanitarian emergency response committees'
    ],
    approach: 'Rights-based civil engagement combined with active community diplomacy to de-escalate tension and protect vulnerable lives.',
    iconName: 'Megaphone',
    image: '/images/mwancha-community-grounds.jpg',
    imageAlt: 'Mwancha Senior Community outreach grounds and logistics base in Nyamira County',
    metricsHighlight: 'Grassroots barazas mobilizing local champions across sub-counties',
    relatedProgramSlugs: ['systems-strengthening', 'psychosocial-support'],
    featured: false,
    displayOrder: 3
  },
  {
    id: 'prog-4',
    slug: 'systems-strengthening',
    title: 'Systems Strengthening & Partnerships',
    shortDescription: 'Building institutional resilience, multi-agency collaborations, and sustainable safety nets for the aging population.',
    fullDescription: 'Sustainable support for older persons demands institutional synergy between government line ministries, healthcare facilities, faith-based institutions, civil society, and development partners. MSC fosters multi-stakeholder coalitions to build durable elder-responsive public service systems.',
    objectives: [
      'Foster strategic partnerships with national and county government social protection agencies.',
      'Strengthen healthcare system capacities to accommodate geriatric care and assistive devices.',
      'Mobilize corporate, academic, and philanthropic allies around elderly welfare priorities.',
      'Build internal governance frameworks that guarantee long-term organizational accountability.'
    ],
    activities: [
      'Strategic coordination meetings with County Departments of Health and Social Services',
      'Signing joint collaborative frameworks with healthcare centers for priority elderly triage',
      'Engaging academic institutions for research into rural geriatric challenges and interventions',
      'Capacity development and training for organizational staff and community focal persons',
      'Advocacy for continuous allocation of public funds toward senior citizens safety nets',
      'Networking with regional and global aging advocacy bodies'
    ],
    targetBeneficiaries: [
      'County and National government social protection departments',
      'Public and mission health facilities serving senior citizens',
      'Community-based organizations working on child and elderly welfare',
      'Elderly communities seeking systematic policy recognition'
    ],
    approach: 'Collaborative, multi-sectoral alliance building that leverages existing statutory mechanisms to scale impact.',
    iconName: 'Building2',
    image: '/images/mwancha-garden-pathway.jpg',
    imageAlt: 'Therapeutic botanical wellness garden pathway at Mwancha community center',
    metricsHighlight: 'Active linkage with 40 ward volunteers and local public authorities',
    relatedProgramSlugs: ['case-management', 'meal'],
    featured: false,
    displayOrder: 4
  },
  {
    id: 'prog-5',
    slug: 'meal',
    title: 'Monitoring, Evaluation, Accountability & Learning (MEAL)',
    shortDescription: 'Data-driven tracking, rigorous accountability to beneficiaries, and continuous organizational learning.',
    fullDescription: 'Our MEAL framework guarantees that every initiative delivered by MSC is transparent, evidence-based, and genuinely transformative. By tracking case progress, gathering beneficiary feedback, and learning from field realities, we ensure ethical stewardship and measurable impact.',
    objectives: [
      'Systematically capture and analyze longitudinal wellbeing data of enrolled elderly households.',
      'Maintain an accessible, safe, and confidential community feedback and complaints mechanism.',
      'Ensure absolute accountability and transparent reporting to partners, donors, and the community.',
      'Document evidence-based best practices for community-based geriatric care models in Kenya.'
    ],
    activities: [
      'Deployment of standardized digital and paper monitoring tools for ward-level volunteers',
      'Periodic household welfare re-assessments and post-distribution monitoring',
      'Beneficiary satisfaction surveys and participatory community review sessions',
      'Maintenance of a secure, confidential beneficiary registry complying with data protection principles',
      'Publication of annual accountability summaries and learning briefs',
      'Quarterly performance review meetings with program teams and volunteer supervisors'
    ],
    targetBeneficiaries: [
      'Beneficiary households participating in MSC welfare programs',
      'Institutional partners and donor organizations seeking verified impact data',
      'Community volunteer corps and field officers',
      'Researchers and social policy practitioners in aging studies'
    ],
    approach: 'Uncompromising transparency, beneficiary-centered feedback loops, and data integrity at every tier of intervention.',
    iconName: 'LineChart',
    image: '/images/mwancha-sustainable-farm.jpg',
    imageAlt: 'Community agricultural plot and sustainable crops supporting elderly nutrition at Mwancha',
    metricsHighlight: 'Longitudinal welfare tracking across 1,203+ beneficiary homes',
    relatedProgramSlugs: ['case-management', 'systems-strengthening'],
    featured: true,
    displayOrder: 5
  }
];
