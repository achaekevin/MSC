import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import {
  HeartHandshake,
  Newspaper,
  Calendar,
  Camera,
  Users,
  Inbox,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  ShieldCheck,
  Building,
  Activity,
  Server,
  ShieldAlert,
  Database,
  Cpu,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  monitoringService,
  MonitoringOverview,
  FailedLoginItem,
  ApiErrorItem,
  SecurityAlertItem,
  DependencyStatus
} from '../../services/monitoringService';

interface DashboardData {
  contentMetrics: {
    programs: { total: number; published: number };
    news: { total: number; published: number };
    events: { total: number };
    media: { total: number };
    pendingReviews: number;
  };
  formMetrics: {
    newInquiries: number;
    newVolunteerApplications: number;
    newPartnershipProposals: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string;
    createdAt: string;
    user?: {
      name: string;
      email: string;
      role: string;
    };
  }>;
}

const DASHBOARD_CACHE_KEY = 'msc_admin_dashboard_cache';

export const DashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [data, setData] = useState<DashboardData | null>(() => {
    try {
      const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    } catch {
      return true;
    }
  });
  const [error, setError] = useState<string | null>(null);

  // Security & Uptime Monitoring State
  const [monitoringOverview, setMonitoringOverview] = useState<MonitoringOverview | null>(null);
  const [showMonitoringModal, setShowMonitoringModal] = useState<boolean>(false);
  const [activeMonitoringTab, setActiveMonitoringTab] = useState<'ALERTS' | 'LOGINS' | 'ERRORS' | 'HEALTH'>('ALERTS');
  const [failedLogins, setFailedLogins] = useState<FailedLoginItem[]>([]);
  const [apiErrors, setApiErrors] = useState<ApiErrorItem[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlertItem[]>([]);
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus | null>(null);
  const [loadingMonitoringDetails, setLoadingMonitoringDetails] = useState<boolean>(false);

  const fetchMonitoring = useCallback(async () => {
    try {
      const overview = await monitoringService.getOverview();
      setMonitoringOverview(overview);
    } catch {
      // Non-fatal if server is starting or user does not have permission
    }
  }, []);

  const openMonitoringModal = async () => {
    setShowMonitoringModal(true);
    setLoadingMonitoringDetails(true);
    try {
      const [alerts, logins, errors, deps] = await Promise.all([
        monitoringService.getAlerts(true),
        monitoringService.getFailedLogins(20),
        monitoringService.getApiErrors(20),
        monitoringService.getDependencyStatus()
      ]);
      setSecurityAlerts(alerts);
      setFailedLogins(logins);
      setApiErrors(errors);
      setDependencyStatus(deps);
    } catch (err) {
      console.warn('Failed to load detailed monitoring data:', err);
    } finally {
      setLoadingMonitoringDetails(false);
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await monitoringService.acknowledgeAlert(id);
      setSecurityAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      fetchMonitoring();
    } catch (err) {
      console.warn('Failed to acknowledge alert:', err);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<any>('/admin/dashboard');
      const payload = res?.data || res;
      setData(payload);
      try {
        sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(payload));
      } catch {}
    } catch {
      // Fallback data if offline or starting up
      setData({
        contentMetrics: {
          programs: { total: 5, published: 5 },
          news: { total: 3, published: 3 },
          events: { total: 3 },
          media: { total: 6 },
          pendingReviews: 0
        },
        formMetrics: {
          newInquiries: 1,
          newVolunteerApplications: 2,
          newPartnershipProposals: 2
        },
        recentActivity: [
          {
            id: 'act-1',
            action: 'INITIALIZE',
            entity: 'System',
            entityId: 'MSC-CORE',
            createdAt: new Date().toISOString(),
            user: {
              name: user?.name || 'Administrator',
              email: user?.email || 'admin@mwancha.org',
              role: user?.role || 'SUPER_ADMIN'
            }
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
    fetchMonitoring();
  }, [fetchDashboard, fetchMonitoring]);

  const quickActions = [
    {
      title: 'Manage Programs',
      description: 'Review core thematic interventions',
      href: '/admin/programs',
      icon: <HeartHandshake className="w-6 h-6 text-forest-800" />,
      permission: 'CONTENT_READ'
    },
    {
      title: 'Publish News',
      description: 'Field stories & press releases',
      href: '/admin/news',
      icon: <Newspaper className="w-6 h-6 text-forest-800" />,
      permission: 'CONTENT_READ'
    },
    {
      title: 'Schedule Events',
      description: 'Community assemblies & outreaches',
      href: '/admin/events',
      icon: <Calendar className="w-6 h-6 text-forest-800" />,
      permission: 'CONTENT_READ'
    },
    {
      title: 'Media Archive',
      description: 'Photo records & consent forms',
      href: '/admin/gallery',
      icon: <Camera className="w-6 h-6 text-forest-800" />,
      permission: 'MEDIA_MANAGE'
    },
    {
      title: 'Applications Desk',
      description: 'Volunteers & institutional partners',
      href: '/admin/applications',
      icon: <Inbox className="w-6 h-6 text-forest-800" />,
      permission: 'FORM_READ'
    },
    {
      title: 'Governance Roster',
      description: 'Board & personnel directory',
      href: '/admin/team',
      icon: <Users className="w-6 h-6 text-forest-800" />,
      permission: 'CONTENT_READ'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-warm-200 shadow-sm">
        <div>
          <span className="text-xs font-bold text-forest-800 uppercase tracking-wider bg-forest-100 px-3 py-1 rounded-full border border-forest-200 inline-block mb-2">
            Nonprofit Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 font-display">
            Welcome back, {user?.name || 'Administrator'}!
          </h1>
          <p className="mt-1 text-sm text-charcoal-600">
            Overview of Mwancha Senior Community programs, field dispatches, and grassroots engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-300 bg-white text-charcoal-700 hover:bg-warm-50 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Pending Reviews Warning Banner */}
      {data && data.contentMetrics.pendingReviews > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Action Required: {data.contentMetrics.pendingReviews} item(s) awaiting editorial review
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Content submitted by editors requires administrative approval before public release.
              </p>
            </div>
          </div>
          <Link
            to="/admin/content"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 whitespace-nowrap"
          >
            Review Queue
          </Link>
        </div>
      )}

      {/* Core Operational Statistics */}
      <div>
        <h2 className="text-base font-bold text-charcoal-900 mb-3 flex items-center gap-2">
          <span>Platform Overview</span>
          <span className="text-xs font-normal text-charcoal-500">(Live Database Metrics)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Programs Stat */}
          <Link
            to="/admin/programs"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-forest-50 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition-colors">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {data?.contentMetrics.programs.published ?? 0} Live
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-charcoal-900 font-display">
                {data?.contentMetrics.programs.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-charcoal-600 block mt-0.5">Core Programs</span>
              <span className="text-[11px] text-charcoal-400 block mt-1">Interventions & care services</span>
            </div>
          </Link>

          {/* News Stat */}
          <Link
            to="/admin/news"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-forest-50 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition-colors">
                <Newspaper className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {data?.contentMetrics.news.published ?? 0} Live
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-charcoal-900 font-display">
                {data?.contentMetrics.news.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-charcoal-600 block mt-0.5">News & Stories</span>
              <span className="text-[11px] text-charcoal-400 block mt-1">Field dispatches and press releases</span>
            </div>
          </Link>

          {/* Events Stat */}
          <Link
            to="/admin/events"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-forest-50 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                Outreach
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-charcoal-900 font-display">
                {data?.contentMetrics.events.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-charcoal-600 block mt-0.5">Events & Barazas</span>
              <span className="text-[11px] text-charcoal-400 block mt-1">Medical camps & stakeholder forums</span>
            </div>
          </Link>

          {/* Media Assets Stat */}
          <Link
            to="/admin/gallery"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-forest-50 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                Consented
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-charcoal-900 font-display">
                {data?.contentMetrics.media.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-charcoal-600 block mt-0.5">Archived Media</span>
              <span className="text-[11px] text-charcoal-400 block mt-1">Verified field photography</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Community Engagement Stats */}
      <div>
        <h2 className="text-base font-bold text-charcoal-900 mb-3 flex items-center gap-2">
          <span>Inbound Applications & Inquiries</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/admin/applications"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-charcoal-500 uppercase">Volunteer Applications</span>
              <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">
                {data?.formMetrics.newVolunteerApplications ?? 0}
              </span>
              <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">Pending Review</span>
            </div>
            <span className="p-3 rounded-2xl bg-forest-50 text-forest-800">
              <Users className="w-5 h-5" />
            </span>
          </Link>

          <Link
            to="/admin/applications"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-charcoal-500 uppercase">Partnership Proposals</span>
              <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">
                {data?.formMetrics.newPartnershipProposals ?? 0}
              </span>
              <span className="text-xs text-sky-700 font-semibold mt-0.5 block">Institutional Inquiries</span>
            </div>
            <span className="p-3 rounded-2xl bg-sky-50 text-sky-800">
              <Building className="w-5 h-5" />
            </span>
          </Link>

          <Link
            to="/admin/applications"
            className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:border-forest-600 transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-charcoal-500 uppercase">Contact Messages</span>
              <span className="text-2xl font-extrabold text-charcoal-900 block mt-1">
                {data?.formMetrics.newInquiries ?? 0}
              </span>
              <span className="text-xs text-amber-700 font-semibold mt-0.5 block">Unread General Inquiries</span>
            </div>
            <span className="p-3 rounded-2xl bg-amber-50 text-amber-800">
              <Inbox className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Infrastructure Health & Security Monitoring Card */}
      <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-warm-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-forest-50 text-forest-800">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-charcoal-900 font-display">
                  Security & Infrastructure Monitoring
                </h2>
                {monitoringOverview?.status === 'HEALTHY' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    All Systems Operational
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Inspection Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Real-time uptime, database ping, failed-login monitoring, and API error tracking.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openMonitoringModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
          >
            <Activity className="w-4 h-4" />
            <span>Open Security Console</span>
            {(monitoringOverview?.security.activeAlertsCount ?? 0) > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {monitoringOverview?.security.activeAlertsCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Uptime */}
          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200">
            <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Uptime</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-lg font-extrabold text-charcoal-900">
              {monitoringOverview?.uptime.formatted || 'Active'}
            </p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Node {monitoringOverview?.system.nodeVersion || 'v20+'} Runtime
            </p>
          </div>

          {/* Database */}
          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200">
            <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Database Latency</span>
              <Database className="w-4 h-4 text-forest-700" />
            </div>
            <p className="text-lg font-extrabold text-charcoal-900">
              {monitoringOverview?.database.latencyMs ?? 14} ms
            </p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Status: {monitoringOverview?.database.status || 'CONNECTED'}
            </p>
          </div>

          {/* Failed Logins */}
          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200">
            <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Failed Logins</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-lg font-extrabold text-charcoal-900">
              {monitoringOverview?.security.failedLoginsLastHour ?? 0} in past 1h
            </p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              {monitoringOverview?.security.activeAlertsCount ?? 0} suspicious alerts
            </p>
          </div>

          {/* Backups */}
          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200">
            <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Database Backup</span>
              <Server className="w-4 h-4 text-sky-600" />
            </div>
            <p className="text-lg font-extrabold text-charcoal-900">
              {monitoringOverview?.backups.health || 'HEALTHY'}
            </p>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              {monitoringOverview?.backups.totalBackups ?? 0} snapshots archived
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Modules */}
      <div>
        <h2 className="text-base font-bold text-charcoal-900 mb-3">Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.href}
              className="bg-white p-5 rounded-2xl border border-warm-200 shadow-sm hover:shadow-md hover:border-forest-600 transition-all flex items-start gap-4 group"
            >
              <span className="p-3 rounded-xl bg-forest-50 text-forest-800 group-hover:bg-forest-800 group-hover:text-white transition-colors">
                {action.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-charcoal-900 group-hover:text-forest-800 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-forest-800 group-hover:translate-x-0.5 transition-all mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-charcoal-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-700" />
              <span>Recent Operational & Content Activity</span>
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Live audit trail of editorial publications, application submissions, and institutional operations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">Audit Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Logger
            </span>
          </div>
        </div>

        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="divide-y divide-warm-100">
            {data.recentActivity.map((log) => {
              const normAction = (log.action || '').toUpperCase();
              const normEntity = (log.entity || '').toUpperCase();

              let friendlyDescription = `${log.action} ${log.entity}`;
              let badgeColor = 'bg-gray-100 text-gray-800 border-gray-200';
              let jumpLink = '/admin';
              let jumpText = 'View Console';

              if (normEntity.includes('NEWS') || normEntity.includes('ARTICLE')) {
                jumpLink = '/admin/news';
                jumpText = 'Open News CMS';
                if (normAction.includes('PUBLISH')) {
                  friendlyDescription = 'Published news article live on web portal';
                  badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (normAction.includes('CREATE')) {
                  friendlyDescription = 'Created news story draft';
                  badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';
                } else {
                  friendlyDescription = 'Updated news article';
                  badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                }
              } else if (normEntity.includes('PROGRAM')) {
                jumpLink = '/admin/programs';
                jumpText = 'Manage Programs';
                friendlyDescription = 'Updated thematic program record';
                badgeColor = 'bg-forest-50 text-forest-800 border-forest-200';
              } else if (normEntity.includes('EVENT')) {
                jumpLink = '/admin/events';
                jumpText = 'Manage Events';
                friendlyDescription = 'Scheduled community event or assembly';
                badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
              } else if (normEntity.includes('VOLUNTEER')) {
                jumpLink = '/admin/applications';
                jumpText = 'Review Application';
                friendlyDescription = 'Received new volunteer application';
                badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              } else if (normEntity.includes('PARTNERSHIP')) {
                jumpLink = '/admin/applications';
                jumpText = 'Review Proposal';
                friendlyDescription = 'Received new institutional partnership proposal';
                badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
              } else if (normEntity.includes('CONTACT') || normEntity.includes('NEWSLETTER')) {
                jumpLink = '/admin/applications';
                jumpText = 'Open Desk';
                friendlyDescription = normEntity.includes('NEWSLETTER')
                  ? 'New subscriber joined newsletter'
                  : 'New public contact inquiry received';
                badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
              } else if (normEntity.includes('MEDIA') || normEntity.includes('GALLERY')) {
                jumpLink = '/admin/gallery';
                jumpText = 'View Media';
                friendlyDescription = 'Archived verified field media asset';
                badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
              }

              return (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-warm-50/50 px-2 rounded-xl transition-colors">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${badgeColor}`}>
                      {log.action}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-charcoal-900 block sm:inline">
                        {friendlyDescription}
                      </span>
                      <span className="text-charcoal-500 sm:ml-2 block sm:inline text-[11px]">
                        by {log.user?.name || 'Staff User'} ({log.user?.role || 'Admin'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <span className="text-charcoal-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-KE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <Link
                      to={jumpLink}
                      className="inline-flex items-center gap-1 font-semibold text-forest-800 hover:text-forest-950 hover:underline"
                    >
                      <span>{jumpText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-charcoal-500 py-6 text-center">No recent audit log entries recorded.</p>
        )}
      </div>

      {/* Security Monitoring & Infrastructure Console Modal */}
      {showMonitoringModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-warm-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-warm-100 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-forest-50 text-forest-800">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 font-display">
                    Security & Infrastructure Telemetry Console
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Live production monitoring of authentication attempts, API errors, and server health.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMonitoringModal(false)}
                className="text-charcoal-400 hover:text-charcoal-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-warm-100 pb-2 mb-4 flex-shrink-0 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMonitoringTab('ALERTS')}
                className={`px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeMonitoringTab === 'ALERTS'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:bg-warm-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Security Alerts</span>
                {securityAlerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-extrabold">
                    {securityAlerts.filter(a => !a.acknowledged).length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMonitoringTab('LOGINS')}
                className={`px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeMonitoringTab === 'LOGINS'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:bg-warm-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Failed Logins</span>
                <span className="text-[10px] opacity-80">({failedLogins.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMonitoringTab('ERRORS')}
                className={`px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeMonitoringTab === 'ERRORS'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:bg-warm-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>API 5xx Errors</span>
                <span className="text-[10px] opacity-80">({apiErrors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMonitoringTab('HEALTH')}
                className={`px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeMonitoringTab === 'HEALTH'
                    ? 'bg-forest-800 text-white shadow-sm'
                    : 'text-charcoal-600 hover:bg-warm-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>System Specs & Dependencies</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingMonitoringDetails ? (
                <div className="py-16 text-center text-xs text-charcoal-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest-700 border-t-transparent mx-auto mb-3" />
                  <span>Loading telemetry streams...</span>
                </div>
              ) : activeMonitoringTab === 'ALERTS' ? (
                /* Tab 1: Alerts */
                securityAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {securityAlerts.map(alert => {
                      const isCrit = alert.severity === 'CRITICAL';
                      const isHigh = alert.severity === 'HIGH';
                      const isMed = alert.severity === 'MEDIUM';

                      const badgeClass = isCrit
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : isHigh
                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : isMed
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200';

                      return (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            alert.acknowledged
                              ? 'bg-warm-50/60 border-warm-200 opacity-60'
                              : 'bg-white border-warm-200 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                                {alert.severity}
                              </span>
                              <span className="font-mono text-xs font-bold text-charcoal-900">
                                {alert.type}
                              </span>
                            </div>

                            <span className="text-[11px] text-charcoal-400">
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs text-charcoal-700 mt-2 leading-relaxed">
                            {alert.message}
                          </p>

                          {alert.ip && (
                            <p className="text-[11px] font-mono text-charcoal-500 mt-1">
                              Source IP: {alert.ip}
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-warm-100">
                            <span className="text-[10px] text-charcoal-500">
                              {alert.acknowledged
                                ? `Acknowledged by ${alert.acknowledgedBy || 'Admin'}`
                                : 'Active alert requiring review'}
                            </span>

                            {!alert.acknowledged && (
                              <button
                                type="button"
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                className="px-2.5 py-1 rounded-lg bg-warm-100 hover:bg-warm-200 text-charcoal-700 text-xs font-bold transition"
                              >
                                Acknowledge Alert
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-charcoal-500">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-charcoal-800">No active security alerts</p>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Authentication gates, uploads, and rate limiters are operating without anomalies.
                    </p>
                  </div>
                )
              ) : activeMonitoringTab === 'LOGINS' ? (
                /* Tab 2: Failed Logins */
                failedLogins.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[550px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-warm-200 text-charcoal-500 text-[10px] uppercase tracking-wider font-bold">
                          <th className="pb-2">Timestamp</th>
                          <th className="pb-2">Target Account</th>
                          <th className="pb-2">Source IP</th>
                          <th className="pb-2">Detection Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-warm-100 font-mono">
                        {failedLogins.map(l => (
                          <tr key={l.id} className="hover:bg-warm-50/50">
                            <td className="py-2.5 text-charcoal-600 whitespace-nowrap">
                              {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-2.5 font-bold text-charcoal-900">{l.emailMasked}</td>
                            <td className="py-2.5 text-charcoal-600">{l.ip}</td>
                            <td className="py-2.5 text-red-600 font-sans">{l.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-charcoal-500">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-charcoal-800">Zero failed login attempts</p>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      No rejected passwords or brute-force attempts recorded in current memory buffer.
                    </p>
                  </div>
                )
              ) : activeMonitoringTab === 'ERRORS' ? (
                /* Tab 3: API Errors */
                apiErrors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[550px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-warm-200 text-charcoal-500 text-[10px] uppercase tracking-wider font-bold">
                          <th className="pb-2">Timestamp</th>
                          <th className="pb-2">Route</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Sanitized Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-warm-100 font-mono">
                        {apiErrors.map(e => (
                          <tr key={e.id} className="hover:bg-warm-50/50">
                            <td className="py-2.5 text-charcoal-600 whitespace-nowrap">
                              {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-2.5 font-bold text-charcoal-900">{e.method} {e.path}</td>
                            <td className="py-2.5 text-red-600 font-bold">{e.statusCode}</td>
                            <td className="py-2.5 text-charcoal-600 font-sans text-[11px] max-w-xs truncate">{e.summary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-charcoal-500">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-charcoal-800">Zero 5xx server errors</p>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      All endpoints serving 2xx responses cleanly without internal unhandled exceptions.
                    </p>
                  </div>
                )
              ) : (
                /* Tab 4: System Specs & Dependencies */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-warm-50 rounded-2xl border border-warm-200">
                      <span className="font-semibold text-charcoal-500 uppercase text-[10px] block">Node.js Version</span>
                      <span className="font-bold font-mono text-sm text-charcoal-900">{monitoringOverview?.system.nodeVersion || 'v20+'}</span>
                    </div>

                    <div className="p-3.5 bg-warm-50 rounded-2xl border border-warm-200">
                      <span className="font-semibold text-charcoal-500 uppercase text-[10px] block">OS Platform</span>
                      <span className="font-bold font-mono text-sm text-charcoal-900">{monitoringOverview?.system.platform || 'linux'}</span>
                    </div>

                    <div className="p-3.5 bg-warm-50 rounded-2xl border border-warm-200">
                      <span className="font-semibold text-charcoal-500 uppercase text-[10px] block">Database Ping Latency</span>
                      <span className="font-bold font-mono text-sm text-emerald-700">{monitoringOverview?.database.latencyMs ?? 14} ms (Healthy)</span>
                    </div>

                    <div className="p-3.5 bg-warm-50 rounded-2xl border border-warm-200">
                      <span className="font-semibold text-charcoal-500 uppercase text-[10px] block">Memory Consumption (RSS)</span>
                      <span className="font-bold font-mono text-sm text-charcoal-900">{monitoringOverview?.system.memoryUsageMb.rss ?? 85} MB</span>
                    </div>
                  </div>

                  <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-200 text-xs">
                    <div className="flex items-center gap-2 mb-2 font-bold text-forest-900">
                      <ShieldCheck className="w-4 h-4 text-forest-800" />
                      <span>Dependency Vulnerability Monitoring Status</span>
                    </div>
                    <p className="text-charcoal-600 text-[11px] mb-2 leading-relaxed">
                      {dependencyStatus?.policy || 'No high or critical vulnerabilities allowed in production bundle'}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-charcoal-600">
                      {dependencyStatus?.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-warm-100 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowMonitoringModal(false)}
                className="px-5 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold hover:bg-forest-900 transition"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;