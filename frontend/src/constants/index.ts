// Mwancha Senior Community (MSC) - Official Constants & Source of Truth

export const MSC_ORGANIZATION = {
  name: "Mwancha Senior Community",
  shortName: "MSC",
  formerName: "Mwancha Home for the Elderly",
  nameChangeYear: 2024,
  foundedYear: 2016,
  
  // Official Physical & Postal Address
  physicalFacility: "Mwancha House - Ekerenyo",
  subCounty: "Nyamira North",
  county: "Nyamira County",
  country: "Kenya",
  road: "Ekerenyo-Obwari-Magwagwa Road",
  postalAddress: "P.O. Box 162-40506 Ekerenyo-Nyamira",
  physicalAddress: "Mwancha House - Ekerenyo, Ekerenyo-Obwari-Magwagwa Road, Nyamira North, Nyamira County",
  fullLocation: "Mwancha House - Ekerenyo, Ekerenyo-Obwari-Magwagwa Road, Nyamira North, P.O. Box 162-40506 Ekerenyo-Nyamira, Kenya",
  
  // Official Contact
  email: "mwachahomeforelderly@gmail.com",
  secondaryEmail: "mwanchacommunity.seniors@gmail.com",
  secondaryEmailAddress: "mwanchacommunity.seniors.com",
  phone: "+254 790 629439",
  whatsapp: "+254 790 629439",
  whatsappDigits: "254790629439",
  
  // Official Stated Vision
  vision: "To become a leading regional and global organization in spearheading the rights, welfare and wellbeing of the elderly in society.",
  
  // Official Stated Mission
  mission: "To empower senior citizens through health, economic, social, and psychosocial development initiatives that enhance their dignity and quality of life.",
  
  // Official Core Values
  coreValues: [
    {
      title: "Respect",
      description: "Upholding the inherent dignity, wisdom, and life experiences of every older person in our society."
    },
    {
      title: "Fairness",
      description: "Ensuring equitable access to resources, opportunities, advocacy, and social protection services."
    },
    {
      title: "Unity",
      description: "Fostering intergenerational cohesion, strong community solidarity, and collaborative partnerships."
    },
    {
      title: "Integrity",
      description: "Operating with unyielding honesty, ethical stewardship, and transparency in all programs."
    },
    {
      title: "Compassion",
      description: "Responding with deep empathy, active listening, and heartfelt care to the needs of older citizens."
    },
    {
      title: "Accountability",
      description: "Taking full responsibility to our beneficiaries, communities, partners, and stakeholders."
    }
  ],
  
  // Official Documented Impact (Primary Source of Truth)
  impactHighlights: {
    beneficiaryHouseholds: "1,203+",
    beneficiaryLabel: "Elderly & OVC Households Supported",
    volunteersCount: "40",
    volunteersLabel: "Ward-Based Volunteers Mobilized",
    geographicScope: "National Scope",
    geographicScopeNote: "Mandate extends across Kenya, rooted in grassroots community mobilization.",
    establishedYear: "2016",
    establishedLabel: "Founded & Community-Rooted"
  },

  // Documented Challenges Faced by Older Persons (Sourced directly from organizational profile)
  documentedChallenges: [
    {
      title: "Food Insecurity & Malnutrition",
      description: "Inability to farm or earn income leading to chronic hunger and lack of essential nutritional support."
    },
    {
      title: "Limited Physical Mobility",
      description: "Age-related physical constraints and lack of assistive devices restricting access to essential community services."
    },
    {
      title: "Abuse & Disregard",
      description: "Physical, psychological, and financial exploitation or dispossession of property from vulnerable elders."
    },
    {
      title: "Severe Neglect & Isolation",
      description: "Erosion of traditional safety nets, leaving frail older persons living alone without caregivers."
    },
    {
      title: "False Accusations of Witchcraft",
      description: "Stigmatization, social ostracization, and perilous violence targeting vulnerable elderly persons."
    },
    {
      title: "Exclusion from Relief Services",
      description: "Emergency, humanitarian, and public welfare programs that unintentionally bypass the unique needs of older citizens."
    }
  ],

  // Social links configuration - Only URLs that exist are rendered (Do not invent URLs)
  socialLinks: {
    facebook: "",
    instagram: "",
    linkedin: "",
    x: "",
    youtube: ""
  }
};

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  {
    name: "About",
    href: "/about",
    dropdown: [
      { name: "About MSC", href: "/about" },
      { name: "Our Story", href: "/about/story" },
      { name: "Mission & Vision", href: "/about/mission" },
      { name: "Core Values", href: "/about/mission#values" },
      { name: "Organizational Structure", href: "/about/structure" },
      { name: "Our Team", href: "/team" },
    ]
  },
  {
    name: "Programs",
    href: "/programs",
    dropdown: [
      { name: "All Programs", href: "/programs" },
      { name: "Health Training & Free Medical Camps", href: "/programs/health-training-medical-camps" },
      { name: "Case Management", href: "/programs/case-management" },
      { name: "Psychosocial Support", href: "/programs/psychosocial-support" },
      { name: "Advocacy & Sensitization", href: "/programs/advocacy-sensitization" },
      { name: "Systems Strengthening & Partnerships", href: "/programs/systems-strengthening" },
      { name: "MEAL", href: "/programs/meal" },
    ]
  },
  {
    name: "Impact",
    href: "/impact",
    dropdown: [
      { name: "Impact Overview", href: "/impact" },
      { name: "Stories of Impact", href: "/stories" },
    ]
  },
  { name: "Stories of Impact", href: "/stories" },
  { name: "Publications", href: "/publications" },
  { name: "News", href: "/news" },
  { name: "Events", href: "/events" },
  { name: "Gallery", href: "/gallery" },
  {
    name: "Get Involved",
    href: "/get-involved",
    dropdown: [
      { name: "Ways to Support", href: "/get-involved" },
      { name: "Volunteer With Us", href: "/volunteer" },
      { name: "Partner With Us", href: "/partner" },
    ]
  },
  { name: "Contact", href: "/contact" }
];
