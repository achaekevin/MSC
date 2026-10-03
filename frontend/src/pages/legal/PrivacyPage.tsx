import React from 'react';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { MSC_ORGANIZATION } from '../../constants';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="pb-20 space-y-12">
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container size="md">
          <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
          <div className="mt-4 text-left">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Data Protection & Privacy
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 font-display">
              Privacy Policy
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
            {/* Transparent Client Notice */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 not-prose flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Legal Review Placeholder:</strong> This privacy framework outlines MSC's commitment to the Kenyan Data Protection Act 2019 and ethical handling of vulnerable beneficiary records. Official legal registration certificates and designated Data Protection Officer details will be formally gazetted by the client.
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                1. Organizational Commitment to Privacy
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                Mwancha Senior Community ("MSC", "we", "our", or "us"), headquartered in Kebirigo, Nyamira County, Kenya, is dedicated to upholding the fundamental rights, dignity, and personal privacy of all individuals with whom we interact. This includes our senior citizens, OVC households, volunteers, partner representatives, donors, and website visitors.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                2. Information We Collect
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                We collect personal information solely for legitimate non-profit, humanitarian, and operational purposes:
              </p>
              <ul className="text-sm sm:text-base text-charcoal-700 space-y-2 list-disc pl-5">
                <li><strong>Contact Inquiries:</strong> Name, email address, phone number, and message contents submitted through our contact forms.</li>
                <li><strong>Volunteer Applications:</strong> Full legal name, contact details, residence county, interest areas, and availability submitted through the volunteer portal.</li>
                <li><strong>Partnership Proposals:</strong> Institution name, designated contact person, official email, telephone, and collaborative focus areas.</li>
                <li><strong>Beneficiary Field Records:</strong> Strictly held within secure, confidential offline/encrypted MEAL databases with informed consent. We never publish full identifying records of vulnerable beneficiaries on public websites.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                3. How We Use Collected Data
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                Information collected is utilized strictly to:
              </p>
              <ul className="text-sm sm:text-base text-charcoal-700 space-y-2 list-disc pl-5">
                <li>Respond promptly to public inquiries and case notifications.</li>
                <li>Evaluate and onboard ward-based volunteer applicants.</li>
                <li>Coordinate official institutional collaborations with public authorities and partners.</li>
                <li>Ensure compliance with Kenyan statutory regulations for community-based organizations.</li>
              </ul>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed mt-3">
                <strong>We do not sell, rent, trade, or monetize your personal information to third parties under any circumstances.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                4. Data Security & Retention
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                We implement appropriate administrative, technical, and physical safeguards designed to protect personal information against unauthorized access, loss, alteration, or misuse. Information is retained only as long as necessary to fulfill the operational purpose for which it was gathered.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900">
                5. Contacting the Secretariat Regarding Privacy
              </h2>
              <p className="text-sm sm:text-base text-charcoal-700 leading-relaxed">
                If you have questions regarding this policy, or wish to request the review or deletion of your submitted personal details, please contact our Secretariat:
              </p>
              <div className="not-prose mt-4 p-5 rounded-2xl bg-warm-50 border border-warm-200 text-sm text-charcoal-800 space-y-1">
                <p className="font-bold">Mwancha Senior Community Secretariat</p>
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
