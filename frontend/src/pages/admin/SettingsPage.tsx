import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService, AuthError } from '../../services/authService';
import { Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  KeyRound,
  Send,
  Sparkles,
  CreditCard,
  ArrowRight
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, changePassword } = useAuth();

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changeSuccessMessage, setChangeSuccessMessage] = useState<string | null>(null);
  const [changeErrorMessage, setChangeErrorMessage] = useState<string | null>(null);

  // Email Reset State
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [emailResetMessage, setEmailResetMessage] = useState<string | null>(null);
  const [emailResetError, setEmailResetError] = useState<string | null>(null);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Password must contain at least one special character.';
    return null;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeSuccessMessage(null);
    setChangeErrorMessage(null);

    if (!passwordForm.currentPassword) {
      setChangeErrorMessage('Please enter your current password.');
      return;
    }

    const passErr = validatePassword(passwordForm.newPassword);
    if (passErr) {
      setChangeErrorMessage(passErr);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setChangeErrorMessage('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setChangeErrorMessage('New password must be different from current password.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setChangeSuccessMessage('Your password has been changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      if (err instanceof AuthError) {
        setChangeErrorMessage(err.message);
      } else {
        setChangeErrorMessage('Failed to change password. Please check your current password.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setEmailResetMessage(null);
    setEmailResetError(null);
    setIsSendingResetEmail(true);

    try {
      const res = await authService.forgotPassword({ email: user.email });
      setEmailResetMessage(
        res.message || `A password reset verification email has been dispatched to ${user.email}.`
      );
    } catch (err) {
      if (err instanceof AuthError) {
        setEmailResetError(err.message);
      } else {
        setEmailResetError('Failed to dispatch reset email. Please try again later.');
      }
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const hasLength = passwordForm.newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordForm.newPassword);
  const hasNumber = /[0-9]/.test(passwordForm.newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordForm.newPassword);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-forest-850 px-3 py-1 rounded-full border border-forest-700 inline-block mb-2">
              Account Security & Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Admin Profile & Password Settings
            </h1>
            <p className="text-forest-200 text-sm mt-1">
              Manage your administrator credentials, change your password, or trigger an email reset verification.
            </p>
          </div>
          <div className="bg-forest-850/80 p-3.5 rounded-xl border border-forest-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-xs text-forest-300">{user?.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
              Payment & Donation Methods Management
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-0.5">
              Configure Safaricom M-Pesa (Paybill/Till), Bank Wire coordinates, or other client-approved payment methods without changing code.
            </p>
          </div>
        </div>
        <Link
          to="/admin/payments"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold transition shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <span>Manage Payment Settings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Direct Change Password Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-warm-200 dark:border-charcoal-800">
            <div className="flex items-center gap-3 border-b border-warm-100 dark:border-charcoal-800 pb-4 mb-6">
              <div className="p-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-900 dark:text-warm-50">
                  Change Password
                </h2>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Update your administrator password immediately
                </p>
              </div>
            </div>

            {changeSuccessMessage && (
              <div className="mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  {changeSuccessMessage}
                </div>
              </div>
            )}

            {changeErrorMessage && (
              <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  {changeErrorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                      if (changeErrorMessage) setChangeErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                    placeholder="Enter current password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400 hover:text-charcoal-600"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      if (changeErrorMessage) setChangeErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                    placeholder="Min 8 chars, 1 uppercase, 1 special char"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400 hover:text-charcoal-600"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                {passwordForm.newPassword && (
                  <div className="mt-2.5 p-3 rounded-xl bg-warm-50 dark:bg-charcoal-950 text-xs space-y-1.5 border border-warm-200 dark:border-charcoal-800">
                    <p className="font-semibold text-charcoal-700 dark:text-warm-200 mb-1">Security Criteria:</p>
                    <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>At least 8 characters in length</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>At least one uppercase character (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>At least one numeric digit (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-charcoal-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>At least one special symbol (!@#$%^&*...)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (changeErrorMessage) setChangeErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent text-sm"
                    placeholder="Repeat new password"
                    disabled={isChangingPassword}
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save New Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Reset Through Email Verification & Profile Details (1 col) */}
        <div className="space-y-6">
          {/* Email Verification Reset Card */}
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-6 shadow-sm border border-warm-200 dark:border-charcoal-800">
            <div className="flex items-center gap-3 border-b border-warm-100 dark:border-charcoal-800 pb-3.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50">
                  Email Reset Option
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Send reset link to your email
                </p>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 dark:text-warm-300 leading-relaxed mb-4">
              Prefer resetting via email verification? We will send a secure 1-hour verification token link directly to your official email:
            </p>

            <div className="p-3 bg-warm-50 dark:bg-charcoal-950 rounded-xl border border-warm-200 dark:border-charcoal-800 text-xs font-mono text-charcoal-800 dark:text-warm-200 mb-4 break-all">
              {user?.email}
            </div>

            {emailResetMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                {emailResetMessage}
              </div>
            )}

            {emailResetError && (
              <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-3.5 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
                {emailResetError}
              </div>
            )}

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isSendingResetEmail}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-forest-900 dark:text-emerald-300 bg-forest-50 dark:bg-forest-950/60 hover:bg-forest-100 dark:hover:bg-forest-900 border border-forest-200 dark:border-forest-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingResetEmail ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-forest-700 border-t-transparent" />
                  <span>Sending Verification Link...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reset Verification Link</span>
                </>
              )}
            </button>
          </div>

          {/* Account Profile Card */}
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-6 shadow-sm border border-warm-200 dark:border-charcoal-800">
            <div className="flex items-center gap-3 border-b border-warm-100 dark:border-charcoal-800 pb-3.5 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50">
                  Account Details
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Active session overview
                </p>
              </div>
            </div>

            <dl className="space-y-3 text-xs">
              <div>
                <dt className="text-charcoal-500 dark:text-warm-400">Full Name</dt>
                <dd className="font-semibold text-charcoal-900 dark:text-warm-100">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-charcoal-500 dark:text-warm-400">Email Address</dt>
                <dd className="font-semibold text-charcoal-900 dark:text-warm-100">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-charcoal-500 dark:text-warm-400">Assigned Role</dt>
                <dd className="font-semibold text-charcoal-900 dark:text-warm-100">{user?.role.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-charcoal-500 dark:text-warm-400">Granted Permissions</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {user?.permissions.slice(0, 5).map(perm => (
                    <span key={perm} className="px-1.5 py-0.5 rounded bg-warm-100 dark:bg-charcoal-800 text-[10px] text-charcoal-700 dark:text-warm-300 font-mono">
                      {perm}
                    </span>
                  ))}
                  {(user?.permissions.length || 0) > 5 && (
                    <span className="text-[10px] text-charcoal-500 font-semibold self-center">
                      +{ (user?.permissions.length || 0) - 5 } more
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
