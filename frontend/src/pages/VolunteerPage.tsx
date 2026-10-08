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
import {
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  User,
  Clock,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Phone,
  Mail,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import { SpamProtection, SpamProtectionData } from '../components/common/SpamProtection';

interface ExtendedVolunteerData extends VolunteerApplication {
  subCounty?: string;
  consentDPA?: boolean;
  consentSafeguarding?: boolean;
}

export const VolunteerPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState<ExtendedVolunteerData>({
    fullName: '',
    email: '',
    phone: '',
    county: 'Nyamira County',
    subCounty: 'Manga Sub-County',
    areaOfInterest: '',
    availability: '',
    message: '',
    consentDPA: false,
    consentSafeguarding: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [spamData, setSpamData] = useState<SpamProtectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submissionRef, setSubmissionRef] = useState<string>('');
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

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your full legal name.';
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
      errs.phone = 'Please enter a valid phone number (e.g. 0712345678 or +254712345678).';
    }

    if (!formData.county.trim()) {
      errs.county = 'Please indicate your current county of residence.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};

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

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.consentDPA) {
      errs.consentDPA = 'You must consent to data processing under the Kenya Data Protection Act 2019 to apply.';
    }

    if (!formData.consentSafeguarding) {
      errs.consentSafeguarding = 'You must confirm agreement to the MSC Elder Safeguarding and Dignity pledge.';
    }

    if (!spamData?.challengeAnswer?.trim()) {
      errs.challengeAnswer = 'Please solve the anti-spam question to confirm you are human.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateStep3()) return;

    setLoading(true);
    try {
      const cleanSubmission: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        county: formData.subCounty ? `${formData.county} (${formData.subCounty})` : formData.county,
        areaOfInterest: formData.areaOfInterest,
        availability: formData.availability,
        message: formData.message.trim(),
        ...(spamData || {})
      };

      const response = await volunteerService.submitApplication(cleanSubmission);
      if (response.success) {
        const refId = `MSC-VOL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmissionRef(refId);
        setCurrentStep(4);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else {
        setErrorMessage(response.message || 'Submission failed. Please check your details and try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Unable to connect to the volunteer application service. Please verify your connection or email info@mwancha.org directly.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      county: 'Nyamira County',
      subCounty: 'Manga Sub-County',
      areaOfInterest: '',
      availability: '',
      message: '',
      consentDPA: false,
      consentSafeguarding: false
    });
    setErrors({});
    setSubmissionRef('');
    setCurrentStep(1);
  };

  return (
    <div className="pb-20 space-y-12">
      {/* Page Header */}
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
              Join our network of active ward-based volunteers across Nyamira and Kisii. Dedicate your skills and compassion to defending elderly dignity, home check-ins, and community outreach.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content & Form Wizard */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
            {/* Left Column: Guidelines & Safeguarding Notice */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-warm-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold font-display text-charcoal-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-forest-800" />
                  <span>What Volunteers Do</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-charcoal-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Conduct regular home-based check-ins on frail and bedridden seniors.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Distribute emergency nutrition supplies and home winterization aid.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Facilitate hospital clinic escorts and mobile health screening camps.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
                    <span>Report cases of elder abuse, abandonment, or dispossession to local authorities.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl bg-forest-900 text-warm-50 space-y-3">
                <div className="flex items-center gap-2 text-earth-300 font-bold text-sm uppercase tracking-wide">
                  <ShieldCheck className="w-5 h-5 text-earth-400" />
                  <span>Safeguarding Commitment</span>
                </div>
                <p className="text-xs text-forest-100 leading-relaxed">
                  All MSC volunteers receive comprehensive training on elder dignity, ethical boundaries, non-discrimination, and zero-tolerance for abuse or exploitation.
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-forest-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Protected under Kenya Data Protection Act 2019</span>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Step Wizard Card */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-warm-200 shadow-card">
                {/* Step Progress Header */}
                <div className="mb-8 pb-6 border-b border-warm-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
                        Step {currentStep} of 4
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900 mt-2">
                        {currentStep === 1 && '1. Personal Information'}
                        {currentStep === 2 && '2. Role Interest & Availability'}
                        {currentStep === 3 && '3. Review & Consent Agreement'}
                        {currentStep === 4 && '4. Application Confirmed'}
                      </h2>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentStep >= step ? 'bg-forest-800' : 'bg-warm-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

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

                {/* STEP 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <p className="text-sm text-charcoal-600">
                      Please enter your contact details. We use this information to reach out for your volunteer intake interview.
                    </p>

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

                      <Input
                        id="subCounty"
                        label="Sub-County / Ward"
                        placeholder="e.g. Manga Sub-County / Kemera Ward"
                        value={formData.subCounty || ''}
                        onChange={(e) => setFormData({ ...formData, subCounty: e.target.value })}
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleNext}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-8"
                      >
                        <span>Continue to Role &amp; Availability</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Role Interest & Availability */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <p className="text-sm text-charcoal-600">
                      Tell us how you would like to participate and how many hours you can commit.
                    </p>

                    <Select
                      id="areaOfInterest"
                      label="Primary Area of Volunteer Interest"
                      required
                      options={interestOptions}
                      placeholder="Select an intervention area"
                      value={formData.areaOfInterest}
                      onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                      error={errors.areaOfInterest}
                    />

                    <Select
                      id="availability"
                      label="Your Weekly Availability"
                      required
                      options={availabilityOptions}
                      placeholder="Select weekly availability"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      error={errors.availability}
                    />

                    <Textarea
                      id="message"
                      label="Statement of Motivation &amp; Skills"
                      required
                      rows={4}
                      placeholder="Share a short note on your motivation to serve older persons, relevant skills, languages spoken, or prior community experience..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      error={errors.message}
                    />

                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleNext}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-8 shadow-md"
                      >
                        <span>Review Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Review & Consent Agreement */}
                {currentStep === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-sm text-charcoal-600">
                      Please review your application summary below and confirm your ethical commitment.
                    </p>

                    {/* Summary Card */}
                    <div className="bg-warm-50 border border-warm-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-warm-200 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
                          Applicant Summary
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-xs font-bold text-forest-800 hover:text-forest-950 underline"
                        >
                          Edit Details
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div>
                          <span className="text-charcoal-500 block">Full Name:</span>
                          <span className="font-semibold text-charcoal-900">{formData.fullName}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-500 block">Contact:</span>
                          <span className="font-semibold text-charcoal-900">
                            {formData.phone} | {formData.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-charcoal-500 block">Location:</span>
                          <span className="font-semibold text-charcoal-900">
                            {formData.county} {formData.subCounty ? `(${formData.subCounty})` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-charcoal-500 block">Commitment:</span>
                          <span className="font-semibold text-charcoal-900">{formData.availability}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-charcoal-500 block">Selected Area:</span>
                          <span className="font-semibold text-charcoal-900">{formData.areaOfInterest}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-charcoal-500 block">Motivation Statement:</span>
                          <p className="text-charcoal-800 italic bg-white p-2.5 rounded-lg border border-warm-200 mt-1">
                            "{formData.message}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Consent Checkboxes */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-warm-200 bg-white hover:bg-warm-50/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.consentDPA}
                          onChange={(e) => setFormData({ ...formData, consentDPA: e.target.checked })}
                          className="mt-1 w-4 h-4 text-forest-800 rounded border-gray-300 focus:ring-forest-800"
                        />
                        <span className="text-xs text-charcoal-700 leading-relaxed">
                          <strong className="text-charcoal-900">Data Protection Consent: </strong>
                          I consent to Mwancha Senior Community storing and processing my personal information for volunteer recruitment and community placement under the Kenya Data Protection Act 2019.
                        </span>
                      </label>
                      {errors.consentDPA && (
                        <p className="text-xs text-rose-600 font-medium pl-1">{errors.consentDPA}</p>
                      )}

                      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-warm-200 bg-white hover:bg-warm-50/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.consentSafeguarding}
                          onChange={(e) => setFormData({ ...formData, consentSafeguarding: e.target.checked })}
                          className="mt-1 w-4 h-4 text-forest-800 rounded border-gray-300 focus:ring-forest-800"
                        />
                        <span className="text-xs text-charcoal-700 leading-relaxed">
                          <strong className="text-charcoal-900">Elder Dignity &amp; Safeguarding Pledge: </strong>
                          I pledge to uphold MSC's strict code of ethics, treating all elderly persons with absolute dignity, respecting family privacy, and reporting any safeguarding concerns.
                        </span>
                      </label>
                      {errors.consentSafeguarding && (
                        <p className="text-xs text-rose-600 font-medium pl-1">{errors.consentSafeguarding}</p>
                      )}
                    </div>

                    {/* Anti-Spam Security Challenge */}
                    <div className="pt-2">
                      <SpamProtection
                        onChange={setSpamData}
                        error={errors.challengeAnswer}
                      />
                    </div>

                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleBack}
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold px-8 shadow-md"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>{loading ? 'Submitting Application...' : 'Confirm & Submit Application'}</span>
                      </Button>
                    </div>
                  </form>
                )}

                {/* STEP 4: Success & Confirmation */}
                {currentStep === 4 && (
                  <div className="text-center py-6 space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
                        Application Ref: {submissionRef}
                      </span>
                      <h3 className="text-2xl font-bold font-display text-charcoal-900">
                        Asante Sana! Application Successfully Received
                      </h3>
                      <p className="text-sm text-charcoal-600 max-w-md mx-auto">
                        Thank you, <strong className="text-charcoal-900">{formData.fullName}</strong>. Your commitment to supporting senior citizens in {formData.county} is deeply appreciated.
                      </p>
                    </div>

                    <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6 text-left max-w-lg mx-auto space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-forest-800" />
                        <span>What Happens Next</span>
                      </h4>
                      <ol className="text-xs text-charcoal-700 space-y-2.5 list-decimal pl-4 leading-relaxed">
                        <li>
                          <strong>Desk Review:</strong> Our volunteer coordination team will review your application within 3 to 5 working days.
                        </li>
                        <li>
                          <strong>Telephone Orientation:</strong> We will contact you at <code>{formData.phone}</code> for a brief discussion about available ward initiatives.
                        </li>
                        <li>
                          <strong>Induction &amp; Placement:</strong> You will receive orientation materials on elder safeguarding before your first field activity.
                        </li>
                      </ol>
                    </div>

                    <div className="pt-4 flex flex-wrap justify-center gap-4">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleReset}
                        className="font-bold"
                      >
                        Submit Another Application
                      </Button>
                      <Button
                        to="/get-involved"
                        variant="outline"
                      >
                        Explore Other Ways to Help
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default VolunteerPage;
