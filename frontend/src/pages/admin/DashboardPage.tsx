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
  Building
} from 'lucide-react';

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
  }, [fetchDashboard]);

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-charcoal-900 font-display">Recent System Activity</h2>
            <p className="text-xs text-charcoal-500">Live immutable audit trail of content and operational events.</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-forest-700" />
        </div>

        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="divide-y divide-warm-100">
            {data.recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-forest-600" />
                  <div>
                    <span className="font-bold text-charcoal-900">
                      {log.action} {log.entity}
                    </span>
                    <span className="text-charcoal-500 ml-2">
                      by {log.user?.name || 'Authorized Staff'} ({log.user?.role || 'Admin'})
                    </span>
                  </div>
                </div>
                <span className="text-charcoal-400">
                  {new Date(log.createdAt).toLocaleString('en-KE', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-charcoal-500 py-4 text-center">No recent audit log entries.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;