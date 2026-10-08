import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { donationService } from '../../services/donationService';
import { DonationMethod, MpesaPaymentDetails, BankPaymentDetails, OtherPaymentDetails } from '../../types';
import {
  CreditCard,
  Smartphone,
  Building2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Power,
  RefreshCw,
  Eye,
  Info,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentSettingsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('SETTINGS_MANAGE');

  const [methods, setMethods] = useState<DonationMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mpesa' | 'bank' | 'other'>('mpesa');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states per provider
  const [mpesaForm, setMpesaForm] = useState<MpesaPaymentDetails>({
    paybillNumber: '',
    tillNumber: '',
    mpesaPhoneNumber: '',
    accountReference: 'MWANCHA',
    instructions: ''
  });

  const [bankForm, setBankForm] = useState<BankPaymentDetails>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    swiftCode: '',
    instructions: ''
  });

  const [otherForm, setOtherForm] = useState<OtherPaymentDetails>({
    methodTitle: '',
    clientApprovedInstructions: '',
    instructions: '',
    notes: ''
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await donationService.getAdminPaymentSettings();
      setMethods(data);

      const mpesa = data.find(m => m.paymentProvider === 'mpesa' || m.type === 'mpesa');
      if (mpesa) {
        setMpesaForm({
          paybillNumber: mpesa.details?.paybillNumber || '',
          tillNumber: mpesa.details?.tillNumber || '',
          mpesaPhoneNumber: mpesa.details?.mpesaPhoneNumber || '',
          accountReference: mpesa.details?.accountReference || 'MWANCHA',
          instructions: mpesa.instructions || mpesa.details?.instructions || ''
        });
      }

      const bank = data.find(m => m.paymentProvider === 'bank' || m.type === 'bank');
      if (bank) {
        setBankForm({
          bankName: bank.details?.bankName || '',
          accountName: bank.details?.accountName || 'Mwancha Senior Community',
          accountNumber: bank.details?.accountNumber || '',
          branch: bank.details?.branch || '',
          swiftCode: bank.details?.swiftCode || '',
          instructions: bank.instructions || bank.details?.instructions || ''
        });
      }

      const other = data.find(m => m.paymentProvider === 'other' || m.type === 'other');
      if (other) {
        setOtherForm({
          methodTitle: other.name || other.details?.methodTitle || 'Other Approved Methods',
          clientApprovedInstructions: other.details?.clientApprovedInstructions || other.instructions || '',
          instructions: other.instructions || other.details?.instructions || '',
          notes: other.details?.notes || ''
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load payment settings'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getMethod = (provider: 'mpesa' | 'bank' | 'other') => {
    return methods.find(m => m.paymentProvider === provider || m.type === provider);
  };

  const handleToggle = async (provider: 'mpesa' | 'bank' | 'other') => {
    const method = getMethod(provider);
    if (!method) return;

    try {
      setTogglingId(method.id);
      setFeedback(null);
      const newActive = !method.isActive;
      const updated = await donationService.togglePaymentMethodStatus(method.id, newActive);
      
      setMethods(prev => prev.map(m => m.id === updated.id ? updated : m));
      setFeedback({
        type: 'success',
        message: `${method.name} is now ${newActive ? 'Active and visible on the website' : 'Deactivated and hidden from public visitors'}.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to toggle payment method status'
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = getMethod('mpesa');
    if (!method) return;

    try {
      setSavingId(method.id);
      setFeedback(null);

      const updated = await donationService.updatePaymentSetting(method.id, {
        name: 'M-Pesa Mobile Giving',
        instructions: mpesaForm.instructions || 'Paybill and Till number options for Safaricom M-Pesa supporters.',
        details: mpesaForm
      });

      setMethods(prev => prev.map(m => m.id === updated.id ? updated : m));
      setFeedback({
        type: 'success',
        message: 'M-Pesa payment coordinates saved successfully!'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save M-Pesa payment settings'
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = getMethod('bank');
    if (!method) return;

    try {
      setSavingId(method.id);
      setFeedback(null);

      const updated = await donationService.updatePaymentSetting(method.id, {
        name: 'Direct Bank Wire Transfer',
        instructions: bankForm.instructions || 'Direct bank deposit and wire transfer account details.',
        details: bankForm
      });

      setMethods(prev => prev.map(m => m.id === updated.id ? updated : m));
      setFeedback({
        type: 'success',
        message: 'Bank transfer coordinates saved successfully!'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save Bank transfer settings'
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveOther = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = getMethod('other');
    if (!method) return;

    try {
      setSavingId(method.id);
      setFeedback(null);

      const updated = await donationService.updatePaymentSetting(method.id, {
        name: otherForm.methodTitle || 'Other Methods',
        instructions: otherForm.clientApprovedInstructions || otherForm.instructions || 'Client-approved payment instructions.',
        details: otherForm
      });

      setMethods(prev => prev.map(m => m.id === updated.id ? updated : m));
      setFeedback({
        type: 'success',
        message: 'Other payment methods instructions saved successfully!'
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save other payment settings'
      });
    } finally {
      setSavingId(null);
    }
  };

  const currentMpesa = getMethod('mpesa');
  const currentBank = getMethod('bank');
  const currentOther = getMethod('other');

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-warm-200 dark:border-charcoal-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest-700 dark:text-forest-400 mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Fiduciary Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white font-display">
            Payment & Donation Settings
          </h1>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-warm-300">
            Configure official payment coordinates and activate or deactivate methods without code modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-800 dark:text-warm-100 hover:bg-warm-50 dark:hover:bg-charcoal-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-forest-900 text-white hover:bg-forest-800 transition shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-medium">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Summary Cards (Instant Toggles) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* M-Pesa Summary Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          currentMpesa?.isActive
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm'
            : 'bg-warm-50 dark:bg-charcoal-900 border-warm-200 dark:border-charcoal-800 opacity-90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              currentMpesa?.isActive
                ? 'bg-emerald-200/70 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-warm-200 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300'
            }`}>
              {currentMpesa?.isActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVE</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>DEACTIVATED</span>
                </>
              )}
            </span>
          </div>
          <h3 className="font-bold text-lg text-charcoal-900 dark:text-white">M-Pesa Mobile</h3>
          <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-1 mb-5">
            {currentMpesa?.isActive
              ? 'Visible on public donation page for mobile donors.'
              : 'Deactivated. Visitors will not see M-Pesa details.'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-warm-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={() => setActiveTab('mpesa')}
              className="text-xs font-bold text-forest-800 dark:text-forest-400 hover:underline"
            >
              Configure Fields
            </button>
            <button
              type="button"
              disabled={!canManage || togglingId === currentMpesa?.id}
              onClick={() => handleToggle('mpesa')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                currentMpesa?.isActive
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-200'
                  : 'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-600'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentMpesa?.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        </div>

        {/* Bank Transfer Summary Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          currentBank?.isActive
            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 shadow-sm'
            : 'bg-warm-50 dark:bg-charcoal-900 border-warm-200 dark:border-charcoal-800 opacity-90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <Building2 className="w-5 h-5" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              currentBank?.isActive
                ? 'bg-blue-200/70 dark:bg-blue-900 text-blue-900 dark:text-blue-200'
                : 'bg-warm-200 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300'
            }`}>
              {currentBank?.isActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVE</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>DEACTIVATED</span>
                </>
              )}
            </span>
          </div>
          <h3 className="font-bold text-lg text-charcoal-900 dark:text-white">Bank Transfer</h3>
          <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-1 mb-5">
            {currentBank?.isActive
              ? 'Direct wire transfer coordinates are live on the website.'
              : 'Deactivated. Visitors will not see bank coordinates.'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-warm-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className="text-xs font-bold text-forest-800 dark:text-forest-400 hover:underline"
            >
              Configure Fields
            </button>
            <button
              type="button"
              disabled={!canManage || togglingId === currentBank?.id}
              onClick={() => handleToggle('bank')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                currentBank?.isActive
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-200'
                  : 'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-600'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentBank?.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        </div>

        {/* Other Methods Summary Card */}
        <div className={`p-6 rounded-3xl border transition-all ${
          currentOther?.isActive
            ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 shadow-sm'
            : 'bg-warm-50 dark:bg-charcoal-900 border-warm-200 dark:border-charcoal-800 opacity-90'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              currentOther?.isActive
                ? 'bg-purple-200/70 dark:bg-purple-900 text-purple-900 dark:text-purple-200'
                : 'bg-warm-200 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300'
            }`}>
              {currentOther?.isActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTIVE</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>DEACTIVATED</span>
                </>
              )}
            </span>
          </div>
          <h3 className="font-bold text-lg text-charcoal-900 dark:text-white">Other Methods</h3>
          <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-1 mb-5">
            {currentOther?.isActive
              ? 'Client-approved offline or special instructions are published.'
              : 'Deactivated. Visitors will not see other methods.'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-warm-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={() => setActiveTab('other')}
              className="text-xs font-bold text-forest-800 dark:text-forest-400 hover:underline"
            >
              Configure Fields
            </button>
            <button
              type="button"
              disabled={!canManage || togglingId === currentOther?.id}
              onClick={() => handleToggle('other')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                currentOther?.isActive
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-200'
                  : 'bg-emerald-700 text-white hover:bg-emerald-600 dark:bg-emerald-600'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{currentOther?.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-warm-200 dark:border-charcoal-700 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('mpesa')}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'mpesa'
              ? 'border-forest-700 text-forest-900 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-400 hover:text-charcoal-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>M-Pesa Settings</span>
          {currentMpesa?.isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'bank'
              ? 'border-forest-700 text-forest-900 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-400 hover:text-charcoal-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank Transfer Settings</span>
          {currentBank?.isActive && (
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('other')}
          className={`flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'other'
              ? 'border-forest-700 text-forest-900 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-400 hover:text-charcoal-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Other Methods Settings</span>
          {currentOther?.isActive && (
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Forms (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* TAB 1: M-PESA */}
          {activeTab === 'mpesa' && (
            <form onSubmit={handleSaveMpesa} className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-warm-100 dark:border-charcoal-800">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-900 dark:text-white font-display">
                    M-Pesa Mobile Giving Configuration
                  </h2>
                  <p className="text-xs text-charcoal-600 dark:text-warm-400 mt-1">
                    Enter Safaricom Paybill, Till, or registered phone number credentials.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal-600 dark:text-warm-300">
                    Live Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle('mpesa')}
                    disabled={!canManage || togglingId === currentMpesa?.id}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentMpesa?.isActive ? 'bg-emerald-600' : 'bg-warm-300 dark:bg-charcoal-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        currentMpesa?.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-charcoal-800 dark:text-white">
                    {currentMpesa?.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Paybill Number
                  </label>
                  <input
                    type="text"
                    value={mpesaForm.paybillNumber || ''}
                    onChange={(e) => setMpesaForm({ ...mpesaForm, paybillNumber: e.target.value })}
                    placeholder="e.g. 247247 or 522522"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Official business Paybill registered with Safaricom.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Till Number (Buy Goods)
                  </label>
                  <input
                    type="text"
                    value={mpesaForm.tillNumber || ''}
                    onChange={(e) => setMpesaForm({ ...mpesaForm, tillNumber: e.target.value })}
                    placeholder="e.g. 9876543"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Buy Goods and Services Till number if applicable.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="text"
                    value={mpesaForm.mpesaPhoneNumber || ''}
                    onChange={(e) => setMpesaForm({ ...mpesaForm, mpesaPhoneNumber: e.target.value })}
                    placeholder="e.g. +254 790 629439"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Dedicated mobile giving line for Send Money donations.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Account Reference Name
                  </label>
                  <input
                    type="text"
                    value={mpesaForm.accountReference || ''}
                    onChange={(e) => setMpesaForm({ ...mpesaForm, accountReference: e.target.value })}
                    placeholder="e.g. MWANCHA or DONOR NAME"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    What supporters should enter as Account Name when paying.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                  Payment Instructions
                </label>
                <textarea
                  rows={4}
                  value={mpesaForm.instructions || ''}
                  onChange={(e) => setMpesaForm({ ...mpesaForm, instructions: e.target.value })}
                  placeholder="Step by step instructions for mobile donors..."
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                />
                <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                  Clear directions shown to donors on how to complete the transaction on their mobile device.
                </span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-warm-100 dark:border-charcoal-800">
                <div className="text-xs text-charcoal-500 dark:text-warm-400">
                  Last updated: {currentMpesa?.updatedAt ? new Date(currentMpesa.updatedAt).toLocaleDateString() : 'Never'}
                </div>

                <button
                  type="submit"
                  disabled={!canManage || savingId === currentMpesa?.id}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingId === currentMpesa?.id ? 'Saving...' : 'Save M-Pesa Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BANK TRANSFER */}
          {activeTab === 'bank' && (
            <form onSubmit={handleSaveBank} className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-warm-100 dark:border-charcoal-800">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-900 dark:text-white font-display">
                    Bank Wire Transfer Configuration
                  </h2>
                  <p className="text-xs text-charcoal-600 dark:text-warm-400 mt-1">
                    Enter institutional bank coordinates, account name, branch, and SWIFT code.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal-600 dark:text-warm-300">
                    Live Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle('bank')}
                    disabled={!canManage || togglingId === currentBank?.id}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentBank?.isActive ? 'bg-blue-600' : 'bg-warm-300 dark:bg-charcoal-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        currentBank?.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-charcoal-800 dark:text-white">
                    {currentBank?.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.bankName || ''}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="e.g. Kenya Commercial Bank (KCB) or Equity Bank"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Full commercial banking institution name.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountName || ''}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    placeholder="e.g. Mwancha Senior Community"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Exact title registered on the corporate bank account.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountNumber || ''}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="e.g. 1234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Primary institutional bank account number.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.branch || ''}
                    onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                    placeholder="e.g. Nyamira Branch or Kisii Branch"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    Domiciled bank branch.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={bankForm.swiftCode || ''}
                    onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                    placeholder="e.g. KCBLKENX"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium uppercase"
                  />
                  <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                    For international wire transfers.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                  Payment Instructions
                </label>
                <textarea
                  rows={4}
                  value={bankForm.instructions || ''}
                  onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
                  placeholder="Instructions for EFT, RTGS, or cash deposits..."
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                />
                <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                  Guidelines for EFT/RTGS transfers, teller deposits, and payment reference numbers.
                </span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-warm-100 dark:border-charcoal-800">
                <div className="text-xs text-charcoal-500 dark:text-warm-400">
                  Last updated: {currentBank?.updatedAt ? new Date(currentBank.updatedAt).toLocaleDateString() : 'Never'}
                </div>

                <button
                  type="submit"
                  disabled={!canManage || savingId === currentBank?.id}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingId === currentBank?.id ? 'Saving...' : 'Save Bank Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: OTHER METHODS */}
          {activeTab === 'other' && (
            <form onSubmit={handleSaveOther} className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-warm-100 dark:border-charcoal-800">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-900 dark:text-white font-display">
                    Other Payment Methods Configuration
                  </h2>
                  <p className="text-xs text-charcoal-600 dark:text-warm-400 mt-1">
                    Provide client-approved instructions for offline cheques, in-person giving, or international grants.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal-600 dark:text-warm-300">
                    Live Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle('other')}
                    disabled={!canManage || togglingId === currentOther?.id}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      currentOther?.isActive ? 'bg-purple-600' : 'bg-warm-300 dark:bg-charcoal-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        currentOther?.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-charcoal-800 dark:text-white">
                    {currentOther?.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                  Method Title / Provider Name
                </label>
                <input
                  type="text"
                  value={otherForm.methodTitle || ''}
                  onChange={(e) => setOtherForm({ ...otherForm, methodTitle: e.target.value })}
                  placeholder="e.g. Cheque, Secretariat In-Person, or Wire Transfer"
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                  Client-Approved Instructions
                </label>
                <textarea
                  rows={5}
                  value={otherForm.clientApprovedInstructions || otherForm.instructions || ''}
                  onChange={(e) => setOtherForm({ ...otherForm, clientApprovedInstructions: e.target.value, instructions: e.target.value })}
                  placeholder="Official instructions for donors seeking alternative channels..."
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                />
                <span className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1 block">
                  Specific directions verified and approved by the MSC leadership.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={otherForm.notes || ''}
                  onChange={(e) => setOtherForm({ ...otherForm, notes: e.target.value })}
                  placeholder="e.g. Official receipts are issued within 48 hours."
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-forest-600 focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-warm-100 dark:border-charcoal-800">
                <div className="text-xs text-charcoal-500 dark:text-warm-400">
                  Last updated: {currentOther?.updatedAt ? new Date(currentOther.updatedAt).toLocaleDateString() : 'Never'}
                </div>

                <button
                  type="submit"
                  disabled={!canManage || savingId === currentOther?.id}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingId === currentOther?.id ? 'Saving...' : 'Save Other Methods Settings'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Live Website Preview (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="bg-warm-100/70 dark:bg-charcoal-900/80 rounded-3xl p-6 border border-warm-300 dark:border-charcoal-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-900 dark:text-white">
                  Live Public Preview
                </h3>
              </div>
              <span className="text-[11px] font-bold text-charcoal-500 dark:text-warm-400">
                Donor View
              </span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-warm-300 mb-6 leading-relaxed">
              This card reflects what public visitors will see on the <Link to="/donate" target="_blank" className="text-forest-700 dark:text-forest-400 font-bold underline">Support Our Work</Link> page.
            </p>

            {/* M-PESA PREVIEW */}
            {activeTab === 'mpesa' && (
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-warm-200 dark:border-charcoal-700 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentMpesa?.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-warm-200 text-charcoal-700 dark:bg-charcoal-700 dark:text-warm-300'
                  }`}>
                    {currentMpesa?.isActive ? 'PUBLISHED' : 'DEACTIVATED'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-charcoal-900 dark:text-white">
                    M-Pesa Mobile Giving
                  </h4>
                  <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-1 leading-relaxed">
                    {mpesaForm.instructions || 'Official Safaricom M-Pesa channels.'}
                  </p>
                </div>

                {currentMpesa?.isActive ? (
                  <div className="space-y-2 pt-2 border-t border-warm-100 dark:border-charcoal-700 text-xs">
                    {mpesaForm.paybillNumber && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-charcoal-900/80 border border-warm-200 dark:border-charcoal-700">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">Paybill Number</span>
                          <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-white">{mpesaForm.paybillNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(mpesaForm.paybillNumber || '', 'paybill')}
                          className="p-1.5 rounded-md hover:bg-warm-200 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-warm-300"
                          title="Copy"
                        >
                          {copiedKey === 'paybill' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {mpesaForm.tillNumber && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-charcoal-900/80 border border-warm-200 dark:border-charcoal-700">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">Till Number</span>
                          <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-white">{mpesaForm.tillNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(mpesaForm.tillNumber || '', 'till')}
                          className="p-1.5 rounded-md hover:bg-warm-200 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-warm-300"
                          title="Copy"
                        >
                          {copiedKey === 'till' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {mpesaForm.mpesaPhoneNumber && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-warm-50 dark:bg-charcoal-900/80 border border-warm-200 dark:border-charcoal-700">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-charcoal-500 dark:text-warm-400 block">M-Pesa Phone</span>
                          <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-white">{mpesaForm.mpesaPhoneNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(mpesaForm.mpesaPhoneNumber || '', 'phone')}
                          className="p-1.5 rounded-md hover:bg-warm-200 dark:hover:bg-charcoal-700 text-charcoal-600 dark:text-warm-300"
                          title="Copy"
                        >
                          {copiedKey === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                    {mpesaForm.accountReference && (
                      <div className="text-[11px] text-charcoal-600 dark:text-warm-400 pt-1">
                        Account Reference: <strong className="text-charcoal-900 dark:text-white">{mpesaForm.accountReference}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-warm-100 dark:bg-charcoal-900 text-xs text-charcoal-600 dark:text-warm-400 text-center font-medium border border-warm-200 dark:border-charcoal-700">
                    Channel currently deactivated by administrator.
                  </div>
                )}
              </div>
            )}

            {/* BANK PREVIEW */}
            {activeTab === 'bank' && (
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-warm-200 dark:border-charcoal-700 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-800 dark:text-blue-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentBank?.isActive
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-warm-200 text-charcoal-700 dark:bg-charcoal-700 dark:text-warm-300'
                  }`}>
                    {currentBank?.isActive ? 'PUBLISHED' : 'DEACTIVATED'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-charcoal-900 dark:text-white">
                    Direct Bank Wire Transfer
                  </h4>
                  <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-1 leading-relaxed">
                    {bankForm.instructions || 'Direct institutional bank deposit coordinates.'}
                  </p>
                </div>

                {currentBank?.isActive ? (
                  <div className="space-y-2 pt-2 border-t border-warm-100 dark:border-charcoal-700 text-xs">
                    <div className="p-2 rounded-lg bg-warm-50 dark:bg-charcoal-900/80 border border-warm-200 dark:border-charcoal-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500 dark:text-warm-400">Bank:</span>
                        <strong className="text-charcoal-900 dark:text-white">{bankForm.bankName || 'Not specified'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500 dark:text-warm-400">Account Name:</span>
                        <strong className="text-charcoal-900 dark:text-white">{bankForm.accountName || 'Mwancha Senior Community'}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal-500 dark:text-warm-400">Account No:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-charcoal-900 dark:text-white">{bankForm.accountNumber || 'Not specified'}</strong>
                          {bankForm.accountNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopy(bankForm.accountNumber || '', 'acct')}
                              className="text-charcoal-600 hover:text-charcoal-900 dark:text-warm-300"
                              title="Copy"
                            >
                              {copiedKey === 'acct' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                      {bankForm.branch && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500 dark:text-warm-400">Branch:</span>
                          <span className="text-charcoal-800 dark:text-warm-200">{bankForm.branch}</span>
                        </div>
                      )}
                      {bankForm.swiftCode && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500 dark:text-warm-400">SWIFT Code:</span>
                          <span className="font-mono font-bold text-charcoal-800 dark:text-warm-200">{bankForm.swiftCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-warm-100 dark:bg-charcoal-900 text-xs text-charcoal-600 dark:text-warm-400 text-center font-medium border border-warm-200 dark:border-charcoal-700">
                    Channel currently deactivated by administrator.
                  </div>
                )}
              </div>
            )}

            {/* OTHER PREVIEW */}
            {activeTab === 'other' && (
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-warm-200 dark:border-charcoal-700 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-800 dark:text-purple-300">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    currentOther?.isActive
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-warm-200 text-charcoal-700 dark:bg-charcoal-700 dark:text-warm-300'
                  }`}>
                    {currentOther?.isActive ? 'PUBLISHED' : 'DEACTIVATED'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-charcoal-900 dark:text-white">
                    {otherForm.methodTitle || 'Other Approved Methods'}
                  </h4>
                  <p className="text-xs text-charcoal-600 dark:text-warm-300 mt-2 leading-relaxed">
                    {otherForm.clientApprovedInstructions || otherForm.instructions || 'Client-approved payment instructions.'}
                  </p>
                </div>

                {otherForm.notes && (
                  <div className="p-2.5 rounded-lg bg-warm-50 dark:bg-charcoal-900 text-[11px] text-charcoal-700 dark:text-warm-300 border border-warm-200 dark:border-charcoal-700">
                    {otherForm.notes}
                  </div>
                )}

                {!currentOther?.isActive && (
                  <div className="p-3 rounded-xl bg-warm-100 dark:bg-charcoal-900 text-xs text-charcoal-600 dark:text-warm-400 text-center font-medium border border-warm-200 dark:border-charcoal-700">
                    Channel currently deactivated by administrator.
                  </div>
                )}
              </div>
            )}

            {/* Admin Guidance Box */}
            <div className="mt-6 p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800/60 border border-warm-200 dark:border-charcoal-700 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-800 dark:text-forest-400">
                <Info className="w-4 h-4" />
                <span>Zero Developer Intervention</span>
              </div>
              <p className="text-xs text-charcoal-600 dark:text-warm-300 leading-relaxed">
                When you toggle the switch to <strong>Active</strong> or <strong>Deactivated</strong>, the change is applied immediately to the live public website. No code changes or server redeployment are required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsPage;
