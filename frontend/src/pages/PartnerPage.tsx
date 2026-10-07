import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { partnershipService } from '../services/partnershipService';
import { PartnershipRequest } from '../types';
import { Building2, Globe2, Handshake, CheckCircle2 } from 'lucide-react';

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
      const response = await partnershipService.submitPartnershipRequest(formData);
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
    } catch {
      setErrorMessage('Unable to connect to the partnership service. Please try again later or reach out directly to mwachahomeforelderly@gmail.com.');
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

      {/* Main Content */}
      <section>
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
                  <a href="mailto:mwachahomeforelderly@gmail.com" className="underline underline-offset-2">
                    mwachahomeforelderly@gmail.com
                  </a>{' '}
                  /{' '}
                  <a href="mailto:mwanchacommunity.seniors@gmail.com" className="underline underline-offset-2">
                    mwanchacommunity.seniors.com
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
                  We accept grains, warm fleece blankets, clothing, wheelchairs, and shelter repair materials. Drop-offs are received at Mwancha House – Ekerenyo.
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
