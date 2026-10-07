import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import {
  Bell,
  Mail,
  UserCheck,
  Building,
  FileCheck2,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';

interface NotificationSummary {
  actionCounts: {
    newContactMessages: number;
    newVolunteerApplications: number;
    newPartnershipRequests: number;
    contentAwaitingReview: number;
  };
  totalActionItems: number;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

export const AdminNotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NotificationSummary>({
    actionCounts: {
      newContactMessages: 0,
      newVolunteerApplications: 0,
      newPartnershipRequests: 0,
      contentAwaitingReview: 0
    },
    totalActionItems: 0,
    recentNotifications: []
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get<any>('/admin/notifications');
      const payload = res?.data || res;
      if (payload?.actionCounts) {
        setData(payload);
      }
    } catch {
      // Fallback or offline
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    try {
      await apiClient.patch(`/admin/notifications/${id}/read`, {});
      setData((prev) => ({
        ...prev,
        recentNotifications: prev.recentNotifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      }));
    } catch {}

    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await apiClient.patch('/admin/notifications/mark-all-read', {});
      setData((prev) => ({
        ...prev,
        recentNotifications: prev.recentNotifications.map((n) => ({ ...n, isRead: true }))
      }));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const { actionCounts, totalActionItems, recentNotifications } = data;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-charcoal-600 hover:text-forest-900 hover:bg-warm-100 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-600"
        aria-label="Open notifications center"
        title="Admin Notifications Center"
      >
        <Bell className="w-5 h-5" />

        {totalActionItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md animate-pulse">
            {totalActionItems > 99 ? '99+' : totalActionItems}
          </span>
        )}
      </button>

      {/* Flyout Notification Center */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notification Center"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-warm-200 shadow-2xl py-3 z-50 text-left animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b border-warm-200">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <div>
                <h3 className="font-extrabold text-sm text-charcoal-900 font-display">
                  Notifications Center
                </h3>
                <span className="text-[11px] text-charcoal-500 block">
                  {totalActionItems} pending items require attention
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={fetchNotifications}
                className="p-1 rounded-lg hover:bg-warm-100 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-warm-100 text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Center Categories */}
          <div className="p-3 bg-warm-50/70 border-b border-warm-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-charcoal-500 block px-1">
              Action Items
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Contact Inquiries */}
              <Link
                to="/admin/applications?tab=contacts"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-white border border-warm-200 hover:border-forest-600 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block group-hover:text-forest-800">
                      {actionCounts.newContactMessages} Inquiries
                    </span>
                    <span className="text-[10px] text-charcoal-500">Unread</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-forest-800" />
              </Link>

              {/* Volunteer Applications */}
              <Link
                to="/admin/applications?tab=volunteers"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-white border border-warm-200 hover:border-forest-600 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block group-hover:text-forest-800">
                      {actionCounts.newVolunteerApplications} Volunteers
                    </span>
                    <span className="text-[10px] text-charcoal-500">New applications</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-forest-800" />
              </Link>

              {/* Partnership Requests */}
              <Link
                to="/admin/applications?tab=partnerships"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-white border border-warm-200 hover:border-forest-600 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-50 text-sky-800">
                    <Building className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block group-hover:text-forest-800">
                      {actionCounts.newPartnershipRequests} Partners
                    </span>
                    <span className="text-[10px] text-charcoal-500">Proposals</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-forest-800" />
              </Link>

              {/* Content in Review */}
              <Link
                to="/admin/content"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-white border border-warm-200 hover:border-forest-600 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-800">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block group-hover:text-forest-800">
                      {actionCounts.contentAwaitingReview} In Review
                    </span>
                    <span className="text-[10px] text-charcoal-500">Awaiting sign-off</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-forest-800" />
              </Link>
            </div>
          </div>

          {/* Recent Notifications Feed */}
          <div className="max-h-64 overflow-y-auto divide-y divide-warm-100">
            <div className="px-4 py-2 flex items-center justify-between text-[11px] text-charcoal-500 bg-white sticky top-0">
              <span className="font-bold uppercase tracking-wider">Recent Activity</span>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-forest-800 hover:text-forest-950 font-bold transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p>All caught up! No recent unread alerts.</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id, notif.link)}
                  className={`p-3 px-4 hover:bg-warm-50 transition-colors cursor-pointer flex items-start gap-3 ${
                    !notif.isRead ? 'bg-forest-50/40' : ''
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !notif.isRead ? 'bg-forest-700' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-charcoal-900 truncate">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-charcoal-600 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-charcoal-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {notif.link && (
                    <ExternalLink className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer View Dashboard */}
          <div className="p-2.5 pt-2 border-t border-warm-200 text-center">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-forest-800 hover:text-forest-950 transition-colors inline-flex items-center gap-1"
            >
              <span>Go to Admin Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
