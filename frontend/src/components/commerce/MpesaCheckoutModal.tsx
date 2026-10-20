import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Download,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { paymentService, PaymentStatusResponse } from '../../services/paymentService';
import { publicationService } from '../../services/publicationService';

interface MpesaCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'PUBLICATION' | 'DONATION';
  itemId?: string;
  itemTitle: string;
  itemSubtitle?: string;
  coverImage?: string;
  amount: number;
  currency?: string;
  onSuccess?: (result: PaymentStatusResponse) => void;
}

export const MpesaCheckoutModal: React.FC<MpesaCheckoutModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
  itemSubtitle,
  coverImage,
  amount,
  currency = 'KES',
  onSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [stage, setStage] = useState<'FORM' | 'PROMPTING' | 'SUCCESS' | 'FAILED'>('FORM');
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentStatusResponse | null>(null);
  const [countdown, setCountdown] = useState(60);

  const pollingRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Clean up timers on unmount or close
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client-side validation
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Please enter a valid Kenyan Safaricom phone number (e.g. 0712345678).');
      return;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address to receive your official receipt.');
      return;
    }

    try {
      setStage('PROMPTING');
      setCountdown(60);

      let res;
      if (itemType === 'PUBLICATION' && itemId) {
        res = await paymentService.initiatePublicationPurchase({
          publicationId: itemId,
          phoneNumber: cleanPhone,
          customerName: customerName.trim() || 'Reader',
          customerEmail: customerEmail.trim()
        });
      } else {
        res = await paymentService.initiateDonation({
          amount,
          phoneNumber: cleanPhone,
          donorName: customerName.trim() || 'Supporter',
          donorEmail: customerEmail.trim()
        });
      }

      setReferenceCode(res.referenceCode);

      // Start countdown
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start polling backend status every 3.5 seconds
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await paymentService.getPaymentStatus(res.referenceCode);
          if (statusRes.status === 'SUCCESSFUL') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            setPaymentResult(statusRes);
            setStage('SUCCESS');
            if (onSuccess) {
              onSuccess({
                ...statusRes,
                customerEmail: customerEmail.trim(),
                receiptNumber: statusRes.providerReference || statusRes.referenceCode
              });
            }
          } else if (statusRes.status === 'FAILED' || statusRes.status === 'CANCELLED') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            setErrorMessage(statusRes.message || 'Payment was declined or cancelled on your phone.');
            setStage('FAILED');
          }
        } catch {
          // Keep polling if transient network error
        }
      }, 3500);
    } catch (err: any) {
      setStage('FORM');
      setErrorMessage(err?.response?.data?.error?.message || err?.message || 'Failed to initiate M-Pesa STK push. Please check your network and phone number.');
    }
  };

  const handleDownload = () => {
    if (!paymentResult || !paymentResult.publication) return;
    const downloadUrl = publicationService.getDownloadUrl(
      paymentResult.publication.id,
      paymentResult.downloadToken,
      customerEmail
    );
    window.open(downloadUrl, '_blank');
  };

  const resetToForm = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setStage('FORM');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-warm-200 dark:border-charcoal-700 overflow-hidden">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base font-display text-white">
                Lipa Na M-Pesa Express
              </h3>
              <p className="text-[11px] text-forest-200">Safaricom Direct Instant Checkout</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-forest-200 hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Item Preview Card */}
          <div className="flex items-center gap-4 p-3.5 mb-6 rounded-2xl bg-warm-50 dark:bg-charcoal-800/80 border border-warm-200 dark:border-charcoal-700">
            {coverImage && (
              <img
                src={coverImage}
                alt={itemTitle}
                className="w-14 h-18 object-cover rounded-xl shadow-sm border border-warm-200 dark:border-charcoal-700"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-forest-800 dark:text-emerald-400">
                {itemType === 'PUBLICATION' ? 'Digital Publication' : 'Community Donation'}
              </span>
              <h4 className="font-bold text-sm sm:text-base text-charcoal-900 dark:text-white truncate">
                {itemTitle}
              </h4>
              {itemSubtitle && (
                <p className="text-xs text-charcoal-500 dark:text-warm-400 truncate">{itemSubtitle}</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-charcoal-500 dark:text-warm-400 uppercase font-semibold block">Total</span>
              <span className="text-lg font-black text-emerald-800 dark:text-emerald-400 font-display">
                {currency} {amount.toLocaleString('en-KE')}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-800 dark:text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* STAGE 1: FORM */}
          {stage === 'FORM' && (
            <form onSubmit={handleStartPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  M-Pesa Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="0712 345 678 or 2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 pl-11 rounded-2xl border border-warm-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Smartphone className="w-5 h-5 text-charcoal-400 dark:text-warm-500 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1">
                  You will receive an instant prompt on this phone to authorize payment with your PIN.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Kemunto"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-warm-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                    Receipt Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-warm-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-forest-800 hover:from-emerald-500 hover:to-forest-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <span>Prompt M-Pesa on My Phone</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-500 dark:text-warm-400 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL Encrypted • Official Safaricom Daraja 2.0 Integration</span>
              </div>
            </form>
          )}

          {/* STAGE 2: WAITING FOR M-PESA PIN */}
          {stage === 'PROMPTING' && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-pulse">
                  <Smartphone className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-charcoal-900 rounded-full shadow">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                </div>
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-extrabold font-display text-charcoal-900 dark:text-white">
                  STK Push Sent to Your Phone!
                </h4>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 max-w-sm mx-auto mt-1 leading-relaxed">
                  Please unlock your phone and enter your <strong>M-Pesa PIN</strong> to authorize{' '}
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {currency} {amount.toLocaleString()}
                  </span>.
                </p>
              </div>

              {/* Waiting status pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-100 dark:bg-charcoal-800 text-xs font-mono font-bold text-charcoal-700 dark:text-warm-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Waiting for carrier confirmation ({countdown}s)</span>
              </div>

              {referenceCode && (
                <p className="text-[11px] text-charcoal-400 dark:text-warm-500 font-mono">
                  Ref: {referenceCode}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetToForm}
                  className="text-xs text-charcoal-500 dark:text-warm-400 hover:text-charcoal-800 dark:hover:text-white underline"
                >
                  Wrong number or didn't receive prompt? Try again
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: SUCCESS */}
          {stage === 'SUCCESS' && (
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold font-display text-charcoal-900 dark:text-white">
                  Payment Verified Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 mt-1">
                  Thank you! An official fiduciary receipt has been sent to{' '}
                  <strong>{customerEmail}</strong>.
                </p>
              </div>

              {paymentResult?.providerReference && (
                <div className="p-3 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 inline-block">
                  <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">
                    M-Pesa Receipt Number
                  </span>
                  <span className="font-mono font-bold text-base text-emerald-800 dark:text-emerald-300">
                    {paymentResult.providerReference}
                  </span>
                </div>
              )}

              {itemType === 'PUBLICATION' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Full Publication PDF</span>
                  </button>
                  <p className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-2">
                    * You can also access your digital library anytime in your personal account portal.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-600 text-xs font-bold text-charcoal-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-all"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: FAILED */}
          {stage === 'FAILED' && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border-2 border-red-500">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold font-display text-charcoal-900 dark:text-white">
                Transaction Incomplete
              </h4>
              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 max-w-sm mx-auto">
                The payment could not be confirmed. This happens if the request timed out or was cancelled on your phone.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={resetToForm}
                  className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-600 text-xs font-bold text-charcoal-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
