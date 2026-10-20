import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { partnershipService } from '../services/partnershipService';
import { sponsorshipService, PartnerLogoItem } from '../services/sponsorshipService';
import { PartnershipRequest } from '../types';
import {
  Building2,
  Globe2,
  Handshake,
  CheckCircle2,
  Award,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Download
} from 'lucide-react';
import { SpamProtection, SpamProtectionData } from '../components/common/SpamProtection';

export const PartnerPage: React.FC = () => {
  const [formData, setFormData] = useState<PartnershipRequest>({
    organization: '',
    contactPerson: '',
    email: '',
    phone: '',
    organizationType: '',
    areaOfInterest: '',
    message: ''
  });

  const [approvedPartners, setApprovedPartners] = useState<PartnerLogoItem[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoadingPartners(true);
      try {
        const partners = await sponsorshipService.getApprovedSponsors();
        setApprovedPartners(partners || []);
      } catch (err) {
        console.error('Failed to load approved partner logos:', err);
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  const [spamData, setSpamData] = useState<SpamProtectionData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orgTypeOptions = [
    { value: 'County / National Government Department', label: 'County / National Government Department' },
    { value: 'International Non-Governmental Organization (INGO)', label: 'International Non-Governmental Organization (INGO)' },
    { value: 'Local NGO / Civil Society Organization', label: 'Local NGO / Civil Society Organization' },
    { value: 'Healthcare / Medical Institution', label: 'Healthcare / Medical Institution' },
    { value: 'Academic / Research Institution', label: 'Academic / Research Institution' },
    { value: 'Corporate / CSR Foundation', label: 'Corporate / CSR Foundation' },
    { value: 'Faith-Based Organization', label: 'Faith-Based Organization' }
  ];

  const interestOptions = [
    { value: 'Free Medical Outreach Camps & Healthcare Partnerships', label: 'Free Medical Outreach Camps & Healthcare Partnerships' },
    { value: 'Food & In-Kind Material Distributions', label: 'Food & In-Kind Material Distributions (Grains, Clothing, Aids)' },
    { value: 'Health Training Forums for Caregivers & CHPs', label: 'Health Training Forums for Caregivers & CHPs' },
    { value: 'Systems Strengthening & Policy Advocacy', label: 'Systems Strengthening & Policy Advocacy' },
    { value: 'Healthcare Screenings & Clinical Referrals', label: 'Healthcare Screenings & Clinical Referrals' },
    { value: 'Geriatric Research & Longitudinal MEAL Data', label: 'Geriatric Research & Longitudinal MEAL Data' },
    { value: 'Capacity Building & Volunteer Training', label: 'Capacity Building & Volunteer Training' },
    { value: 'Grant Funding & Institutional Co-sponsorship', label: 'Grant Funding & Institutional Co-sponsorship' }
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.organization.trim()) {
      errs.organization = 'Please enter your organization name.';
    }

    if (!formData.contactPerson.trim()) {
      errs.contactPerson = 'Please enter the primary contact person.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter an official contact email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Please provide an official contact phone number.';
    }

    if (!formData.organizationType) {
      errs.organizationType = 'Please select your organization type.';
    }

    if (!formData.areaOfInterest) {
      errs.areaOfInterest = 'Please indicate your collaborative area of interest.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide a brief summary of your proposed partnership or inquiry.';
    } else if (formData.message.trim().length < 20) {
      errs.message = 'Please write at least 20 characters describing the partnership opportunity.';
    }

    if (!spamData?.challengeAnswer?.trim()) {
      errs.challengeAnswer = 'Please solve the anti-spam question to confirm you are human.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        ...(spamData || {})
      };
      const response = await partnershipService.submitPartnershipRequest(payload);
      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          organization: '',
          contactPerson: '',
          email: '',
          phone: '',
          organizationType: '',
          areaOfInterest: '',
          message: ''
        });
        setErrors({});
      } else {
        setErrorMessage(response.message || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Unable to connect to the partnership service. Please try again later or reach out directly to mwanchaseniorcommunity@gmail.com.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Get Involved', href: '/get-involved' },
              { label: 'Partner With Us' }
            ]}
          />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Institutional Collaborations
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Partner With Mwancha Senior Community
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              We collaborate with public agencies, development partners, healthcare centers, academia, and civil society to build sustainable safety nets for older persons in Kenya.
            </p>
          </div>
        </Container>
      </section>

      {/* Strategic Corporate Sponsorship Packages */}
      <section className="text-left">
        <Container>
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 inline-block mb-3">
              Corporate Social Responsibility (CSR)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-charcoal-900 dark:text-white">
              Corporate Sponsorship & Strategic Tiers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-charcoal-600 dark:text-warm-300">
              Align your organization with Kenya's premier geriatric community initiative. Every sponsorship directly finances emergency nutrition, healthcare outreach camps, and dignified shelter restoration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bronze Tier */}
            <div className="rounded-3xl p-6 bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-800 shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    Bronze Partner
                  </span>
                  <Award className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <span className="text-xs text-charcoal-500 block">Annual Contribution</span>
                  <span className="text-2xl font-black font-display text-charcoal-900 dark:text-white">
                    KES 50,000
                  </span>
                </div>
                <ul className="text-xs text-charcoal-600 dark:text-warm-300 space-y-2 pt-2 border-t border-warm-100 dark:border-charcoal-800">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Official CSR Partnership Certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Corporate logo listed on MSC website</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Quarterly impact and outreach digests</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    areaOfInterest: 'Corporate / CSR Foundation',
                    message: 'We are interested in discussing the Bronze Corporate Sponsorship Package (KES 50,000 / year).'
                  }));
                  document.getElementById('dialogue-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-warm-100 hover:bg-forest-900 hover:text-white dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 font-bold text-xs transition-all text-center"
              >
                Enquire for Bronze
              </button>
            </div>

            {/* Silver Tier */}
            <div className="rounded-3xl p-6 bg-white dark:bg-charcoal-900 border-2 border-warm-300 dark:border-charcoal-700 shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    Silver Impact
                  </span>
                  <Award className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <span className="text-xs text-charcoal-500 block">Annual Contribution</span>
                  <span className="text-2xl font-black font-display text-charcoal-900 dark:text-white">
                    KES 150,000
                  </span>
                </div>
                <ul className="text-xs text-charcoal-600 dark:text-warm-300 space-y-2 pt-2 border-t border-warm-100 dark:border-charcoal-800">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>All Bronze benefits included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Logo in MSC Annual Publications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Co-branding at 1 Free Medical Camp</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    areaOfInterest: 'Corporate / CSR Foundation',
                    message: 'We are interested in discussing the Silver Impact Sponsorship Package (KES 150,000 / year).'
                  }));
                  document.getElementById('dialogue-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-warm-100 hover:bg-forest-900 hover:text-white dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 font-bold text-xs transition-all text-center"
              >
                Enquire for Silver
              </button>
            </div>

            {/* Gold Strategic Tier (Featured) */}
            <div className="rounded-3xl p-6 bg-gradient-to-b from-forest-900 to-forest-950 text-white border-2 border-amber-400 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-amber-400 text-charcoal-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Gold Strategic
                  </span>
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-xs text-forest-200 block">Annual Contribution</span>
                  <span className="text-2xl font-black font-display text-amber-300">
                    KES 500,000
                  </span>
                </div>
                <ul className="text-xs text-forest-100 space-y-2 pt-2 border-t border-forest-800">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>All Silver benefits included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>Exclusive naming rights for 2 medical camps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>Joint press release & executive recognition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>Dedicated CSR verification case study</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    areaOfInterest: 'Corporate / CSR Foundation',
                    message: 'We are interested in discussing the Gold Strategic Sponsorship Package (KES 500,000 / year).'
                  }));
                  document.getElementById('dialogue-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-charcoal-950 font-black text-xs transition-all text-center shadow-md"
              >
                Enquire for Gold
              </button>
            </div>

            {/* Platinum Tier */}
            <div className="rounded-3xl p-6 bg-white dark:bg-charcoal-900 border-2 border-warm-300 dark:border-charcoal-700 shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                    Platinum Benefactor
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-xs text-charcoal-500 block">Annual Contribution</span>
                  <span className="text-2xl font-black font-display text-charcoal-900 dark:text-white">
                    KES 1,000,000+
                  </span>
                </div>
                <ul className="text-xs text-charcoal-600 dark:text-warm-300 space-y-2 pt-2 border-t border-warm-100 dark:border-charcoal-800">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Flagship Institutional Benefactor status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Permanent facility wing / vehicle naming rights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Keynote address at Annual Stakeholders Baraza</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    areaOfInterest: 'Corporate / CSR Foundation',
                    message: 'We are interested in discussing the Platinum Benefactor Sponsorship Package (KES 1,000,000+ / year).'
                  }));
                  document.getElementById('dialogue-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-6 w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all text-center"
              >
                Enquire for Platinum
              </button>
            </div>
          </div>

          {/* Approved Partners Logo Showcase */}
          {approvedPartners.length > 0 && (
            <div className="mt-16 p-8 rounded-3xl bg-warm-100/60 dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-charcoal-500 text-center mb-6">
                Recognized Corporate Sponsors & Institutional Allies
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-items-center">
                {approvedPartners.map((partner) => (
                  <div key={partner.id} className="flex flex-col items-center text-center p-3">
                    {partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.organizationName}
                        className="max-h-12 max-w-[120px] object-contain grayscale hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <span className="font-bold text-xs text-charcoal-700 dark:text-warm-200 font-display">
                        {partner.organizationName}
                      </span>
                    )}
                    <span className="text-[10px] text-charcoal-400 mt-1 uppercase font-semibold">
                      {partner.tier} Partner
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Main Content */}
      <section id="dialogue-form">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-forest-800">
                  <Handshake className="w-6 h-6 text-earth-600" />
                  <h3 className="text-xl font-bold font-display text-charcoal-900">
                    Why Partner With MSC?
                  </h3>
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed">
                  As an organization combining grassroots legitimacy with an expanding national mandate, MSC offers partners authentic community access, trained volunteer cadres, and verifiable field records.
                </p>
                <div className="space-y-3 pt-2 text-sm text-charcoal-700">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Direct grassroots outreach to 1,203+ documented households.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>40 ward-based volunteers ready for mobilization.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Transparent MEAL framework and accountable reporting.</span>
                  </div>
                </div>
              </div>

              <div className="bg-forest-900 text-white p-7 rounded-3xl space-y-3">
                <span className="text-xs uppercase font-bold tracking-wider text-earth-300">
                  Official Inquiries Desk
                </span>
                <h4 className="text-lg font-bold font-display">
                  Mwancha Senior Community Secretariat
                </h4>
                <p className="text-xs sm:text-sm text-forest-100 leading-relaxed">
                  Mwancha House - Ekerenyo<br />
                  Ekerenyo-Obwari-Magwagwa Road, Nyamira North<br />
                  P.O. Box 162-40506 Ekerenyo-Nyamira, Kenya<br />
                  Email:{' '}
                  <a href="mailto:mwanchaseniorcommunity@gmail.com" className="underline underline-offset-2">
                    mwanchaseniorcommunity@gmail.com
                  </a>
                </p>
              </div>

              {/* In-Kind Giving Callout */}
              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 text-left space-y-2.5">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-800">
                  In-Kind Giving Opportunity
                </span>
                <h4 className="text-base font-bold text-amber-950">
                  Donating Food Staples or Supplies?
                </h4>
                <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                  We accept grains, warm fleece blankets, clothing, wheelchairs, and shelter repair materials. Drop-offs are received at Mwancha House in Ekerenyo.
                </p>
                <div className="pt-1">
                  <a
                    href="/donate"
                    className="inline-flex items-center text-xs font-bold text-amber-900 underline underline-offset-4 hover:text-amber-700"
                  >
                    Go to Food & Material Donation Form &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-card">
                <h2 className="text-2xl font-bold font-display text-charcoal-900 mb-2">
                  Partnership Dialogue Request
                </h2>
                <p className="text-sm text-charcoal-600 mb-6">
                  Submit the details of your institution to initiate formal discussions with our Executive Directorate.
                </p>

                {successMessage && (
                  <div className="mb-6">
                    <Alert
                      type="success"
                      title="Partnership Inquiry Received"
                      message={successMessage}
                      onClose={() => setSuccessMessage(null)}
                    />
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-6">
                    <Alert
                      type="error"
                      title="Submission Error"
                      message={errorMessage}
                      onClose={() => setErrorMessage(null)}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <Input
                    id="organization"
                    label="Organization / Institution Name"
                    required
                    placeholder="e.g. County Department of Health Services / NGO Name"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    error={errors.organization}
                  />

                  <Input
                    id="contactPerson"
                    label="Lead Contact Person & Title"
                    required
                    placeholder="e.g. Dr. Daniel Mokaya, Director of Community Health"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    error={errors.contactPerson}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      id="email"
                      type="email"
                      label="Official Email Address"
                      required
                      placeholder="e.g. partnerships@institution.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                    />

                    <Input
                      id="phone"
                      type="tel"
                      label="Contact Telephone"
                      required
                      placeholder="e.g. +254 700 000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      error={errors.phone}
                    />
                  </div>

                  <Select
                    id="organizationType"
                    label="Type of Organization"
                    required
                    options={orgTypeOptions}
                    placeholder="Select organization category"
                    value={formData.organizationType}
                    onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                    error={errors.organizationType}
                  />

                  <Select
                    id="areaOfInterest"
                    label="Primary Strategic Alignment"
                    required
                    options={interestOptions}
                    placeholder="Select focus area"
                    value={formData.areaOfInterest}
                    onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                    error={errors.areaOfInterest}
                  />

                  <Textarea
                    id="message"
                    label="Partnership Concept / Objectives"
                    required
                    rows={4}
                    placeholder="Outline your organization's mission and how you envision collaborating with Mwancha Senior Community..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    error={errors.message}
                  />

                  {/* Anti-Spam Security Challenge & Honeypot */}
                  <SpamProtection
                    onChange={setSpamData}
                    error={errors.challengeAnswer}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full font-bold"
                    >
                      {loading ? 'Submitting Proposal...' : 'Submit Partnership Request'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
