import React from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { MSC_ORGANIZATION } from '../../constants';
import { AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="pb-20 space-y-12">
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container size="md">
          <Breadcrumb items={[{ label: 'Terms of Website Use' }]} />
          <div className="mt-4 text-left">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Legal Terms
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 font-display">
              Terms of Website Use
            </h1>
            <p className="mt-3 text-base text-charcoal-600">
              Last updated: January 2025 &bull; Mwancha Senior Community
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container size="md">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-warm-200 shadow-sm text-left space-y-8 prose prose-charcoal max-w-none">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 not-prose flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Terms of Use Review:</strong> These terms govern the informational use of this website. Formal organizational registration numbers and official statutory filings will be added by the client.
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                By accessing and using this website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, please discontinue use of the site.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                2. Informational Purpose
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                The content provided on this website is for general informational, educational, and advocacy purposes regarding the welfare and rights of older persons in Kenya. While we strive to maintain accurate and up-to-date information, the material does not constitute clinical medical advice or formal legal counsel.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                3. Intellectual Property & Moral Rights
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                All written materials, reports, organizational symbols, logos, and programmatic frameworks featured on this site are the property of Mwancha Senior Community unless otherwise attributed. Republication for commercial gain is strictly prohibited without prior written authorization from the Secretariat.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                4. Protection of Beneficiary Dignity
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                Any photographs, case summaries, or community accounts displayed on this website are presented strictly with informed consent to advance community education. Users may not scrape, copy, or redistribute beneficiary photographs for derogatory, sensationalized, or unauthorized purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                5. Inquiries & Official Communication
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                For questions regarding permissions or terms, please write to:
              </p>
              <div className="not-prose mt-4 p-5 rounded-2xl bg-warm-50 border border-warm-200 text-sm text-charcoal-800 space-y-1">
                <p className="font-bold">Mwancha Senior Community</p>
                <p>P.O. Box 21–40506, Kebirigo, Nyamira County, Kenya</p>
                <p>Email: <a href={`mailto:${MSC_ORGANIZATION.email}`} className="text-forest-800 underline">{MSC_ORGANIZATION.email}</a></p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
