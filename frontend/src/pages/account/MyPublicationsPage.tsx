import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicationService, CustomerPurchasedItem } from '../../services/publicationService';
import { paymentService } from '../../services/paymentService';
import { Container } from '../../components/ui/Container';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/common/SEO';
import {
  BookOpen,
  Download,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
  Receipt
} from 'lucide-react';

export const MyPublicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || localStorage.getItem('msc_customer_email') || '';

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [activeEmail, setActiveEmail] = useState(initialEmail);
  const [library, setLibrary] = useState<CustomerPurchasedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerLibrary = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await publicationService.getCustomerLibrary(email.trim().toLowerCase());
      setLibrary(data || []);
      localStorage.setItem('msc_customer_email', email.trim().toLowerCase());
      setActiveEmail(email.trim().toLowerCase());
    } catch (err: any) {
      setError(err?.message || 'Unable to load customer library. Please check your email address.');
      setLibrary([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialEmail && initialEmail.includes('@')) {
      fetchCustomerLibrary(initialEmail);
    }
  }, [initialEmail, fetchCustomerLibrary]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setSearchParams({ email: emailInput.trim() });
    fetchCustomerLibrary(emailInput.trim());
  };

  const handleDownload = (item: CustomerPurchasedItem) => {
    const downloadUrl = publicationService.getDownloadUrl(item.publicationId, item.downloadToken, activeEmail);
    window.open(downloadUrl, '_blank');
  };

  const handleDownloadReceipt = async (refCode: string) => {
    try {
      await paymentService.downloadReceiptPdf(refCode);
    } catch (err: any) {
      alert(`Receipt download failed: ${err?.message || 'Please contact support.'}`);
    }
  };

  return (
    <div className="pb-20 space-y-12 text-left">
      <SEO
        title="My Purchased Publications & Digital Library"
        description="Access and download your purchased Mwancha Senior Community books, policy briefs, and research materials with your verified purchase license."
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950 text-white py-16 border-b border-forest-800 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Container className="relative z-10">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Publications', href: '/publications' },
              { label: 'My Purchased Library' }
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-800/80 text-amber-300 text-xs font-bold uppercase tracking-wider border border-forest-700/80 mb-3 shadow-xs">
                <ShoppingBag className="w-3.5 h-3.5" />
                Purchaser Access Portal
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white">
                My Digital Library
              </h1>
              <p className="mt-3 text-base text-forest-100/90 leading-relaxed font-medium">
                Enter the email address you used during your Lipa Na M-Pesa purchase to retrieve your licensed books, download tokens, and official purchase receipts.
              </p>
            </div>

            <Link
              to="/publications"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white font-bold text-xs border border-forest-700 transition-all shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Catalogue</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Lookup Card */}
      <Container>
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm max-w-3xl mx-auto -mt-8 relative z-20">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-wider text-charcoal-700 dark:text-warm-300">
              Lookup by Purchaser Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. purchaser@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find My Purchases</span>
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-500 font-semibold">{error}</p>
            )}
          </form>
        </div>

        {/* Results Area */}
        <div className="mt-12">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-charcoal-600 dark:text-warm-300">
                Retrieving your licensed publications...
              </p>
            </div>
          ) : searched && library.length === 0 ? (
            <div className="text-center py-20 bg-warm-50 dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 p-8 max-w-xl mx-auto space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-charcoal-400" />
              <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">
                No Purchases Found for {activeEmail}
              </h3>
              <p className="text-sm text-charcoal-600 dark:text-warm-300">
                We could not find any publications linked to this email address. Please make sure you entered the same email you provided when completing the Lipa Na M-Pesa prompt.
              </p>
              <div className="pt-2">
                <Button to="/publications" variant="primary" size="md">
                  Explore Publications Catalogue
                </Button>
              </div>
            </div>
          ) : library.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-warm-200 dark:border-charcoal-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-black text-charcoal-900 dark:text-white font-display">
                    {library.length} Licensed Publication{library.length === 1 ? '' : 's'} Available
                  </h2>
                </div>
                <span className="text-xs font-semibold text-charcoal-500">
                  Account: <strong>{activeEmail}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {library.map((item) => (
                  <div
                    key={item.purchaseId}
                    className="group bg-white dark:bg-charcoal-900 rounded-3xl border-2 border-warm-200 dark:border-charcoal-800 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden text-left"
                  >
                    <div>
                      {/* Cover Thumbnail */}
                      <div className="aspect-[16/10] bg-warm-100 dark:bg-charcoal-800 relative overflow-hidden border-b border-warm-200 dark:border-charcoal-800">
                        <img
                          src={item.coverImage || '/images/mwancha-facility-main.jpg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />

                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                            Active License
                          </span>
                        </div>

                        {item.mpesaReceipt && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-charcoal-950/80 text-amber-300 border border-white/20">
                              {item.mpesaReceipt}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs font-semibold">
                          <span>Purchased: {new Date(item.purchaseDate).toLocaleDateString('en-KE', { dateStyle: 'medium' })}</span>
                          <span>{item.downloadsUsed} / {item.maxDownloads} Downloads</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-black font-display text-charcoal-950 dark:text-white leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className="text-xs text-charcoal-500 dark:text-warm-300 font-semibold line-clamp-1 italic">
                            {item.subtitle}
                          </p>
                        )}

                        <div className="p-3 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-charcoal-500">Order Reference:</span>
                            <span className="font-mono font-bold text-charcoal-900 dark:text-white">{item.referenceCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-charcoal-500">Amount Paid:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              KES {item.pricePaid?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 pt-0 border-t border-warm-100 dark:border-charcoal-800/80 mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                          title="Download high-resolution official PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>

                        <Link
                          to={`/publications/${item.slug}`}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 text-charcoal-800 dark:text-warm-100 font-bold text-xs transition-all border border-warm-200 dark:border-charcoal-700"
                          title="Read in interactive online viewer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadReceipt(item.referenceCode)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-charcoal-600 dark:text-warm-300 hover:text-forest-800 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Download Official Purchase Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-charcoal-500 text-sm">
              Enter your purchase email address above to view your library.
            </div>
          )}
        </div>

        {/* Security & Support Callout */}
        <div className="mt-16 p-8 rounded-3xl bg-forest-50 dark:bg-charcoal-900 border border-forest-200 dark:border-charcoal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-forest-900 dark:text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Secure Digital Rights & Continuous Entitlement</span>
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-warm-300 max-w-2xl leading-relaxed">
              Every purchase through Safaricom Lipa Na M-Pesa is cryptographically linked to your email address and transaction reference. If you ever switch devices or lose your PDF download, simply return to this portal with your email to re-download your material.
            </p>
          </div>
          <a
            href="mailto:mwanchaseniorcommunity@gmail.com?subject=Customer%20Library%20Assistance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-charcoal-800 border border-warm-300 dark:border-charcoal-700 text-charcoal-800 dark:text-warm-100 text-xs font-bold hover:bg-warm-100 transition-colors whitespace-nowrap"
          >
            <Mail className="w-4 h-4 text-forest-700" />
            <span>Contact Support</span>
          </a>
        </div>
      </Container>
    </div>
  );
};

export default MyPublicationsPage;
