import React, { useState } from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CONTENT_ADMIN',
    adminInviteCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CONTENT_ADMIN';
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) clearError();
    if (validationError) setValidationError(null);
  };

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.adminInviteCode.trim()) {
      setValidationError('Please complete all required fields, including the Admin Authorization Key.');
      return;
    }

    const passErr = validatePassword(formData.password);
    if (passErr) {
      setValidationError(passErr);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role as any,
        adminInviteCode: formData.adminInviteCode.trim()
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50/70 dark:bg-charcoal-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white dark:bg-charcoal-900 p-8 sm:p-10 rounded-2xl shadow-elevated border border-warm-200 dark:border-charcoal-800">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <img
              className="h-16 w-auto mx-auto"
              src="/images/logo.png"
              alt="Mwancha Senior Community"
            />
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Restricted MSC Personnel Access</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            Admin Account Setup
          </h1>
          <p className="mt-1.5 text-xs text-charcoal-600 dark:text-warm-300">
            Administrative registration requires an official authorization key issued by MSC leadership.
          </p>
        </div>

        {/* Global Error Banner */}
        {(error || validationError) && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300 font-medium">
              {validationError || error}
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
              Full Legal Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
              placeholder="e.g., Achaa Kevin"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
              Official Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
              placeholder="admin@mwanchasenior.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
              Administrative Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
              disabled={isSubmitting}
            >
              <option value="CONTENT_ADMIN">Content Administrator</option>
              <option value="EDITOR">Editor / Staff</option>
              <option value="REVIEWER">Reviewer / Approver</option>
              <option value="FORM_MANAGER">Volunteer & Donor Manager</option>
            </select>
          </div>

          {/* Admin Authorization Key */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40">
            <label htmlFor="adminInviteCode" className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 dark:text-warm-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>Admin Authorization Key *</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Required</span>
            </label>
            <input
              id="adminInviteCode"
              name="adminInviteCode"
              type="password"
              required
              value={formData.adminInviteCode}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm font-mono tracking-wider"
              placeholder="Enter MSC Authorization Key"
              disabled={isSubmitting}
            />
            <p className="mt-1.5 text-[11px] text-charcoal-600 dark:text-warm-400">
              Only authorized personnel holding a valid MSC administrative key can create an admin account.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                placeholder="At least 8 characters"
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

            {/* Password Requirements Guidance */}
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
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                placeholder="Re-enter password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400 hover:text-charcoal-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-forest-800 hover:bg-forest-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Create Admin Account</span>
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center text-sm text-charcoal-600 dark:text-warm-300 pt-2 border-t border-warm-100 dark:border-charcoal-800">
            Already have an admin account?{' '}
            <Link
              to="/admin/login"
              className="font-bold text-forest-700 dark:text-emerald-400 hover:underline"
            >
              Sign In here &rarr;
            </Link>
          </div>
        </form>

        {/* Back Link */}
        <div className="text-center">
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

export default RegisterPage;
