import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auditService, AuditLogItem } from '../../services/auditService';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileCode,
  ShieldCheck,
  CheckCircle,
  Database
} from 'lucide-react';

export const AuditLogsManagementPage: React.FC = () => {
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  // Modal inspection
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await auditService.getAuditLogs({
        page,
        limit: 15,
        entity: entityFilter,
        action: actionFilter
      });
      setLogs(res.logs);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit records.');
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('INSERT')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('STATUS')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('REVOKE')) {
      return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200';
    }
    if (act.includes('LOGIN') || act.includes('AUTH') || act.includes('PASSWORD')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-200 dark:border-charcoal-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-forest-700 dark:text-forest-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Security & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-100 font-display mt-1">
            System Audit & Mutation Trail
          </h1>
          <p className="text-sm text-charcoal-600 dark:text-warm-300/80 mt-1">
            Immutable log of administrative operations, data modifications, and security events across the MSC platform.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-white dark:bg-charcoal-900 border border-warm-300 dark:border-charcoal-700 rounded-xl hover:bg-warm-50 dark:hover:bg-charcoal-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-4 sm:p-5 border border-warm-200 dark:border-charcoal-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-charcoal-500" />
            <span className="text-xs font-bold text-charcoal-700 dark:text-warm-300 uppercase">Filter:</span>
          </div>

          <select
            value={entityFilter}
            onChange={e => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">All Entities</option>
            <option value="User">Users</option>
            <option value="Program">Programs</option>
            <option value="NewsArticle">News Articles</option>
            <option value="Event">Events</option>
            <option value="Media">Media & Gallery</option>
            <option value="VolunteerApplication">Volunteer Applications</option>
            <option value="PartnershipApplication">Partnership Applications</option>
            <option value="DonationConfiguration">Donation Configuration</option>
            <option value="Organization">Organization Profile</option>
            <option value="Security">Security Events</option>
          </select>

          <select
            value={actionFilter}
            onChange={e => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS CHANGE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="PASSWORD_RESET">PASSWORD RESET</option>
          </select>
        </div>

        <div className="text-xs text-charcoal-500 dark:text-warm-300/60 font-medium">
          Showing <span className="font-bold text-charcoal-900 dark:text-warm-100">{logs.length}</span> of{' '}
          <span className="font-bold text-charcoal-900 dark:text-warm-100">{totalCount}</span> recorded events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mb-3" />
            <p className="text-sm font-medium text-charcoal-600 dark:text-warm-300">Loading audit records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 dark:text-red-400">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={fetchLogs}
              className="mt-3 px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-warm-100 dark:bg-charcoal-800 text-charcoal-500 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-100">No Audit Events Found</h3>
            <p className="text-xs text-charcoal-500 dark:text-warm-300/70 max-w-sm mx-auto">
              No audit logs match the selected filter criteria. Administrative operations will be recorded here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-warm-50 dark:bg-charcoal-800/80 text-charcoal-700 dark:text-warm-300 border-b border-warm-200 dark:border-charcoal-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Actor</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Action</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Entity & ID</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider">IP Address</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800">
                {logs.map(log => {
                  const dateStr = new Date(log.createdAt).toLocaleString('en-KE', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-warm-50/70 dark:hover:bg-charcoal-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-600 dark:text-warm-300">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.user ? (
                          <div>
                            <div className="font-semibold text-charcoal-900 dark:text-warm-100">
                              {log.user.name}
                            </div>
                            <div className="text-xs text-charcoal-500 dark:text-warm-300/60">
                              {log.user.email} &bull; <span className="font-mono">{log.user.role}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-charcoal-400 italic font-mono text-xs">System / Unauthenticated</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-charcoal-800 dark:text-warm-200">
                          {log.entity}
                        </div>
                        {log.entityId && (
                          <div className="font-mono text-[11px] text-charcoal-500 dark:text-warm-300/60 truncate max-w-[140px]">
                            {log.entityId}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-charcoal-600 dark:text-warm-300">
                        {log.ipAddress || '—'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-forest-800 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/60 hover:bg-forest-100 dark:hover:bg-forest-900/60 rounded-lg border border-forest-200 dark:border-forest-800 transition shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-warm-200 dark:border-charcoal-800 flex items-center justify-between text-xs font-medium">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-charcoal-600 dark:text-warm-300">
              Page <span className="font-bold text-charcoal-900 dark:text-warm-100">{page}</span> of{' '}
              <span className="font-bold text-charcoal-900 dark:text-warm-100">{totalPages}</span>
            </span>

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-200 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-warm-200 dark:border-charcoal-800 flex items-center justify-between bg-warm-50/50 dark:bg-charcoal-800/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-forest-700" />
                <h3 className="font-bold text-base text-charcoal-900 dark:text-warm-100">
                  Audit Event Details &bull; {selectedLog.action} ({selectedLog.entity})
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-warm-100 dark:hover:bg-charcoal-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800/60 border border-warm-200 dark:border-charcoal-800 font-mono text-xs">
                <div>
                  <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Event ID</span>
                  <span className="text-charcoal-900 dark:text-warm-100 truncate block">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Actor Email</span>
                  <span className="text-charcoal-900 dark:text-warm-100 truncate block">
                    {selectedLog.user?.email || 'System'}
                  </span>
                </div>
                <div>
                  <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Client IP</span>
                  <span className="text-charcoal-900 dark:text-warm-100 block">{selectedLog.ipAddress || '—'}</span>
                </div>
                <div>
                  <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="text-charcoal-900 dark:text-warm-100 block">
                    {new Date(selectedLog.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Data Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-600 dark:text-warm-300 mb-2">
                    Prior State (oldData)
                  </h4>
                  <pre className="p-4 rounded-xl bg-warm-100/70 dark:bg-charcoal-950 font-mono text-[11px] leading-relaxed border border-warm-200 dark:border-charcoal-800 max-h-60 overflow-y-auto text-charcoal-800 dark:text-warm-200">
                    {selectedLog.oldData
                      ? JSON.stringify(selectedLog.oldData, null, 2)
                      : '// No prior state (CREATE or unrecorded)'}
                  </pre>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-charcoal-600 dark:text-warm-300 mb-2">
                    Modified State (newData)
                  </h4>
                  <pre className="p-4 rounded-xl bg-warm-100/70 dark:bg-charcoal-950 font-mono text-[11px] leading-relaxed border border-warm-200 dark:border-charcoal-800 max-h-60 overflow-y-auto text-charcoal-800 dark:text-warm-200">
                    {selectedLog.newData
                      ? JSON.stringify(selectedLog.newData, null, 2)
                      : '// No new state (DELETE or unrecorded)'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-warm-200 dark:border-charcoal-800 flex justify-end bg-warm-50/50 dark:bg-charcoal-800/50">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-700 dark:text-warm-200 bg-white dark:bg-charcoal-800 border border-warm-300 dark:border-charcoal-700 rounded-xl hover:bg-warm-100 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsManagementPage;
