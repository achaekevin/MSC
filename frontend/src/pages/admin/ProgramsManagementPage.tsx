import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  programManagementService,
  ProgramWithStatus,
  ProgramCategory,
  ProgramInput
} from '../../services/programManagementService';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Globe,
  Tag,
  X,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  IN_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  CHANGES_REQUESTED: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  APPROVED: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' }
};

const DEFAULT_PROGRAM_INPUT: ProgramInput = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  categoryId: '',
  objectives: [''],
  activities: [''],
  targetBeneficiaries: [''],
  thematicArea: 'Elder Care & Welfare',
  approach: '',
  iconName: 'HeartHandshake',
  image: '/images/mwancha-facility-main.jpg',
  imageAlt: 'Mwancha community program outreach',
  metricsHighlight: '',
  relatedProgramSlugs: [],
  featured: false,
  displayOrder: 1,
  seoTitle: '',
  seoDescription: '',
  changeNote: ''
};

export const ProgramsManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  const [programs, setPrograms] = useState<ProgramWithStatus[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramWithStatus | null>(null);
  const [formInput, setFormInput] = useState<ProgramInput>(DEFAULT_PROGRAM_INPUT);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Workflow Dialog
  const [workflowDialog, setWorkflowDialog] = useState<{
    open: boolean;
    type: 'SUBMIT' | 'APPROVE' | 'PUBLISH' | 'DELETE';
    programId: string;
    programTitle: string;
    notes: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await programManagementService.getCategories();
      setCategories(cats);
    } catch {
      // Fallback
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await programManagementService.getAllPrograms(
        currentPage,
        15,
        statusFilter,
        searchQuery,
        categoryFilter
      );
      setPrograms(res.programs);
      setTotal(res.total);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to load programs'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Clear notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setFormInput({
      ...DEFAULT_PROGRAM_INPUT,
      categoryId: categories[0]?.id || ''
    });
    setFormErrors({});
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (program: ProgramWithStatus) => {
    setEditingProgram(program);
    setFormInput({
      title: program.title,
      slug: program.slug,
      shortDescription: program.shortDescription || program.summary || '',
      fullDescription: program.fullDescription || program.description || '',
      categoryId: program.categoryId || program.category?.id || '',
      objectives: program.objectives?.length ? program.objectives : [''],
      activities: program.activities?.length ? program.activities : [''],
      targetBeneficiaries: program.targetBeneficiaries?.length ? program.targetBeneficiaries : [''],
      thematicArea: program.thematicArea || '',
      approach: program.approach || '',
      iconName: program.iconName || 'HeartHandshake',
      image: program.image || '',
      imageAlt: program.imageAlt || '',
      metricsHighlight: program.metricsHighlight || '',
      relatedProgramSlugs: program.relatedProgramSlugs || [],
      featured: program.featured ?? false,
      displayOrder: program.displayOrder ?? 0,
      seoTitle: program.seoTitle || '',
      seoDescription: program.seoDescription || '',
      changeNote: ''
    });
    setFormErrors({});
    setIsEditorOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formInput.title.trim()) errors.title = 'Title is required';
    if (!formInput.shortDescription?.trim()) errors.shortDescription = 'Summary description is required';
    if (!formInput.fullDescription?.trim()) errors.fullDescription = 'Detailed overview is required';
    if (!formInput.image.trim()) errors.image = 'Featured image URL or path is required';
    if (!formInput.imageAlt.trim()) errors.imageAlt = 'Image alt text is required for accessibility';

    const cleanObjectives = formInput.objectives.filter(o => o.trim() !== '');
    if (!cleanObjectives.length) errors.objectives = 'At least one objective is required';

    const cleanActivities = formInput.activities.filter(a => a.trim() !== '');
    if (!cleanActivities.length) errors.activities = 'At least one activity is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setActionLoading(true);
    try {
      const payload: ProgramInput = {
        ...formInput,
        objectives: cleanObjectives,
        activities: cleanActivities,
        targetBeneficiaries: formInput.targetBeneficiaries?.filter(b => b.trim() !== ''),
        displayOrder: Number(formInput.displayOrder) || 0
      };

      if (editingProgram) {
        await programManagementService.updateProgram(editingProgram.id, payload);
        setNotification({ type: 'success', message: `Program "${payload.title}" updated successfully.` });
      } else {
        await programManagementService.createProgram(payload);
        setNotification({ type: 'success', message: `Program "${payload.title}" created as Draft.` });
      }
      setIsEditorOpen(false);
      fetchPrograms();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Error saving program.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflowDialog) return;
    const { type, programId, notes } = workflowDialog;

    setActionLoading(true);
    try {
      if (type === 'SUBMIT') {
        await programManagementService.submitReview(programId, notes);
        setNotification({ type: 'success', message: 'Program submitted for review.' });
      } else if (type === 'APPROVE') {
        await programManagementService.approveProgram(programId, notes);
        setNotification({ type: 'success', message: 'Program approved for publication.' });
      } else if (type === 'PUBLISH') {
        await programManagementService.publishProgram(programId);
        setNotification({ type: 'success', message: 'Program published to public portal.' });
      } else if (type === 'DELETE') {
        await programManagementService.deleteProgram(programId);
        setNotification({ type: 'success', message: 'Program removed.' });
      }
      setWorkflowDialog(null);
      fetchPrograms();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleArrayFieldChange = (
    field: 'objectives' | 'activities' | 'targetBeneficiaries',
    index: number,
    value: string
  ) => {
    const list = [...(formInput[field] || [])];
    list[index] = value;
    setFormInput(prev => ({ ...prev, [field]: list }));
  };

  const handleAddArrayItem = (field: 'objectives' | 'activities' | 'targetBeneficiaries') => {
    setFormInput(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const handleRemoveArrayItem = (field: 'objectives' | 'activities' | 'targetBeneficiaries', index: number) => {
    const list = [...(formInput[field] || [])];
    if (list.length > 1) {
      list.splice(index, 1);
      setFormInput(prev => ({ ...prev, [field]: list }));
    }
  };

  // Quick stats
  const publishedCount = programs.filter(p => p.status === 'PUBLISHED').length;
  const inReviewCount = programs.filter(p => p.status === 'IN_REVIEW').length;
  const draftCount = programs.filter(p => p.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-2.5 py-0.5 rounded-full border border-forest-200">
              CMS Module
            </span>
            <span className="text-xs font-semibold text-gray-500">Section 14 & 20</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display mt-1">
            Program Portfolio Management
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Curate and manage Mwancha Senior Community's strategic pillars, objectives, and field interventions.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Program</span>
          </button>
        )}
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Pillars</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Published</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-amber-700">In Review</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">{inReviewCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{draftCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, overview, or thematic focus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-forest-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium border border-gray-300 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-forest-500 max-w-[180px]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Program Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-600">Retrieving programs from database...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No Programs Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              No program matches your current filters. Clear the search or add a new program.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50/80 text-gray-600 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Program Pillar</th>
                  <th className="py-3.5 px-4">Category & Source</th>
                  <th className="py-3.5 px-3 text-center">Order</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {programs.map((prog) => {
                  const statusStyle = STATUS_COLORS[prog.status] || STATUS_COLORS.DRAFT;
                  return (
                    <tr key={prog.id} className="hover:bg-warm-50/50 transition-colors">
                      {/* Title & info */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img
                              src={prog.image}
                              alt={prog.imageAlt || prog.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 font-display">{prog.title}</span>
                              {prog.featured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                  <Sparkles className="w-3 h-3" /> Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-md">
                              {prog.shortDescription || prog.summary}
                            </p>
                            <span className="text-[11px] text-gray-400 font-mono">/programs/{prog.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Source */}
                      <td className="py-4 px-4">
                        <span className="inline-block text-xs font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {prog.category?.name || 'Uncategorized'}
                        </span>
                        <div className="mt-1">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500">
                            {prog.source || 'OFFICIAL_PROFILE'}
                          </span>
                        </div>
                      </td>

                      {/* Order */}
                      <td className="py-4 px-3 text-center">
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {prog.displayOrder ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {prog.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Public View Link */}
                          <a
                            href={`/programs/${prog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Edit Button */}
                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEdit(prog)}
                              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Program"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Workflow: Submit for Review */}
                          {canUpdate && (prog.status === 'DRAFT' || prog.status === 'CHANGES_REQUESTED') && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'SUBMIT',
                                  programId: prog.id,
                                  programTitle: prog.title,
                                  notes: ''
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
                              title="Submit for Review"
                            >
                              <Send className="w-3.5 h-3.5" /> Submit
                            </button>
                          )}

                          {/* Workflow: Approve */}
                          {canApprove && prog.status === 'IN_REVIEW' && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'APPROVE',
                                  programId: prog.id,
                                  programTitle: prog.title,
                                  notes: ''
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-colors"
                              title="Approve Program"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}

                          {/* Workflow: Publish */}
                          {canPublish && prog.status === 'APPROVED' && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'PUBLISH',
                                  programId: prog.id,
                                  programTitle: prog.title,
                                  notes: ''
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                              title="Publish Live"
                            >
                              <Globe className="w-3.5 h-3.5" /> Publish
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'DELETE',
                                  programId: prog.id,
                                  programTitle: prog.title,
                                  notes: ''
                                })
                              }
                              className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Program Editor (Create / Edit) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-warm-50/60 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display">
                  {editingProgram ? `Edit Program: ${editingProgram.title}` : 'Create New Program Pillar'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ensure all details reflect verified Mwancha Senior Community interventions.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProgram} className="overflow-y-auto p-6 space-y-6 flex-1 text-left">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Program Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formInput.title}
                    onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                    placeholder="e.g. Case Management & Emergency Support"
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 ${
                      formErrors.title ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.title && <p className="text-xs text-rose-500 mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Category Pillar <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formInput.categoryId || ''}
                    onChange={(e) => setFormInput({ ...formInput, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 bg-white"
                  >
                    <option value="">Select a Strategic Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Summary / Lead Paragraph <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formInput.shortDescription}
                    onChange={(e) => setFormInput({ ...formInput, shortDescription: e.target.value })}
                    placeholder="A concise 2-sentence summary visible on program cards..."
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 ${
                      formErrors.shortDescription ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.shortDescription && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.shortDescription}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Full Program Overview & Scope <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formInput.fullDescription}
                    onChange={(e) => setFormInput({ ...formInput, fullDescription: e.target.value })}
                    placeholder="Detailed explanation of methodology, background, and delivery in Nyamira County..."
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 ${
                      formErrors.fullDescription ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.fullDescription && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.fullDescription}</p>
                  )}
                </div>
              </div>

              {/* Objectives Dynamic List */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Strategic Objectives <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem('objectives')}
                    className="text-xs text-forest-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Objective
                  </button>
                </div>
                {formInput.objectives.map((obj, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => handleArrayFieldChange('objectives', idx, e.target.value)}
                      placeholder={`Objective #${idx + 1}...`}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
                    />
                    {formInput.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('objectives', idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formErrors.objectives && <p className="text-xs text-rose-500">{formErrors.objectives}</p>}
              </div>

              {/* Activities Dynamic List */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Key Field Activities <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddArrayItem('activities')}
                    className="text-xs text-forest-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Activity
                  </button>
                </div>
                {formInput.activities.map((act, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={act}
                      onChange={(e) => handleArrayFieldChange('activities', idx, e.target.value)}
                      placeholder={`Activity #${idx + 1}...`}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
                    />
                    {formInput.activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem('activities', idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formErrors.activities && <p className="text-xs text-rose-500">{formErrors.activities}</p>}
              </div>

              {/* Media & Accessibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Featured Image URL / Path <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formInput.image}
                    onChange={(e) => setFormInput({ ...formInput, image: e.target.value })}
                    placeholder="/images/mwancha-facility-main.jpg"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  {formErrors.image && <p className="text-xs text-rose-500 mt-1">{formErrors.image}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Image Alt Text (Accessibility WCAG) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formInput.imageAlt}
                    onChange={(e) => setFormInput({ ...formInput, imageAlt: e.target.value })}
                    placeholder="Descriptive alt text for screen readers..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  {formErrors.imageAlt && <p className="text-xs text-rose-500 mt-1">{formErrors.imageAlt}</p>}
                </div>
              </div>

              {/* Extra Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formInput.displayOrder}
                    onChange={(e) => setFormInput({ ...formInput, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Metrics Highlight
                  </label>
                  <input
                    type="text"
                    value={formInput.metricsHighlight || ''}
                    onChange={(e) => setFormInput({ ...formInput, metricsHighlight: e.target.value })}
                    placeholder="e.g. 1,200+ Elders Supported"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="featured-program"
                    checked={formInput.featured}
                    onChange={(e) => setFormInput({ ...formInput, featured: e.target.checked })}
                    className="w-4 h-4 text-forest-800 rounded focus:ring-forest-500"
                  />
                  <label htmlFor="featured-program" className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              {/* Revision note for edits */}
              {editingProgram && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Change Note (Audit Log & Content Revision)
                  </label>
                  <input
                    type="text"
                    value={formInput.changeNote || ''}
                    onChange={(e) => setFormInput({ ...formInput, changeNote: e.target.value })}
                    placeholder="Briefly state why this program was modified..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingProgram ? 'Update Program' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow Confirmation Dialog */}
      {workflowDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-left border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 font-display">
              {workflowDialog.type === 'SUBMIT' && 'Submit Program for Review'}
              {workflowDialog.type === 'APPROVE' && 'Approve Program'}
              {workflowDialog.type === 'PUBLISH' && 'Publish Program Live'}
              {workflowDialog.type === 'DELETE' && 'Delete Program'}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Target: <span className="font-semibold text-gray-900">{workflowDialog.programTitle}</span>
            </p>

            {(workflowDialog.type === 'SUBMIT' || workflowDialog.type === 'APPROVE') && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Review Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={workflowDialog.notes}
                  onChange={(e) => setWorkflowDialog({ ...workflowDialog, notes: e.target.value })}
                  placeholder="Enter comments for editorial history..."
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {workflowDialog.type === 'PUBLISH' && (
              <p className="text-sm text-gray-700 mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                This will make the program instantly visible to the public under <code className="text-emerald-900 font-mono">/programs</code>.
              </p>
            )}

            {workflowDialog.type === 'DELETE' && (
              <p className="text-sm text-rose-700 mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
                This will soft-delete the program and retain historical audit records.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setWorkflowDialog(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteWorkflow}
                className={`px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-sm ${
                  workflowDialog.type === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : workflowDialog.type === 'PUBLISH'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-forest-800 hover:bg-forest-900'
                }`}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsManagementPage;
