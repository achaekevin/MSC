import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService, AuthError } from '../../services/authService';
import { Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Password must contain at least one special character (e.g. !@#$%^&*).';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing or invalid password reset token. Please request a new reset link.');
      return;
    }

    const passErr = validatePassword(formData.password);
    if (passErr) {
      setError(passErr);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.resetPassword({
        token,
        newPassword: formData.password
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Failed to reset password. The link may have expired.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

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
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-charcoal-600 dark:text-warm-300">
            Create a secure new password for your administrator account
          </p>
        </div>

        {!token ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                Invalid or missing reset token. Please request a new password reset link via email.
              </div>
            </div>
            <Link
              to="/admin/forgot-password"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors shadow-sm"
            >
              Request Password Reset
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-5 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                Password Successfully Reset!
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                Your account password has been updated. You can now sign in with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors shadow-sm"
            >
              Sign In Now &rarr;
            </button>
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
              <label htmlFor="newPassword" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    if (error) setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                  placeholder="Min 8 chars, 1 uppercase, 1 special char"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-600 hover:text-forest-800 dark:text-warm-300 dark:hover:text-white cursor-pointer z-20 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-charcoal-700 dark:text-warm-200" /> : <Eye className="w-5 h-5 text-charcoal-700 dark:text-warm-200" />}
                </button>
              </div>

              {/* Requirement Checklist */}
              {formData.password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least one number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least one special character (!@#$...)</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    if (error) setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-600 hover:text-forest-800 dark:text-warm-300 dark:hover:text-white cursor-pointer z-20 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 text-charcoal-700 dark:text-warm-200" /> : <Eye className="w-5 h-5 text-charcoal-700 dark:text-warm-200" />}
                </button>
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
                    <span>Saving New Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>

            <div className="text-center pt-2 border-t border-warm-100 dark:border-charcoal-800">
              <Link to="/admin/login" className="text-xs font-semibold text-forest-700 dark:text-emerald-400 hover:underline">
                &larr; Return to Sign In
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

export default ResetPasswordPage;
