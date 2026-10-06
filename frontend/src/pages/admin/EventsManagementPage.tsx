import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventService, EventCategory, EventStats } from '../../services/eventService';
import { EventItem, ContentStatus } from '../../types';
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
  Calendar,
  Clock,
  MapPin,
  X,
  Copy,
  Users,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Building
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  IN_REVIEW: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  CHANGES_REQUESTED: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  APPROVED: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' },
  upcoming: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  completed: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' }
};

interface EventFormState {
  title: string;
  slug: string;
  category: string;
  description: string;
  location: string;
  county: string;
  startDate: string;
  endDate: string;
  timeString: string;
  isRegistrationOpen: boolean;
  registrationRequired: boolean;
  registrationUrl: string;
  organizer: string;
  image: string;
  status: ContentStatus;
}

const DEFAULT_EVENT_FORM: EventFormState = {
  title: '',
  slug: '',
  category: 'Community Outreach',
  description: '',
  location: '',
  county: 'Nyamira County',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  timeString: '09:00 AM - 03:00 PM EAT',
  isRegistrationOpen: true,
  registrationRequired: false,
  registrationUrl: '',
  organizer: 'Mwancha Senior Community',
  image: '/images/mwancha-pavilion-gathering.jpg',
  status: 'PUBLISHED'
};

