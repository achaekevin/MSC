import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';
import { donationService } from '../services/donationService';
import { DonationMethod, InKindDonationRequest } from '../types';
import {
  Heart,
  Smartphone,
  Landmark,
  CreditCard,
  Mail,
  AlertTriangle,
  Wheat,
  Shirt,
  Accessibility,
  Home,
  MapPin,
  CheckCircle2,
  Clock,
  PhoneCall,
  Sparkles,
  PackageCheck,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import { MSC_ORGANIZATION } from '../constants';
import { ContentStatusBadge } from '../components/common/ContentStatusBadge';
import { SpamProtection, SpamProtectionData } from '../components/common/SpamProtection';

export const DonatePage: React.FC = () => {
  const [methods, setMethods] = useState<DonationMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'inkind' | 'financial'>('inkind');

  // In-Kind Form State
  const [inKindForm, setInKindForm] = useState<InKindDonationRequest>({
    fullName: '',
    email: '',
    phone: '',
    donorType: 'Individual',
    donationCategory: 'Food & Nutritional Staples',
    itemDescription: '',
    estimatedQuantity: '',
    deliveryMethod: 'DROP_OFF_EKERENYO',
    pickupAddress: '',
    preferredDate: '',
    notes: '',
    consent: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [spamData, setSpamData] = useState<SpamProtectionData | null>(null);
  const [submittingInKind, setSubmittingInKind] = useState<boolean>(false);
  const [inKindSuccess, setInKindSuccess] = useState<{ message: string; ref?: string } | null>(null);
  const [inKindError, setInKindError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    donationService.getDonationMethods().then((data) => {
      if (isMounted) {
        setMethods(data);
        setLoadingMethods(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethodIcon = (type: DonationMethod['type']) => {
    switch (type) {
      case 'mpesa':
        return <Smartphone className="w-6 h-6 text-emerald-700" />;
      case 'bank':
        return <Landmark className="w-6 h-6 text-forest-800" />;
      case 'online':
        return <CreditCard className="w-6 h-6 text-earth-700" />;
      case 'other':
        return <HelpCircle className="w-6 h-6 text-purple-700" />;
      default:
        return <Heart className="w-6 h-6 text-forest-800" />;
    }
  };

  const handleInKindSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInKindSuccess(null);
    setInKindError(null);

    const errors: Record<string, string> = {};
    if (!inKindForm.fullName.trim()) errors.fullName = 'Please enter your full name or organization.';
    if (!inKindForm.email.trim() || !/^\S+@\S+\.\S+$/.test(inKindForm.email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!inKindForm.phone.trim() || inKindForm.phone.trim().length < 8) {
      errors.phone = 'Please provide a valid phone number for logistics coordination.';
    }
    if (!inKindForm.donationCategory) errors.donationCategory = 'Please select a donation category.';
    if (!inKindForm.itemDescription.trim() || inKindForm.itemDescription.trim().length < 5) {
      errors.itemDescription = 'Please describe the items you wish to donate (minimum 5 characters).';
    }
    if (inKindForm.deliveryMethod === 'FIELD_PICKUP_REQUEST' && !inKindForm.pickupAddress?.trim()) {
      errors.pickupAddress = 'Please provide the physical address/location for volunteer pickup.';
    }
    if (!spamData?.challengeAnswer?.trim()) {
      errors.challengeAnswer = 'Please solve the anti-spam question to confirm you are human.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setSubmittingInKind(true);
    try {
      const payload: any = {
        ...inKindForm,
        ...(spamData || {})
      };
      const res = await donationService.submitInKindDonation(payload);
      if (res.success) {
        setInKindSuccess({ message: res.message, ref: res.referenceNumber });
        setInKindForm({
          fullName: '',
          email: '',
          phone: '',
          donorType: 'Individual',
          donationCategory: 'Food & Nutritional Staples',
          itemDescription: '',
          estimatedQuantity: '',
          deliveryMethod: 'DROP_OFF_EKERENYO',
          pickupAddress: '',
          preferredDate: '',
          notes: '',
          consent: true
        });
      } else {
        setInKindError(res.message);
      }
    } catch (err: any) {
      setInKindError(err?.message || 'Failed to submit in-kind donation pledge. Please try again or reach out to us directly.');
    } finally {
      setSubmittingInKind(false);
    }
  };

  return (
    <div className="pb-20 space-y-16">
      {/* Header */}
      <section className="bg-warm-100/80 dark:bg-charcoal-900/80 border-b border-warm-200 dark:border-charcoal-800 py-12 transition-colors">
        <Container>
          <Breadcrumb items={[{ label: 'Support Our Work' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-earth-700 dark:text-amber-400 uppercase tracking-wider bg-earth-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-earth-300 dark:border-amber-700 inline-block mb-3">
              Compassionate Giving & In-Kind Relief
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 dark:text-white font-display">
              Support Senior Dignity & Care
            </h1>
            <p className="mt-4 text-base sm:text-lg text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
              We welcome financial support and <strong>generous in-kind contributions of staple food, clothing, bedding, mobility aids, and shelter materials</strong>. Every contribution directly reaches vulnerable, neglected, and bedridden elders across Kenya.
            </p>
          </div>

          {/* Navigation Toggle Tabs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('inkind')}
              className={`px-5 py-3 rounded-2xl text-sm sm:text-base font-bold transition-all flex items-center gap-2.5 shadow-xs ${
                activeTab === 'inkind'
                  ? 'bg-forest-900 text-white dark:bg-amber-400 dark:text-charcoal-950 shadow-md ring-2 ring-forest-600/50'
                  : 'bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 border border-warm-300 dark:border-charcoal-700 hover:bg-warm-50'
              }`}
            >
              <Wheat className="w-5 h-5 text-amber-500" />
              <span>Food & Donation Materials (In-Kind)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-950 font-black">
                Urgent Need
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('financial')}
              className={`px-5 py-3 rounded-2xl text-sm sm:text-base font-bold transition-all flex items-center gap-2.5 shadow-xs ${
                activeTab === 'financial'
                  ? 'bg-forest-900 text-white dark:bg-amber-400 dark:text-charcoal-950 shadow-md ring-2 ring-forest-600/50'
                  : 'bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 border border-warm-300 dark:border-charcoal-700 hover:bg-warm-50'
              }`}
            >
              <Smartphone className="w-5 h-5 text-emerald-500" />
              <span>Financial Channels & Bank Accounts</span>
            </button>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          TAB 1: FOOD & DONATION MATERIALS (IN-KIND GIVING)
          ========================================================================= */}
      {activeTab === 'inkind' && (
        <section>
          <Container>
            <div className="max-w-5xl mx-auto space-y-12">
              {/* Overview & Accepted Items Banner */}
              <div className="text-left space-y-3">
                <span className="text-xs font-black text-forest-800 dark:text-emerald-400 uppercase tracking-widest bg-forest-100 dark:bg-forest-900/60 px-3.5 py-1.5 rounded-full border border-forest-300 dark:border-forest-700 inline-block">
                  In-Kind Giving Guidelines
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white font-display">
                  We Warmly Accept Food & Material Donations
                </h2>
                <p className="text-sm sm:text-base text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                  Many vulnerable older persons under our care are bedridden, living alone, or caring for orphaned grandchildren. You can directly donate nutritious food supplies, warm clothing, assistive medical aids, and home weatherization materials.
                </p>
              </div>

              {/* 4 Accepted Material Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {/* 1. Food Staples */}
                <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-700">
                    <Wheat className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-charcoal-900 dark:text-white font-display mb-2">
                    Food & Nutritional Staples
                  </h3>
                  <ul className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 space-y-1.5 list-disc list-inside">
                    <li>Maize flour (Unga wa Mahindi)</li>
                    <li>Dry beans, peas & green grams</li>
                    <li>Rice & fortified porridge flour</li>
                    <li>Cooking oil, sugar & salt</li>
                    <li>Clean drinking water & storage</li>
                  </ul>
                </div>

                {/* 2. Warm Bedding & Clothing */}
                <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-700">
                    <Shirt className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-charcoal-900 dark:text-white font-display mb-2">
                    Warm Bedding & Clothing
                  </h3>
                  <ul className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 space-y-1.5 list-disc list-inside">
                    <li>Heavy blankets & fleece bedsheets</li>
                    <li>Sweaters, warm cardigans & shawls</li>
                    <li>Socks, scarves & warm beanies</li>
                    <li>Clean enclosed walking shoes</li>
                    <li>Mattresses & protective bedding</li>
                  </ul>
                </div>

                {/* 3. Mobility & Geriatric Aids */}
                <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-700">
                    <Accessibility className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-charcoal-900 dark:text-white font-display mb-2">
                    Mobility & Medical Devices
                  </h3>
                  <ul className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 space-y-1.5 list-disc list-inside">
                    <li>Walking sticks, canes & crutches</li>
                    <li>Manual & transport wheelchairs</li>
                    <li>Adult diapers & incontinence pads</li>
                    <li>BP monitors & glucometer strips</li>
                    <li>Reading glasses & magnifying aids</li>
                  </ul>
                </div>

                {/* 4. Shelter Weatherization */}
                <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-warm-200 dark:border-charcoal-700 shadow-card hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-warm-200 dark:bg-warm-800/60 text-forest-900 dark:text-amber-300 flex items-center justify-center mb-4 border border-warm-300 dark:border-charcoal-600">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-charcoal-900 dark:text-white font-display mb-2">
                    Shelter Weatherization
                  </h3>
                  <ul className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 space-y-1.5 list-disc list-inside">
                    <li>Corrugated iron sheets (Mabati)</li>
                    <li>Roofing nails & timber poles</li>
                    <li>Cement bags for floor repairs</li>
                    <li>Waterproof tarpaulins / sheeting</li>
                    <li>Secure door latches & window mesh</li>
                  </ul>
                </div>
              </div>

              {/* Physical Drop-off Details Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-forest-900 to-forest-950 text-white text-left shadow-lg border border-forest-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 text-earth-300 font-bold text-sm uppercase tracking-wide">
                    <MapPin className="w-5 h-5" />
                    <span>Physical Drop-off & Reception Center</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                    Mwancha House in Ekerenyo
                  </h3>
                  <p className="text-sm text-forest-100 leading-relaxed">
                    <strong>Road:</strong> Ekerenyo-Obwari-Magwagwa Road<br />
                    <strong>Location:</strong> Nyamira North, Nyamira County, Kenya<br />
                    <strong>Postal Address:</strong> P.O. Box 162-40506 Ekerenyo-Nyamira<br />
                    <strong>Operating Hours:</strong> Monday to Saturday, 8:00 AM to 5:00 PM
                  </p>
                  <p className="text-xs text-forest-300 italic pt-1">
                    * Need assistance with bulky items or field collection? Fill out the pledge form below and our 40 ward volunteers will coordinate pickup.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <a
                    href="tel:+254790629439"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-earth-600 hover:bg-earth-500 text-white font-bold text-sm shadow transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Call Logistics: +254 790 629439
                  </a>
                  <a
                    href={`mailto:mwanchacommunity.seniors@gmail.com?subject=In-Kind%20Donation%20Inquiry`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-sm border border-forest-600 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Email: mwanchacommunity.seniors@gmail.com
                  </a>
                </div>
              </div>

              {/* Functional In-Kind Pledge Form */}
              <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-10 border-2 border-warm-200 dark:border-charcoal-700 text-left shadow-card">
                <div className="mb-8">
                  <span className="text-xs font-black text-earth-700 dark:text-amber-400 uppercase tracking-widest bg-earth-100 dark:bg-amber-950/70 px-3 py-1 rounded-full border border-earth-300 dark:border-amber-700 inline-block mb-2">
                    Online Pledge Registration
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white font-display">
                    Register Your Food or Material Donation
                  </h3>
                  <p className="text-sm sm:text-base text-charcoal-600 dark:text-warm-300 mt-1">
                    Registering your pledge helps our logistics and community workforce prepare distribution routes and issue official receipt acknowledgments.
                  </p>
                </div>

                {inKindSuccess && (
                  <div className="mb-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 space-y-3">
                    <div className="flex items-center gap-2.5 font-extrabold text-lg text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span>Pledge Successfully Registered!</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      {inKindSuccess.message}
                    </p>
                    {inKindSuccess.ref && (
                      <div className="p-3 bg-white dark:bg-charcoal-900 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono text-sm font-bold text-emerald-900 dark:text-emerald-300 inline-block">
                        Tracking Reference: {inKindSuccess.ref}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInKindSuccess(null)}
                      >
                        Submit Another Pledge
                      </Button>
                    </div>
                  </div>
                )}

                {inKindError && (
                  <div className="mb-6">
                    <Alert type="error" title="Submission Error" message={inKindError} />
                  </div>
                )}

                {!inKindSuccess && (
                  <form onSubmit={handleInKindSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        id="fullName"
                        label="Your Full Name or Organization"
                        required
                        placeholder="e.g. Jane Kemunto or Kisii Rotary Club"
                        value={inKindForm.fullName}
                        onChange={(e) => setInKindForm({ ...inKindForm, fullName: e.target.value })}
                        error={formErrors.fullName}
                      />

                      <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        required
                        placeholder="e.g. donor@example.com"
                        value={inKindForm.email}
                        onChange={(e) => setInKindForm({ ...inKindForm, email: e.target.value })}
                        error={formErrors.email}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        id="phone"
                        label="Phone / WhatsApp Number"
                        required
                        placeholder="e.g. +254 700 000 000"
                        value={inKindForm.phone}
                        onChange={(e) => setInKindForm({ ...inKindForm, phone: e.target.value })}
                        error={formErrors.phone}
                      />

                      <Select
                        id="donorType"
                        label="Donor Profile / Type"
                        options={[
                          { value: 'Individual', label: 'Individual Donor / Well-wisher' },
                          { value: 'Corporate / Business CSR', label: 'Corporate / Business CSR' },
                          { value: 'Faith-Based / Church Group', label: 'Faith-Based / Church Organization' },
                          { value: 'Community / Self-Help Group', label: 'Community / Self-Help Group' },
                          { value: 'School / University', label: 'School / Academic Institution' }
                        ]}
                        value={inKindForm.donorType}
                        onChange={(e) => setInKindForm({ ...inKindForm, donorType: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        id="donationCategory"
                        label="Donation Material Category"
                        required
                        options={[
                          { value: 'Food & Nutritional Staples', label: 'Food & Nutritional Staples' },
                          { value: 'Warm Bedding & Clothing', label: 'Warm Bedding & Protective Clothing' },
                          { value: 'Mobility & Geriatric Assistive Devices', label: 'Mobility & Geriatric Assistive Devices' },
                          { value: 'Shelter Weatherization Materials', label: 'Shelter Weatherization Materials' },
                          { value: 'Other Essential Supplies', label: 'Other Essential Humanitarian Supplies' }
                        ]}
                        value={inKindForm.donationCategory}
                        onChange={(e) => setInKindForm({ ...inKindForm, donationCategory: e.target.value })}
                        error={formErrors.donationCategory}
                      />

                      <Input
                        id="estimatedQuantity"
                        label="Estimated Quantity / Volume"
                        placeholder="e.g. 5 bags of maize, 20 blankets, 2 wheelchairs"
                        value={inKindForm.estimatedQuantity}
                        onChange={(e) => setInKindForm({ ...inKindForm, estimatedQuantity: e.target.value })}
                      />
                    </div>

                    <Textarea
                      id="itemDescription"
                      label="Detailed Description of Donated Items"
                      required
                      rows={3}
                      placeholder="Please specify item brands, conditions (new/gently used), expiration dates (if food), packaging, etc."
                      value={inKindForm.itemDescription}
                      onChange={(e) => setInKindForm({ ...inKindForm, itemDescription: e.target.value })}
                      error={formErrors.itemDescription}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        id="deliveryMethod"
                        label="Handover / Delivery Method"
                        required
                        options={[
                          {
                            value: 'DROP_OFF_EKERENYO',
                            label: 'Drop-off at Mwancha House in Ekerenyo'
                          },
                          {
                            value: 'FIELD_PICKUP_REQUEST',
                            label: 'Request Volunteer Field Collection (Nyamira County)'
                          }
                        ]}
                        value={inKindForm.deliveryMethod}
                        onChange={(e) => setInKindForm({ ...inKindForm, deliveryMethod: e.target.value })}
                      />

                      <Input
                        id="preferredDate"
                        type="date"
                        label="Preferred Handover Date"
                        value={inKindForm.preferredDate}
                        onChange={(e) => setInKindForm({ ...inKindForm, preferredDate: e.target.value })}
                      />
                    </div>

                    {inKindForm.deliveryMethod === 'FIELD_PICKUP_REQUEST' && (
                      <Input
                        id="pickupAddress"
                        label="Pickup Physical Address / Ward / Landmark"
                        required
                        placeholder="e.g. Magwagwa market center, near the chief's office"
                        value={inKindForm.pickupAddress}
                        onChange={(e) => setInKindForm({ ...inKindForm, pickupAddress: e.target.value })}
                        error={formErrors.pickupAddress}
                      />
                    )}

                    <Textarea
                      id="notes"
                      label="Additional Notes or Handling Instructions (Optional)"
                      rows={2}
                      placeholder="Any specific instructions, accessibility notes, or message for the community team."
                      value={inKindForm.notes}
                      onChange={(e) => setInKindForm({ ...inKindForm, notes: e.target.value })}
                    />

                    <div className="flex items-start gap-3 pt-2">
                      <input
                        id="consent"
                        type="checkbox"
                        checked={inKindForm.consent}
                        onChange={(e) => setInKindForm({ ...inKindForm, consent: e.target.checked })}
                        className="w-5 h-5 rounded text-forest-700 border-warm-300 focus:ring-forest-600 mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="consent" className="text-xs sm:text-sm text-charcoal-700 dark:text-warm-300">
                        I confirm that these items are safe, hygienic, and non-expired. I consent to Mwancha Senior Community contacting me to finalize delivery and acknowledge receipt.
                      </label>
                    </div>

                    {/* Anti-Spam Security Challenge & Honeypot */}
                    <SpamProtection
                      onChange={setSpamData}
                      error={formErrors.challengeAnswer}
                    />

                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={submittingInKind || !inKindForm.consent}
                        className="w-full sm:w-auto font-black shadow-lg"
                      >
                        {submittingInKind ? 'Registering Pledge...' : 'Submit In-Kind Pledge'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* =========================================================================
          TAB 2: FINANCIAL DONATION CHANNELS
          ========================================================================= */}
      {activeTab === 'financial' && (
        <section>
          <Container>
            {/* Conditional Transparency Banner */}
            {methods.some((m) => m.isActive) ? (
              <div className="mb-10 p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-left max-w-4xl mx-auto flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed">
                  <h4 className="font-bold text-sm sm:text-base">
                    Official Verified Giving Channels
                  </h4>
                  <p>
                    Please find our active contribution coordinates below. Every gift directly supports food parcels, warm blankets, medical attention, and shelter restoration for seniors across Kenya.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-10 p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700 text-left max-w-4xl mx-auto flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
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
            )}

            {/* Donation Methods Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
              {methods.map((method) => {
                const provider = method.paymentProvider || method.type;
                const details = method.details || {};
                const isActive = method.isActive;

                return (
                  <div
                    key={method.id}
                    className={`bg-white dark:bg-charcoal-900 rounded-3xl p-8 border transition-all flex flex-col justify-between relative shadow-card ${
                      isActive
                        ? 'border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-500/20'
                        : 'border-warm-200 dark:border-charcoal-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-warm-100 dark:bg-charcoal-800 flex items-center justify-center">
                          {getMethodIcon(method.type)}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-500 dark:text-warm-400'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'OFFLINE'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold font-display text-charcoal-900 dark:text-white mb-2">
                        {method.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed mb-5">
                        {method.instructions}
                      </p>

                      {/* Dynamic Details when Active */}
                      {isActive && provider === 'mpesa' && (
                        <div className="space-y-2.5 my-4 p-3.5 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 text-xs">
                          {details.paybillNumber && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-700">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">
                                  Paybill Number
                                </span>
                                <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-white">
                                  {details.paybillNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(details.paybillNumber, `paybill-${method.id}`)}
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-xl hover:bg-warm-100 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 active:scale-95 transition-all"
                                title="Copy Paybill Number"
                                aria-label="Copy Paybill Number"
                              >
                                {copiedKey === `paybill-${method.id}` ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}

                          {details.tillNumber && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-700">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">
                                  Till Number
                                </span>
                                <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-white">
                                  {details.tillNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(details.tillNumber, `till-${method.id}`)}
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-xl hover:bg-warm-100 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 active:scale-95 transition-all"
                                title="Copy Till Number"
                                aria-label="Copy Till Number"
                              >
                                {copiedKey === `till-${method.id}` ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}

                          {details.mpesaPhoneNumber && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-700">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">
                                  M-Pesa Phone
                                </span>
                                <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-white">
                                  {details.mpesaPhoneNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(details.mpesaPhoneNumber, `phone-${method.id}`)}
                                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-2 rounded-xl hover:bg-warm-100 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 active:scale-95 transition-all"
                                title="Copy Phone Number"
                                aria-label="Copy Phone Number"
                              >
                                {copiedKey === `phone-${method.id}` ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}

                          {details.accountReference && (
                            <div className="text-[11px] text-charcoal-600 dark:text-warm-400 pt-1">
                              Account Reference: <strong className="text-charcoal-900 dark:text-white">{details.accountReference}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bank Details when Active */}
                      {isActive && provider === 'bank' && (
                        <div className="space-y-2 my-4 p-3.5 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 text-xs">
                          {details.bankName && (
                            <div className="flex justify-between">
                              <span className="text-charcoal-500 dark:text-warm-400">Bank:</span>
                              <strong className="text-charcoal-900 dark:text-white">{details.bankName}</strong>
                            </div>
                          )}
                          {details.accountName && (
                            <div className="flex justify-between">
                              <span className="text-charcoal-500 dark:text-warm-400">Account Name:</span>
                              <strong className="text-charcoal-900 dark:text-white">{details.accountName}</strong>
                            </div>
                          )}
                          {details.accountNumber && (
                            <div className="flex justify-between items-center pt-1 border-t border-warm-200 dark:border-charcoal-700">
                              <span className="text-charcoal-500 dark:text-warm-400">Account No:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono font-bold text-charcoal-900 dark:text-white">{details.accountNumber}</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(details.accountNumber, `acct-${method.id}`)}
                                  className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1.5 rounded-lg text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900 hover:bg-warm-100 dark:hover:bg-charcoal-700 active:scale-95 transition-all"
                                  title="Copy Account Number"
                                  aria-label="Copy Account Number"
                                >
                                  {copiedKey === `acct-${method.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                          {details.branch && (
                            <div className="flex justify-between">
                              <span className="text-charcoal-500 dark:text-warm-400">Branch:</span>
                              <span className="text-charcoal-800 dark:text-warm-200">{details.branch}</span>
                            </div>
                          )}
                          {details.swiftCode && (
                            <div className="flex justify-between items-center">
                              <span className="text-charcoal-500 dark:text-warm-400">SWIFT Code:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-charcoal-900 dark:text-white">{details.swiftCode}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(details.swiftCode, `swift-${method.id}`)}
                                  className="p-1 text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900"
                                  title="Copy SWIFT Code"
                                >
                                  {copiedKey === `swift-${method.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Other Details when Active */}
                      {isActive && provider === 'other' && (
                        <div className="my-4 p-3.5 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 text-xs space-y-2">
                          <p className="text-charcoal-700 dark:text-warm-200 leading-relaxed font-medium">
                            {details.clientApprovedInstructions || details.instructions || 'Client-approved payment instructions.'}
                          </p>
                          {details.notes && (
                            <p className="text-[11px] text-charcoal-500 dark:text-warm-400 italic">
                              {details.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-warm-100 dark:border-charcoal-800">
                      <div className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 text-xs text-charcoal-600 dark:text-warm-300 text-center font-medium">
                        {isActive
                          ? 'Official verified channel ready for contributions'
                          : method.statusMessage || 'Channel currently offline / under administrative review'}
                      </div>
                    </div>
                  </div>
                );
              })}
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
      )}

      {/* Stewardship Principles */}
      <section className="bg-warm-100/60 dark:bg-charcoal-900/60 py-16 border-y border-warm-200 dark:border-charcoal-800 transition-colors">
        <Container>
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <SectionHeading
              centered
              badge="Financial & Material Stewardship"
              title="How Your Donation Is Managed"
              subtitle="We honor the sacred trust placed in our organization by beneficiaries, community members, and donors."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-charcoal-900 p-6 rounded-2xl border border-warm-200 dark:border-charcoal-700">
                <h4 className="font-bold text-charcoal-900 dark:text-white text-base mb-1 font-display">100% Accountable</h4>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed">
                  Every financial and in-kind disbursement is documented through our MEAL longitudinal audit registers.
                </p>
              </div>

              <div className="bg-white dark:bg-charcoal-900 p-6 rounded-2xl border border-warm-200 dark:border-charcoal-700">
                <h4 className="font-bold text-charcoal-900 dark:text-white text-base mb-1 font-display">Direct Beneficiary Aid</h4>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed">
                  Resources prioritize emergency food parcels, warm blankets, urgent medication, and weatherized shelters.
                </p>
              </div>

              <div className="bg-white dark:bg-charcoal-900 p-6 rounded-2xl border border-warm-200 dark:border-charcoal-700">
                <h4 className="font-bold text-charcoal-900 dark:text-white text-base mb-1 font-display">Zero Wastage</h4>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 leading-relaxed">
                  Our grassroots network of 40 ward volunteers ensures supplies reach verified destitute households directly.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
