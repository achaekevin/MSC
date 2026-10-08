import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  newsService,
  NewsArticleInput,
  NewsCategory
} from '../../services/newsService';
import { NewsArticle } from '../../types';
import { DraftPreviewModal } from '../../components/admin/DraftPreviewModal';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Send,
  Globe,
  Tag,
  X,
  Newspaper,
  Sparkles,
  ExternalLink,
  User,
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  IN_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  CHANGES_REQUESTED: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  APPROVED: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' }
};

const DEFAULT_NEWS_INPUT: NewsArticleInput = {
  title: '',
  slug: '',
  categoryId: '',
  category: 'Community Story',
  summary: '',
  content: [''],
  featuredImage: '/images/mwancha-facility-main.jpg',
  imageAlt: 'Mwancha community news update',
  authorName: 'MSC Communications Unit',
  authorRole: 'Communications & Outreach',
  tags: ['Community', 'Senior Care'],
  isFeatured: false,
  seoTitle: '',
  seoDescription: '',
  changeNote: '',
  status: 'PUBLISHED'
};

export const NewsManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formInput, setFormInput] = useState<NewsArticleInput>(DEFAULT_NEWS_INPUT);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Scheduling & Live Draft Preview State
  const [scheduleMode, setScheduleMode] = useState<'NOW' | 'SCHEDULE'>('NOW');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<NewsArticleInput | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Workflow Dialog
  const [workflowDialog, setWorkflowDialog] = useState<{
    open: boolean;
    type: 'SUBMIT' | 'APPROVE' | 'PUBLISH' | 'DELETE';
    articleId: string;
    articleTitle: string;
    notes: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await newsService.getCategories();
      setCategories(cats);
    } catch {
      // Fallback
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsService.getAllAdmin(
        currentPage,
        15,
        statusFilter,
        searchQuery,
        categoryFilter
      );
      setArticles(res.articles);
      setTotal(res.total);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to load news articles'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormInput(DEFAULT_NEWS_INPUT);
    setScheduleMode('NOW');
    setScheduledDateTime('');
    setFormErrors({});
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    const isScheduledFuture = article.publishedAt && new Date(article.publishedAt) > new Date();
    setScheduleMode(isScheduledFuture ? 'SCHEDULE' : 'NOW');
    setScheduledDateTime(
      isScheduledFuture ? new Date(article.publishedAt).toISOString().slice(0, 16) : ''
    );
    setFormInput({
      title: article.title,
      slug: article.slug,
      categoryId: article.categoryId || '',
      category: article.category,
      summary: article.summary,
      content: Array.isArray(article.content) ? article.content : [article.content],
      featuredImage: article.featuredImage,
      imageAlt: article.imageAlt,
      authorName: article.author?.name || 'MSC Communications Unit',
      authorRole: article.author?.role || 'Communications & Outreach',
      tags: article.tags || [],
      isFeatured: article.isFeatured ?? false,
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || '',
      changeNote: '',
      status: (article.status as any) || 'PUBLISHED',
      publishedAt: article.publishedAt
    });
    setFormErrors({});
    setIsEditorOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formInput.title.trim()) errors.title = 'Title is required';
    if (!formInput.summary.trim()) errors.summary = 'Summary lead paragraph is required';
    if (!formInput.featuredImage.trim()) errors.featuredImage = 'Featured image URL or path is required';
    if (!formInput.imageAlt.trim()) errors.imageAlt = 'Image alt text is required for accessibility';

    const contentArray = Array.isArray(formInput.content) ? formInput.content : [formInput.content];
    const cleanParagraphs = contentArray.filter(p => p.trim() !== '');
    if (!cleanParagraphs.length) errors.content = 'At least one content paragraph is required';

    if (scheduleMode === 'SCHEDULE' && !scheduledDateTime) {
      errors.scheduledDateTime = 'Please select a future date and time for scheduled publication';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setActionLoading(true);
    try {
      const payload: NewsArticleInput = {
        ...formInput,
        content: cleanParagraphs
      };

      if (scheduleMode === 'SCHEDULE' && scheduledDateTime) {
        payload.publishedAt = new Date(scheduledDateTime).toISOString();
        payload.status = 'PUBLISHED';
      } else if (scheduleMode === 'NOW' && formInput.status === 'PUBLISHED') {
        payload.publishedAt = new Date().toISOString();
      }

      if (editingArticle) {
        await newsService.update(editingArticle.id, payload);
        setNotification({ type: 'success', message: `Article "${payload.title}" updated successfully.` });
      } else {
        await newsService.create(payload);
        setNotification({ 
          type: 'success', 
          message: scheduleMode === 'SCHEDULE'
            ? `Article "${payload.title}" scheduled for publication on ${new Date(scheduledDateTime).toLocaleString()}!`
            : payload.status === 'PUBLISHED' 
            ? `Article "${payload.title}" created and published live!` 
            : `Article "${payload.title}" created as Draft.` 
        });
      }
      setIsEditorOpen(false);
      fetchArticles();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Error saving article.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflowDialog) return;
    const { type, articleId, notes } = workflowDialog;

    setActionLoading(true);
    try {
      if (type === 'SUBMIT') {
        await newsService.submitReview(articleId, notes);
        setNotification({ type: 'success', message: 'Article submitted for review.' });
      } else if (type === 'APPROVE') {
        await newsService.approve(articleId, notes);
        setNotification({ type: 'success', message: 'Article approved for publication.' });
      } else if (type === 'PUBLISH') {
        await newsService.publish(articleId);
        setNotification({ type: 'success', message: 'Article published live.' });
      } else if (type === 'DELETE') {
        await newsService.delete(articleId);
        setNotification({ type: 'success', message: 'Article deleted.' });
      }
      setWorkflowDialog(null);
      fetchArticles();
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Action failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddParagraph = () => {
    const list = Array.isArray(formInput.content) ? [...formInput.content] : [formInput.content];
    setFormInput(prev => ({ ...prev, content: [...list, ''] }));
  };

  const handleRemoveParagraph = (index: number) => {
    const list = Array.isArray(formInput.content) ? [...formInput.content] : [formInput.content];
    if (list.length > 1) {
      list.splice(index, 1);
      setFormInput(prev => ({ ...prev, content: list }));
    }
  };

  const handleParagraphChange = (index: number, val: string) => {
    const list = Array.isArray(formInput.content) ? [...formInput.content] : [formInput.content];
    list[index] = val;
    setFormInput(prev => ({ ...prev, content: list }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formInput.tags?.includes(tagInput.trim())) {
      setFormInput(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormInput(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
  const inReviewCount = articles.filter(a => a.status === 'IN_REVIEW').length;
  const draftCount = articles.filter(a => a.status === 'DRAFT').length;

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
            <span className="text-xs font-semibold text-gray-500">Section 18 & 27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display mt-1">
            News & Story Publications
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Manage official MSC articles, community baraza updates, and elder advocacy coverage.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-forest-500 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        )}
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Articles</p>
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

      {/* Search and Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by headline or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
            <option value="Community Story">Community Story</option>
            <option value="Organizational News">Organizational News</option>
            <option value="Advocacy">Advocacy</option>
            <option value="Events & Outreaches">Events & Outreaches</option>
            <option value="Partnerships">Partnerships</option>
          </select>
        </div>
      </div>

      {/* News Articles Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-forest-800 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-600">Retrieving articles from database...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900">No Articles Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              No news matches your current filters. Clear the search or create a new article.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50/80 text-gray-600 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {articles.map((art) => {
                  const statusStyle = STATUS_COLORS[art.status || 'DRAFT'] || STATUS_COLORS.DRAFT;
                  return (
                    <tr key={art.id} className="hover:bg-warm-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img
                              src={art.featuredImage}
                              alt={art.imageAlt || art.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 font-display line-clamp-1">{art.title}</span>
                              {art.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                  <Sparkles className="w-3 h-3" /> Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 max-w-md">
                              {art.summary}
                            </p>
                            <span className="text-[11px] text-gray-400 font-mono">/news/{art.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block text-xs font-medium text-forest-900 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                          {art.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{art.author?.name || 'MSC Communications'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {(art.status || 'DRAFT').replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewArticle({
                                title: art.title,
                                slug: art.slug,
                                categoryId: art.categoryId || '',
                                category: art.category,
                                summary: art.summary,
                                content: Array.isArray(art.content) ? art.content : [art.content],
                                featuredImage: art.featuredImage,
                                imageAlt: art.imageAlt || art.title,
                                authorName: art.author?.name || 'MSC Communications',
                                authorRole: art.author?.role || 'Communications & Outreach',
                                tags: art.tags || [],
                                isFeatured: art.isFeatured,
                                seoTitle: art.seoTitle,
                                seoDescription: art.seoDescription,
                                changeNote: '',
                                status: art.status
                              });
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 text-forest-700 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
                            title="Live Draft / Article Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={`/news/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Open Public Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEdit(art)}
                              className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Article"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canUpdate && (art.status === 'DRAFT' || art.status === 'CHANGES_REQUESTED') && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'SUBMIT',
                                  articleId: art.id,
                                  articleTitle: art.title,
                                  notes: ''
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" /> Submit
                            </button>
                          )}

                          {canApprove && art.status === 'IN_REVIEW' && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'APPROVE',
                                  articleId: art.id,
                                  articleTitle: art.title,
                                  notes: ''
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}

                          {canPublish && art.status !== 'PUBLISHED' && art.status !== 'ARCHIVED' && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'PUBLISH',
                                  articleId: art.id,
                                  articleTitle: art.title,
                                  notes: ''
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5" /> Publish
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() =>
                                setWorkflowDialog({
                                  open: true,
                                  type: 'DELETE',
                                  articleId: art.id,
                                  articleTitle: art.title,
                                  notes: ''
                                })
                              }
                              className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Article"
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

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-warm-50/60 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-display">
                  {editingArticle ? `Edit Article: ${editingArticle.title}` : 'Draft New Article'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Publish verified community stories, policy advocacy briefs, and milestones.
                </p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="overflow-y-auto p-6 space-y-6 flex-1 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Article Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formInput.title}
                    onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                    placeholder="Enter engaging, dignified headline..."
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 ${
                      formErrors.title ? 'border-rose-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.title && <p className="text-xs text-rose-500 mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formInput.category}
                    onChange={(e) => setFormInput({ ...formInput, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 bg-white"
                  >
                    <option value="Community Story">Community Story</option>
                    <option value="Organizational News">Organizational News</option>
                    <option value="Advocacy">Advocacy</option>
                    <option value="Events & Outreaches">Events & Outreaches</option>
                    <option value="Partnerships">Partnerships</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Summary / Lead Paragraph <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formInput.summary}
                  onChange={(e) => setFormInput({ ...formInput, summary: e.target.value })}
                  placeholder="Concise overview summarizing the article's core message..."
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 ${
                    formErrors.summary ? 'border-rose-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.summary && <p className="text-xs text-rose-500 mt-1">{formErrors.summary}</p>}
              </div>

              {/* Multi-paragraph Content Editor */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Article Body Paragraphs <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="text-xs text-forest-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Paragraph
                  </button>
                </div>

                {(Array.isArray(formInput.content) ? formInput.content : [formInput.content]).map((para, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => handleParagraphChange(idx, e.target.value)}
                      placeholder={`Paragraph #${idx + 1}...`}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                    />
                    {(Array.isArray(formInput.content) ? formInput.content.length : 1) > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formErrors.content && <p className="text-xs text-rose-500">{formErrors.content}</p>}
              </div>

              {/* Author & Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formInput.authorName || ''}
                    onChange={(e) => setFormInput({ ...formInput, authorName: e.target.value })}
                    placeholder="MSC Communications Unit"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formInput.authorRole || ''}
                    onChange={(e) => setFormInput({ ...formInput, authorRole: e.target.value })}
                    placeholder="Communications & Outreach"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Featured Image URL / Path <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formInput.featuredImage}
                    onChange={(e) => setFormInput({ ...formInput, featuredImage: e.target.value })}
                    placeholder="/images/mwancha-facility-main.jpg"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                  {formErrors.featuredImage && <p className="text-xs text-rose-500 mt-1">{formErrors.featuredImage}</p>}
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

              {/* Tags & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formInput.tags?.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs font-medium bg-forest-50 text-forest-900 border border-forest-200 px-2 py-0.5 rounded-full"
                      >
                        #{t}
                        <button type="button" onClick={() => handleRemoveTag(t)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="featured-news"
                    checked={formInput.isFeatured}
                    onChange={(e) => setFormInput({ ...formInput, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-forest-800 rounded focus:ring-forest-500"
                  />
                  <label htmlFor="featured-news" className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Feature on Homepage Carousel
                  </label>
                </div>
              </div>

              {/* Revision note for edits */}
              {editingArticle && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Change Note (Audit Log & Revision History)
                  </label>
                  <input
                    type="text"
                    value={formInput.changeNote || ''}
                    onChange={(e) => setFormInput({ ...formInput, changeNote: e.target.value })}
                    placeholder="Briefly describe what was edited in this revision..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {/* Publication Status & Scheduling Selection */}
              <div className="p-4 rounded-xl border border-gray-200 bg-emerald-50/40 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-forest-900 uppercase tracking-wider mb-1.5">
                    Publication Status *
                  </label>
                  <select
                    value={formInput.status || 'PUBLISHED'}
                    onChange={(e) => setFormInput({ ...formInput, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-forest-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white font-medium text-charcoal-900"
                  >
                    <option value="PUBLISHED">Published (Ready for public visibility)</option>
                    <option value="DRAFT">Draft (Save privately for editorial review)</option>
                    <option value="IN_REVIEW">In Review (Queued for administrative sign-off)</option>
                    <option value="APPROVED">Approved (Approved by editorial committee)</option>
                  </select>
                </div>

                {/* Scheduling Option */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <label className="block text-xs font-bold text-forest-900 uppercase tracking-wider mb-2">
                    Publication Timing
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition-all ${
                        scheduleMode === 'NOW'
                          ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                          : 'bg-white text-charcoal-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="scheduleTiming"
                        checked={scheduleMode === 'NOW'}
                        onChange={() => setScheduleMode('NOW')}
                        className="sr-only"
                      />
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <span>Publish Immediately</span>
                        <span className="block font-normal text-[10px] opacity-80">
                          Live as soon as approved
                        </span>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 text-xs font-bold transition-all ${
                        scheduleMode === 'SCHEDULE'
                          ? 'bg-forest-900 text-white border-forest-900 shadow-xs'
                          : 'bg-white text-charcoal-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="scheduleTiming"
                        checked={scheduleMode === 'SCHEDULE'}
                        onChange={() => setScheduleMode('SCHEDULE')}
                        className="sr-only"
                      />
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <span>Schedule Publication</span>
                        <span className="block font-normal text-[10px] opacity-80">
                          Automated date & time release
                        </span>
                      </div>
                    </label>
                  </div>

                  {scheduleMode === 'SCHEDULE' && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300">
                      <label className="block text-xs font-bold text-charcoal-800 mb-1">
                        Scheduled Release Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-600 font-mono"
                      />
                      {formErrors.scheduledDateTime && (
                        <p className="text-xs text-rose-500 mt-1">{formErrors.scheduledDateTime}</p>
                      )}
                      <p className="text-[11px] text-charcoal-500 mt-1">
                        Backend will automatically release and display this article on the website once the scheduled timestamp arrives.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const contentArray = Array.isArray(formInput.content) ? formInput.content : [formInput.content];
                    setPreviewArticle({
                      ...formInput,
                      content: contentArray.filter(p => p.trim() !== '')
                    });
                    setIsPreviewOpen(true);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 rounded-xl inline-flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Live Layout</span>
                </button>

                <div className="flex items-center gap-2">
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
                    {actionLoading
                      ? 'Saving...'
                      : editingArticle
                      ? 'Update Article'
                      : scheduleMode === 'SCHEDULE'
                      ? 'Schedule Publication'
                      : formInput.status === 'PUBLISHED'
                      ? 'Publish Article Now'
                      : 'Save as Draft'}
                  </button>
                </div>
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
              {workflowDialog.type === 'SUBMIT' && 'Submit Article for Review'}
              {workflowDialog.type === 'APPROVE' && 'Approve News Article'}
              {workflowDialog.type === 'PUBLISH' && 'Publish Article Live'}
              {workflowDialog.type === 'DELETE' && 'Delete Article'}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Headline: <span className="font-semibold text-gray-900">{workflowDialog.articleTitle}</span>
            </p>

            {(workflowDialog.type === 'SUBMIT' || workflowDialog.type === 'APPROVE') && (
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Editorial Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={workflowDialog.notes}
                  onChange={(e) => setWorkflowDialog({ ...workflowDialog, notes: e.target.value })}
                  placeholder="Add comments for editorial audit log..."
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {workflowDialog.type === 'PUBLISH' && (
              <p className="text-sm text-gray-700 mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                This will immediately publish the article on the public portal under <code className="text-emerald-900 font-mono">/news</code>.
              </p>
            )}

            {workflowDialog.type === 'DELETE' && (
              <p className="text-sm text-rose-700 mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
                This will soft-delete the article and preserve historical revision records.
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

      {/* Live Draft Preview Modal */}
      <DraftPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        article={previewArticle}
        scheduledDateTime={scheduleMode === 'SCHEDULE' ? scheduledDateTime : undefined}
      />
    </div>
  );
};

export default NewsManagementPage;
