import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Logo } from '../../components/common/Logo';
import { SEO } from '../../components/common/SEO';
import { spamService } from '../../services/spamService';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [emailForResend, setEmailForResend] = useState<string>('');
  const [showResendInput, setShowResendInput] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerify = async (tokenOrCodeToVerify: string) => {
    if (!tokenOrCodeToVerify || tokenOrCodeToVerify.trim().length === 0) {
      setErrorMessage('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await spamService.verifyEmail(tokenOrCodeToVerify.trim());
      setSuccessMessage(response.message || 'Email verified successfully. You may now log in.');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Verification failed. The token or code may have expired.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForResend.trim()) {
      setErrorMessage('Please enter your email address to receive a new code.');
      return;
    }

    setResending(true);
    setErrorMessage(null);

    try {
      const response = await spamService.resendVerification(emailForResend.trim());
      setSuccessMessage(response.message || 'Verification email resent. Please check your inbox.');
      setShowResendInput(false);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Unable to resend verification email.';
      setErrorMessage(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-16 flex flex-col justify-center bg-warm-100 dark:bg-charcoal-950 px-4">
      <SEO
        title="Verify Email Address"
        description="Verify your email address for Mwancha Senior Community administrative access."
      />
      <Container size="sm">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            Verify Email Address
          </h1>
          <p className="mt-2 text-sm text-charcoal-600 dark:text-warm-300">
            Confirm your identity to activate administrative privileges.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-700 shadow-xl rounded-3xl">
          {successMessage ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-charcoal-900 dark:text-warm-50">
                Email Address Confirmed!
              </h2>
              <p className="text-sm text-charcoal-600 dark:text-warm-300 max-w-sm mx-auto">
                {successMessage}
              </p>
              <div className="pt-4">
                <Button
                  to="/admin/login"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold justify-center"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {errorMessage && (
                <Alert type="error" message={errorMessage} />
              )}

              <div className="text-center py-2">
                <div className="w-12 h-12 bg-forest-50 dark:bg-forest-950 text-forest-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Please enter the 6-digit verification code sent to your registered email.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify(code);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-200 mb-2 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 px-4 rounded-2xl border-2 border-warm-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-50 focus:border-forest-700 focus:ring-4 focus:ring-forest-700/20 focus:outline-none"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold justify-center"
                  isLoading={loading}
                >
                  Confirm & Verify Code
                </Button>
              </form>

              <div className="pt-4 border-t border-warm-200 dark:border-charcoal-800 text-center space-y-3">
                {!showResendInput ? (
                  <button
                    type="button"
                    onClick={() => setShowResendInput(true)}
                    className="text-xs font-semibold text-forest-800 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Didn't receive the email? Resend code</span>
                  </button>
                ) : (
                  <form onSubmit={handleResend} className="space-y-2 pt-2">
                    <p className="text-xs text-charcoal-600 dark:text-warm-300">
                      Enter your email address to receive a fresh verification link:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailForResend}
                        onChange={(e) => setEmailForResend(e.target.value)}
                        placeholder="admin@mwanchasenior.org"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-warm-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-50 focus:outline-none focus:ring-2 focus:ring-forest-600"
                        required
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        isLoading={resending}
                        className="text-xs font-bold flex-shrink-0"
                      >
                        Resend
                      </Button>
                    </div>
                  </form>
                )}

                <div>
                  <Link
                    to="/admin/login"
                    className="text-xs font-medium text-charcoal-500 hover:text-charcoal-800 dark:text-warm-400 dark:hover:text-warm-200"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default VerifyEmailPage;
