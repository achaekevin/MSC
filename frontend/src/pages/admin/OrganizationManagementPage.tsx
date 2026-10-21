import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { organizationService, OrganizationProfile } from '../../services/organizationService';
import {
  Building2,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Target,
  Eye,
  History,
  Shield,
  HeartHandshake
} from 'lucide-react';

export const OrganizationManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('SETTINGS_MANAGE') || hasPermission('CONTENT_UPDATE');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'mission' | 'contact' | 'values'>('general');

  const [formData, setFormData] = useState<Partial<OrganizationProfile>>({
    name: 'Mwancha Senior Community',
    formerName: 'Mwancha Home for the Elderly',
    tagline: 'Empowering senior citizens through health, economic, social, and psychosocial development',
    legalStatus: 'Registered Community-Based Organization (Kenya)',
    geographicScope: 'Nyamira County & Nyanza-Kenya',
    coreGoal: 'Promote elder rights, eliminate elder abuse, and provide holistic psychosocial support',
    address: 'Mwancha House, Ekerenyo-Obwari-Magwagwa Road',
    postalCode: '162-40506',
    county: 'Nyamira County',
    country: 'Kenya',
    email: 'mwanchaseniorcommunity@gmail.com',
    phone: '+254 790 629439',
    helpline: '+254 790 629439',
    vision: 'A dignified, resilient, and inclusive society where older persons live free from discrimination and neglect.',
    mission: 'To advance the holistic wellbeing, healthcare access, and social protection of vulnerable seniors through community-led action.',
    history: 'Founded in 2016 in Ekerenyo as Mwancha Home for the Elderly, the initiative grew to encompass mobile health screening, psychosocial support, legal safeguarding, and community sensitization.',
    values: 'Dignity, Integrity, Compassion, Inclusivity, Transparency, Community Solidarity'
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await organizationService.getAdminProfile();
      if (data) {
        setFormData(prev => ({
          ...prev,
          ...data,
          values: Array.isArray(data.values) ? (data.values as any[]).map(v => typeof v === 'string' ? v : v.name).join(', ') : data.values
        }));
      }
    } catch {
      // Fallback to public profile or defaults
      try {
        const publicData = await organizationService.getProfile();
        if (publicData) {
          setFormData(prev => ({ ...prev, ...publicData }));
        }
      } catch {
        // Keep defaults
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (field: keyof OrganizationProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setErrorMessage('You do not have permission to modify organization settings.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload = {
        ...formData
      };

      await organizationService.updateProfile(payload);
      setSuccessMessage('Organization profile updated successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save organization settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-forest-700 animate-spin" />
        <span className="ml-3 text-sm text-charcoal-600 font-medium">Loading organization configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-200 dark:border-charcoal-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-forest-700 dark:text-forest-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Governance & Organization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-display mt-1">
            Organization Profile & Identity
          </h1>
          <p className="text-sm text-charcoal-600 dark:text-warm-300/80 mt-1">
            Manage official Mwancha Senior Community identity, mission statement, contact points, and historical context.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-white dark:bg-charcoal-900 border border-warm-300 dark:border-charcoal-700 rounded-xl hover:bg-warm-50 dark:hover:bg-charcoal-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-3 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-warm-200 dark:border-charcoal-800 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-forest-700 text-forest-800 dark:text-forest-400 dark:border-forest-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900 dark:hover:text-warm-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>General Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mission')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'mission'
              ? 'border-forest-700 text-forest-800 dark:text-forest-400 dark:border-forest-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900 dark:hover:text-warm-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Mission & Vision</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-forest-700 text-forest-800 dark:text-forest-400 dark:border-forest-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900 dark:hover:text-warm-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Physical & Contacts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('values')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'values'
              ? 'border-forest-700 text-forest-800 dark:text-forest-400 dark:border-forest-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900 dark:hover:text-warm-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Values & History</span>
        </button>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: General Identity */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-forest-700" />
              <span>Official Naming & Legal Framework</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Official Legal Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
                <p className="text-xs text-charcoal-500 mt-1">Must match statutory NGO/CBO registration certificates.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Former / Historical Name
                </label>
                <input
                  type="text"
                  value={formData.formerName || ''}
                  onChange={e => handleChange('formerName', e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Mwancha Home for the Elderly"
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
                <p className="text-xs text-charcoal-500 mt-1">Displayed in historical context for public clarity.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Organizational Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={e => handleChange('tagline', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Legal Registration Status
                </label>
                <input
                  type="text"
                  value={formData.legalStatus || ''}
                  onChange={e => handleChange('legalStatus', e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Registered CBO (Department of Social Development)"
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Geographic Operational Scope
                </label>
                <input
                  type="text"
                  value={formData.geographicScope || ''}
                  onChange={e => handleChange('geographicScope', e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Nyamira County & Nyanza-Kenya"
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Core Strategic Goal
                </label>
                <textarea
                  rows={2}
                  value={formData.coreGoal || ''}
                  onChange={e => handleChange('coreGoal', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mission & Vision */}
        {activeTab === 'mission' && (
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-forest-700" />
              <span>Vision & Mission Statements</span>
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Vision Statement *
                </label>
                <textarea
                  rows={3}
                  value={formData.vision || ''}
                  onChange={e => handleChange('vision', e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Mission Statement *
                </label>
                <textarea
                  rows={3}
                  value={formData.mission || ''}
                  onChange={e => handleChange('mission', e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contact Points & Physical Location */}
        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-forest-700" />
              <span>Secretariat Address & Official Contact Channels</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Physical Secretariat Address *
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Postal Address / Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={e => handleChange('postalCode', e.target.value)}
                  disabled={!canEdit}
                  placeholder="P.O. Box 162-40506 Ekerenyo"
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  County
                </label>
                <input
                  type="text"
                  value={formData.county || ''}
                  onChange={e => handleChange('county', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Official Secretariat Telephone
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Community Helpline / Emergency Support
                </label>
                <input
                  type="text"
                  value={formData.helpline || ''}
                  onChange={e => handleChange('helpline', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Values & History */}
        {activeTab === 'values' && (
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 border border-warm-200 dark:border-charcoal-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100 flex items-center gap-2">
              <History className="w-5 h-5 text-forest-700" />
              <span>Core Values & Founding Narrative</span>
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Core Values (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.values || ''}
                  onChange={e => handleChange('values', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Dignity, Integrity, Compassion, Transparency, Solidarity"
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase tracking-wider mb-2">
                  Organizational History & Founding Narrative
                </label>
                <textarea
                  rows={4}
                  value={formData.history || ''}
                  onChange={e => handleChange('history', e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-4 py-3 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Actions Bar */}
        {canEdit && (
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Organization Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrganizationManagementPage;