export const EventsManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('CONTENT_CREATE');
  const canUpdate = hasPermission('CONTENT_UPDATE');
  const canDelete = hasPermission('CONTENT_DELETE');
  const canApprove = hasPermission('CONTENT_APPROVE');
  const canPublish = hasPermission('CONTENT_PUBLISH');

  // State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [stats, setStats] = useState<EventStats>({
    total: 0,
    published: 0,
    draft: 0,
    inReview: 0,
    approved: 0,
    upcomingCount: 0,
    pastCount: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormState>(DEFAULT_EVENT_FORM);

  // Preview & Review Modal
  const [previewEvent, setPreviewEvent] = useState<EventItem | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    eventId: string | null;
    action: 'SUBMIT' | 'APPROVE';
    notes: string;
  }>({
    isOpen: false,
    eventId: null,
    action: 'SUBMIT',
    notes: ''
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, catsRes, statsRes] = await Promise.all([
        eventService.getAllEvents({
          page: currentPage,
          limit: 10,
          status: statusFilter,
          category: categoryFilter,
          search
        }),
        eventService.getCategories(),
        eventService.getEventStats()
      ]);

      setEvents(eventsRes.items);
      setTotalPages(eventsRes.totalPages);
      setCategories(catsRes);
      setStats(statsRes);
    } catch {
      showNotification('error', 'Failed to load outreach events.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, categoryFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form handling
  const handleOpenCreate = () => {
    setEditingEventId(null);
    setFormData(DEFAULT_EVENT_FORM);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: EventItem) => {
    setEditingEventId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      category: item.category || 'Community Outreach',
      description: item.description,
      location: item.location,
      county: item.county || 'Nyamira County',
      startDate: item.startDate ? item.startDate.split('T')[0] : (item.date || new Date().toISOString().split('T')[0]),
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      timeString: item.timeString || item.time || '09:00 AM - 03:00 PM EAT',
      isRegistrationOpen: item.isRegistrationOpen ?? item.registrationOpen ?? true,
      registrationRequired: item.registrationRequired ?? false,
      registrationUrl: item.registrationUrl || '',
      organizer: item.organizer || 'Mwancha Senior Community',
      image: item.image || '/images/mwancha-pavilion-gathering.jpg',
      status: item.status || 'PUBLISHED'
    });
    setIsEditorOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim() || !formData.startDate) {
      showNotification('error', 'Please fill in required fields (Title, Location, Date).');
      return;
    }

    try {
      setActionLoading(true);
      if (editingEventId) {
        await eventService.updateEvent(editingEventId, {
          title: formData.title,
          slug: formData.slug || undefined,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          county: formData.county,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          timeString: formData.timeString,
          isRegistrationOpen: formData.isRegistrationOpen,
          registrationRequired: formData.registrationRequired,
          registrationUrl: formData.registrationUrl,
          organizer: formData.organizer,
          image: formData.image,
          status: formData.status
        });
        showNotification('success', 'Event updated successfully.');
      } else {
        await eventService.createEvent({
          title: formData.title,
          slug: formData.slug || undefined,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          county: formData.county,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          timeString: formData.timeString,
          isRegistrationOpen: formData.isRegistrationOpen,
          registrationRequired: formData.registrationRequired,
          registrationUrl: formData.registrationUrl,
          organizer: formData.organizer,
          image: formData.image,
          status: formData.status
        });
        showNotification('success', formData.status === 'PUBLISHED' ? 'Event created and published live!' : 'Event created in DRAFT state.');
      }
      setIsEditorOpen(false);
      loadData();
    } catch {
      showNotification('error', 'Could not save event. Check fields and network.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      setActionLoading(true);
      await eventService.deleteEvent(id);
      showNotification('success', 'Event deleted.');
      loadData();
    } catch {
      showNotification('error', 'Failed to delete event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      setActionLoading(true);
      await eventService.duplicateEvent(id);
      showNotification('success', 'Event duplicated as a new draft.');
      loadData();
    } catch {
      showNotification('error', 'Could not duplicate event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(true);
      await eventService.publishEvent(id);
      showNotification('success', 'Event published to public portal.');
      loadData();
    } catch {
      showNotification('error', 'Only APPROVED events can be published directly.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewAction = async () => {
    if (!reviewDialog.eventId) return;
    try {
      setActionLoading(true);
      if (reviewDialog.action === 'SUBMIT') {
        await eventService.submitReview(reviewDialog.eventId, reviewDialog.notes);
        showNotification('success', 'Event submitted for administrative review.');
      } else {
        await eventService.approveEvent(reviewDialog.eventId, reviewDialog.notes);
        showNotification('success', 'Event approved for publication.');
      }
      setReviewDialog({ isOpen: false, eventId: null, action: 'SUBMIT', notes: '' });
      loadData();
    } catch {
      showNotification('error', 'Review workflow update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(events.map((e) => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkStatus = async (status: ContentStatus) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apply ${status} status to ${selectedIds.length} event(s)?`)) return;
    try {
      setActionLoading(true);
      await eventService.bulkUpdateStatus(selectedIds, status);
      showNotification('success', `Bulk update complete.`);
      setSelectedIds([]);
      loadData();
    } catch {
      showNotification('error', 'Bulk status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} event(s)?`)) return;
    try {
      setActionLoading(true);
      await eventService.bulkDelete(selectedIds);
      showNotification('success', `Deleted ${selectedIds.length} event(s).`);
      setSelectedIds([]);
      loadData();
    } catch {
      showNotification('error', 'Bulk delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

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
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-charcoal-900 font-display">Outreach & Events Manager</h1>
          </div>
          <p className="text-sm text-charcoal-600 mt-1">
            Coordinate grassroots community forums, medical outreach camps, stakeholder assemblies, and safeguarding dialogues across Nyamira County.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-50 text-sm font-semibold transition-colors disabled:opacity-50"
            title="Refresh list"
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
              <span>Schedule Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Total Events</span>
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
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Drafts</span>
          <span className="text-2xl font-extrabold text-charcoal-700 mt-1 block">{stats.draft}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-forest-700 font-semibold block uppercase">Upcoming</span>
          <span className="text-2xl font-extrabold text-forest-800 mt-1 block">{stats.upcomingCount}</span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, venue, or county..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-warm-50/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-warm-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-warm-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="all">All Lifecycle States</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-forest-50 rounded-xl border border-forest-200">
            <span className="text-xs font-bold text-forest-900 ml-2">
              {selectedIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-2">
              {canPublish && (
                <button
                  onClick={() => handleBulkStatus('PUBLISHED')}
                  disabled={actionLoading}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                >
                  Publish Selected
                </button>
              )}
              {canApprove && (
                <button
                  onClick={() => handleBulkStatus('APPROVED')}
                  disabled={actionLoading}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors"
                >
                  Approve Selected
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleBulkDelete}
                  disabled={actionLoading}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors"
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-warm-300 bg-white text-charcoal-600 hover:bg-warm-100"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-charcoal-700">
            <thead className="bg-warm-100/70 border-b border-warm-200 text-xs text-charcoal-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={events.length > 0 && selectedIds.length === events.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-forest-800 focus:ring-forest-600"
                    aria-label="Select all events"
                  />
                </th>
                <th className="py-3 px-4">Event & Category</th>
                <th className="py-3 px-4">Date & Schedule</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-forest-700 mb-2" />
                    <span>Loading events catalog...</span>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-500">
                    <Calendar className="w-8 h-8 text-warm-400 mx-auto mb-2" />
                    <p className="font-semibold">No events found matching your criteria.</p>
                    <p className="text-xs text-charcoal-400 mt-1">Adjust filters or create a new event.</p>
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const statusConfig = STATUS_COLORS[event.status] || STATUS_COLORS.DRAFT;
                  const dateStr = event.startDate
                    ? new Date(event.startDate).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : (event.date || 'TBD');

                  return (
                    <tr key={event.id} className="hover:bg-warm-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(event.id)}
                          onChange={() => handleSelectOne(event.id)}
                          className="rounded text-forest-800 focus:ring-forest-600"
                          aria-label={`Select event ${event.title}`}
                        />
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-charcoal-900 line-clamp-1">{event.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md font-medium border border-forest-200">
                            {event.category || 'Outreach'}
                          </span>
                          <span className="text-xs text-charcoal-400">/{event.slug}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-800 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-forest-700" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          <span>{event.timeString || event.time || '09:00 AM - 03:00 PM'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-start gap-1 text-xs text-charcoal-800">
                          <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        {event.county && (
                          <span className="text-[11px] text-charcoal-500 pl-4 block">{event.county}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {event.isRegistrationOpen ?? event.registrationOpen ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Open
                          </span>
                        ) : (
                          <span className="text-xs text-charcoal-500 bg-warm-100 px-2 py-0.5 rounded-full">
                            Closed
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {event.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Live Preview Button */}
                          <button
                            onClick={() => setPreviewEvent(event)}
                            className="p-1.5 rounded-lg text-charcoal-600 hover:text-forest-800 hover:bg-warm-100 transition-colors"
                            title="Preview event"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Submit Review */}
                          {event.status === 'DRAFT' && (
                            <button
                              onClick={() =>
                                setReviewDialog({
                                  isOpen: true,
                                  eventId: event.id,
                                  action: 'SUBMIT',
                                  notes: ''
                                })
                              }
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Submit for review"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Approve Action */}
                          {canApprove && (event.status === 'IN_REVIEW' || event.status === 'DRAFT') && (
                            <button
                              onClick={() =>
                                setReviewDialog({
                                  isOpen: true,
                                  eventId: event.id,
                                  action: 'APPROVE',
                                  notes: ''
                                })
                              }
                              className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-50 transition-colors"
                              title="Approve event"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Publish Action */}
                          {canPublish && event.status !== 'PUBLISHED' && event.status !== 'ARCHIVED' && (
                            <button
                              onClick={() => handlePublish(event.id)}
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Publish event to website"
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                          )}

                          {/* Duplicate */}
                          {canCreate && (
                            <button
                              onClick={() => handleDuplicate(event.id)}
                              className="p-1.5 rounded-lg text-charcoal-600 hover:bg-warm-100 transition-colors"
                              title="Duplicate event"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEdit(event)}
                              className="p-1.5 rounded-lg text-forest-800 hover:bg-forest-50 transition-colors"
                              title="Edit event"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-warm-200 text-xs text-charcoal-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-warm-300 disabled:opacity-40 hover:bg-warm-50 font-semibold"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-warm-300 disabled:opacity-40 hover:bg-warm-50 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-warm-100 text-charcoal-500 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-charcoal-900 font-display">
                  {editingEventId ? 'Edit Outreach Event' : 'Schedule New Event'}
                </h2>
                <p className="text-xs text-charcoal-500">
                  Ensure dates, venues, and registration requirements strictly reflect official plans.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward-Level Elder Rights & Safeguarding Forum"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setFormData((prev) => ({
                      ...prev,
                      title,
                      slug: editingEventId ? prev.slug : slug
                    }));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-warm-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Thematic Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Community Outreach">Community Outreach</option>
                    <option value="Senior Engagement">Senior Engagement</option>
                    <option value="Health Outreach">Health Outreach</option>
                    <option value="Advocacy & Rights">Advocacy & Rights</option>
                    <option value="Stakeholder Meeting">Stakeholder Meeting</option>
                    <option value="Volunteer Training">Volunteer Training</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Time String
                  </label>
                  <input
                    type="text"
                    value={formData.timeString}
                    placeholder="09:00 AM - 03:00 PM EAT"
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeString: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  />
                </div>
              </div>

              {/* Location & County */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kebirigo Community Hall"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    County / Sub-County
                  </label>
                  <input
                    type="text"
                    value={formData.county}
                    placeholder="e.g. Nyamira County"
                    onChange={(e) => setFormData((prev) => ({ ...prev, county: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Outline the purpose, agenda, target attendees, and key outcomes of this outreach event..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  Banner Image URL / Local Asset Path
                </label>
                <input
                  type="text"
                  placeholder="/images/mwancha-pavilion-gathering.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                />
                {formData.image && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-warm-200 relative bg-forest-950">
                    <img
                      src={formData.image}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/mwancha-facility-main.jpg';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Registration Options */}
              <div className="p-4 rounded-xl border border-warm-200 bg-warm-50/50 space-y-3">
                <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block">
                  Registration & Capacity Settings
                </span>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-charcoal-700">
                    <input
                      type="checkbox"
                      checked={formData.isRegistrationOpen}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isRegistrationOpen: e.target.checked }))}
                      className="rounded text-forest-800 focus:ring-forest-600 w-4 h-4"
                    />
                    <span>Registration Currently Open</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-charcoal-700">
                    <input
                      type="checkbox"
                      checked={formData.registrationRequired}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, registrationRequired: e.target.checked }))
                      }
                      className="rounded text-forest-800 focus:ring-forest-600 w-4 h-4"
                    />
                    <span>Advance Registration Required</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    External Registration URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://forms.gle/..."
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, registrationUrl: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div className="p-4 rounded-xl border border-warm-200 bg-emerald-50/40">
                <label className="block text-xs font-bold text-forest-900 uppercase tracking-wider mb-1.5">
                  Publication Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ContentStatus }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-forest-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white font-medium text-charcoal-900"
                >
                  <option value="PUBLISHED">Published (Visible immediately on public website)</option>
                  <option value="DRAFT">Draft (Save privately for review)</option>
                  <option value="IN_REVIEW">In Review (Queued for administrative sign-off)</option>
                  <option value="APPROVED">Approved (Approved for publication)</option>
                </select>
                <p className="text-xs text-charcoal-500 mt-1.5">
                  Setting to "Published" will make this event instantly visible on the public events directory.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-warm-300 bg-white text-charcoal-700 font-bold text-sm hover:bg-warm-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-forest-800 text-warm-50 font-bold text-sm hover:bg-forest-900 shadow-sm transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : editingEventId ? 'Update Event' : formData.status === 'PUBLISHED' ? 'Publish Event Now' : 'Save Draft Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Notes Dialog */}
      {reviewDialog.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warm-200">
            <h3 className="text-lg font-extrabold text-charcoal-900 font-display mb-1">
              {reviewDialog.action === 'SUBMIT' ? 'Submit Event for Review' : 'Approve Event for Publication'}
            </h3>
            <p className="text-xs text-charcoal-600 mb-4">
              Add internal review notes or verification comments for the audit log.
            </p>

            <textarea
              rows={3}
              value={reviewDialog.notes}
              onChange={(e) => setReviewDialog((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Venue confirmed with Kebirigo administration and county health officials."
              className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReviewDialog({ isOpen: false, eventId: null, action: 'SUBMIT', notes: '' })}
                className="px-4 py-2 rounded-xl border border-warm-300 text-xs font-bold text-charcoal-700 hover:bg-warm-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewAction}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-forest-800 text-warm-50 text-xs font-bold hover:bg-forest-900 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewEvent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewEvent(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-warm-100 text-charcoal-500 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              {previewEvent.image && (
                <div className="h-64 rounded-2xl overflow-hidden bg-forest-950 border border-warm-200">
                  <img
                    src={previewEvent.image}
                    alt={previewEvent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/mwancha-pavilion-gathering.jpg';
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
                  {previewEvent.category}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[previewEvent.status]?.bg || ''} ${STATUS_COLORS[previewEvent.status]?.text || ''} ${STATUS_COLORS[previewEvent.status]?.border || ''}`}
                >
                  {previewEvent.status}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-charcoal-900 font-display">
                {previewEvent.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-warm-50 border border-warm-200 text-xs">
                <div className="flex items-center gap-2 text-charcoal-800">
                  <Calendar className="w-4 h-4 text-forest-700" />
                  <span>
                    {previewEvent.startDate
                      ? new Date(previewEvent.startDate).toLocaleDateString('en-KE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : previewEvent.date}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-charcoal-800">
                  <Clock className="w-4 h-4 text-forest-700" />
                  <span>{previewEvent.timeString || previewEvent.time}</span>
                </div>

                <div className="flex items-center gap-2 text-charcoal-800 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                  <span>
                    {previewEvent.location}, {previewEvent.county || 'Nyamira County'}
                  </span>
                </div>
              </div>

              <div className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                {previewEvent.description}
              </div>

              <div className="pt-4 border-t border-warm-200 flex items-center justify-between text-xs text-charcoal-500">
                <span>Organizer: {previewEvent.organizer || 'Mwancha Senior Community'}</span>
                <a
                  href={`/events/${previewEvent.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-forest-800 hover:text-forest-950"
                >
                  <span>Open Public Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
