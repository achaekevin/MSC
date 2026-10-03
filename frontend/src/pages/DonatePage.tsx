import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { donationService } from '../services/donationService';
import { DonationMethod } from '../types';
import { Heart, Smartphone, Landmark, CreditCard, ShieldCheck, Mail, AlertTriangle } from 'lucide-react';
import { MSC_ORGANIZATION } from '../constants';
import { ContentStatusBadge } from '../components/common/ContentStatusBadge';

export const DonatePage: React.FC = () => {
  const [methods, setMethods] = useState<DonationMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    donationService.getDonationMethods().then((data) => {
      if (isMounted) {
        setMethods(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getMethodIcon = (type: DonationMethod['type']) => {
    switch (type) {
      case 'mpesa':
        return <Smartphone className="w-6 h-6 text-emerald-700" />;
      case 'bank':
        return <Landmark className="w-6 h-6 text-forest-800" />;
      case 'online':
        return <CreditCard className="w-6 h-6 text-earth-700" />;
      default:
        return <Heart className="w-6 h-6 text-forest-800" />;
    }
  };

  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Support Our Work' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-earth-700 uppercase tracking-wider bg-earth-100 px-3 py-1 rounded-full border border-earth-300 inline-block mb-3">
              Compassionate Giving
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Support Senior Dignity & Care
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Every financial contribution directly funds emergency nutritional baskets, shelter weatherization, medical clinic referrals, and protective advocacy for vulnerable elders across Kenya.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Donation Channels */}
      <section>
        <Container>
          {/* Transparency Callout Banner */}
          <div className="mb-10 p-6 rounded-3xl bg-amber-50 border border-amber-200 text-left max-w-4xl mx-auto flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-amber-950 leading-relaxed">
              <h4 className="font-bold text-sm sm:text-base">
                Official Account Accreditation Notice
              </h4>
              <p>
                In strict compliance with Kenyan non-profit financial regulations and our organizational principle of <strong>Integrity</strong>, Mwancha Senior Community does not display placeholder or unverified personal banking numbers.
              </p>
              <p>
                Official MSC corporate M-Pesa Paybill numbers and institutional bank coordinates are undergoing client verification and will be published directly upon board sign-off.
              </p>
            </div>
          </div>

          {/* Donation Methods Cards (Architected for Client Credentials) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {methods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-3xl p-8 border border-warm-200 shadow-card flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-warm-100 flex items-center justify-center">
                      {getMethodIcon(method.type)}
                    </div>
                    {method.metadata && (
                      <ContentStatusBadge metadata={method.metadata} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display text-charcoal-900 mb-2">
                    {method.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-6">
                    {method.instructions}
                  </p>
                </div>

                <div className="pt-4 border-t border-warm-100">
                  <div className="p-3 rounded-xl bg-warm-50 border border-warm-200 text-xs text-charcoal-600 text-center font-medium">
                    {method.statusMessage || 'Pending official credential attachment'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Secretariat Coordination Option */}
          <div className="mt-14 max-w-3xl mx-auto bg-forest-900 text-white p-8 sm:p-10 rounded-3xl text-left shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-earth-300" />
              <h3 className="text-xl font-bold font-display text-white">
                Inquire Directly With Our Fiduciary Secretariat
              </h3>
            </div>
            <p className="text-sm sm:text-base text-forest-100 leading-relaxed">
              If you or your foundation wish to make an immediate earmarked grant, in-kind contribution (assistive mobility devices, adult nutritional supplements, clothing), or Wire transfer, please contact our Board Treasurer directly via:
            </p>
            <div className="pt-2 text-base font-bold text-earth-300">
              <a
                href={`mailto:${MSC_ORGANIZATION.email}?subject=Donation%20Inquiry%20-%20Mwancha%20Senior%20Community`}
                className="underline underline-offset-4 hover:text-earth-200 break-all"
              >
                {MSC_ORGANIZATION.email}
              </a>
            </div>
            <p className="text-xs text-forest-300 italic pt-2">
              Official written acknowledgements and receipts are issued by the Secretariat for all contributions.
            </p>
          </div>
        </Container>
      </section>

      {/* Stewardship Principles */}
      <section className="bg-warm-100/60 py-16 border-y border-warm-200">
        <Container>
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <SectionHeading
              centered
              badge="Financial Stewardship"
              title="How Your Donation Is Managed"
              subtitle="We honor the sacred trust placed in our organization by beneficiaries, community members, and donors."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-warm-200">
                <h4 className="font-bold text-charcoal-900 text-base mb-1 font-display">100% Accountable</h4>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Every disbursement is documented through our MEAL longitudinal audit registers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-warm-200">
                <h4 className="font-bold text-charcoal-900 text-base mb-1 font-display">Direct Beneficiary Aid</h4>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Funds prioritize emergency food parcels, urgent medication, and weatherized shelters.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-warm-200">
                <h4 className="font-bold text-charcoal-900 text-base mb-1 font-display">Zero Wastage</h4>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Grassroots volunteer network ensures resources reach verified households directly.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
