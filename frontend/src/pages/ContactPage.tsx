import React, { useState } from 'react';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { contactService } from '../services/contactService';
import { ContactMessage } from '../types';
import { MSC_ORGANIZATION } from '../constants';
import { Mail, MapPin, Clock, ShieldCheck, Phone, MessageCircle } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter a valid email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Please enter a subject for your inquiry.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
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
      const response = await contactService.submitContactMessage(formData);
      if (response.success) {
        setSuccessMessage(response.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setErrors({});
      } else {
        setErrorMessage(response.message || 'Unable to send message. Please try again.');
      }
    } catch {
      setErrorMessage('Could not deliver your message. Please write directly to mwachahomeforelderly@gmail.com.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 space-y-16">
      <SEO
        title="Contact Us & Secretariat"
        description="Contact Mwancha Senior Community (MSC). Mwancha House - Ekerenyo, Ekerenyo-Obwari-Magwagwa Road, Nyamira North. P.O. Box 162-40506 Ekerenyo-Nyamira, Kenya."
      />
      {/* Header */}
      <section className="bg-warm-100/80 border-b border-warm-200 py-12">
        <Container>
          <Breadcrumb items={[{ label: 'Contact Us' }]} />
          <div className="max-w-3xl text-left mt-4">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-3">
              Official Secretariat
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-charcoal-900 font-display">
              Contact Mwancha Senior Community
            </h1>
            <p className="mt-4 text-lg text-charcoal-700 leading-relaxed">
              Reach out to our leadership, program desks, or community coordination team. We welcome inquiries from families, partners, volunteers, and donors.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            {/* Left Column: Official Contact Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-display text-charcoal-900 mb-1">
                    Secretariat Headquarters
                  </h3>
                  <p className="text-sm font-semibold text-forest-800">
                    Mwancha House - Ekerenyo
                  </p>
                </div>

                <div className="space-y-4 text-sm text-charcoal-700">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-forest-700" />
                    </div>
                    <div>
                      <span className="font-bold text-charcoal-900 block mb-0.5">Physical Facility &amp; Road</span>
                      <span className="font-semibold text-charcoal-900 block">{MSC_ORGANIZATION.physicalFacility}</span>
                      <span className="text-charcoal-700 block text-xs mt-0.5">Road: {MSC_ORGANIZATION.road}</span>
                      <span className="block text-charcoal-500 text-xs mt-0.5">{MSC_ORGANIZATION.subCounty}, {MSC_ORGANIZATION.county}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-forest-700" />
                    </div>
                    <div>
                      <span className="font-bold text-charcoal-900 block mb-0.5">Official Postal Address</span>
                      <span>{MSC_ORGANIZATION.postalAddress}</span>
                      <span className="block text-charcoal-500 text-xs">{MSC_ORGANIZATION.country}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-5 h-5 text-forest-700" />
                    </div>
                    <div>
                      <span className="font-bold text-charcoal-900 block mb-0.5">Official Communication Emails</span>
                      <div className="space-y-1">
                        <div>
                          <span className="text-[11px] font-bold uppercase text-charcoal-400 block">Primary:</span>
                          <a
                            href={`mailto:${MSC_ORGANIZATION.email}`}
                            className="text-forest-800 hover:text-forest-950 underline underline-offset-2 break-all font-medium text-xs sm:text-sm"
                          >
                            {MSC_ORGANIZATION.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase text-charcoal-400 block">Secondary:</span>
                          <a
                            href={`mailto:${MSC_ORGANIZATION.secondaryEmail || 'mwanchacommunity.seniors@gmail.com'}`}
                            className="text-forest-800 hover:text-forest-950 underline underline-offset-2 break-all font-medium text-xs sm:text-sm"
                          >
                            {MSC_ORGANIZATION.secondaryEmailAddress || MSC_ORGANIZATION.secondaryEmail}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-5 h-5 text-forest-700" />
                    </div>
                    <div>
                      <span className="font-bold text-charcoal-900 block mb-0.5">Helpline & Direct Phone</span>
                      <a
                        href="tel:+254790629439"
                        className="text-forest-800 hover:text-forest-950 font-semibold underline underline-offset-2"
                      >
                        +254 790 629439
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-bold text-charcoal-900 block mb-0.5">Official WhatsApp Desk</span>
                      <p className="text-xs text-charcoal-600 mb-2">
                        Instant consultation, referral requests, and general elder welfare inquiries.
                      </p>
                      <a
                        href="https://wa.me/254790629439?text=Hello%20Mwancha%20Senior%20Community%2C%20I%20would%20like%20to%20inquire%20about%20your%20programs%20and%20support%20services."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Chat on WhatsApp (+254 790 629439)</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 text-forest-700" />
                    </div>
                    <div>
                      <span className="font-bold text-charcoal-900 block mb-0.5">Operational Desk Hours</span>
                      <span>Monday - Friday: 08:30 AM - 05:00 PM EAT</span>
                      <span className="block text-charcoal-500">Emergency case referrals accessible via ward volunteers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dignity & Privacy Notice */}
              <div className="p-6 rounded-3xl bg-forest-900 text-warm-50 space-y-2">
                <div className="flex items-center gap-2 text-earth-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confidential Elder Reporting</span>
                </div>
                <p className="text-xs sm:text-sm text-forest-100 leading-relaxed">
                  If you are reporting an urgent case of elder abuse, abandonment, or starvation in your locality, all identifying information is kept confidential in strict accordance with Kenyan child and elder safeguarding standards.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-warm-200 shadow-card">
                <h2 className="text-2xl font-bold font-display text-charcoal-900 mb-2">
                  Send a Direct Message
                </h2>
                <p className="text-sm text-charcoal-600 mb-6">
                  Fill in your inquiry details below. Our Secretariat reviews and responds to all legitimate communications.
                </p>

                {successMessage && (
                  <div className="mb-6">
                    <Alert
                      type="success"
                      title="Message Sent"
                      message={successMessage}
                      onClose={() => setSuccessMessage(null)}
                    />
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-6">
                    <Alert
                      type="error"
                      title="Delivery Problem"
                      message={errorMessage}
                      onClose={() => setErrorMessage(null)}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <Input
                    id="name"
                    label="Your Full Name"
                    required
                    placeholder="e.g. John Ombati"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      id="email"
                      type="email"
                      label="Email Address"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={errors.email}
                    />

                    <Input
                      id="phone"
                      type="tel"
                      label="Phone Number (Optional)"
                      placeholder="e.g. 0712345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      error={errors.phone}
                    />
                  </div>

                  <Input
                    id="subject"
                    label="Subject of Inquiry"
                    required
                    placeholder="e.g. Elderly Referral / Partnership Question / General Inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    error={errors.subject}
                  />

                  <Textarea
                    id="message"
                    label="Your Message"
                    required
                    rows={5}
                    placeholder="Please write your detailed message, question, or elder welfare notification here..."
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
                      {loading ? 'Sending Message...' : 'Send Message to MSC'}
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
