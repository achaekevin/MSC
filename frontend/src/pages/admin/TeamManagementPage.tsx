import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { teamService, TeamStats } from '../../services/teamService';
import { TeamMember, ContentStatus } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Send,
  Globe,
  RefreshCw,
  X,
  ShieldCheck,
  UserCheck,
  Building
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  IN_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  CHANGES_REQUESTED: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  APPROVED: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' }
};

const DEPARTMENTS = [
  'All',
  'Board of Management',
  'Administrative Leadership',
  'Professional Staff',
  'Support Staff',
  'Community Workforce'
];

interface TeamFormState {
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
  responsibilities: string;
  displayOrder: number;
  isActive: boolean;
  isPlaceholder: boolean;
}

const DEFAULT_FORM: TeamFormState = {
  name: '',
  role: '',
  department: 'Board of Management',
  bio: '',
  image: '/images/mwancha-facility-main.jpg',
  responsibilities: '',
  displayOrder: 0,
  isActive: true,
  isPlaceholder: false
};

export const TeamManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({
    total: 0,
    published: 0,
    draft: 0,
    inReview: 0,
    approved: 0,
    activeCount: 0
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Modal
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamFormState>(DEFAULT_FORM);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [teamRes, statsRes] = await Promise.all([
        teamService.getAdminTeam(),
        teamService.getStats()
      ]);

      setMembers(teamRes);
      setStats(statsRes);
    } catch {
      showNotification('error', 'Failed to load team roster.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      role: m.role,
      department: m.department || 'Board of Management',
      bio: m.bio || '',
      image: m.image || '/images/mwancha-facility-main.jpg',
      responsibilities: m.responsibilities || '',
      displayOrder: m.displayOrder ?? 0,
      isActive: m.isActive !== false,
      isPlaceholder: Boolean(m.isPlaceholder)
    });
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      showNotification('error', 'Please provide member name and position.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingId) {
        await teamService.updateTeamMember(editingId, formData);
        showNotification('success', 'Team record updated.');
      } else {
        await teamService.createTeamMember(formData);
        showNotification('success', 'Team member created in DRAFT state.');
      }
      setIsEditorOpen(false);
      loadData();
    } catch {
      showNotification('error', 'Could not save team member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      setActionLoading(true);
      await teamService.deleteTeamMember(id);
      showNotification('success', 'Team member removed.');
      loadData();
    } catch {
      showNotification('error', 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (id: string) => {
    try {
      setActionLoading(true);
      await teamService.submitReview(id);
      showNotification('success', 'Record submitted for review.');
      loadData();
    } catch {
      showNotification('error', 'Could not submit record.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await teamService.approveTeamMember(id);
      showNotification('success', 'Team member approved.');
      loadData();
    } catch {
      showNotification('error', 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(true);
      await teamService.publishTeamMember(id);
      showNotification('success', 'Profile published to public portal.');
      loadData();
    } catch {
      showNotification('error', 'Publication failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesDept = selectedDept === 'All' || m.department === selectedDept;
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      (m.bio && m.bio.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-charcoal-900 font-display">Governance & Leadership Roster</h1>
          </div>
          <p className="text-sm text-charcoal-600 mt-1">
            Maintain verified leadership records across the Board of Management, Secretariat, and community health workforce.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-50 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-800 text-warm-50 hover:bg-forest-900 text-sm font-bold shadow-sm transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Total Personnel</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{stats.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-semibold block uppercase">Published</span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">{stats.published}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-amber-700 font-semibold block uppercase">In Review</span>
          <span className="text-2xl font-extrabold text-amber-800 mt-1 block">{stats.inReview}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-sky-700 font-semibold block uppercase">Approved</span>
          <span className="text-2xl font-extrabold text-sky-800 mt-1 block">{stats.approved}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-forest-700 font-semibold block uppercase">Active Status</span>
          <span className="text-2xl font-extrabold text-forest-800 mt-1 block">{stats.activeCount}</span>
        </div>
      </div>

      {/* Controls & Department Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search member name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-warm-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official MSC Governance Structure</span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-forest-800 text-warm-50'
                  : 'bg-warm-100/70 text-charcoal-700 hover:bg-warm-200/60'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-charcoal-500 bg-white rounded-2xl border border-warm-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-700 mb-3" />
          <p className="font-semibold text-sm">Loading personnel directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-16 text-center text-charcoal-500 bg-white rounded-2xl border border-warm-200">
          <Users className="w-10 h-10 text-warm-400 mx-auto mb-3" />
          <p className="font-bold text-charcoal-900">No personnel records match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMembers.map((member) => {
            const statusConfig = STATUS_COLORS[member.status || 'PUBLISHED'] || STATUS_COLORS.PUBLISHED;
            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="relative h-44 bg-forest-950 overflow-hidden">
                  <img
                    src={member.image || '/images/mwancha-facility-main.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {member.status || 'PUBLISHED'}
                    </span>
                    {member.isPlaceholder && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Placeholder
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200 inline-block mb-1">
                      {member.department}
                    </span>
                    <h3 className="font-bold text-charcoal-900 text-base">{member.name}</h3>
                    <p className="text-xs text-charcoal-600 font-medium">{member.role}</p>
                    {member.bio && (
                      <p className="text-xs text-charcoal-500 line-clamp-2 mt-2 leading-relaxed">{member.bio}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-warm-100 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        member.isActive !== false ? 'text-emerald-700' : 'text-charcoal-400'
                      }`}
                    >
                      {member.isActive !== false ? '● Active' : '○ Inactive'}
                    </span>

                    <div className="flex items-center gap-1">
                      {member.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSubmitReview(member.id)}
                          className="p-1 rounded text-amber-700 hover:bg-amber-50"
                          title="Submit for review"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canApprove && (member.status === 'IN_REVIEW' || member.status === 'DRAFT') && (
                        <button
                          onClick={() => handleApprove(member.id)}
                          className="p-1 rounded text-sky-700 hover:bg-sky-50"
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canPublish && member.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePublish(member.id)}
                          className="p-1 rounded text-emerald-700 hover:bg-emerald-50"
                          title="Publish"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canUpdate && (
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1 rounded text-forest-800 hover:bg-forest-50"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="p-1 rounded text-rose-700 hover:bg-rose-50"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-warm-100 text-charcoal-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-charcoal-900 font-display">
                  {editingId ? 'Edit Personnel Record' : 'Add Team Member'}
                </h2>
                <p className="text-xs text-charcoal-500">
                  Ensure roles align with official organization governance charts.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Mogaka"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Position / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chairperson, Board of Management"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                >
                  <option value="Board of Management">Board of Management</option>
                  <option value="Administrative Leadership">Administrative Leadership</option>
                  <option value="Professional Staff">Professional Staff</option>
                  <option value="Support Staff">Support Staff</option>
                  <option value="Community Workforce">Community Workforce</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Photo URL / Path</label>
                <input
                  type="text"
                  placeholder="/images/mwancha-facility-main.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Biography</label>
                <textarea
                  rows={3}
                  placeholder="Professional background, expertise, and institutional mandate..."
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 p-3 rounded-xl bg-warm-50 border border-warm-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded text-forest-800 focus:ring-forest-600 w-4 h-4"
                  />
                  <span>Active Position</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={formData.isPlaceholder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPlaceholder: e.target.checked }))}
                    className="rounded text-forest-800 focus:ring-forest-600 w-4 h-4"
                  />
                  <span>Interim / Placeholder Record</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-warm-300 text-xs font-bold text-charcoal-700 hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-warm-50 text-xs font-bold hover:bg-forest-900 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
