import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ContentStatus, ContentSource } from '@prisma/client';
import { generateUniqueSlug } from '../utils/slugify.js';

// Default authentic MSC publications — content based on verifiable Kenyan laws, policies, and MSC's real mission
const DEFAULT_MSC_PUBLICATIONS = [
  {
    id: 'pub-dignified-ageing-blueprint',
    slug: 'dignified-ageing-in-kenya-strategic-blueprint',
    title: 'Advancing Dignified Ageing in Kenya: A Community-Centred Framework',
    subtitle: 'Exploring Constitutional Protections, Social Protection Mechanisms, and Grassroots Intervention Models for Older Persons',
    summary: 'This policy framework examines the constitutional, legal, and social structures that govern the welfare of older persons in Kenya. Drawing on established legislation such as Article 57 of the Constitution and the National Policy on Older Persons and Ageing, it outlines a community-centred approach to elder care and proposes practical recommendations for strengthening support systems at the county and grassroots levels.',
    category: 'Book',
    type: 'Book',
    authorName: 'MSC Research & Policy Directorate',
    authorRole: 'Policy & Social Protection Unit',
    coverImage: '/images/mwancha-facility-main.jpg',
    pdfUrl: '',
    fileSize: '3.2 MB',
    pages: 42,
    readingTime: '40 min read',
    isbn: 'Doc Ref: MSC-PB-2024-01',
    tags: ['Policy Brief', 'Elder Rights', 'Social Protection', 'Kenya', 'Constitution'],
    isFeatured: true,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-06-15'),
    chapters: [
      {
        title: 'Chapter 1: The Demographic Transition and Ageing in Kenya',
        body: `Kenya, like many countries across sub-Saharan Africa, is experiencing a demographic transition characterised by gradually increasing life expectancy and a growing population of persons aged 60 years and above. The Kenya National Bureau of Statistics (KNBS) has consistently documented this shift through successive national census exercises, including the 2019 Kenya Population and Housing Census. As the proportion of older persons grows, the need for targeted social protection, healthcare, and community support systems becomes increasingly urgent.\n\nHistorically, the extended family system served as the primary safety net for older persons in Kenyan communities. Grandparents, aunts, uncles, and other relatives provided mutual care, shared resources, and ensured that no elderly family member was left without support. However, accelerating urbanisation, internal labour migration, and economic pressures have significantly weakened these traditional structures. Many older persons in rural areas, including those in Nyamira County where Mwancha Senior Community operates, now find themselves living alone or heading households that include orphaned and vulnerable children (OVC).\n\nThe challenges are compounded by the fact that most older persons in rural Kenya spent their working years in the informal economy — subsistence farming, small-scale trade, and casual labour — without access to contributory pension schemes. As a result, they enter old age without savings, pension income, or health insurance. The government's Older Persons Cash Transfer programme (OPCT, commonly known as Inua Jamii) provides a lifeline for some, but coverage remains limited and the stipend may not fully address the complex needs of the most vulnerable elderly individuals.\n\nUnderstanding this demographic and socioeconomic context is essential for designing effective interventions. Any meaningful framework for supporting older persons must reckon with the realities of poverty, geographic isolation, weakened family networks, and the limitations of existing government programmes. Community-based organisations like Mwancha Senior Community are positioned to bridge some of these gaps through direct engagement, grassroots volunteer networks, and advocacy for stronger institutional responses.`
      },
      {
        title: 'Chapter 2: Constitutional and Legal Protections for Older Persons',
        body: `The Constitution of Kenya, promulgated in 2010, provides an explicit legal foundation for the rights of older persons. Article 57 of the Constitution states that the State shall take measures to ensure the rights of older members of society, including the right to participate fully in the affairs of society, to pursue their personal development, to live in dignity and respect and be free from abuse, and to receive reasonable care and assistance from the family and the State. These provisions represent a significant legal commitment and establish the basis upon which all policy and programmatic interventions for older persons should be built.\n\nBeyond Article 57, other constitutional provisions are directly relevant. Article 27 guarantees equality and freedom from discrimination, including on the basis of age. Article 43 enshrines economic and social rights, including the right to the highest attainable standard of health, accessible and adequate housing, and social security. Article 48 guarantees access to justice for all persons, which is particularly important for older persons who may face property disputes, abuse, or neglect.\n\nAt the legislative level, several Acts of Parliament provide additional protections. The Law of Succession Act (Chapter 160, Laws of Kenya) governs inheritance and succession, offering safeguards against the fraudulent disinheritance of surviving spouses and elderly family members. The Land Registration Act (No. 3 of 2012) provides mechanisms such as caveats and cautions that can be lodged to prevent unauthorized transfers of land belonging to or occupied by older persons. The Protection Against Domestic Violence Act (PADVA, Act No. 2 of 2015) offers recourse for older persons who experience physical, emotional, or economic abuse within family settings.\n\nThe National Policy on Older Persons and Ageing, adopted through Sessional Paper No. 2 of 2018 by the Ministry of Labour and Social Protection, provides a comprehensive policy framework addressing healthcare, social protection, housing, and the social inclusion of older persons. This policy recognises the multi-dimensional nature of vulnerability in old age and calls for coordinated action across government ministries, county governments, civil society, and community organisations.\n\nDespite these strong legal foundations, enforcement and implementation remain significant challenges. Many older persons, particularly in rural areas, are unaware of their constitutional rights. Legal aid services are limited, and the capacity of local government structures to address elder abuse and neglect is often insufficient. Community-based organisations play a critical role in bridging this awareness and enforcement gap through civic education, legal referral, and direct advocacy on behalf of affected individuals.`
      },
      {
        title: 'Chapter 3: Healthcare Challenges Facing Older Persons in Rural Kenya',
        body: `Access to adequate healthcare is one of the most pressing concerns for older persons in rural Kenya. Non-communicable diseases (NCDs) — including hypertension, diabetes, cardiovascular disease, and arthritis — disproportionately affect the elderly population. Managing these chronic conditions requires consistent access to medications, regular clinical monitoring, and lifestyle support, all of which are difficult to obtain in under-resourced rural health facilities.\n\nMany Level 2 and Level 3 health facilities (dispensaries and health centres) in rural areas face persistent challenges with drug stock-outs, limited diagnostic equipment, and insufficient staffing. Older persons who require specialised geriatric care must often travel to sub-county or county referral hospitals, incurring transport costs that they cannot afford. For those with mobility impairments or who are bedridden, even reaching the nearest dispensary can be an insurmountable challenge.\n\nThe transition from the National Hospital Insurance Fund (NHIF) to the Social Health Authority (SHA) and the Social Health Insurance Fund (SHIF) introduced under the Social Health Insurance Act (No. 16 of 2023) aims to achieve universal health coverage. However, the practical implementation of these changes, particularly for older persons who may lack the documentation or digital literacy required for registration, is an ongoing challenge. Community health promoters and local organisations can play a vital role in assisting older persons with registration, explaining their entitlements, and facilitating access to health services.\n\nMwancha Senior Community's approach to healthcare access involves organising community health outreach activities, facilitating linkages between older persons and health facilities, training family caregivers in basic home-based care techniques, and advocating for improved geriatric services at the county level. This model recognises that healthcare for older persons cannot be addressed in isolation — it must be integrated with nutrition support, shelter improvement, psychosocial care, and social protection mechanisms.\n\nMental health is another critical but often overlooked dimension of elder healthcare. Depression, anxiety, grief, and cognitive decline affect many older persons, particularly those who are isolated, bereaved, or caring for orphaned grandchildren. The stigma associated with mental illness in many Kenyan communities further prevents older persons from seeking help. Community-based psychosocial support programmes, including peer support circles and counselling, are essential components of a comprehensive elder care framework.`
      },
      {
        title: 'Chapter 4: The Community-Based Elder Care Model',
        body: `Mwancha Senior Community, originally established in 2016 as Mwancha Home for the Elderly and reconstituted in 2024 as Mwancha Senior Community, operates from its base in Ekerenyo, Nyamira County. The organisation's approach to elder care is rooted in the principle that older persons should, wherever possible, be supported within their own communities and homes rather than being removed to institutional settings. This community-based model preserves the social connections, cultural identity, and sense of belonging that are vital to the wellbeing of older persons.\n\nAt the core of this model is a network of ward-based volunteers who live within the same communities as the older persons they serve. These volunteers are trained to conduct home visits, identify signs of neglect or abuse, assist with basic needs assessments, monitor medication adherence, and provide companionship. By embedding the volunteer network within the community itself, the model ensures that support is accessible, culturally appropriate, and responsive to the immediate circumstances of each individual.\n\nThe organisation's centre in Ekerenyo provides a physical space for communal gatherings, peer support circles, caregiver training workshops, and coordination of outreach activities. The centre also serves as a hub for liaising with government agencies, healthcare facilities, and other partner organisations. This dual structure — combining a central coordination point with a distributed volunteer network — allows the organisation to maintain oversight and quality while reaching older persons in dispersed rural settlements.\n\nA key principle of the model is that it works with and within existing community structures. Rather than creating parallel systems, MSC engages with local administration (Chiefs, Assistant Chiefs, and Nyumba Kumi leaders), religious institutions, and community health structures. This collaborative approach strengthens the sustainability of interventions and ensures that elder welfare is integrated into broader community development efforts.\n\nThe model also emphasises the active participation of older persons themselves. Rather than treating older persons solely as passive recipients of services, MSC recognises their roles as knowledge holders, community advisors, cultural custodians, and heads of households. Programmes are designed to restore and affirm the dignity, agency, and social value of older persons within their communities.`
      },
      {
        title: 'Chapter 5: Recommendations for Strengthening Elder Care Systems',
        body: `Based on the constitutional framework, the realities documented through community-level engagement, and the lessons of the community-based model, the following recommendations are offered for consideration by government agencies, county administrations, civil society organisations, and development partners:\n\nFirst, the coverage and adequacy of the Older Persons Cash Transfer (OPCT / Inua Jamii) programme should be progressively expanded. While the programme represents an important social protection intervention, its reach remains limited relative to the number of eligible older persons. Disbursement mechanisms should be designed to be accessible to older persons in remote areas, including those who may not have mobile phones or bank accounts.\n\nSecond, county governments should allocate specific budgetary resources for geriatric healthcare services within their County Integrated Development Plans (CIDPs). This includes ensuring that Level 3 and Level 4 health facilities maintain adequate stocks of medications for common chronic conditions, and that healthcare workers receive training on age-sensitive service delivery.\n\nThird, legal aid and protection services for older persons should be strengthened. The National Legal Aid Service (NLAS), established under the Legal Aid Act (No. 6 of 2016), should prioritise cases involving elder abuse, property dispossession, and violations of succession rights. Community-based paralegals and volunteer advocates can help bridge the gap between older persons and formal legal services.\n\nFourth, community-based elder care organisations should be recognised and supported as essential partners in the delivery of social services. County governments and the national government can facilitate this through capacity building, coordination mechanisms, and resource mobilisation support.\n\nFifth, public awareness and community education campaigns should actively challenge ageism, elder neglect, and harmful cultural practices such as witchcraft accusations that endanger older persons. These campaigns should engage community leaders, religious institutions, schools, and media outlets to promote a culture of respect and care for older members of society.`
      },
      {
        title: 'References and Statutory Sources',
        body: `The following sources are cited in this document and are publicly accessible for verification:\n\n1. The Constitution of Kenya (2010), particularly Article 27 (Equality and Freedom from Discrimination), Article 43 (Economic and Social Rights), Article 48 (Access to Justice), and Article 57 (Rights of Older Members of Society). Available at: Kenya Law Reports (kenyalaw.org).\n\n2. Sessional Paper No. 2 of 2018: National Policy on Older Persons and Ageing. Ministry of Labour and Social Protection, Government of Kenya.\n\n3. Older Persons Cash Transfer Programme (OPCT / Inua Jamii). State Department for Social Protection and Senior Citizen Affairs. Information available through the National Social Protection Secretariat (socialprotection.or.ke).\n\n4. Social Health Insurance Act (No. 16 of 2023), Laws of Kenya. Establishes the Social Health Authority (SHA) and Social Health Insurance Fund (SHIF).\n\n5. Law of Succession Act, Chapter 160, Laws of Kenya.\n\n6. Land Registration Act, No. 3 of 2012, Laws of Kenya.\n\n7. Protection Against Domestic Violence Act (PADVA), Act No. 2 of 2015, Laws of Kenya.\n\n8. Legal Aid Act, No. 6 of 2016, Laws of Kenya.\n\n9. Kenya Population and Housing Census (2019). Kenya National Bureau of Statistics (KNBS).\n\n10. Protocol to the African Charter on Human and Peoples' Rights on the Rights of Older Persons in Africa (2016). African Union.\n\n11. World Health Organization (WHO): Integrated Care for Older People (ICOPE) — Guidelines on Community-Level Interventions to Manage Declines in Intrinsic Capacity.`
      }
    ]
  },
  {
    id: 'pub-grassroots-case-management-manual',
    slug: 'grassroots-elder-care-and-case-management-manual',
    title: 'Grassroots Elder Care & Case Management Field Guide',
    subtitle: 'A Practical Guide for Ward Volunteers, Community Health Promoters, and Caregivers',
    summary: 'A field guide developed for use by Mwancha Senior Community\'s ward-based volunteers and community health promoters. Covers the principles and practical steps involved in elder vulnerability assessment, compassionate home visits, psychosocial support, safeguarding, and referral to health and legal services. Based on Kenya\'s Community Health Strategy and applicable human rights standards.',
    category: 'Field Manual',
    type: 'Field Manual',
    authorName: 'MSC Programs & Field Operations',
    authorRole: 'Care Coordination Secretariat',
    coverImage: '/images/mwancha-pavilion-gathering.jpg',
    pdfUrl: '',
    fileSize: '2.8 MB',
    pages: 34,
    readingTime: '30 min read',
    isbn: 'Doc Ref: MSC-SOP-2024-02',
    tags: ['Field Manual', 'Case Management', 'Volunteers', 'Safeguarding', 'Community Health'],
    isFeatured: true,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-08-20'),
    chapters: [
      {
        title: 'Module 1: Understanding Elder Vulnerability and Needs Assessment',
        body: `The first step in any community-based elder care intervention is understanding who is most at risk and what forms their vulnerability takes. Vulnerability among older persons is multi-dimensional — it can encompass physical frailty, chronic illness, food insecurity, inadequate shelter, social isolation, psychological distress, and exposure to abuse or neglect. No single indicator can capture the full picture; rather, a comprehensive assessment must consider multiple interconnected factors.\n\nMSC's approach to needs assessment draws on principles outlined in Kenya's Community Health Strategy (CHS), which establishes the role of Community Health Promoters (CHPs, formerly Community Health Volunteers) in conducting household-level health assessments and referrals. Volunteers are trained to observe and document the overall condition of an older person's living environment, including the state of their dwelling, availability of food and clean water, the presence or absence of family caregivers, and any visible signs of physical decline or distress.\n\nThe assessment process is designed to be respectful, non-intrusive, and culturally sensitive. Volunteers approach each household with humility and empathy, recognising that the older person is the primary authority on their own situation. Questions are asked conversationally rather than through rigid checklists, and the older person's own priorities and concerns guide the interaction. The goal is to build a trusting relationship that enables ongoing support, rather than conducting a one-time survey.\n\nBased on the information gathered, volunteers work with the MSC coordination team to determine the most appropriate forms of support. This may include linking the older person with health services, providing emergency food or shelter assistance, facilitating registration for the Older Persons Cash Transfer (OPCT / Inua Jamii) or the Social Health Insurance Fund (SHIF), or initiating safeguarding measures in cases of suspected abuse. The assessment is not an end in itself — it is the starting point for a sustained relationship of care and support.`
      },
      {
        title: 'Module 2: Conducting Respectful and Effective Home Visits',
        body: `Home visits are the foundation of MSC's community-based elder care model. They provide the primary mechanism through which volunteers maintain regular contact with older persons, monitor their wellbeing, identify emerging needs, and offer companionship and emotional support. The quality and consistency of home visits directly determines the effectiveness of the entire intervention.\n\nBefore conducting a visit, the volunteer should be aware of any specific concerns or follow-up items from previous visits. If the older person has a chronic health condition, the volunteer should ask about medication adherence, symptom changes, and any upcoming clinic appointments. If the previous visit identified a shelter or food security concern, the volunteer should follow up on whether assistance has been provided or whether further action is needed.\n\nDuring the visit, the volunteer's primary role is to listen. Many older persons, particularly those living alone, experience profound loneliness. The visit itself — the simple act of someone coming to sit with them, hear their stories, and show genuine interest in their wellbeing — can be as valuable as any material assistance. Volunteers should avoid rushing through visits and should be attentive to non-verbal cues such as changes in the person's appearance, hygiene, or mood that may indicate declining health or wellbeing.\n\nPractical observation during the visit is also important. The volunteer should note the condition of the dwelling — checking for leaking roofs, unstable walls, or tripping hazards that could cause falls. They should verify that the older person has access to clean drinking water and adequate food. If the older person is bedridden or has significant mobility limitations, the volunteer should assess whether the caregiver (if present) has adequate knowledge and support to provide safe care, including pressure sore prevention, feeding assistance, and basic hygiene.\n\nAfter each visit, the volunteer records their observations and any actions taken or needed. These records are shared with the MSC coordination team on a regular basis, enabling the organisation to track the overall wellbeing of enrolled individuals and to identify patterns or emerging issues that require collective response. Maintaining accurate and confidential records is essential, consistent with the principles of the Data Protection Act (No. 24 of 2019, Laws of Kenya).`
      },
      {
        title: 'Module 3: Psychosocial Support and Community Fellowship',
        body: `The psychosocial wellbeing of older persons is often overlooked in favour of more visible material needs such as food, shelter, and healthcare. However, emotional and social health are equally fundamental to dignified ageing. Depression, grief, anxiety, loneliness, and loss of purpose are common experiences among older persons, particularly those who have lost spouses, who are estranged from family members, or who face stigma and marginalisation within their communities.\n\nMSC's psychosocial support programming takes two primary forms: individual support provided through one-on-one conversations during home visits, and group-based support provided through communal gatherings, peer circles, and intergenerational activities. Both approaches are guided by principles of respect, confidentiality, active listening, and cultural sensitivity.\n\nPeer support circles bring together groups of older persons to share experiences, offer mutual encouragement, and participate in structured discussions on topics such as coping with bereavement, managing stress, maintaining positive family relationships, and understanding their rights. These circles are typically held at the MSC centre in Ekerenyo or at other accessible community meeting points. The gatherings also provide an opportunity for recreational activities — storytelling, song, gentle physical exercise — that promote cognitive stimulation and social connection.\n\nFor older persons who are heading households that include orphaned and vulnerable children (OVC), MSC offers guidance on positive parenting and intergenerational communication. Many grandparents caring for grandchildren carry a heavy emotional and practical burden, often without the energy, financial resources, or parenting skills that their circumstances demand. Supportive workshops address topics such as understanding children's developmental needs, managing discipline with patience, and accessing available government support for OVC households.\n\nVolunteers providing psychosocial support are not expected to serve as professional counsellors. Rather, their role is to offer empathetic companionship, recognise signs of serious psychological distress, and facilitate referral to qualified professionals where needed. Cases involving severe depression, suicidal ideation, or trauma resulting from abuse should be referred promptly through the MSC coordination team to appropriate health or social services.`
      },
      {
        title: 'Module 4: Safeguarding, Incident Response, and Legal Referral',
        body: `Safeguarding is a core responsibility of every MSC volunteer and staff member. All individuals working with vulnerable older persons have a duty to protect them from harm, to report suspected abuse or neglect, and to respond to emergencies in a timely and appropriate manner. MSC's safeguarding framework is informed by applicable Kenyan law, including the Protection Against Domestic Violence Act (PADVA, Act No. 2 of 2015) and the Penal Code (Chapter 63, Laws of Kenya).\n\nElder abuse can take many forms, including physical violence, emotional or psychological abuse, financial exploitation, neglect by caregivers, and property dispossession. In some communities, older persons — particularly elderly women — are vulnerable to accusations of witchcraft, which can lead to social ostracism, violent attacks, or forced eviction from their homes. Volunteers must be trained to recognise the signs of each form of abuse and to respond appropriately.\n\nWhen a volunteer identifies or suspects a safeguarding concern, they should immediately inform the MSC coordination team. The nature and urgency of the concern will determine the appropriate response. In cases of immediate physical danger, the volunteer should help ensure the safety of the older person and alert local administration (Chief or Assistant Chief) and, where necessary, the National Police Service. The NPS has established Gender and Vulnerable Persons Desks at police stations, which are intended to handle cases involving vulnerable individuals including older persons.\n\nFor cases involving property disputes, inheritance fraud, or land grabbing, MSC can facilitate referral to the National Legal Aid Service (NLAS), established under the Legal Aid Act (No. 6 of 2016). The NLAS provides subsidised legal representation for persons who cannot afford legal services. Community-based paralegals and pro bono legal networks may also be engaged to assist older persons in understanding their legal options and protecting their rights.\n\nAll safeguarding concerns and incidents must be documented accurately and stored securely, in accordance with the Data Protection Act (No. 24 of 2019). Information about individuals involved in safeguarding cases is strictly confidential and must only be shared on a need-to-know basis with those directly involved in the response. MSC is committed to maintaining the highest standards of confidentiality, accountability, and ethical conduct in all safeguarding matters.`
      },
      {
        title: 'Module 5: Health Referral Pathways and Caregiver Support',
        body: `Many of the older persons served by MSC live with chronic health conditions that require ongoing management. Ensuring that these individuals can access appropriate health services is a critical function of the community-based care model. Volunteers play a key role in facilitating health referrals, supporting registration for health insurance, and helping family caregivers develop the knowledge and skills needed to provide safe and effective home-based care.\n\nKenya's public health system is structured in tiers, from Community Health Units (Level 1) through dispensaries (Level 2), health centres (Level 3), sub-county hospitals (Level 4), county referral hospitals (Level 5), and national referral hospitals (Level 6). Volunteers should be familiar with the nearest health facilities, the services available at each level, and the referral process for cases requiring more specialised care. Where possible, volunteers or MSC staff can accompany older persons to health appointments to provide logistical and emotional support.\n\nRegistration for health insurance coverage is an important step in ensuring that older persons can access health services without prohibitive out-of-pocket costs. The transition from the National Hospital Insurance Fund (NHIF) to the Social Health Authority (SHA) and the Social Health Insurance Fund (SHIF) under the Social Health Insurance Act (No. 16 of 2023) is intended to expand coverage. Volunteers can assist older persons with the registration process, helping to gather required documentation and navigating any digital registration platforms.\n\nFor older persons who are bedridden or have severe mobility limitations, home-based care provided by family members is often the primary — and sometimes the only — source of daily support. MSC offers training for family caregivers on practical topics such as safe repositioning and pressure sore prevention, feeding assistance, basic hygiene and personal care, medication management, and recognising warning signs that require urgent medical attention. This training is designed to be practical and accessible, recognising that most caregivers are family members without formal health training.\n\nSupporting caregivers also means recognising the physical and emotional toll that caregiving takes. Caregiver burnout is a real phenomenon, and MSC encourages caregivers to seek their own support, share responsibilities where possible, and access respite when available. A healthy and supported caregiver is better positioned to provide consistent, compassionate care.`
      },
      {
        title: 'Regulatory References and Further Reading',
        body: `The following laws, policies, and resources are referenced throughout this guide. All cited legislation is publicly available through the Kenya Law Reports (kenyalaw.org).\n\n1. The Constitution of Kenya (2010) — Articles 27, 43, 48, and 57.\n\n2. Protection Against Domestic Violence Act (PADVA), Act No. 2 of 2015, Laws of Kenya.\n\n3. Data Protection Act, Act No. 24 of 2019, Laws of Kenya.\n\n4. Social Health Insurance Act, No. 16 of 2023, Laws of Kenya.\n\n5. Legal Aid Act, No. 6 of 2016, Laws of Kenya.\n\n6. Law of Succession Act, Chapter 160, Laws of Kenya.\n\n7. Land Registration Act, No. 3 of 2012, Laws of Kenya.\n\n8. Penal Code, Chapter 63, Laws of Kenya.\n\n9. Ministry of Health, Kenya: Community Health Strategy (CHS) — Framework for Community Health Promoters (CHPs).\n\n10. Sessional Paper No. 2 of 2018: National Policy on Older Persons and Ageing. Ministry of Labour and Social Protection.\n\n11. Ministry of Labour and Social Protection: National Guidelines on Safeguarding in Community Organisations.\n\n12. World Health Organization (WHO): Integrated Care for Older People (ICOPE) — Guidelines on Community-Level Interventions.`
      }
    ]
  },
  {
    id: 'pub-handbook-senior-citizen-rights',
    slug: 'handbook-on-senior-citizen-rights-and-safeguards',
    title: 'Understanding Your Rights: A Guide for Older Persons in Kenya',
    subtitle: 'Constitutional Protections, Property Safeguards, Social Protection Entitlements, and How to Report Abuse',
    summary: 'A plain-language civic education guide explaining the legal rights and protections available to older persons under Kenyan law. Covers the constitutional guarantees of Article 57, land and property protections, the Older Persons Cash Transfer programme (Inua Jamii), health insurance entitlements, and practical steps for reporting abuse and accessing legal aid.',
    category: 'Policy Brief',
    type: 'Policy Brief',
    authorName: 'MSC Advocacy & Civic Education Team',
    authorRole: 'Civic Education & Rights Awareness',
    coverImage: '/images/mwancha-community-grounds.jpg',
    pdfUrl: '',
    fileSize: '1.9 MB',
    pages: 26,
    readingTime: '25 min read',
    isbn: 'Doc Ref: MSC-LEG-2024-03',
    tags: ['Legal Rights', 'Constitution', 'Article 57', 'Property Rights', 'Advocacy', 'Inua Jamii'],
    isFeatured: false,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2024-10-01'),
    chapters: [
      {
        title: 'Section 1: Your Constitutional Rights as an Older Person',
        body: `The Constitution of Kenya (2010) is the supreme law of the country. It recognises the rights of older persons in several important ways, and these rights cannot be taken away by any person, institution, or government agency.\n\nArticle 57 of the Constitution specifically addresses the rights of older members of society. It states that the State shall take measures to ensure that older persons: (a) fully participate in the affairs of society; (b) pursue their personal development; (c) live in dignity and respect and be free from abuse; and (d) receive reasonable care and assistance from the family and the State. This means that the government has a constitutional obligation to create conditions in which older persons can live with dignity, safety, and social inclusion.\n\nArticle 27 guarantees every person equality before the law and freedom from discrimination. Discrimination on the basis of age is prohibited. This means that an older person cannot be denied access to services, opportunities, or justice simply because of their age.\n\nArticle 43 sets out economic and social rights that apply to all Kenyans, including the right to the highest attainable standard of health, the right to accessible and adequate housing, and the right to social security. For older persons who may not be able to work or generate income, the right to social security is particularly important. It provides the constitutional basis for government programmes such as the Older Persons Cash Transfer (Inua Jamii).\n\nArticle 48 guarantees the right of access to justice for every person. This includes older persons who may need to pursue legal remedies for property disputes, abuse, or violations of their rights. The state is required to ensure that fees do not prevent access to justice, and the Legal Aid Act (No. 6 of 2016) provides for subsidised legal services for those who cannot afford them.`
      },
      {
        title: 'Section 2: Protecting Your Land and Property',
        body: `Land and property disputes are among the most common and most distressing issues facing older persons in Kenya. Elderly widows, grandparents, and other older family members are sometimes targeted for fraudulent land transfers, coerced signing of documents, or outright eviction from land they have occupied for decades. Understanding the legal protections available is the first step in defending against these threats.\n\nThe Land Registration Act (No. 3 of 2012, Laws of Kenya) governs the registration of land and the recording of interests in land. Under this Act, a proprietor of land can lodge a caution with the Land Registrar to prevent any dealings with the land without their knowledge. For example, if an older person is concerned that a family member might attempt to transfer their land without consent, they can lodge a caution at the county land registry to block any such transaction. The process requires visiting the relevant land registry and filing the appropriate form, with or without the assistance of a lawyer.\n\nThe Law of Succession Act (Chapter 160, Laws of Kenya) governs how property is distributed when a person dies. It provides protections for surviving spouses and dependants, including provisions that a surviving spouse is entitled to a life interest in the matrimonial home. This means that a surviving wife or husband has the legal right to continue living in the family home for the rest of their life, and no other family member can legally evict them. It is important for older persons to know that wills obtained through coercion, fraud, or undue influence can be challenged and invalidated in court.\n\nIf an older person believes that their land or property rights are being threatened, they should seek help as soon as possible. Initial steps can include reporting the matter to the local Chief or Assistant Chief, contacting the county land office, or seeking legal advice through the National Legal Aid Service (NLAS). Community organisations such as MSC can also assist in facilitating referrals and accompaniment through legal processes.\n\nIt is also advisable for older persons to ensure that their identification documents (National ID card), land title documents, and any relevant succession documents are kept in a safe place and that trusted individuals are aware of their existence and location. Keeping copies of important documents with a trusted community leader or at the MSC office can provide an additional layer of protection.`
      },
      {
        title: 'Section 3: Social Protection — The Inua Jamii Cash Transfer Programme',
        body: `The Older Persons Cash Transfer (OPCT), commonly known as Inua Jamii, is a government social protection programme that provides regular cash payments to vulnerable older persons in Kenya. The programme is administered by the State Department for Social Protection and Senior Citizen Affairs within the Ministry of Labour and Social Protection.\n\nThe programme is designed to provide a basic income safety net for older persons who are poor, vulnerable, and without adequate support. Eligible individuals receive periodic cash transfers that can be used to meet basic needs such as food, healthcare, and household expenses. The programme uses a community-based targeting mechanism to identify eligible beneficiaries, with input from local administrators and community members.\n\nTo be considered for enrollment in the Inua Jamii programme, an older person typically needs to meet certain eligibility criteria, which may include being above a specified age (generally 70 years and above, though this may vary), being a Kenyan citizen with a valid National Identification Card, and meeting poverty or vulnerability criteria. Persons who are already receiving a government pension or other formal income support may not be eligible.\n\nIf you are an older person who believes you may be eligible for the Inua Jamii programme but have not been enrolled, you can inquire at your local Chief's office, the sub-county Social Development office, or through community organisations that work with older persons. MSC volunteers can assist with the inquiry process and help gather the necessary documentation.\n\nIt is important to note that the Inua Jamii programme is a government entitlement for eligible persons — it is not a favour or a gift. No person should demand a fee or payment in exchange for enrolling someone in the programme. If you encounter any form of corruption or extortion related to the Inua Jamii programme, you can report it to the programme's complaints mechanism, the local government administration, or the Ethics and Anti-Corruption Commission (EACC).`
      },
      {
        title: 'Section 4: Health Insurance and Accessing Medical Care',
        body: `Access to healthcare is a fundamental right under the Constitution of Kenya (Article 43). For older persons living with chronic health conditions, access to affordable and consistent medical care is essential to maintaining health, dignity, and quality of life.\n\nThe Social Health Insurance Act (No. 16 of 2023) established the Social Health Authority (SHA) and the Social Health Insurance Fund (SHIF) as the framework for achieving universal health coverage in Kenya. This system is intended to replace the previous National Hospital Insurance Fund (NHIF) and to provide more comprehensive coverage for all Kenyans, including older persons.\n\nOlder persons are encouraged to register with the Social Health Authority to ensure that they can access health services at public health facilities without prohibitive out-of-pocket costs. Registration may require a National Identification Card and may involve completing registration at a designated health facility or through a digital platform. Community health promoters, local administrators, and organisations such as MSC can assist with the registration process.\n\nWhen visiting a health facility, older persons have the right to be treated with dignity and respect. They have the right to receive clear explanations of their health condition and treatment options. They have the right to privacy and confidentiality regarding their health information. If an older person feels that they have been denied care, treated disrespectfully, or charged fees that they should not have been charged, they can raise a complaint with the facility management, the county health department, or the Kenya National Commission on Human Rights (KNCHR).\n\nFor older persons who are unable to travel to health facilities, home-based care provided by trained family caregivers and community health promoters is an important alternative. MSC advocates for the strengthening of home-based care support services at the county level, including training for caregivers, provision of basic medical supplies, and regular supportive supervision from health professionals.`
      },
      {
        title: 'Section 5: Reporting Abuse and Getting Help',
        body: `If you are an older person who is experiencing abuse, neglect, or any form of mistreatment, it is important to know that you have the right to seek help and that there are people and institutions that can assist you.\n\nAbuse of older persons can take many forms. Physical abuse includes hitting, pushing, or any form of physical violence. Emotional or psychological abuse includes threats, insults, intimidation, humiliation, or isolation. Financial abuse includes stealing money or property, forging signatures on documents, or pressuring an older person to hand over assets. Neglect means failing to provide necessary care, food, medicine, or shelter to an older person who is dependent on a caregiver. All of these are wrong, and in many cases they are criminal offences under Kenyan law.\n\nThe Protection Against Domestic Violence Act (PADVA, Act No. 2 of 2015) provides legal remedies for persons experiencing violence or abuse within a domestic setting. Under this Act, an affected person can apply to a court for a protection order, which can require the abuser to stop the abusive behaviour, leave the shared home, or stay away from the affected person. The application can be made by the affected person themselves, or by another person on their behalf.\n\nIf you are in immediate danger, call the National Police Service emergency number (999 or 112) or go to the nearest police station. Ask to speak with an officer at the Gender and Vulnerable Persons Desk, which is specifically established to handle cases involving vulnerable persons. You can also report the matter to your local Chief or Assistant Chief, who has the authority to intervene in disputes and to refer cases to the police or courts.\n\nCommunity organisations such as Mwancha Senior Community can provide support in several ways: accompanying you to the police station or court, helping you understand your legal options, connecting you with legal aid services through the National Legal Aid Service (NLAS), and providing emotional support through the process. You do not have to face abuse alone — help is available, and seeking it is an act of courage, not weakness.\n\nAll reports of abuse will be treated with confidentiality and respect. MSC and other service providers are bound by ethical standards and by the Data Protection Act (No. 24 of 2019) to protect the privacy and dignity of all persons who seek their assistance.`
      },
      {
        title: 'Statutory References and Useful Contacts',
        body: `The following laws are referenced in this guide. All Kenyan legislation is publicly accessible through the Kenya Law Reports website (kenyalaw.org).\n\n1. The Constitution of Kenya (2010) — Articles 27, 43, 48, and 57.\n\n2. Protection Against Domestic Violence Act (PADVA), Act No. 2 of 2015, Laws of Kenya.\n\n3. Law of Succession Act, Chapter 160, Laws of Kenya.\n\n4. Land Registration Act, No. 3 of 2012, Laws of Kenya.\n\n5. Social Health Insurance Act, No. 16 of 2023, Laws of Kenya.\n\n6. Legal Aid Act, No. 6 of 2016, Laws of Kenya.\n\n7. Data Protection Act, No. 24 of 2019, Laws of Kenya.\n\n8. Penal Code, Chapter 63, Laws of Kenya.\n\nUseful Contacts and Institutions:\n\n- National Police Service Emergency: 999 or 112\n- Kenya National Commission on Human Rights (KNCHR): knchr.org\n- National Legal Aid Service (NLAS): nlas.go.ke\n- Ethics and Anti-Corruption Commission (EACC): eacc.go.ke\n- Kenya Law Reports: kenyalaw.org\n- Local Chief's Office and Assistant Chief: Available in every administrative location\n- Mwancha Senior Community: Contact through local ward volunteers or the MSC centre in Ekerenyo, Nyamira County`
      }
    ]
  }
];


