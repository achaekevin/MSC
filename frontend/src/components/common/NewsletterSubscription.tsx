import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, ShieldCheck, HeartHandshake } from 'lucide-react';
import { newsletterService } from '../../services/newsletterService';

interface Props {
  variant?: 'inline' | 'card' | 'footer';
}

export const NewsletterSubscription: React.FC<Props> = ({ variant = 'card' }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    if (!consent) {
      setStatus({
        type: 'error',
        message: 'Please check the consent box to receive our community newsletters.'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await newsletterService.subscribe(email, consent);
      setStatus({
        type: 'success',
        message: res.message || 'Thank you for subscribing to Mwancha Senior Community updates!'
      });
      setEmail('');
      setConsent(false);
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to subscribe. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'footer') {
    return (
      <div className="text-left">
        <h4 className="text-sm font-bold text-warm-50 uppercase tracking-wider mb-2">
          Stay Connected With MSC
        </h4>
        <p className="text-xs text-forest-200/90 leading-relaxed mb-4">
          Receive authentic field updates, policy briefs, and stories of elder impact directly to your inbox.
        </p>

        {status?.type === 'success' ? (
          <div className="p-3.5 rounded-xl bg-forest-900 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{status.message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-forest-900 border border-forest-700 text-white placeholder-forest-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-earth-600 hover:bg-earth-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>

            <label className="flex items-start gap-2 text-[11px] text-forest-300/80 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-forest-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                I explicitly consent to receive monthly MSC newsletters. Unsubscribe anytime.
              </span>
            </label>

            {status?.type === 'error' && (
              <p className="text-xs text-rose-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{status.message}</span>
              </p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-forest-950 text-white p-6 sm:p-10 border border-forest-800 shadow-xl text-left relative overflow-hidden">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-forest-700">
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span>Stay Connected With MSC</span>
        </span>

        <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
          Join Our Elder Welfare Newsletter
        </h3>
        <p className="text-xs sm:text-sm text-forest-200 mt-2 leading-relaxed">
          Get authentic quarterly field bulletins, senior advocacy briefs, baraza schedules, and verified impact stories from Mwancha Senior Community in Kenya.
        </p>

        {status?.type === 'success' ? (
          <div className="mt-6 p-4 rounded-2xl bg-forest-900 border border-emerald-500/50 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="font-bold text-white">Subscription Confirmed!</p>
              <p className="text-xs text-emerald-200 mt-1">{status.message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your official or personal email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-forest-900 border border-forest-700 text-white placeholder-forest-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-earth-600 hover:bg-earth-500 text-white text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Subscribing...' : 'Subscribe Now'}
                <Send className="w-4 h-4" />
              </button>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-forest-200/90 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-forest-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                I agree to receive communications from Mwancha Senior Community. We practice data minimization and will never sell your details. You may unsubscribe at any time.
              </span>
            </label>

            {status?.type === 'error' && (
              <p className="text-xs text-rose-300 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{status.message}</span>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
