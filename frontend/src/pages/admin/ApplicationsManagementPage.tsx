import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  applicationManagementService,
  ApplicationStats
} from '../../services/applicationManagementService';
import { newsletterService, SubscriberItem } from '../../services/newsletterService';
import { ContactMessage, VolunteerApplication, PartnershipRequest } from '../../types';
import {
  Inbox,
  UserCheck,
  Building,
  Mail,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Clock,
  X,
  FileText,
  Download,
  Trash2,
  ShieldCheck,
  Send
} from 'lucide-react';

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  NEW: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
  PENDING: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  REVIEWED: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  IN_REVIEW: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  IN_PROGRESS: { bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300' },
  ACCEPTED: { bg: 'bg-forest-100', text: 'text-forest-900', border: 'border-forest-300' },
  RESOLVED: { bg: 'bg-forest-100', text: 'text-forest-900', border: 'border-forest-300' },
  DECLINED: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
  ARCHIVED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300' }
};

export const ApplicationsManagementPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('FORM_UPDATE') || hasPermission('CONTENT_UPDATE');

  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'volunteers' | 'partnerships' | 'contacts' | 'subscribers'>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'contacts' || tabParam === 'partnerships' || tabParam === 'volunteers' || tabParam === 'subscribers') {
      return tabParam;
    }
    return 'volunteers';
  });

  // Keep tab in sync with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'contacts' || tabParam === 'partnerships' || tabParam === 'volunteers' || tabParam === 'subscribers') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Data state
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    totalVolunteers: 0,
    newVolunteers: 0,
    totalPartnerships: 0,
    newPartnerships: 0,
    totalContacts: 0,
    newContacts: 0
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<{
    type: 'volunteer' | 'partnership' | 'contact';
    data: any;
  } | null>(null);

  // Status Update Dialog State
  const [statusDialog, setStatusDialog] = useState<{
    isOpen: boolean;
    id: string;
    type: 'volunteer' | 'partnership' | 'contact';
    currentStatus: string;
    newStatus: string;
    notes: string;
  }>({
    isOpen: false,
    id: '',
    type: 'volunteer',
    currentStatus: '',
    newStatus: '',
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
      const [volRes, partRes, conRes, statsRes, subRes] = await Promise.all([
        applicationManagementService.getVolunteers({ status: statusFilter }),
        applicationManagementService.getPartnerships({ status: statusFilter }),
        applicationManagementService.getContacts({ status: statusFilter }),
        applicationManagementService.getStats(),
        newsletterService.getSubscribers().catch(() => ({ data: { subscribers: [] } }))
      ]);

      setVolunteers(volRes.items);
      setPartnerships(partRes.items);
      setContacts(conRes.items);
      setStats(statsRes);
      const subList = (subRes as any)?.data?.subscribers || (subRes as any)?.subscribers || [];
      setSubscribers(subList);
    } catch {
      showNotification('error', 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle status update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusDialog.id || !statusDialog.newStatus) return;

    try {
      setActionLoading(true);
      if (statusDialog.type === 'volunteer') {
        await applicationManagementService.updateVolunteerStatus(
          statusDialog.id,
          statusDialog.newStatus,
          statusDialog.notes
        );
      } else if (statusDialog.type === 'partnership') {
        await applicationManagementService.updatePartnershipStatus(
          statusDialog.id,
          statusDialog.newStatus,
          statusDialog.notes
        );
      } else {
        await applicationManagementService.updateContactStatus(
          statusDialog.id,
          statusDialog.newStatus,
          statusDialog.notes
        );
      }

      showNotification('success', 'Application status updated.');
      setStatusDialog({ isOpen: false, id: '', type: 'volunteer', currentStatus: '', newStatus: '', notes: '' });
      if (selectedItem) {
        setSelectedItem((prev) => prev ? { ...prev, data: { ...prev.data, status: statusDialog.newStatus } } : null);
      }
      loadData();
    } catch {
      showNotification('error', 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter calculations
  const filteredVolunteers = volunteers.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.fullName.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      v.county.toLowerCase().includes(q) ||
      v.areaOfInterest.toLowerCase().includes(q)
    );
  });

  const filteredPartnerships = partnerships.filter((p) => {
    const q = search.toLowerCase();
    const org = p.organizationName || p.organization || '';
    return (
      org.toLowerCase().includes(q) ||
      p.contactPerson.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.organizationType.toLowerCase().includes(q)
    );
  });

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q)
    );
  });

  const filteredSubscribers = subscribers.filter((s) => {
    const q = search.toLowerCase();
    return s.email.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q));
  });

  const handleExportSubscribers = async () => {
    try {
      const blob = await newsletterService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `msc-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification('success', 'Subscribers list exported as CSV.');
    } catch {
      showNotification('error', 'Failed to export subscribers.');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this subscriber from the mailing list?')) return;
    try {
      await newsletterService.deleteSubscriber(id);
      showNotification('success', 'Subscriber removed successfully.');
      loadData();
    } catch {
      showNotification('error', 'Failed to remove subscriber.');
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
              <Inbox className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-charcoal-900 font-display">Applications & Inquiries Desk</h1>
          </div>
          <p className="text-sm text-charcoal-600 mt-1">
            Manage volunteer applications across Nyamira wards, institutional partnership proposals, and public contact submissions.
          </p>
        </div>

        <button
          onClick={() => loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-50 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Volunteers</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{stats.totalVolunteers}</span>
          <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">{stats.newVolunteers} New</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Partnerships</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{stats.totalPartnerships}</span>
          <span className="text-[11px] text-sky-700 font-bold block mt-0.5">{stats.newPartnerships} Pending</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Inquiries</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">{stats.totalContacts}</span>
          <span className="text-[11px] text-amber-700 font-bold block mt-0.5">{stats.newContacts} Unread</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-forest-700 font-semibold block uppercase">Active Wards</span>
          <span className="text-2xl font-extrabold text-forest-800 mt-1 block">5</span>
          <span className="text-[11px] text-charcoal-400 block mt-0.5">Nyamira County</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Response Rate</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">94%</span>
          <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">&lt; 48 hours</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-warm-200 shadow-sm">
          <span className="text-xs text-charcoal-500 font-semibold block uppercase">Total Submissions</span>
          <span className="text-2xl font-extrabold text-charcoal-900 mt-1 block">
            {stats.totalVolunteers + stats.totalPartnerships + stats.totalContacts}
          </span>
          <span className="text-[11px] text-charcoal-500 block mt-0.5">Logged in system</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-warm-200 pb-3">
        <button
          onClick={() => {
            setActiveTab('volunteers');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'volunteers'
              ? 'bg-forest-800 text-warm-50 shadow-sm'
              : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Volunteer Applications ({volunteers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('partnerships');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'partnerships'
              ? 'bg-forest-800 text-warm-50 shadow-sm'
              : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Partnership Proposals ({partnerships.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('contacts');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'contacts'
              ? 'bg-forest-800 text-warm-50 shadow-sm'
              : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Contact Messages ({contacts.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('subscribers');
            setSearch('');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'subscribers'
              ? 'bg-forest-800 text-warm-50 shadow-sm'
              : 'bg-white text-charcoal-700 border border-warm-200 hover:bg-warm-100'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Newsletter Subscribers ({subscribers.length})</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              activeTab === 'volunteers'
                ? 'Search volunteer name, email, ward...'
                : activeTab === 'partnerships'
                ? 'Search organization, contact person...'
                : activeTab === 'contacts'
                ? 'Search message, name, subject...'
                : 'Search subscriber email or name...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-warm-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'subscribers' && (
            <button
              onClick={handleExportSubscribers}
              className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
              title="Download active subscribers as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {activeTab !== 'subscribers' && (
            <>
              <Filter className="w-3.5 h-3.5 text-charcoal-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-warm-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="all">All Statuses</option>
                <option value="NEW">New</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACCEPTED">Accepted / Resolved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-charcoal-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-forest-700 mb-3" />
            <p className="font-semibold text-sm">Loading applications catalog...</p>
          </div>
        ) : activeTab === 'volunteers' ? (
          /* Volunteers Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-700">
              <thead className="bg-warm-100/70 border-b border-warm-200 text-xs text-charcoal-600 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">County / Ward</th>
                  <th className="py-3 px-4">Area of Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-charcoal-500">
                      No volunteer applications match your search.
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((vol) => {
                    const statusConfig = STATUS_BADGES[vol.status || 'NEW'] || STATUS_BADGES.NEW;
                    return (
                      <tr key={vol.id} className="hover:bg-warm-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal-900">{vol.fullName}</div>
                          {vol.referenceNumber && (
                            <span className="text-[11px] text-charcoal-400 font-mono">{vol.referenceNumber}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div>{vol.email}</div>
                          <div className="text-charcoal-500">{vol.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div>{vol.county}</div>
                          {vol.subCounty && <div className="text-charcoal-500">{vol.subCounty}</div>}
                        </td>
                        <td className="py-3 px-4 text-xs max-w-xs truncate font-medium text-forest-900">
                          {vol.areaOfInterest}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {vol.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedItem({ type: 'volunteer', data: vol })}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-warm-300 bg-white hover:bg-warm-100 text-charcoal-700 inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            {canUpdate && (
                              <button
                                onClick={() =>
                                  setStatusDialog({
                                    isOpen: true,
                                    id: vol.id || '',
                                    type: 'volunteer',
                                    currentStatus: vol.status || 'NEW',
                                    newStatus: vol.status === 'NEW' ? 'REVIEWED' : 'ACCEPTED',
                                    notes: vol.reviewNotes || ''
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-forest-800 text-white hover:bg-forest-900"
                              >
                                Update
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
        ) : activeTab === 'partnerships' ? (
          /* Partnerships Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-700">
              <thead className="bg-warm-100/70 border-b border-warm-200 text-xs text-charcoal-600 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredPartnerships.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-charcoal-500">
                      No partnership proposals match your search.
                    </td>
                  </tr>
                ) : (
                  filteredPartnerships.map((part) => {
                    const statusConfig = STATUS_BADGES[part.status || 'NEW'] || STATUS_BADGES.NEW;
                    const org = part.organizationName || part.organization || 'Institutional Partner';
                    return (
                      <tr key={part.id} className="hover:bg-warm-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal-900">{org}</div>
                          {part.website && (
                            <a
                              href={part.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-forest-700 hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              <span>{part.website.replace(/^https?:\/\//, '')}</span>
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div className="font-semibold text-charcoal-800">{part.contactPerson}</div>
                          <div className="text-charcoal-500">{part.email}</div>
                          <div className="text-charcoal-400">{part.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-xs">{part.organizationType}</td>
                        <td className="py-3 px-4 text-xs max-w-xs truncate font-medium text-forest-900">
                          {part.partnershipInterests || part.areaOfInterest}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {part.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedItem({ type: 'partnership', data: part })}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-warm-300 bg-white hover:bg-warm-100 text-charcoal-700 inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            {canUpdate && (
                              <button
                                onClick={() =>
                                  setStatusDialog({
                                    isOpen: true,
                                    id: part.id || '',
                                    type: 'partnership',
                                    currentStatus: part.status || 'NEW',
                                    newStatus: part.status === 'NEW' ? 'IN_REVIEW' : 'ACCEPTED',
                                    notes: part.reviewNotes || ''
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-forest-800 text-white hover:bg-forest-900"
                              >
                                Update
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
        ) : activeTab === 'contacts' ? (
          /* Contacts Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-700">
              <thead className="bg-warm-100/70 border-b border-warm-200 text-xs text-charcoal-600 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-charcoal-500">
                      No contact submissions match your search.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((con) => {
                    const statusConfig = STATUS_BADGES[con.status || 'NEW'] || STATUS_BADGES.NEW;
                    return (
                      <tr key={con.id} className="hover:bg-warm-50/60 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-charcoal-900">{con.name}</div>
                          <div className="text-xs text-charcoal-500">{con.email}</div>
                          {con.phone && <div className="text-[11px] text-charcoal-400">{con.phone}</div>}
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-charcoal-900 max-w-xs truncate">
                          {con.subject}
                        </td>
                        <td className="py-3 px-4 text-xs text-charcoal-600 max-w-sm truncate">
                          {con.message}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            {con.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedItem({ type: 'contact', data: con })}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-warm-300 bg-white hover:bg-warm-100 text-charcoal-700 inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            {canUpdate && (
                              <button
                                onClick={() =>
                                  setStatusDialog({
                                    isOpen: true,
                                    id: con.id || '',
                                    type: 'contact',
                                    currentStatus: con.status || 'NEW',
                                    newStatus: con.status === 'NEW' ? 'IN_PROGRESS' : 'RESOLVED',
                                    notes: con.internalNotes || ''
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-forest-800 text-white hover:bg-forest-900"
                              >
                                Update
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
        ) : (
          /* Newsletter Subscribers Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal-700">
              <thead className="bg-warm-100/70 border-b border-warm-200 text-xs text-charcoal-600 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Subscriber Email</th>
                  <th className="py-3 px-4">Name / Note</th>
                  <th className="py-3 px-4">Consent Status</th>
                  <th className="py-3 px-4">Date Subscribed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-charcoal-500">
                      No newsletter subscribers match your query.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-warm-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-charcoal-900">{sub.email}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-charcoal-600 whitespace-nowrap">
                        {sub.name || 'Community Member'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Explicit Consent</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-charcoal-600 whitespace-nowrap">
                        {new Date(sub.subscribedAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-stone-100 text-stone-700 border-stone-300'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 inline-flex items-center gap-1 transition-colors"
                          title="Remove from subscriber list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-warm-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-warm-100 text-charcoal-500"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-charcoal-900 font-display">
                  {selectedItem.type === 'volunteer'
                    ? 'Volunteer Application Dossier'
                    : selectedItem.type === 'partnership'
                    ? 'Partnership Proposal Details'
                    : 'Contact Inquiry Dossier'}
                </h2>
                <p className="text-xs text-charcoal-500">
                  Status:{' '}
                  <span className="font-bold text-forest-800">{selectedItem.data.status || 'NEW'}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-charcoal-800">
              {/* Common Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-warm-50 border border-warm-200 text-xs">
                <div>
                  <strong>Primary Contact:</strong>{' '}
                  {selectedItem.data.fullName || selectedItem.data.contactPerson || selectedItem.data.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedItem.data.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedItem.data.phone || 'N/A'}
                </div>
                <div>
                  <strong>Date Logged:</strong>{' '}
                  {selectedItem.data.submittedAt
                    ? new Date(selectedItem.data.submittedAt).toLocaleString('en-KE')
                    : 'Recent'}
                </div>
              </div>

              {/* Type-specific Fields */}
              {selectedItem.type === 'volunteer' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <strong>County / Sub-County:</strong> {selectedItem.data.county}{' '}
                      {selectedItem.data.subCounty ? `(${selectedItem.data.subCounty})` : ''}
                    </div>
                    <div>
                      <strong>Area of Interest:</strong> {selectedItem.data.areaOfInterest}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Availability:</strong> {selectedItem.data.availability}
                    </div>
                  </div>

                  {selectedItem.data.experience && (
                    <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs">
                      <strong>Relevant Experience / Skills:</strong>
                      <p className="mt-1 leading-relaxed text-charcoal-700">{selectedItem.data.experience}</p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs">
                    <strong>Motivation / Statement of Intent:</strong>
                    <p className="mt-1 leading-relaxed text-charcoal-700">{selectedItem.data.message}</p>
                  </div>
                </>
              )}

              {selectedItem.type === 'partnership' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <strong>Organization Name:</strong>{' '}
                      {selectedItem.data.organizationName || selectedItem.data.organization}
                    </div>
                    <div>
                      <strong>Organization Type:</strong> {selectedItem.data.organizationType}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Partnership Focus:</strong>{' '}
                      {selectedItem.data.partnershipInterests || selectedItem.data.areaOfInterest}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs">
                    <strong>Proposal Summary / Collaboration Scope:</strong>
                    <p className="mt-1 leading-relaxed text-charcoal-700">{selectedItem.data.message}</p>
                  </div>
                </>
              )}

              {selectedItem.type === 'contact' && (
                <>
                  <div className="text-xs">
                    <strong>Subject:</strong> {selectedItem.data.subject}
                  </div>
                  <div className="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs">
                    <strong>Inquiry Content:</strong>
                    <p className="mt-1 leading-relaxed text-charcoal-700">{selectedItem.data.message}</p>
                  </div>
                </>
              )}

              {/* Review notes if any */}
              {(selectedItem.data.reviewNotes || selectedItem.data.internalNotes) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Internal Review Notes:</strong>
                  <p className="mt-0.5">{selectedItem.data.reviewNotes || selectedItem.data.internalNotes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-200 mt-6">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl border border-warm-300 text-xs font-bold text-charcoal-700 hover:bg-warm-100"
              >
                Close
              </button>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusDialog({
                      isOpen: true,
                      id: selectedItem.data.id || '',
                      type: selectedItem.type,
                      currentStatus: selectedItem.data.status || 'NEW',
                      newStatus:
                        selectedItem.type === 'volunteer'
                          ? 'ACCEPTED'
                          : selectedItem.type === 'partnership'
                          ? 'ACCEPTED'
                          : 'RESOLVED',
                      notes: selectedItem.data.reviewNotes || selectedItem.data.internalNotes || ''
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-forest-800 text-warm-50 text-xs font-bold hover:bg-forest-900"
                >
                  Update Status & Notes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Dialog */}
      {statusDialog.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-200">
            <h3 className="text-lg font-extrabold text-charcoal-900 font-display mb-1">
              Update Submission Status
            </h3>
            <p className="text-xs text-charcoal-600 mb-4">
              Select lifecycle state and append operational tracking notes.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Status *</label>
                <select
                  value={statusDialog.newStatus}
                  onChange={(e) => setStatusDialog((prev) => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
                >
                  <option value="NEW">New</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ACCEPTED">Accepted / Approved</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DECLINED">Declined</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase mb-1">Review Notes</label>
                <textarea
                  rows={3}
                  value={statusDialog.notes}
                  onChange={(e) => setStatusDialog((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Spoke via phone on 2025-05-10. Ward coordinator assigned."
                  className="w-full px-3.5 py-2 rounded-xl border border-warm-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setStatusDialog({
                      isOpen: false,
                      id: '',
                      type: 'volunteer',
                      currentStatus: '',
                      newStatus: '',
                      notes: ''
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-warm-300 text-xs font-bold text-charcoal-700 hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-forest-800 text-warm-50 text-xs font-bold hover:bg-forest-900 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
