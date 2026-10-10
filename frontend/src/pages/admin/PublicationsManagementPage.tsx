import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { publicationService, PublicationItem, PublicationInput, PublicationChapter } from '../../services/publicationService';
import {
  BookOpen,
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
  Download,
  Calendar,
  Clock,
  User,
  Layers,
  Sparkles,
  ExternalLink,
  FileText,
  FileCheck2,
  PlusCircle,
  MinusCircle
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Book',
  'Field Manual',
  'Policy Brief',
  'Annual Report',
  'Research Paper',
  'Article'
];

const PRESET_COVERS = [
  { label: 'Community Facility & Residence', url: '/images/mwancha-facility-main.jpg' },
  { label: 'Pavilion Elder Gathering', url: '/images/mwancha-pavilion-gathering.jpg' },
  { label: 'Elder Fellowship Baraza', url: '/images/mwancha-fellowship-gathering.jpg' },
  { label: 'Community Outpost Grounds', url: '/images/mwancha-community-grounds.jpg' }
];

interface PublicationFormData {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  coverImage: string;
  pdfUrl: string;
  fileSize: string;
  pages: number;
  readingTime: string;
  isbn: string;
  isFeatured: boolean;
  status: string;
  chapters: PublicationChapter[];
}

const DEFAULT_FORM_DATA: PublicationFormData = {
  title: '',
  subtitle: '',
  summary: '',
  content: '',
  category: 'Book',
  authorName: 'MSC Editorial & Research Unit',
  authorRole: 'Research & Knowledge Hub',
  coverImage: '/images/mwancha-facility-main.jpg',
  pdfUrl: '',
  fileSize: '2.5 MB',
  pages: 24,
  readingTime: '20 min read',
  isbn: '',
  isFeatured: false,
  status: 'PUBLISHED',
  chapters: [
    { title: 'Chapter 1: Background & Context', body: '' }
  ]
};

