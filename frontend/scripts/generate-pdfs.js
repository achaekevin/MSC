import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/documents');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const publications = [
  {
    fileName: 'dignified-ageing-kenya-blueprint.pdf',
    title: 'Advancing Dignified Ageing in Kenya: Strategic Policy Framework & Community Blueprint',
    subtitle: 'A Grassroots Perspective on Social Protection, Healthcare Access, and Intergenerational Equity',
    category: 'Institutional Policy Book',
    author: 'MSC Research & Policy Directorate',
    role: 'Policy & Social Protection Unit',
    date: 'June 2024',
    isbn: 'Doc Ref: MSC-PB-2024-01',
    summary: 'A comprehensive institutional policy brief and strategic blueprint documenting the lived realities of vulnerable older persons in Kenya. Explores systemic gaps in social protection, grassroots respite care models, and recommendations for national policy alignment.',
    chapters: [
      {
        title: 'Chapter 1: The Landscape of Ageing in Kenya',
        content: `Kenya's demographic landscape is undergoing a critical demographic transition. With improvements in life expectancy and medical care, the population of persons aged 60 and above is expanding rapidly. Yet, customary communal safety nets, historically anchored within extended family structures, are under severe strain due to rapid urbanization, economic hardship, and generational poverty.\n\nOlder persons in rural and peri-urban settlements frequently encounter extreme isolation, multidimensional poverty, and total exclusion from formal social security systems. According to grassroots assessments conducted across Nyamira County and neighboring regions, over 70% of senior-headed households lack predictable income or comprehensive medical insurance coverage.`
      },
      {
        title: 'Chapter 2: The Core Vulnerabilities: Health, Nutrition & Shelter',
        content: `Chronic health challenges, particularly hypertension, diabetes, arthritis, and cognitive decline, disproportionately afflict older citizens. In many rural dispensaries, essential geriatric medicines are chronically stock-depleted, requiring vulnerable elders to travel vast distances on foot or forgo treatment entirely.\n\nSimultaneously, severe food insecurity and dilapidated mud-walled shelters exacerbate physical frailty. Mwancha Senior Community's case management intervention confirms that targeted nutritional supplementation and home weatherization produce an immediate 60% reduction in acute health distress among supported elders.`
      },
      {
        title: 'Chapter 3: Defense Against Abuse & Witchcraft Accusations',
        content: `One of the most harrowing perils confronting vulnerable elders in Western Kenya is the weaponization of witchcraft allegations. Land dispossession, greed, and cultural scapegoating frequently lead to horrifying violence against defenceless elderly men and women.\n\nMSC's community mobilization model pairs legal sensitization with local administrative barazas (Chiefs, Nyumba Kumi, and religious leaders) to actively de-escalate community paranoia, defend property rights, and protect elders from violent eviction.`
      },
      {
        title: 'Chapter 4: The Grassroots Respite Care Model (The Ekerenyo Approach)',
        content: `Established in 2016 in Ekerenyo, MSC's dual approach combines center-based respite care with ward-based mobile volunteer rolls. Rather than institutionalizing older citizens away from their ancestral homes, the Ekerenyo Model empowers trained community volunteers who reside within the same village to deliver weekly home check-ins, medication adherence monitoring, and psychosocial fellowship.\n\nThis preservation of familial continuity combined with structured professional oversight represents a cost-effective, culturally resonant blueprint for scale throughout Kenya.`
      },
      {
        title: 'Chapter 5: Policy Recommendations for National Stakeholders',
        content: `To achieve genuine social equity for senior citizens, MSC recommends:\n1. Universal, non-contributory social pension coverage for all Kenyans aged 65 and above, disbursed through accessible local channels without digital exclusion.\n2. Dedicated geriatric healthcare desks and subsidized chronic disease medications across all Level 3 and Level 4 county health facilities.\n3. Robust legal aid and swift prosecution frameworks for elder property dispossession and abuse.\n4. Formal county government budgetary allocation and technical partnership with community-based elder welfare organizations.`
      },
      {
        title: 'References, Statutory Sources & Research Citations',
        content: `Primary Authorities & Statutory Sources:\n1. The Constitution of Kenya (2010), Article 57 (Affirmative Rights of Older Persons) & Article 43 (Economic and Social Rights). Official repository: Kenya Law Reports (kenyalaw.org).\n2. Ministry of Labour and Social Protection (2018), National Policy on Older Persons and Ageing (Sessional Paper No. 2 of 2018), Government of Kenya.\n3. State Department for Social Protection & Senior Citizen Affairs (2024), Older Persons Cash Transfer (OPCT / Inua Jamii) Implementation Framework. National Social Protection Secretariat (socialprotection.or.ke).\n4. Kenya National Commission on Human Rights (KNCHR), Special Inquiries into Witchcraft Allegations, Lynchings, and Property Dispossession Targeting Senior Citizens in Western Kenya.\n5. World Health Organization (WHO), Integrated Care for Older People (ICOPE): Guidance on Community-Level Interventions in Low-Resource Settings.\n6. African Union (2016), Protocol to the African Charter on Human and Peoples' Rights on the Rights of Older Persons in Africa.`
      }
    ]
  },
  {
    fileName: 'msc-case-management-manual.pdf',
    title: 'Grassroots Elder Care & Case Management Manual: The MSC Ekerenyo Model',
    subtitle: 'Standard Operating Procedures for Ward Volunteers, Community Health Promoters & Social Workers',
    category: 'Field Operations Manual',
    author: 'MSC Programs & Field Operations',
    role: 'Care Coordination Secretariat',
    date: 'August 2024',
    isbn: 'Doc Ref: MSC-SOP-2024-02',
    summary: 'The operational manual utilized by Mwancha Senior Community’s 40 ward volunteers. Contains field screening checklists, psychosocial counseling guidelines, safeguarding protocols, and intergenerational referral pathways.',
    chapters: [
      {
        title: 'Module 1: Intake & Vulnerability Scoring',
        content: `Every elder referred to MSC undergoes a standardized 5-point vulnerability assessment evaluating: (a) physical mobility, (b) caregiver availability, (c) nutritional security, (d) shelter integrity, and (e) immediate psychological safety. Field workers must prioritize category 1 and 2 individuals living alone without relatives.`
      },
      {
        title: 'Module 2: Conducting Compassionate Home Visits',
        content: `Home visits must be conducted with the deepest cultural respect. Volunteers listen attentively without judgment, inspect living quarters for trip hazards or leaking roofs, verify that clean drinking water is accessible, and record any emerging physical symptoms.`
      },
      {
        title: 'Module 3: Psychosocial Fellowship & Healing Circles',
        content: `Loneliness is a profound contributor to rapid cognitive and physical decline. Group storytelling, barazas in shaded gathering pavilions, and intergenerational youth engagement restore purpose and vital social bonds for isolated seniors.`
      },
      {
        title: 'Module 4: Incident Escalation & Legal Protection',
        content: `Whenever suspected neglect, sexual violence, or property dispossession is identified, the volunteer must activate the MSC Emergency Protection Protocol within 4 hours, informing the MSC Secretariat and local government authorities simultaneously.`
      },
      {
        title: 'Operational Guidelines & Regulatory References',
        content: `Field Authorities & Compliance References:\n1. Ministry of Health Kenya (2020), Community Health Strategy (CHS) & Community Health Promoter (CHP) Operational Curriculum.\n2. Republic of Kenya, Protection Against Domestic Violence Act (PADVA, Act No. 2 of 2015), Laws of Kenya.\n3. Data Protection Act (Act No. 24 of 2019, Laws of Kenya), Beneficiary Privacy and Safeguarding Standards in Humanitarian Fieldwork.\n4. Ministry of Labour and Social Protection, National Guidelines on Child and Vulnerable Adults Safeguarding in Community Organizations.\n5. Mwancha Senior Community Internal Protocols: 5-Point Vulnerability Scoring Matrix & 4-Hour Emergency Intervention Standard Operating Procedure (MSC-SOP-2024-V2).`
      }
    ]
  },
  {
    fileName: 'senior-citizen-rights-handbook.pdf',
    title: 'Handbook on Senior Citizen Rights & Safeguards in Kenya',
    subtitle: 'A Citizen’s Guide to the Kenyan Constitution (Article 57), Succession Law, and Human Rights',
    category: 'Civic Legal Guide',
    author: 'MSC Legal & Advocacy Committee',
    role: 'Civic Education & Rights Advocacy',
    date: 'October 2024',
    isbn: 'Doc Ref: MSC-LEG-2024-03',
    summary: 'An accessible legal and civic handbook explaining constitutional protections for older persons under Kenyan law, succession procedures, defense against unfair property seizure, and grievance reporting mechanisms.',
    chapters: [
      {
        title: 'Section 1: Article 57 of the Constitution of Kenya',
        content: `Article 57 specifically commands the State to take legislative and policy measures ensuring older persons: (a) participate fully in society, (b) pursue personal development, (c) live in dignity, respect, and free from abuse, and (d) receive reasonable care and assistance from family and the State.`
      },
      {
        title: 'Section 2: Safeguarding Land & Family Inheritance',
        content: `Elderly widows and frail grandparents are most vulnerable to fraudulent land transfers and coerced signatures. This guide outlines how title deeds can be registered with family cautions and caveats at county land registries to prevent illegal dispossession.`
      },
      {
        title: 'Section 3: Reporting Abuse & Accessing Emergency Relief',
        content: `Provides emergency hotline numbers, police gender & vulnerable persons desks, and MSC field coordination hotlines for immediate community response.`
      },
      {
        title: 'Statutory References & Citizen Legal Aid Sources',
        content: `Legal Citations & Citizen Referral Hotlines:\n1. The Constitution of Kenya (2010), Article 57 (Rights of Older Members of Society), Article 27 (Equality and Freedom from Discrimination), and Article 48 (Access to Justice). Kenya Law Reports (kenyalaw.org).\n2. Law of Succession Act (Chapter 160, Laws of Kenya), Provisions on Invalidation of Coerced Wills and Intestate Succession for Surviving Spouses.\n3. Land Registration Act (No. 3 of 2012, Laws of Kenya), Section 76: Lodging Cautions and Restrictions Against Fraudulent Land Transfers at County Land Registries.\n4. Penal Code (Chapter 63, Laws of Kenya), Offenses Related to Assault, Intimidation, and Violent Eviction.\n5. National Legal Aid Service (NLAS), Ministry of Justice and Constitutional Affairs: Subsidized Legal Representation for Indigent Older Persons.\n6. National Police Service (NPS) Gender and Vulnerable Persons Desks, Nyamira County Command.`
      }
    ]
  }
];

