import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, AuthError } from '../../services/authService';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setMessage(res.message || 'If an account exists with this email, a reset link has been dispatched.');
      setSubmitted(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to send reset link. Please check your network and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50/70 dark:bg-charcoal-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-charcoal-900 p-8 sm:p-10 rounded-2xl shadow-elevated border border-warm-200 dark:border-charcoal-800">
        <div className="text-center">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img
              className="h-16 w-auto mx-auto"
              src="/images/logo.png"
              alt="Mwancha Senior Community"
            />
          </Link>
          <div className="mx-auto w-12 h-12 bg-forest-50 dark:bg-forest-900/40 rounded-full flex items-center justify-center mt-4">
            <KeyRound className="w-6 h-6 text-forest-700 dark:text-emerald-400" />
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-charcoal-600 dark:text-warm-300">
            Enter your official administrator email to receive a password reset verification link
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-5 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Verification Link Dispatched
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                {message}
              </p>
              <p className="text-xs text-charcoal-500 dark:text-warm-400 pt-2">
                Please check your inbox (and spam folder) for the verification email. Follow the link within 1 hour to set a new password.
              </p>
            </div>

            <div className="text-center space-y-3">
              <Link
                to="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors shadow-sm"
              >
                Return to Admin Sign In
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-forest-700 hover:underline font-semibold"
              >
                Did not receive it? Try another email
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                  placeholder="admin@mwanchasenior.com"
                  disabled={isSubmitting}
                />
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-800 hover:bg-forest-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Sending Verification Email...</span>
                  </>
                ) : (
                  <span>Send Reset Verification Link</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 dark:text-warm-300 pt-2 border-t border-warm-100 dark:border-charcoal-800">
              <Link to="/admin/login" className="text-forest-700 dark:text-emerald-400 hover:underline">
                &larr; Back to Sign In
              </Link>
              <Link to="/admin/register" className="text-forest-700 dark:text-emerald-400 hover:underline">
                Create new account &rarr;
              </Link>
            </div>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-forest-800 dark:text-warm-400 dark:hover:text-warm-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to public website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