export const PublicationsManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PublicationFormData>(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch publications
  const fetchPublications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await publicationService.getAdminPublications();
      setPublications(data);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to fetch publications catalogue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Open Edit
  const handleOpenEdit = (pub: PublicationItem) => {
    setEditingId(pub.id);
    setFormData({
      title: pub.title,
      subtitle: pub.subtitle || '',
      summary: pub.summary,
      content: pub.content || pub.fullText,
      category: pub.category || 'Book',
      authorName: pub.authorName || 'MSC Editorial & Research Unit',
      authorRole: pub.authorRole || 'Research & Knowledge Hub',
      coverImage: pub.coverImage || '/images/mwancha-facility-main.jpg',
      pdfUrl: pub.pdfUrl || '',
      fileSize: pub.fileSize || '2.5 MB',
      pages: pub.pages || 24,
      readingTime: pub.readingTime || '20 min read',
      isbn: pub.isbn || '',
      isFeatured: Boolean(pub.isFeatured),
      status: pub.status || 'PUBLISHED',
      chapters: pub.chapters && pub.chapters.length > 0
        ? pub.chapters
        : [{ title: 'Chapter 1: Overview', body: pub.content || pub.summary }]
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Chapter management
  const handleAddChapter = () => {
    setFormData({
      ...formData,
      chapters: [
        ...formData.chapters,
        { title: `Chapter ${formData.chapters.length + 1}: `, body: '' }
      ]
    });
  };

  const handleRemoveChapter = (index: number) => {
    if (formData.chapters.length <= 1) return;
    setFormData({
      ...formData,
      chapters: formData.chapters.filter((_, i) => i !== index)
    });
  };

  const handleChapterChange = (index: number, field: 'title' | 'body', value: string) => {
    const updated = [...formData.chapters];
    updated[index][field] = value;
    setFormData({ ...formData, chapters: updated });
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.summary.trim()) errors.summary = 'Summary / Abstract is required.';
    if (formData.chapters.length === 0 && !formData.content.trim()) {
      errors.content = 'At least one chapter or document content is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: PublicationInput = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        summary: formData.summary.trim(),
        content: formData.content.trim() || formData.summary.trim(),
        category: formData.category,
        authorName: formData.authorName.trim(),
        authorRole: formData.authorRole.trim(),
        coverImage: formData.coverImage,
        pdfUrl: formData.pdfUrl.trim() || undefined,
        fileSize: formData.fileSize.trim() || undefined,
        pages: Number(formData.pages) || undefined,
        readingTime: formData.readingTime.trim() || undefined,
        isbn: formData.isbn.trim() || undefined,
        isFeatured: formData.isFeatured,
        status: formData.status,
        chapters: formData.chapters
      };

      if (editingId) {
        await publicationService.updatePublication(editingId, payload);
        showNotification('success', 'Publication / Book updated successfully!');
      } else {
        await publicationService.createPublication(payload);
        showNotification('success', 'New publication / book published successfully!');
      }

      handleCloseModal();
      await fetchPublications();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save publication.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Change actions
  const handleStatusAction = async (id: string, action: 'publish' | 'approve' | 'delete') => {
    try {
      if (action === 'publish') {
        await publicationService.publishPublication(id);
        showNotification('success', 'Publication published live.');
      } else if (action === 'approve') {
        await publicationService.approvePublication(id);
        showNotification('success', 'Publication approved.');
      } else if (action === 'delete') {
        if (!window.confirm('Are you sure you want to delete this publication?')) return;
        await publicationService.deletePublication(id);
        showNotification('success', 'Publication removed.');
      }
      await fetchPublications();
    } catch (err: any) {
      showNotification('error', err?.message || `Failed to ${action} publication.`);
    }
  };

  // Filtered publications
  const filteredPublications = useMemo(() => {
    return publications.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.isbn && p.isbn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || p.status?.toUpperCase() === statusFilter.toUpperCase();

      const matchesCategory =
        categoryFilter === 'all' || p.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [publications, searchQuery, statusFilter, categoryFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = publications.length;
    const books = publications.filter((p) => p.category === 'Book').length;
    const manuals = publications.filter((p) => p.category === 'Field Manual').length;
    const published = publications.filter((p) => p.status === 'PUBLISHED').length;
    return { total, books, manuals, published };
  }, [publications]);

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-charcoal-900 dark:text-warm-50">
              Publications, Books & Articles Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-warm-300">
            Publish books, research papers, and manuals for users to read online or export/download as PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPublications}
            disabled={loading}
            className="p-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:bg-warm-100 transition-colors shadow-xs"
            title="Refresh catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Book / Article</span>
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
              : 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
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

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">Total Catalogue</span>
          <p className="text-3xl font-black text-charcoal-900 dark:text-white mt-1 font-display">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Published Live</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">Books Published</span>
          <p className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1 font-display">{stats.books}</p>
        </div>
        <div className="bg-white dark:bg-charcoal-900 p-5 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Field Manuals</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-display">{stats.manuals}</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-charcoal-900 p-4 rounded-2xl border border-warm-200 dark:border-charcoal-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search publications, authors, document ref..."
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
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <a
            href="/publications"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-warm-200 text-xs font-bold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Library Hub</span>
          </a>
        </div>
      </div>

      {/* Publications Table */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-forest-700 animate-spin mb-3" />
            <p className="text-sm font-semibold text-charcoal-600 dark:text-warm-300">
              Loading publications...
            </p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="py-20 text-center px-4">
            <BookOpen className="w-12 h-12 mx-auto text-charcoal-400 mb-3" />
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-100">No Publications Found</h3>
            <p className="text-sm text-charcoal-500 max-w-sm mx-auto mt-1">
              Add a new book or article to begin publishing downloadable resources.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-warm-50 dark:bg-charcoal-800/60 border-b border-warm-200 dark:border-charcoal-700 text-xs font-black uppercase text-charcoal-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Document / Book</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Author & Role</th>
                  <th className="py-4 px-6">Format & Pages</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800">
                {filteredPublications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-warm-50/60 dark:hover:bg-charcoal-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={pub.coverImage || '/images/mwancha-facility-main.jpg'}
                          alt={pub.title}
                          className="w-12 h-14 object-cover rounded-lg border border-warm-200 dark:border-charcoal-700 flex-shrink-0"
                        />
                        <div className="max-w-md">
                          <div className="font-bold text-charcoal-900 dark:text-warm-50 text-base line-clamp-1">
                            {pub.title}
                          </div>
                          {pub.subtitle && (
                            <div className="text-xs text-charcoal-500 line-clamp-1 italic">
                              {pub.subtitle}
                            </div>
                          )}
                          <div className="text-[11px] text-charcoal-400 mt-0.5">
                            Slug: /{pub.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-xs font-bold px-2.5 py-1 rounded-full bg-forest-50 dark:bg-forest-950/80 text-forest-800 dark:text-emerald-300 border border-forest-200 dark:border-forest-800">
                        {pub.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-charcoal-800 dark:text-warm-200">
                        {pub.authorName}
                      </div>
                      <div className="text-[11px] text-charcoal-500">
                        {pub.authorRole}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-semibold text-charcoal-800 dark:text-warm-200">
                        {pub.pages || 24} Pages • {pub.fileSize || '2.4 MB'}
                      </div>
                      {pub.pdfUrl && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <Download className="w-3 h-3" />
                          <span>PDF Attached</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          pub.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : pub.status === 'APPROVED'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{pub.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/publications/${pub.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-warm-200 transition-colors"
                          title="Preview Online Reader & PDF Export"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(pub)}
                            className="p-2 rounded-lg bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-800 dark:text-warm-200 transition-colors"
                            title="Edit Publication"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {canPublish && pub.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleStatusAction(pub.id, 'publish')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                            title="Publish Live"
                          >
                            Publish
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleStatusAction(pub.id, 'delete')}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Delete Publication"
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
          CREATE / EDIT PUBLICATION MODAL
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-warm-300 dark:border-charcoal-700 shadow-2xl text-left my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-warm-200 dark:border-charcoal-800 mb-6 sticky top-0 bg-white dark:bg-charcoal-900 z-10">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-forest-100 dark:bg-forest-900/80 text-forest-800 dark:text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-black font-display text-charcoal-900 dark:text-white">
                  {editingId ? 'Edit Publication / Book' : 'Publish New Book or Article'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-warm-100 hover:bg-warm-200 dark:bg-charcoal-800 text-charcoal-600 dark:text-warm-300 flex items-center justify-center font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Book / Article Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Advancing Dignified Ageing in Kenya"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Subtitle / Edition
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A Grassroots Perspective on Social Protection"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Category, Author & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Document Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Author / Directorate
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Author Role / Unit
                  </label>
                  <input
                    type="text"
                    value={formData.authorRole}
                    onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Cover Image & Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[11px] text-charcoal-500 self-center">Presets:</span>
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-warm-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-300 hover:bg-forest-100 hover:text-forest-900 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Download URL, File Size, Pages & ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Direct PDF File URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /documents/elder-guide.pdf"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Pages Count
                  </label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 12 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={formData.readingTime}
                    onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Summary / Abstract */}
              <div>
                <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                  Executive Summary / Abstract *
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide an overview of the book or article..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                {formErrors.summary && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.summary}</p>
                )}
              </div>

              {/* Chapters & Content Builder */}
              <div className="space-y-4 pt-4 border-t border-warm-200 dark:border-charcoal-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-charcoal-900 dark:text-white uppercase tracking-wider">
                      Book Chapters & Reading Sections
                    </h4>
                    <p className="text-xs text-charcoal-500">
                      Add chapters so readers can read online with table of contents and export to PDF:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChapter}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-100 dark:bg-forest-900/80 text-forest-800 dark:text-emerald-300 text-xs font-bold hover:bg-forest-200 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Chapter</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {formData.chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder={`Chapter ${idx + 1} Title`}
                          value={ch.title}
                          onChange={(e) => handleChapterChange(idx, 'title', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white text-xs font-bold focus:outline-none"
                        />
                        {formData.chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChapter(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove Chapter"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Write or paste full chapter content here..."
                        value={ch.body}
                        onChange={(e) => handleChapterChange(idx, 'body', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Featured Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-warm-200 dark:border-charcoal-800 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-200 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-xs font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live to visitors)</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-warm-300 text-forest-800 focus:ring-forest-600"
                    />
                    <span className="text-xs font-bold text-charcoal-800 dark:text-warm-200">
                      Feature on Library Homepage
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-warm-200 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-300 font-bold text-sm hover:bg-warm-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Publishing...'
                    : editingId
                    ? 'Update Publication'
                    : 'Publish Book / Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationsManagementPage;
