import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { volunteerService } from '../services/volunteerService';
import { VolunteerApplication } from '../types';
import { CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';

export const VolunteerPage: React.FC = () => {
  const [formData, setFormData] = useState<VolunteerApplication>({
    fullName: '',
    email: '',
    phone: '',
    county: 'Nyamira County',
    areaOfInterest: '',
    availability: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const interestOptions = [
    { value: 'Case Management & Home Visits', label: 'Case Management & Home Visits' },
    { value: 'Psychosocial Support & Counseling', label: 'Psychosocial Support & Counseling' },
    { value: 'Advocacy & Community Sensitization', label: 'Advocacy & Community Sensitization' },
    { value: 'Healthcare Escort & Screening Aid', label: 'Healthcare Escort & Screening Aid' },
    { value: 'MEAL & Field Data Collection', label: 'MEAL & Field Data Collection' },
    { value: 'Administrative & Logistical Support', label: 'Administrative & Logistical Support' }
  ];

  const availabilityOptions = [
    { value: 'Full-time (5 days / week)', label: 'Full-time (5 days / week)' },
    { value: 'Part-time (2-3 days / week)', label: 'Part-time (2-3 days / week)' },
    { value: 'Weekends only', label: 'Weekends only' },
    { value: 'Flexible / On-call for community barazas', label: 'Flexible / On-call for community barazas' }
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your phone number.';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/[\s-]/g, '')) && formData.phone.length < 9) {
      errs.phone = 'Please enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678).';
    }

    if (!formData.county.trim()) {
      errs.county = 'Please indicate your current county of residence.';
    }

    if (!formData.areaOfInterest) {
      errs.areaOfInterest = 'Please select your preferred area of interest.';
    }

    if (!formData.availability) {
      errs.availability = 'Please specify your weekly availability.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide a brief statement on why you want to support older persons.';
    } else if (formData.message.trim().length < 15) {
      errs.message = 'Please write at least 15 characters describing your motivation.';
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
      const response = await volunteerService.submitApplication(formData);
      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          county: 'Nyamira County',
          areaOfInterest: '',
          availability: '',
          message: ''
        });
        setErrors({});
      } else {
        setErrorMessage(response.message || 'Submission failed. Please try again.');
      }
    } catch {
      setErrorMessage('Unable to connect to the application service. Please check your internet connection or email mwachahomeforelderly@gmail.com directly.');
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
              { label: 'Volunteer Application' }
            ]}
          />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Grassroots Volunteer Corps
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Volunteer With Mwancha Senior Community
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Join our network of 40 active ward-based volunteers. Dedicate your skills and compassion to defending elderly dignity, assisting isolated seniors, and reporting welfare cases.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content & Form */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            {/* Left Column: Context & Guidelines */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold font-display text-charcoal-900">
                  What Volunteers Do
                </h3>
                <ul className="space-y-3 text-sm text-charcoal-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-1" />
                    <span>Conduct regular home-based check-ins on frail and bedridden seniors.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-1" />
                    <span>Distribute emergency nutrition rations and shelter weatherproofing supplies.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-1" />
                    <span>Facilitate healthcare clinic referrals and accompany elders to medical screenings.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-1" />
                    <span>Report cases of financial, physical, or psychological elder abuse to local leadership.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-forest-900 text-warm-50 space-y-3">
                <div className="flex items-center gap-2 text-earth-300 font-bold text-sm uppercase tracking-wide">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Safeguarding Commitment</span>
                </div>
                <p className="text-xs sm:text-sm text-forest-100 leading-relaxed">
                  All MSC volunteers undergo orientation on ethical elder care, non-discrimination, confidentiality, and anti-abuse policies before engaging with beneficiary homes.
                </p>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-card">
                <h2 className="text-2xl font-bold font-display text-charcoal-900 mb-2">
                  Volunteer Application Form
                </h2>
                <p className="text-sm text-charcoal-600 mb-6">
                  Please complete the form below. Our Volunteer Coordination Desk will review your application and contact you.
                </p>

                {successMessage && (
                  <div className="mb-6">
                    <Alert
                      type="success"
                      title="Application Received"
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
                    id="fullName"
                    label="Full Legal Name"
                    required
                    placeholder="e.g. Grace Kerubo Nyaboke"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    error={errors.fullName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      id="email"
                      type="email"
                      label="Email Address"
                      required
                      placeholder="e.g. grace@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                    />

                    <Input
                      id="phone"
                      type="tel"
                      label="Phone Number (M-Pesa / Calls)"
                      required
                      placeholder="e.g. 0712345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      error={errors.phone}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      id="county"
                      label="County of Residence"
                      required
                      placeholder="e.g. Nyamira County"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      error={errors.county}
                    />

                    <Select
                      id="availability"
                      label="Your Availability"
                      required
                      options={availabilityOptions}
                      placeholder="Select availability"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      error={errors.availability}
                    />
                  </div>

                  <Select
                    id="areaOfInterest"
                    label="Primary Area of Interest"
                    required
                    options={interestOptions}
                    placeholder="Select an intervention area"
                    value={formData.areaOfInterest}
                    onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                    error={errors.areaOfInterest}
                  />

                  <Textarea
                    id="message"
                    label="Motivation Statement"
                    required
                    rows={4}
                    placeholder="Briefly describe your background, skills, or why you are drawn to supporting senior citizens in your community..."
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
                      {loading ? 'Submitting Application...' : 'Submit Volunteer Application'}
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
