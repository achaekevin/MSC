import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { impactService, ImpactMetric } from '../../services/impactService';
import {
  Award,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  ShieldCheck,
  Calendar,
  Globe,
  HeartHandshake,
  Users,
  Send,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
  Check,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { ContentStatus } from '../../types';

const CATEGORY_OPTIONS = [
  'beneficiaries',
  'volunteers',
  'coverage',
  'operations',
  'healthcare',
  'psychosocial'
];

const ICON_OPTIONS = [
  { label: 'Users / Beneficiaries', value: 'Users' },
  { label: 'Calendar / Founded', value: 'Calendar' },
  { label: 'Globe / Scope', value: 'Globe' },
  { label: 'HeartHandshake / Volunteers', value: 'HeartHandshake' },
  { label: 'Award / Excellence', value: 'Award' }
];

interface MetricFormData {
  label: string;
  value: string;
  unit: string;
  category: string;
  icon: string;
  description: string;
  sourceDocument: string;
  reportingPeriod: string;
  displayOrder: number;
  status: string;
  clientApprovedConfirmation: boolean;
}

const DEFAULT_FORM_DATA: MetricFormData = {
  label: '',
  value: '',
  unit: '',
  category: 'beneficiaries',
  icon: 'Users',
  description: '',
  sourceDocument: 'MSC Organizational Profile 2024',
  reportingPeriod: '2024–2026',
  displayOrder: 0,
  status: 'APPROVED',
  clientApprovedConfirmation: true
};

export const ImpactManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const editParamId = searchParams.get('edit');

  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MetricFormData>(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch metrics from admin API
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await impactService.getAdminMetrics();
      setMetrics(data);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to fetch impact metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Open modal if URL query param ?edit=id exists
  useEffect(() => {
    if (editParamId && metrics.length > 0) {
      const target = metrics.find((m) => m.id === editParamId);
      if (target) {
        handleOpenEdit(target);
      }
    }
  }, [editParamId, metrics]);

  // Open Edit Modal
  const handleOpenEdit = (metric: ImpactMetric) => {
    setEditingMetricId(metric.id);
    setFormData({
      label: metric.label,
      value: metric.value,
      unit: metric.unit || '',
      category: metric.category || 'beneficiaries',
      icon: metric.icon || 'Users',
      description: metric.description || '',
      sourceDocument: metric.sourceDocument || 'MSC Organizational Profile 2024',
      reportingPeriod: metric.reportingPeriod || '2024–2026',
      displayOrder: metric.displayOrder ?? 0,
      status: metric.status || 'APPROVED',
      clientApprovedConfirmation: true
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingMetricId(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      displayOrder: metrics.length
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMetricId(null);
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.label.trim()) errors.label = 'Indicator title / label is required.';
    if (!formData.value.trim()) errors.value = 'Value is required (e.g. 1,203+, 2016, Kenya).';
    if (!formData.sourceDocument.trim()) errors.sourceDocument = 'Source document is required.';
    if (!formData.clientApprovedConfirmation) {
      errors.clientApprovedConfirmation = 'You must certify this statistic is client-approved.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Metric Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.label.trim(),
        label: formData.label.trim(),
        value: formData.value.trim(),
        unit: formData.unit.trim() || undefined,
        category: formData.category,
        icon: formData.icon,
        description: formData.description.trim() || undefined,
        sourceDocument: formData.sourceDocument.trim(),
        reportingPeriod: formData.reportingPeriod.trim(),
        displayOrder: Number(formData.displayOrder),
        status: formData.status
      };

      if (editingMetricId) {
        await impactService.updateMetric(editingMetricId, payload);
        showNotification('success', 'Impact metric updated successfully without touching source code!');
      } else {
        await impactService.createMetric(payload);
        showNotification('success', 'New verified impact metric added successfully!');
      }

      handleCloseModal();
      await fetchMetrics();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save impact metric.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Change Actions
  const handleStatusChange = async (id: string, action: 'publish' | 'approve' | 'delete') => {
    try {
      if (action === 'publish') {
        await impactService.publishMetric(id);
        showNotification('success', 'Metric published live to the website.');
      } else if (action === 'approve') {
        await impactService.approveMetric(id);
        showNotification('success', 'Metric approved.');
      } else if (action === 'delete') {
        if (!window.confirm('Are you sure you want to remove this impact metric?')) return;
        await impactService.deleteMetric(id);
        showNotification('success', 'Metric deleted.');
      }
      await fetchMetrics();
    } catch (err: any) {
      showNotification('error', err?.message || `Failed to ${action} metric.`);
    }
  };

  // Filtered list
  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) => {
      const matchesSearch =
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.sourceDocument && m.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || m.status?.toUpperCase() === statusFilter.toUpperCase();

      const matchesCategory =
        categoryFilter === 'all' || m.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [metrics, searchQuery, statusFilter, categoryFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = metrics.length;
    const published = metrics.filter((m) => m.status === 'PUBLISHED').length;
    const approved = metrics.filter((m) => m.status === 'APPROVED').length;
    const draft = metrics.filter((m) => m.status === 'DRAFT' || m.status === 'IN_REVIEW').length;
    return { total, published, approved, draft };
  }, [metrics]);

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-charcoal-900 dark:text-warm-50">
              Impact Metrics & Statistics Dashboard
            </h1>
          </div>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-warm-300">
            Maintain, edit, and publish verified organizational statistics live to the website without code alterations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:bg-warm-100 transition-colors shadow-xs"
            title="Refresh statistics list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Metric</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-md animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
              : 'bg-sky-50 text-sky-900 border border-sky-200 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">Total Tracked</span>
          <p className="text-3xl font-black text-charcoal-900 dark:text-white mt-1 font-display">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Published Live</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">Approved</span>
          <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1 font-display">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Draft / Review</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-display">{stats.draft}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-charcoal-900 p-4 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search metric title, value, source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 focus:outline-none capitalize"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-warm-200 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Section</span>
          </a>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-forest-700 animate-spin mb-3" />
            <p className="text-sm font-semibold text-charcoal-600 dark:text-warm-300">
              Loading impact indicators...
            </p>
          </div>
        ) : filteredMetrics.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Layers className="w-12 h-12 mx-auto text-charcoal-400 mb-3" />
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100">No Metrics Found</h3>
            <p className="text-sm text-charcoal-500 max-w-sm mx-auto mt-1">
              No impact statistics match the selected criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-warm-50 dark:bg-charcoal-800/60 border-b border-warm-200 dark:border-charcoal-700 text-xs font-black uppercase text-charcoal-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Metric / Title</th>
                  <th className="py-4 px-6">Current Value</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Source Document</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800">
                {filteredMetrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-warm-50/60 dark:hover:bg-charcoal-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-charcoal-900 dark:text-warm-50 text-base">
                        {metric.label}
                      </div>
                      <div className="text-xs text-charcoal-500 truncate max-w-xs mt-0.5">
                        {metric.description || 'Verified institutional statistic.'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xl font-black font-display text-forest-900 dark:text-emerald-400">
                        {metric.value}
                      </span>
                      {metric.unit && (
                        <span className="text-xs text-charcoal-500 block">({metric.unit})</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-xs font-bold px-2.5 py-1 rounded-full bg-warm-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 border border-warm-200 dark:border-charcoal-700">
                        {metric.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-semibold text-charcoal-800 dark:text-warm-200">
                        {metric.sourceDocument || 'MSC Organizational Profile 2024'}
                      </div>
                      <div className="text-[11px] text-charcoal-500">
                        Period: {metric.reportingPeriod || '2024–2026'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          metric.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : metric.status === 'APPROVED'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{metric.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(metric)}
                            className="p-2 rounded-lg bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-warm-200 transition-colors"
                            title="Edit Metric Value"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canPublish && metric.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleStatusChange(metric.id, 'publish')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                            title="Publish Live"
                          >
                            Publish
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleStatusChange(metric.id, 'delete')}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Delete Metric"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          CREATE / EDIT METRIC MODAL
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-warm-300 dark:border-charcoal-700 shadow-2xl text-left my-8">
            <div className="flex items-center justify-between pb-4 border-b border-warm-200 dark:border-charcoal-800 mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-forest-100 dark:bg-forest-900/80 text-forest-800 dark:text-emerald-400">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-black font-display text-charcoal-900 dark:text-white">
                  {editingMetricId ? 'Update Approved Metric' : 'Add Verified Impact Metric'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300 flex items-center justify-center font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5">
              {/* Metric Label & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Indicator Label / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elderly & OVC Households"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  {formErrors.label && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.label}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Approved Value *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1,203+ or 2016 or Kenya"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 font-bold"
                  />
                  {formErrors.value && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.value}</p>
                  )}
                </div>
              </div>

              {/* Unit & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Unit / Qualifier (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. households, mobilizers, years"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Thematic Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 capitalize"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Visual Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    {ICON_OPTIONS.map((ico) => (
                      <option key={ico.value} value={ico.value}>
                        {ico.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Display Order & Priority
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                  Indicator Narrative & Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail the community methodology or what this statistic encompasses..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Source Document & Reporting Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Auditing Source Document *
                  </label>
                  <input
                    type="text"
                    value={formData.sourceDocument}
                    onChange={(e) => setFormData({ ...formData, sourceDocument: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  {formErrors.sourceDocument && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.sourceDocument}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Reporting Period
                  </label>
                  <input
                    type="text"
                    value={formData.reportingPeriod}
                    onChange={(e) => setFormData({ ...formData, reportingPeriod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                  Publication Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['PUBLISHED', 'APPROVED', 'DRAFT'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        formData.status === st
                          ? 'bg-forest-900 dark:bg-emerald-600 text-white shadow-sm'
                          : 'bg-warm-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-300 border border-warm-200 dark:border-charcoal-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Non-fabrication & Consent Safeguard */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.clientApprovedConfirmation}
                    onChange={(e) =>
                      setFormData({ ...formData, clientApprovedConfirmation: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 rounded border-amber-400 text-forest-800 focus:ring-forest-600"
                  />
                  <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-semibold">
                    <span>
                      I verify that this indicator represents client-approved records from Mwancha Senior Community's official documentation without simulation or artificial inflation.
                    </span>
                  </div>
                </label>
                {formErrors.clientApprovedConfirmation && (
                  <p className="text-xs text-rose-600 font-bold mt-1.5">
                    {formErrors.clientApprovedConfirmation}
                  </p>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-200 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-300 font-bold text-sm hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingMetricId
                    ? 'Update Statistic'
                    : 'Create Indicator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactManagementPage;
