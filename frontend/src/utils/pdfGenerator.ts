import { jsPDF } from 'jspdf';
import { PublicationItem } from '../services/publicationService';

/**
 * Generates an authentic, beautifully formatted PDF document for any MSC publication.
 * Works seamlessly client-side across all browsers and devices without backend dependencies.
 */
export const downloadPublicationPdf = (pub: PublicationItem): void => {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: 'portrait'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const forestGreen: [number, number, number] = [20, 83, 45];
  const charcoal: [number, number, number] = [30, 41, 59];
  const gold: [number, number, number] = [180, 83, 9];

  // ================= 1. COVER PAGE =================
  // Header Ribbon
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

  // Title & Metadata
  let y = 160;
  doc.setTextColor(...forestGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text((pub.category || pub.type || 'Institutional Publication').toUpperCase(), margin, y);

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

  // Author details card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 75, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...charcoal);
  doc.text(`Author: ${pub.authorName || 'MSC Editorial Directorate'}`, margin + 15, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(`Role / Division: ${pub.authorRole || 'Care Coordination & Policy Unit'}`, margin + 15, y + 42);
  const dateFormatted = pub.publishedAt
    ? new Date(pub.publishedAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' })
    : '2024';
  const isbnOrRef = pub.isbn || `REF: MSC-PUB-${pub.slug.toUpperCase().slice(0, 12)}`;
  doc.text(`Published: ${dateFormatted}   •   ${isbnOrRef}`, margin + 15, y + 59);

  y += 105;

  // Executive Summary Box
  if (pub.summary) {
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
  }

  // Cover Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Official Publication of Mwancha Senior Community • Ekerenyo, Nyamira County, Kenya', margin, pageHeight - 35);

  // ================= 2. CHAPTERS / CONTENT =================
  const chapters = pub.chapters || [];

  if (chapters.length > 0) {
    for (const chapter of chapters) {
      doc.addPage();

      // Top Header
      doc.setFillColor(...forestGreen);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('MWANCHA SENIOR COMMUNITY (MSC) — OFFICIAL RESOURCE', margin, 18);

      let curY = 65;

      // Chapter Title
      doc.setTextColor(...forestGreen);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      const chTitleLines = doc.splitTextToSize(chapter.title, contentWidth);
      doc.text(chTitleLines, margin, curY);
      curY += chTitleLines.length * 18 + 15;

      // Gold divider
      doc.setDrawColor(...gold);
      doc.setLineWidth(1.5);
      doc.line(margin, curY, margin + 60, curY);
      curY += 20;

      // Body Paragraphs
      doc.setTextColor(...charcoal);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);

      const chapterText = chapter.body || (chapter as Record<string, any>).content || '';
      const paragraphs = chapterText.split('\n\n');
      for (const para of paragraphs) {
        if (!para.trim()) continue;
        const paraLines = doc.splitTextToSize(para.trim(), contentWidth);
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
          doc.text('MWANCHA SENIOR COMMUNITY (MSC) — OFFICIAL RESOURCE', margin, 18);

          curY = 55;
          doc.setTextColor(...charcoal);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
        }

        doc.text(paraLines, margin, curY);
        curY += paraLines.length * 15 + 12;
      }

      // Bottom page footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Mwancha Senior Community • Eldercare Knowledge Repository', margin, pageHeight - 25);
    }
  } else {
    // If no chapters structured, render body text or fallback content
    doc.addPage();
    doc.setFillColor(...forestGreen);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('MWANCHA SENIOR COMMUNITY (MSC) — PUBLICATION BODY', margin, 18);

    let curY = 65;
    doc.setTextColor(...charcoal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const bodyContent = pub.summary || 'Content document published by Mwancha Senior Community.';
    const bodyLines = doc.splitTextToSize(bodyContent, contentWidth);
    doc.text(bodyLines, margin, curY);
  }

  // ================= 3. INSTITUTIONAL COLOPHON =================
  doc.addPage();
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('MWANCHA SENIOR COMMUNITY (MSC) — INSTITUTIONAL COLOPHON', margin, 18);

  let colY = 90;
  doc.setTextColor(...forestGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('About Mwancha Senior Community (MSC)', margin, colY);
  colY += 25;

  doc.setTextColor(...charcoal);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  const aboutText =
    `Mwancha Senior Community (MSC), founded in 2016 as Mwancha Home for the Elderly and legally registered under the Societies Act of Kenya, is dedicated to defending the dignity, health, and holistic wellbeing of vulnerable older persons in Kenya.\n\nThrough our community care center and network of 40 active ward-based volunteers across Nyamira and Kisii counties, MSC delivers compassionate home check-ins, medical escorts, emergency nutrition, and legal defense against elder abuse and property dispossession.\n\nCitation Notice: Readers, researchers, and civil society partners are welcome to share and cite this document with appropriate attribution to Mwancha Senior Community (MSC).\n\nHeadquarters: Mwancha House - Ekerenyo, Ekerenyo-Obwari-Magwagwa Road, Nyamira North, Nyamira County, Kenya\nPostal Address: P.O. Box 162-40506 Ekerenyo-Nyamira, Kenya\nEmail: mwachahomeforelderly@gmail.com / mwanchacommunity.seniors.com\nWebsite: https://mwancha.org`;

  const aboutLines = doc.splitTextToSize(aboutText, contentWidth);
  doc.text(aboutLines, margin, colY);

  // Trigger browser download with the publication's slug
  const fileName = `${pub.slug || 'msc-publication'}.pdf`;
  doc.save(fileName);
};
