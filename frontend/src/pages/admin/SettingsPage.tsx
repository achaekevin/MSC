import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Copy,
  Check,
  QrCode,
  RefreshCw,
  X,
  ShieldAlert
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

  // Two-Factor Authentication State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [isLoading2FAStatus, setIsLoading2FAStatus] = useState<boolean>(true);
  const [show2FASetupModal, setShow2FASetupModal] = useState<boolean>(false);
  const [twoFactorSecretData, setTwoFactorSecretData] = useState<{ secret: string; otpAuthUri: string } | null>(null);
  const [twoFactorVerificationCode, setTwoFactorVerificationCode] = useState<string>('');
  const [isVerifying2FA, setIsVerifying2FA] = useState<boolean>(false);
  const [twoFactorSetupError, setTwoFactorSetupError] = useState<string | null>(null);
  const [twoFactorBackupCodes, setTwoFactorBackupCodes] = useState<string[] | null>(null);
  const [hasCopiedSecret, setHasCopiedSecret] = useState<boolean>(false);
  const [hasCopiedBackupCodes, setHasCopiedBackupCodes] = useState<boolean>(false);

  // Disable 2FA Modal State
  const [showDisable2FAModal, setShowDisable2FAModal] = useState<boolean>(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState<string>('');
  const [isDisabling2FA, setIsDisabling2FA] = useState<boolean>(false);
  const [disable2FAError, setDisable2FAError] = useState<string | null>(null);
  const [twoFactorSuccessNotification, setTwoFactorSuccessNotification] = useState<string | null>(null);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    setIsLoading2FAStatus(true);
    try {
      const res = await authService.getTwoFactorStatus();
      setTwoFactorEnabled(res.enabled);
    } catch (err) {
      console.warn('Failed to fetch 2FA status:', err);
    } finally {
      setIsLoading2FAStatus(false);
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorSetupError(null);
    setTwoFactorVerificationCode('');
    setTwoFactorBackupCodes(null);
    setHasCopiedSecret(false);
    setHasCopiedBackupCodes(false);
    setShow2FASetupModal(true);

    try {
      const data = await authService.generateTwoFactorSecret();
      setTwoFactorSecretData(data);
    } catch (err: any) {
      setTwoFactorSetupError(err.message || 'Failed to initialize 2FA setup. Please try again.');
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorSecretData || !twoFactorVerificationCode.trim()) return;

    setIsVerifying2FA(true);
    setTwoFactorSetupError(null);

    try {
      const res = await authService.enableTwoFactor(
        twoFactorSecretData.secret,
        twoFactorVerificationCode.trim()
      );
      setTwoFactorEnabled(true);
      setTwoFactorBackupCodes(res.backupCodes);
      setTwoFactorSuccessNotification('Two-Factor Authentication is now enabled for your account.');
    } catch (err: any) {
      setTwoFactorSetupError(err.message || 'Invalid verification code. Please check your authenticator app and try again.');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disable2FAPassword) return;

    setIsDisabling2FA(true);
    setDisable2FAError(null);

    try {
      await authService.disableTwoFactor(disable2FAPassword);
      setTwoFactorEnabled(false);
      setShowDisable2FAModal(false);
      setDisable2FAPassword('');
      setTwoFactorSuccessNotification('Two-Factor Authentication has been disabled.');
    } catch (err: any) {
      setDisable2FAError(err.message || 'Failed to disable 2FA. Please verify your password.');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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

      {/* 2FA Status Notification */}
      {twoFactorSuccessNotification && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {twoFactorSuccessNotification}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorSuccessNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two-Factor Authentication Card */}
      <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-warm-200 dark:border-charcoal-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-100 dark:border-charcoal-800 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-charcoal-900 dark:text-warm-50">
                  Two-Factor Authentication (2FA)
                </h2>
                {isLoading2FAStatus ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-warm-100 dark:bg-charcoal-800 text-charcoal-500">
                    Checking status...
                  </span>
                ) : twoFactorEnabled ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Protected (Enabled)
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Disabled (Optional)
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500 dark:text-warm-400 mt-0.5">
                TOTP RFC 6238 time-based authentication with 8 emergency backup recovery codes
              </p>
            </div>
          </div>

          <div>
            {!isLoading2FAStatus && (
              twoFactorEnabled ? (
                <button
                  type="button"
                  onClick={() => {
                    setDisable2FAError(null);
                    setDisable2FAPassword('');
                    setShowDisable2FAModal(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStart2FASetup}
                  className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Set Up 2FA Protection
                </button>
              )
            )}
          </div>
        </div>

        <div className="text-xs text-charcoal-600 dark:text-warm-300 leading-relaxed space-y-3">
          <p>
            Two-factor authentication adds an extra verification layer to your administrator account. When enabled, signing in requires both your password and a temporary 6-digit passcode generated by an authenticator application (such as Google Authenticator, Microsoft Authenticator, or 1Password).
          </p>
          <div className="p-3.5 rounded-xl bg-warm-50 dark:bg-charcoal-950 border border-warm-200 dark:border-charcoal-800 flex items-start gap-3">
            <KeyRound className="w-4 h-4 text-forest-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-charcoal-800 dark:text-warm-100">
                {twoFactorEnabled ? 'Your account is actively protected.' : 'Recommended Security Upgrade'}
              </p>
              <p className="text-[11px] text-charcoal-500 dark:text-warm-400">
                {twoFactorEnabled
                  ? 'Sign-in requests from unknown browsers will require TOTP confirmation or an unused emergency backup code.'
                  : 'We recommend activating 2FA to prevent unauthorized administrative logins and secure organization data.'}
              </p>
            </div>
          </div>
        </div>
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

      {/* 2FA Setup Modal */}
      {show2FASetupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-warm-200 dark:border-charcoal-800 max-h-[90vh] overflow-y-auto">
            {twoFactorBackupCodes ? (
              /* Success & Backup Codes Display */
              <div className="space-y-5 text-center">
                <div className="mx-auto w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal-900 dark:text-warm-50">
                    2FA Activated Successfully
                  </h3>
                  <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-1">
                    Store these 8 emergency single-use backup codes in a safe place.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-left text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p>
                    If you ever lose access to your authenticator app, each of these backup codes can be used once to access your admin portal. Keep them confidential.
                  </p>
                </div>

                {/* 8 Backup Codes in a 2-column grid */}
                <div className="grid grid-cols-2 gap-2.5 py-1">
                  {twoFactorBackupCodes.map((bCode, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-warm-50 dark:bg-charcoal-950 rounded-lg text-center font-mono font-bold tracking-widest text-charcoal-900 dark:text-warm-100 border border-warm-200 dark:border-charcoal-800 text-sm"
                    >
                      {bCode}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(twoFactorBackupCodes.join('\n'), setHasCopiedBackupCodes)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-forest-900 dark:text-emerald-300 bg-forest-50 dark:bg-forest-950/60 hover:bg-forest-100 dark:hover:bg-forest-900 border border-forest-200 dark:border-forest-800 transition-colors"
                  >
                    {hasCopiedBackupCodes ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Backup Codes Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy All Backup Codes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FASetupModal(false);
                      setTwoFactorBackupCodes(null);
                      setTwoFactorSecretData(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors shadow-sm"
                  >
                    Done (I have saved codes)
                  </button>
                </div>
              </div>
            ) : (
              /* Setup Instructions & Verification Form */
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-warm-100 dark:border-charcoal-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-800 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50">
                      Set Up Two-Factor Authentication
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FASetupModal(false);
                      setTwoFactorSecretData(null);
                      setTwoFactorSetupError(null);
                    }}
                    className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-warm-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {twoFactorSetupError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{twoFactorSetupError}</span>
                  </div>
                )}

                {!twoFactorSecretData ? (
                  <div className="py-12 text-center text-xs text-charcoal-500 dark:text-warm-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest-700 border-t-transparent mx-auto mb-3" />
                    <span>Generating your secure TOTP encryption key...</span>
                  </div>
                ) : (
                  <form onSubmit={handleConfirm2FA} className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-charcoal-700 dark:text-warm-200">
                        Step 1: Scan QR code with your authenticator app
                      </p>
                      <div className="flex justify-center p-3 bg-white rounded-xl border border-warm-200 dark:border-charcoal-700 w-fit mx-auto shadow-sm">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorSecretData.otpAuthUri)}`}
                          alt="2FA QR Code"
                          className="w-40 h-40"
                        />
                      </div>
                      <p className="text-[11px] text-charcoal-500 dark:text-warm-400 text-center">
                        Compatible with Google Authenticator, Microsoft Authenticator, 1Password, and Authy.
                      </p>

                      <div className="pt-1">
                        <p className="text-[11px] font-semibold text-charcoal-600 dark:text-warm-300 mb-1">
                          Or enter this key manually:
                        </p>
                        <div className="flex items-center justify-between p-2.5 bg-warm-50 dark:bg-charcoal-950 rounded-xl border border-warm-200 dark:border-charcoal-800 text-xs font-mono">
                          <span className="tracking-widest font-bold text-charcoal-800 dark:text-warm-100 select-all">
                            {twoFactorSecretData.secret}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(twoFactorSecretData.secret, setHasCopiedSecret)}
                            className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-forest-700 hover:text-forest-900 dark:text-emerald-400"
                          >
                            {hasCopiedSecret ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-warm-100 dark:border-charcoal-800 space-y-2">
                      <label className="block text-xs font-semibold text-charcoal-700 dark:text-warm-200">
                        Step 2: Enter 6-digit code from your app
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        maxLength={6}
                        value={twoFactorVerificationCode}
                        onChange={(e) => {
                          setTwoFactorVerificationCode(e.target.value.replace(/\D/g, ''));
                          if (twoFactorSetupError) setTwoFactorSetupError(null);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-center font-mono text-xl tracking-widest placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
                        placeholder="000000"
                        disabled={isVerifying2FA}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShow2FASetupModal(false);
                          setTwoFactorSecretData(null);
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-charcoal-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifying2FA || twoFactorVerificationCode.length !== 6}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-forest-800 hover:bg-forest-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {isVerifying2FA ? (
                          <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify & Enable 2FA</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisable2FAModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warm-200 dark:border-charcoal-800">
            <div className="flex items-center justify-between border-b border-warm-100 dark:border-charcoal-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50">
                  Disable Two-Factor Authentication
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDisable2FAModal(false);
                  setDisable2FAPassword('');
                  setDisable2FAError(null);
                }}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-warm-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600 dark:text-warm-300 mb-4 leading-relaxed">
              Disabling 2FA reduces your account security. To confirm this action, please enter your current administrator password:
            </p>

            {disable2FAError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{disable2FAError}</span>
              </div>
            )}

            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={disable2FAPassword}
                  onChange={(e) => {
                    setDisable2FAPassword(e.target.value);
                    if (disable2FAError) setDisable2FAError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="Enter current password"
                  disabled={isDisabling2FA}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisable2FAModal(false);
                    setDisable2FAPassword('');
                    setDisable2FAError(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-charcoal-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisabling2FA || !disable2FAPassword}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isDisabling2FA ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      <span>Disabling...</span>
                    </>
                  ) : (
                    <span>Confirm Disable</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