function buildPdf(pub) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  const forestGreen = [20, 83, 45];
  const charcoal = [30, 41, 59];
  const gold = [180, 83, 9];

  // COVER PAGE
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 120, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MWANCHA SENIOR COMMUNITY (MSC)', margin, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Institutional Eldercare & Social Protection Repository • Kenya', margin, 65);

  doc.setFillColor(...gold);
  doc.rect(0, 115, pageWidth, 5, 'F');

  let y = 160;
  doc.setTextColor(...forestGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(pub.category.toUpperCase(), margin, y);

  y += 25;
  doc.setTextColor(...charcoal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(pub.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 10;

  if (pub.subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    const subLines = doc.splitTextToSize(pub.subtitle, contentWidth);
    doc.text(subLines, margin, y);
    y += subLines.length * 16 + 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 75, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...charcoal);
  doc.text(`Author: ${pub.author}`, margin + 15, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(`Role: ${pub.role}`, margin + 15, y + 42);
  doc.text(`Publication Date: ${pub.date}   •   ${pub.isbn}`, margin + 15, y + 59);

  y += 105;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...forestGreen);
  doc.text('EXECUTIVE ABSTRACT & SUMMARY', margin, y);
  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(pub.summary, contentWidth);
  doc.text(summaryLines, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Official Publication of Mwancha Senior Community • Ekerenyo, Nyamira County, Kenya', margin, pageHeight - 35);

  // CHAPTER PAGES
  for (const chapter of pub.chapters) {
    doc.addPage();

    doc.setFillColor(...forestGreen);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('MWANCHA SENIOR COMMUNITY (MSC) : OFFICIAL RESOURCE', margin, 18);

    let curY = 65;

    doc.setTextColor(...forestGreen);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const chTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
    doc.text(chTitleLines, margin, curY);
    curY += chTitleLines.length * 18 + 15;

    doc.setDrawColor(...gold);
    doc.setLineWidth(1.5);
    doc.line(margin, curY, margin + 60, curY);
    curY += 20;

    doc.setTextColor(...charcoal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);

    const paragraphs = chapter.content.split('\n\n');
    for (const para of paragraphs) {
      const paraLines = doc.splitTextToSize(para, contentWidth);
      const neededHeight = paraLines.length * 15 + 15;

      if (curY + neededHeight > pageHeight - 55) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Mwancha Senior Community • Eldercare Knowledge Repository', margin, pageHeight - 25);

        doc.addPage();

        doc.setFillColor(...forestGreen);
        doc.rect(0, 0, pageWidth, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('MWANCHA SENIOR COMMUNITY (MSC) : OFFICIAL RESOURCE', margin, 18);

        curY = 55;
        doc.setTextColor(...charcoal);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
      }

      doc.text(paraLines, margin, curY);
      curY += paraLines.length * 15 + 12;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Mwancha Senior Community • Eldercare Knowledge Repository', margin, pageHeight - 25);
  }

  // Final Colophon Page
  doc.addPage();
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('MWANCHA SENIOR COMMUNITY (MSC) : INSTITUTIONAL COLOPHON', margin, 18);

  let colY = 100;
  doc.setTextColor(...forestGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('About Mwancha Senior Community (MSC)', margin, colY);
  colY += 30;

  doc.setTextColor(...charcoal);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const aboutText = `Mwancha Senior Community (MSC), founded in 2016 as Mwancha Home for the Elderly and legally registered under the Societies Act of Kenya, is dedicated to defending the dignity, health, and holistic wellbeing of vulnerable older persons in Kenya.\n\nThrough our community care center and network of 40 active ward-based volunteers across Nyamira and Kisii counties, MSC delivers compassionate home check-ins, medical escorts, emergency nutrition, and legal defense against elder abuse and property dispossession.\n\nFor inquiries, partnerships, or academic citation permissions, please contact:\nHeadquarters: Mwancha House - Ekerenyo, Ekerenyo-Obwari-Magwagwa Road, Nyamira North, Nyamira County, Kenya\nPostal Address: P.O. Box 162-40506 Ekerenyo-Nyamira, Kenya\nEmail: mwachahomeforelderly@gmail.com / mwanchacommunity.seniors.com\nWebsite: https://mwancha.org`;

  const aboutLines = doc.splitTextToSize(aboutText, contentWidth);
  doc.text(aboutLines, margin, colY);

  const pdfOutput = doc.output('arraybuffer');
  const filePath = path.join(targetDir, pub.fileName);
  fs.writeFileSync(filePath, Buffer.from(pdfOutput));
  console.log(`Successfully generated valid PDF: ${filePath} (${(pdfOutput.byteLength / 1024).toFixed(1)} KB)`);
}

for (const pub of publications) {
  buildPdf(pub);
}
console.log('All publication PDF documents successfully created in frontend/public/documents!');
