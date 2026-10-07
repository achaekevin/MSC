import { NewsArticle } from '../types';

export const NEWS_ARTICLES_DATA: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'msc-name-transition-expanded-mandate',
    title: 'Mwancha Senior Community Expands Strategic Mandate to Advance Senior Rights Nationwide',
    summary: 'Following its 2024 institutional transition from Mwancha Home for the Elderly, MSC is positioning its grassroots community-driven model to champion elderly welfare across Kenya.',
    content: [
      'Founded in 2016 in Nyamira County as Mwancha Home for the Elderly, our organization began as a localized community response to the silent suffering, neglect, and isolation experienced by older persons.',
      'In 2024, the organization officially adopted the name Mwancha Senior Community (MSC). This change reflects a decisive evolution from a localized welfare model toward a comprehensive, community-driven, and rights-focused institution with a national and global outlook.',
      'Under its expanded mandate, MSC continues to prioritize direct case management, while escalating advocacy against elder abuse, fostering institutional systems strengthening, and promoting intergenerational support mechanisms.',
      'Our commitment remains firmly anchored in the dignity, wellbeing, and constitutional rights of senior citizens.'
    ],
    category: 'Organizational News',
    featuredImage: '/images/mwancha-facility-main.jpg',
    imageAlt: 'Mwancha Senior Community headquarters and residential facility in Ekerenyo, Nyamira',
    publishedAt: '2024-03-15',
    author: {
      name: 'MSC Communications Desk',
      role: 'Organizational Secretariat'
    },
    tags: ['Institutional Milestone', 'Elder Rights', 'National Mandate'],
    isFeatured: true
  },
  {
    id: 'news-2',
    slug: 'ward-volunteers-strengthen-grassroots-support',
    title: 'How 40 Ward-Based Volunteers Form the Backbone of MSC Case Management',
    summary: 'A look into how trained community volunteers conduct household mapping, nutrition assessments, and healthcare referrals across 1,203+ elder-headed and OVC homes.',
    content: [
      'Effective elder care cannot be delivered from behind a remote desk. At Mwancha Senior Community, real impact is forged along footpaths, compound verandas, and community centers through our dedicated cadre of 40 ward-based volunteers.',
      'These volunteers are selected from within their local wards, ensuring cultural familiarity, trust, and rapid response capabilities.',
      'Volunteers conduct regular check-ins to monitor food security, assess physical mobility, check shelter safety, and identify signs of emotional or financial elder abuse.',
      'Through this community-led vigilance, over 1,203 elderly and Orphaned & Vulnerable Children (OVC) households have received structured intervention, medical triage, and psychosocial companionship.'
    ],
    category: 'Community Story',
    featuredImage: '/images/mwancha-community-grounds.jpg',
    imageAlt: 'Field operations and community outreach grounds at Mwancha Senior Community',
    publishedAt: '2024-05-20',
    author: {
      name: 'Field Operations Team',
      role: 'Program Implementation'
    },
    tags: ['Grassroots Volunteers', 'Case Management', 'Community Impact'],
    isFeatured: false
  },
  {
    id: 'news-3',
    slug: 'eradicating-witchcraft-stigmatization',
    title: 'Ending the Scourge of Witchcraft Accusations Targeting Elderly Persons',
    summary: 'MSC leads community barazas and multi-agency dialogues to dismantle dangerous superstitions and protect vulnerable older persons from physical and emotional violence.',
    content: [
      'Among the most urgent human rights challenges faced by older persons in rural Kenya is the weaponization of witchcraft allegations. Often rooted in property disputes, domestic conflict, or misunderstandings surrounding age-related dementia, these baseless claims put fragile lives in grave danger.',
      'MSC organizes targeted community sensitization forums (barazas) involving local administration, chiefs, faith leaders, youth groups, and judicial actors.',
      'By replacing superstition with medical education about dementia, chronic illness, and cognitive decline, MSC de-escalates neighborhood hostility and secures emergency protection for targeted elders.',
      'Every human being has the constitutional right to age in safety, peace, and mutual respect.'
    ],
    category: 'Advocacy',
    featuredImage: '/images/mwancha-pavilion-gathering.jpg',
    imageAlt: 'Community dialogue and elder gathering pavilion at Mwancha Senior Community',
    publishedAt: '2024-07-10',
    author: {
      name: 'Advocacy & Sensitization Unit',
      role: 'Policy & Human Rights'
    },
    tags: ['Human Rights', 'Advocacy', 'Elder Protection'],
    isFeatured: false
  },
  {
    id: 'news-4',
    slug: 'intergenerational-psychosocial-dialogues',
    title: 'Strengthening Emotional Wellbeing and Intergenerational Bonds in Senior Households',
    summary: 'Why psychosocial support circles and positive parenting mentorship are vital for grandmothers and grandfathers raising the next generation.',
    content: [
      'In many rural households, older persons carry the dual responsibility of managing their own aging frailties while raising grandchildren left vulnerable by the loss or economic migration of parents.',
      'MSC provides dedicated psychosocial support circles where senior citizens share experiences, receive grief and trauma counseling, and learn positive parenting techniques tailored for their households.',
      'These sessions alleviate acute loneliness, restore self-esteem, and nurture respectful bonds between grandparents and growing youth.',
      'When an elder is emotionally supported, the entire household stabilizes.'
    ],
    category: 'Community Story',
    featuredImage: '/images/mwancha-garden-pathway.jpg',
    imageAlt: 'Botanical garden reflection pathway at Mwancha community grounds',
    publishedAt: '2024-09-02',
    author: {
      name: 'Psychosocial Support Desk',
      role: 'Care & Mental Health'
    },
    tags: ['Psychosocial Support', 'Family Wellness', 'Mental Health'],
    isFeatured: false
  }
];