export class PublicationService {
  // Format database record into clean publication response
  private formatPublication(article: any) {
    let structured: any = {};
    let narrative = article.content;

    try {
      if (typeof article.content === 'string' && article.content.trim().startsWith('{')) {
        structured = JSON.parse(article.content);
        narrative = structured.narrative || structured.fullText || article.summary;
      }
    } catch {
      narrative = article.content;
    }

    let parsedTags: string[] = [];
    try {
      if (typeof article.tags === 'string') {
        parsedTags = JSON.parse(article.tags || '[]');
      } else if (Array.isArray(article.tags)) {
        parsedTags = article.tags;
      }
    } catch {
      parsedTags = [];
    }

    const chapters = structured.chapters && Array.isArray(structured.chapters) && structured.chapters.length > 0
      ? structured.chapters
      : [
          {
            title: 'Full Document Narrative',
            body: typeof narrative === 'string' ? narrative : article.summary
          }
        ];

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      subtitle: structured.subtitle || '',
      summary: article.summary,
      content: typeof narrative === 'string' ? narrative : article.summary,
      fullText: typeof narrative === 'string' ? narrative : article.summary,
      coverImage: article.featuredImage || '/images/mwancha-facility-main.jpg',
      pdfUrl: structured.pdfUrl || '',
      fileSize: structured.fileSize || '2.4 MB',
      pages: structured.pages || (chapters.length * 6),
      readingTime: structured.readingTime || `${Math.max(5, Math.ceil((article.summary?.length || 200) / 100) * 3)} min read`,
      isbn: structured.isbn || '',
      chapters,
      authorName: article.authorName || 'MSC Editorial & Research Unit',
      authorRole: article.authorRole || 'Research & Knowledge Hub',
      category: article.category || 'Book',
      type: structured.type || article.category || 'Book',
      tags: parsedTags,
      isFeatured: article.isFeatured,
      status: article.status,
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : article.createdAt.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    };
  }

  // Get all public publications
  async getPublicPublications(params?: { category?: string; search?: string }) {
    const publicationCategories = [
      'Book',
      'Policy Brief',
      'Field Manual',
      'Annual Report',
      'Research Paper',
      'Publication',
      'Article',
      'Guide'
    ];

    const where: any = {
      status: { in: [ContentStatus.APPROVED, ContentStatus.PUBLISHED] },
      deletedAt: null,
      OR: [
        { category: { in: publicationCategories } },
        { tags: { contains: 'Publication' } },
        { tags: { contains: 'Book' } },
        { tags: { contains: 'Resource' } }
      ]
    };

    if (params?.category && params.category !== 'all') {
      where.category = params.category;
    }

    if (params?.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: params.search } },
            { summary: { contains: params.search } },
            { authorName: { contains: params.search } }
          ]
        }
      ];
    }

    const records = await prisma.newsArticle.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }]
    });

    if (records.length === 0 && (!params?.category || params.category === 'all') && !params?.search) {
      return DEFAULT_MSC_PUBLICATIONS.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.publishedAt.toISOString(),
        updatedAt: p.publishedAt.toISOString()
      }));
    }

    const formatted = records.map((r) => this.formatPublication(r));

    // If query matches some defaults, append unique ones
    if (formatted.length === 0 && !params?.category) {
      return DEFAULT_MSC_PUBLICATIONS.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.publishedAt.toISOString(),
        updatedAt: p.publishedAt.toISOString()
      }));
    }

    return formatted;
  }

  // Get public publication by slug
  async getPublicPublicationBySlug(slug: string) {
    const record = await prisma.newsArticle.findUnique({
      where: { slug }
    });

    if (record && !record.deletedAt && (record.status === ContentStatus.APPROVED || record.status === ContentStatus.PUBLISHED)) {
      return this.formatPublication(record);
    }

    // Check defaults
    const fallback = DEFAULT_MSC_PUBLICATIONS.find((p) => p.slug === slug);
    if (fallback) {
      return {
        ...fallback,
        publishedAt: fallback.publishedAt.toISOString(),
        createdAt: fallback.publishedAt.toISOString(),
        updatedAt: fallback.publishedAt.toISOString()
      };
    }

    throw new NotFoundError('Publication or book not found.');
  }

  // Get all admin publications
  async getAdminPublications() {
    const publicationCategories = [
      'Book',
      'Policy Brief',
      'Field Manual',
      'Annual Report',
      'Research Paper',
      'Publication',
      'Article',
      'Guide'
    ];

    const records = await prisma.newsArticle.findMany({
      where: {
        deletedAt: null,
        OR: [
          { category: { in: publicationCategories } },
          { tags: { contains: 'Publication' } },
          { tags: { contains: 'Book' } },
          { tags: { contains: 'Resource' } }
        ]
      },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }]
    });

    const dbPublications = records.map((r) => this.formatPublication(r));

    // Merge default seeds if database has no publications
    if (dbPublications.length === 0) {
      return DEFAULT_MSC_PUBLICATIONS.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.publishedAt.toISOString(),
        updatedAt: p.publishedAt.toISOString()
      }));
    }

    return dbPublications;
  }

  // Get single publication by ID for admin
  async getPublicationById(id: string) {
    const record = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (record && !record.deletedAt) {
      return this.formatPublication(record);
    }

    const fallback = DEFAULT_MSC_PUBLICATIONS.find((p) => p.id === id);
    if (fallback) {
      return {
        ...fallback,
        publishedAt: fallback.publishedAt.toISOString(),
        createdAt: fallback.publishedAt.toISOString(),
        updatedAt: fallback.publishedAt.toISOString()
      };
    }

    throw new NotFoundError('Publication not found.');
  }

  // Create new publication or book
  async createPublication(data: any, userId?: string) {
    const slug = data.slug || await generateUniqueSlug(data.title, async (candidate) => {
      const existing = await prisma.newsArticle.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });

    const structuredPayload = JSON.stringify({
      type: data.type || data.category || 'Book',
      subtitle: data.subtitle || '',
      pdfUrl: data.pdfUrl || '',
      fileSize: data.fileSize || '2.4 MB',
      pages: Number(data.pages) || 24,
      readingTime: data.readingTime || '20 min read',
      isbn: data.isbn || '',
      chapters: Array.isArray(data.chapters) ? data.chapters : [],
      narrative: typeof data.content === 'string' ? data.content : data.summary
    });

    const tagsArray = Array.isArray(data.tags)
      ? data.tags
      : ['Publication', 'Resource', data.category || 'Book'];

    const article = await prisma.newsArticle.create({
      data: {
        title: data.title,
        slug,
        summary: data.summary,
        content: structuredPayload,
        featuredImage: data.coverImage || '/images/mwancha-facility-main.jpg',
        imageAlt: data.title,
        authorName: data.authorName || 'MSC Editorial & Research Unit',
        authorRole: data.authorRole || 'Research & Knowledge Hub',
        category: data.category || 'Book',
        tags: JSON.stringify(tagsArray),
        isFeatured: Boolean(data.isFeatured),
        status: (data.status as ContentStatus) || ContentStatus.APPROVED,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : new Date(),
        authorId: userId,
        updatedById: userId
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'Publication',
        entityId: article.id,
        newData: JSON.stringify(data)
      }
    });

    return this.formatPublication(article);
  }

  // Update existing publication
  async updatePublication(id: string, data: any, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('Publication not found.');
    }

    let existingStructured: any = {};
    try {
      if (typeof existing.content === 'string' && existing.content.trim().startsWith('{')) {
        existingStructured = JSON.parse(existing.content);
      }
    } catch {}

    const updatedStructured = JSON.stringify({
      ...existingStructured,
      type: data.type || data.category || existingStructured.type || 'Book',
      subtitle: data.subtitle !== undefined ? data.subtitle : existingStructured.subtitle,
      pdfUrl: data.pdfUrl !== undefined ? data.pdfUrl : existingStructured.pdfUrl,
      fileSize: data.fileSize || existingStructured.fileSize || '2.4 MB',
      pages: data.pages !== undefined ? Number(data.pages) : existingStructured.pages || 24,
      readingTime: data.readingTime || existingStructured.readingTime || '20 min read',
      isbn: data.isbn !== undefined ? data.isbn : existingStructured.isbn,
      chapters: data.chapters !== undefined ? data.chapters : existingStructured.chapters || [],
      narrative: data.content !== undefined ? data.content : existingStructured.narrative || existing.summary
    });

    const updateData: any = {
      updatedById: userId
    };

    if (data.title) updateData.title = data.title;
    if (data.summary) updateData.summary = data.summary;
    if (data.coverImage) updateData.featuredImage = data.coverImage;
    if (data.authorName) updateData.authorName = data.authorName;
    if (data.authorRole) updateData.authorRole = data.authorRole;
    if (data.category) updateData.category = data.category;
    if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
    if (data.status) updateData.status = data.status as ContentStatus;
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    updateData.content = updatedStructured;

    if (data.status === ContentStatus.PUBLISHED && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: updateData
    });

    await prisma.$transaction([
      prisma.contentRevision.create({
        data: {
          entityType: 'Publication',
          entityId: id,
          previousVal: JSON.stringify(existing),
          newVal: JSON.stringify(updated),
          changeNote: data.changeNote || 'Publication details updated by admin',
          changedById: userId
        }
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'Publication',
          entityId: id,
          newData: JSON.stringify(data)
        }
      })
    ]);

    return this.formatPublication(updated);
  }

  // Publish publication
  async publishPublication(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedById: userId
      }
    });

    return this.formatPublication(updated);
  }

  // Approve publication
  async approvePublication(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: {
        status: ContentStatus.APPROVED,
        updatedById: userId
      }
    });

    return this.formatPublication(updated);
  }

  // Soft-delete publication
  async deletePublication(id: string, userId?: string) {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundError('Publication not found.');

    await prisma.newsArticle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: userId
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Publication',
        entityId: id
      }
    });

    return true;
  }
}

export const publicationService = new PublicationService();
