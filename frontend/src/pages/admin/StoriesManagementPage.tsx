import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storyService, StoryItem, StoryInput } from '../../services/storyService';
import { ContentStatus } from '../../types';
import {
  FileText,
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
  MapPin,
  ExternalLink,
  Sparkles,
  Lock,
  HeartHandshake,
  Image,
  AlertTriangle,
  Send,
  Globe
} from 'lucide-react';

const PROGRAM_OPTIONS = [
  'Case Management',
  'Psychosocial Support',
  'Advocacy & Sensitization',
  'Systems Strengthening & Partnerships',
  'MEAL & Field Outreach',
  'Nutrition & Healthcare Respite'
];

const PRESET_COVER_IMAGES = [
  { label: 'Pavilion Elder Gathering', url: '/images/mwancha-pavilion-gathering.jpg' },
  { label: 'Community Outpost & Facility', url: '/images/mwancha-facility-main.jpg' },
  { label: 'Elder Fellowship Baraza', url: '/images/mwancha-fellowship-gathering.jpg' },
  { label: 'Field Respite Outreach', url: '/images/mwancha-respite-care.jpg' }
];

export const StoriesManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    relatedProgram: 'Case Management',
    coverImage: '/images/mwancha-pavilion-gathering.jpg',
    situation: '',
    intervention: '',
    outcome: '',
    narrative: '',
    location: 'Nyamira County',
    date: new Date().toISOString().split('T')[0],
    privacyStatus: 'anonymized' as 'anonymized' | 'identified_with_consent',
    beneficiaryConsent: false,
    mediaString: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storyService.getAdminStories(1, 100, statusFilter);
      setStories(res.items || []);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to load stories.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const matchSearch =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.relatedProgram && s.relatedProgram.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSearch;
    });
  }, [stories, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = stories.length;
    const published = stories.filter(s => s.status === 'PUBLISHED').length;
    const approved = stories.filter(s => s.status === 'APPROVED').length;
    const drafts = stories.filter(s => s.status === 'DRAFT').length;
    return { total, published, approved, drafts };
  }, [stories]);

  const openCreateModal = () => {
    setEditingStory(null);
    setFormData({
      title: '',
      relatedProgram: 'Case Management',
      coverImage: '/images/mwancha-pavilion-gathering.jpg',
      situation: '',
      intervention: '',
      outcome: '',
      narrative: '',
      location: 'Nyamira County',
      date: new Date().toISOString().split('T')[0],
      privacyStatus: 'anonymized',
      beneficiaryConsent: false,
      mediaString: ''
    });
    setIsEditorOpen(true);
  };

  const openEditModal = (story: StoryItem) => {
    setEditingStory(story);
    const media = story.media || story.images || [];
    setFormData({
      title: story.title,
      relatedProgram: story.relatedProgram || 'Case Management',
      coverImage: story.coverImage || media[0] || '/images/mwancha-pavilion-gathering.jpg',
      situation: story.situation || '',
      intervention: story.intervention || '',
      outcome: story.outcome || '',
      narrative: story.narrative || story.story || '',
      location: story.location || 'Nyamira County',
      date: story.date ? story.date.split('T')[0] : new Date().toISOString().split('T')[0],
      privacyStatus: story.privacyStatus || 'anonymized',
      beneficiaryConsent: story.beneficiaryConsent || false,
      mediaString: media.join('\n')
    });
    setIsEditorOpen(true);
  };

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.situation.trim() || !formData.intervention.trim() || !formData.outcome.trim()) {
      showNotification('error', 'Please fill in the required fields (Title, Challenge/Situation, MSC Intervention, Outcome).');
      return;
    }

    if (!formData.beneficiaryConsent) {
      showNotification('error', 'In adherence with ethical safeguarding, you must certify beneficiary informed consent and authentic documentation.');
      return;
    }

    const mediaList = formData.mediaString
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const inputData: StoryInput = {
      title: formData.title.trim(),
      summary: formData.situation.length > 250 ? formData.situation.substring(0, 247) + '...' : formData.situation,
      situation: formData.situation.trim(),
      intervention: formData.intervention.trim(),
      outcome: formData.outcome.trim(),
      narrative: formData.narrative.trim(),
      relatedProgram: formData.relatedProgram,
      coverImage: formData.coverImage.trim(),
      media: mediaList,
      images: [formData.coverImage.trim(), ...mediaList],
      location: formData.location.trim(),
      date: formData.date,
      privacyStatus: formData.privacyStatus,
      beneficiaryConsent: formData.beneficiaryConsent
    };

    try {
      setIsSubmitting(true);
      if (editingStory) {
        await storyService.updateStory(editingStory.id, inputData);
        showNotification('success', `Story "${inputData.title}" updated successfully.`);
      } else {
        await storyService.createStory(inputData);
        showNotification('success', `New impact story "${inputData.title}" drafted successfully.`);
      }
      setIsEditorOpen(false);
      fetchStories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (story: StoryItem) => {
    try {
      await storyService.approveStory(story.id);
      showNotification('success', `Story "${story.title}" has been approved for publication.`);
      fetchStories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Approval failed.');
    }
  };

  const handlePublish = async (story: StoryItem) => {
    try {
      await storyService.publishStory(story.id);
      showNotification('success', `Story "${story.title}" is now LIVE on the public Stories of Impact page.`);
      fetchStories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Publication failed.');
    }
  };

  const handleDelete = async (story: StoryItem) => {
    if (!window.confirm(`Are you sure you want to remove the story "${story.title}"?`)) {
      return;
    }

    try {
      await storyService.deleteStory(story.id);
      showNotification('success', `Story "${story.title}" deleted.`);
      fetchStories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to delete story.');
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'APPROVED':
        return 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300';
      case 'IN_REVIEW':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'CHANGES_REQUESTED':
        return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-charcoal-800 dark:text-warm-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-200 dark:border-charcoal-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-forest-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Editorial & Beneficiary Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            Stories of Impact Management
          </h1>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-warm-300 max-w-2xl">
            Author, review, and publish authentic beneficiary case studies documenting real care interventions, measured outcomes, and elder dignity restoration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStories()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-warm-200 hover:bg-warm-100 transition-colors shadow-xs"
            title="Refresh Stories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Impact Story</span>
            </button>
          )}
        </div>
      </div>

      {/* Ethical Safeguarding Disclaimer Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold">Strict Ethical Documentation Mandate:</p>
          <p className="leading-relaxed text-amber-800/90 dark:text-amber-300/90">
            Never fabricate beneficiary accounts or fictitious identities. Every published story must reflect genuine case management conducted by MSC field staff. Beneficiary names and identifying photos must either have documented consent or be responsibly anonymized to safeguard the elder's personal security.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-3 text-sm font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-charcoal-400 hover:text-charcoal-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-charcoal-500 dark:text-warm-400 uppercase tracking-wider">
            Total Stories
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            {metrics.total}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Live on Website
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
            {metrics.published}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
            Approved (Ready)
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-display">
            {metrics.approved}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Drafts in Progress
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-display">
            {metrics.drafts}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories by title or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-800 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="APPROVED">Approved Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-warm-200 dark:border-charcoal-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-forest-700 dark:text-emerald-400 animate-spin" />
            <p className="mt-3 text-sm text-charcoal-500 dark:text-warm-400">Loading MSC impact stories...</p>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileText className="w-12 h-12 mx-auto text-charcoal-300 dark:text-charcoal-600" />
            <h3 className="mt-3 text-base font-bold text-charcoal-900 dark:text-warm-100">No Stories Found</h3>
            <p className="mt-1 text-xs text-charcoal-500 dark:text-warm-400 max-w-sm mx-auto">
              {searchQuery ? 'No stories match the search query.' : 'No impact stories have been created yet. Click "Draft Impact Story" to document your first verified case.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm text-charcoal-700 dark:text-warm-200">
              <thead className="bg-warm-50 dark:bg-charcoal-950/70 text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-warm-400 border-b border-warm-200 dark:border-charcoal-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Story Narrative</th>
                  <th scope="col" className="px-6 py-3.5">Related Program</th>
                  <th scope="col" className="px-6 py-3.5">Safeguard Status</th>
                  <th scope="col" className="px-6 py-3.5">Publication Status</th>
                  <th scope="col" className="px-6 py-3.5">Date</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800/80">
                {filteredStories.map((s) => {
                  return (
                    <tr key={s.id} className="hover:bg-warm-50/60 dark:hover:bg-charcoal-800/40 transition-colors">
                      {/* Title & Preview */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.coverImage || s.images?.[0] || '/images/mwancha-pavilion-gathering.jpg'}
                            alt={s.title}
                            className="w-14 h-11 object-cover rounded-lg shrink-0 border border-warm-200 dark:border-charcoal-700 bg-forest-950"
                          />
                          <div className="min-w-0 max-w-md">
                            <div className="font-semibold text-charcoal-900 dark:text-warm-50 truncate">
                              {s.title}
                            </div>
                            <div className="text-xs text-charcoal-500 dark:text-warm-400 truncate mt-0.5">
                              {s.situation || s.summary}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-warm-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-warm-200">
                          {s.relatedProgram || 'Holistic Care'}
                        </span>
                      </td>

                      {/* Safeguarding */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-charcoal-600 dark:text-warm-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                          <span>{s.privacyStatus === 'identified_with_consent' ? 'Documented Consent' : 'Anonymized Safeguard'}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-charcoal-500 dark:text-warm-400">
                        {new Date(s.date || s.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Public View */}
                          {s.status === 'PUBLISHED' && (
                            <a
                              href={`/stories/${s.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:text-forest-800"
                              title="View Public Story"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Approve (Reviewer / Admin) */}
                          {canApprove && (s.status === 'DRAFT' || s.status === 'IN_REVIEW') && (
                            <button
                              onClick={() => handleApprove(s)}
                              className="p-1.5 rounded-lg border border-sky-300 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100"
                              title="Approve for Publication"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Publish */}
                          {canPublish && s.status === 'APPROVED' && (
                            <button
                              onClick={() => handlePublish(s)}
                              className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                              title="Publish Live on Site"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit */}
                          {canUpdate && (
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:text-forest-800"
                              title="Edit Story"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(s)}
                              className="p-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-rose-600 hover:bg-rose-50"
                              title="Delete Story"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL: CREATE / EDIT STORY */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white dark:bg-charcoal-900 rounded-3xl shadow-elevated border border-warm-200 dark:border-charcoal-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-warm-100 dark:border-charcoal-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-50 font-display">
                    {editingStory ? 'Edit Impact Story' : 'Draft Verified Impact Story'}
                  </h3>
                  <p className="text-xs text-charcoal-500 dark:text-warm-400">
                    Document baseline challenge, MSC intervention, and verified elder outcome
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditorOpen(false)} className="text-charcoal-400 hover:text-charcoal-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Restoring Warmth and Medical Nutrition for Mzee Nyachieo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 font-semibold"
                />
              </div>

              {/* Related Program & Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                    Related Program Area *
                  </label>
                  <select
                    value={formData.relatedProgram}
                    onChange={(e) => setFormData({ ...formData, relatedProgram: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    {PROGRAM_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                    Location / Ward
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ekerenyo, Nyamira County"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                    Case / Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Cover Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="/images/mwancha-pavilion-gathering.jpg or https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-charcoal-400">Presets:</span>
                  {PRESET_COVER_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                      className="text-[11px] text-forest-700 dark:text-emerald-400 hover:underline px-1 py-0.5 rounded bg-warm-100 dark:bg-charcoal-800"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. Situation / Challenge */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>The Situation / Baseline Challenge *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  placeholder="Describe the elder's situation prior to MSC involvement: e.g., acute malnutrition, leaking roof, domestic neglect, lack of medical care..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* 2. MSC Intervention */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>MSC Intervention & Care Actions *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.intervention}
                  onChange={(e) => setFormData({ ...formData, intervention: e.target.value })}
                  placeholder="Describe the exact actions taken: emergency respite care, food packages delivered, home repair, legal advocacy with village elders..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 3. Outcome / Lasting Impact */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Measured Transformation & Outcome *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  placeholder="Describe the positive result: restored health, secure dry shelter, weekly visits established, psychological trauma healed..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Extended Narrative Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Extended Narrative Body (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.narrative}
                  onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                  placeholder="Full background context, quotes from community elders, or field case notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Additional Media Gallery URLs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Additional Verification Photos / Media URLs (One per line)
                </label>
                <textarea
                  rows={2}
                  value={formData.mediaString}
                  onChange={(e) => setFormData({ ...formData, mediaString: e.target.value })}
                  placeholder="https://... or /images/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              {/* Privacy and Consent Section */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Beneficiary Anonymization Tier
                  </label>
                  <select
                    value={formData.privacyStatus}
                    onChange={(e) => setFormData({ ...formData, privacyStatus: e.target.value as any })}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-charcoal-900 text-xs text-charcoal-900 dark:text-warm-100"
                  >
                    <option value="anonymized">Anonymized Name & Photo (Recommended for Vulnerable Elders)</option>
                    <option value="identified_with_consent">Identified Name with Formal Written Consent</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  <input
                    type="checkbox"
                    required
                    checked={formData.beneficiaryConsent}
                    onChange={(e) => setFormData({ ...formData, beneficiaryConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-amber-300 text-forest-800 focus:ring-forest-600"
                  />
                  <span className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                    <strong className="text-amber-900 dark:text-amber-100">Beneficiary Safeguarding Certification: </strong>
                    I certify that this case study reflects an authentic, verified case handled by Mwancha Senior Community with appropriate elder/family informed consent. I certify that this submission contains no fabricated beneficiary identities.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-warm-100 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-200 text-sm font-semibold hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Story...</span>
                    </>
                  ) : (
                    <span>{editingStory ? 'Update Story' : 'Save Draft Story'}</span>
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

export default StoriesManagementPage;
