import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  Clock,
  HardDrive,
  CheckCircle2,
  XCircle,
  Play,
  FileCheck2,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Copy,
  Check,
  Image,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { backupService } from '../../services/backupService';
import {
  BackupMetadata,
  BackupConfig,
  BackupOverviewSummary,
  MediaAssetManifestItem,
  MediaHealthResponse
} from '../../types/backup';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Card } from '../../components/ui/Card';

export const BackupManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'backups' | 'retention' | 'media' | 'runbook'>('backups');
  const [loading, setLoading] = useState<boolean>(true);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [summary, setSummary] = useState<BackupOverviewSummary | null>(null);
  const [config, setConfig] = useState<BackupConfig | null>(null);

  // Filters & Action States
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Creating Backup State
  const [creatingBackup, setCreatingBackup] = useState<boolean>(false);
  const [backupNotes, setBackupNotes] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Test Restore Verification State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    id: string;
    details: string;
    status: 'HEALTHY' | 'FAILED';
  } | null>(null);

  // Media Tab State
  const [mediaAssets, setMediaAssets] = useState<MediaAssetManifestItem[]>([]);
  const [mediaSummary, setMediaSummary] = useState<{
    totalAssets: number;
    cloudinaryCount: number;
    externalCount: number;
    localCount: number;
  } | null>(null);
  const [mediaHealth, setMediaHealth] = useState<MediaHealthResponse | null>(null);
  const [checkingMedia, setCheckingMedia] = useState<boolean>(false);

  // Notification alerts
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // Retention Config Form State
  const [configForm, setConfigForm] = useState<BackupConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setErrorAlert(null);
      const data = await backupService.getOverview();
      setBackups(data.backups || []);
      setSummary(data.summary);
      setConfig(data.config);
      setConfigForm(data.config);
    } catch (err: any) {
      setErrorAlert(err.message || 'Failed to load backup overview.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaManifest = async () => {
    try {
      const res = await backupService.getMediaManifest();
      setMediaAssets(res.assets || []);
      setMediaSummary(res.summary);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'media' && !mediaSummary) {
      fetchMediaManifest();
    }
  }, [activeTab]);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setErrorAlert(null);
    setSuccessAlert(null);
    try {
      const res = await backupService.createBackup(backupNotes);
      setSuccessAlert(`Legacy local snapshot ${res.backup.filename} created; no isolated restore was performed.`);
      setShowCreateModal(false);
      setBackupNotes('');
      await fetchOverview();
    } catch (err: any) {
      setErrorAlert(err.message || 'Failed to generate backup.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleTestRestore = async (backupId: string) => {
    setVerifyingId(backupId);
    setErrorAlert(null);
    setVerificationResult(null);
    try {
      const res = await backupService.testRestore(backupId);
      setVerificationResult({
        id: backupId,
        details: res.result.details,
        status: res.result.status
      });
      if (res.result.status === 'HEALTHY') {
        setSuccessAlert(`Archive integrity checks passed; no restore was performed. ${res.message}`);
      } else {
        setErrorAlert(`Archive integrity check failed: ${res.result.details}`);
      }
      await fetchOverview();
    } catch (err: any) {
      setErrorAlert(err.message || 'Error checking local archive integrity.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm) return;
    setSavingConfig(true);
    setErrorAlert(null);
    try {
      const res = await backupService.updateConfig(configForm);
      setConfig(res.config);
      setConfigForm(res.config);
      setSuccessAlert('Backup schedule and retention policies successfully updated.');
    } catch (err: any) {
      setErrorAlert(err.message || 'Failed to update configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCheckMediaHealth = async () => {
    setCheckingMedia(true);
    try {
      const res = await backupService.checkMediaHealth();
      setMediaHealth(res);
      setSuccessAlert(`Checked ${res.checkedCount} external media assets. Health rate: ${res.healthPercentage}%.`);
    } catch (err: any) {
      setErrorAlert(err.message || 'Media health check encountered an error.');
    } finally {
      setCheckingMedia(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const filteredBackups = backups.filter((b) => {
    const matchType = filterType === 'ALL' || b.type === filterType;
    const matchSearch =
      !searchQuery.trim() ||
      b.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sha256.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-warm-200 dark:border-charcoal-700 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
              <Database className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-forest-800 dark:text-emerald-400">
              Fiduciary Data Protection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white font-display">
            Automated Backups & Disaster Recovery
          </h1>
          <p className="text-sm text-charcoal-600 dark:text-warm-300 mt-1">
            Local archive records and media references. Integrity checks do not restore a database.
          </p>
        </div>

        <Alert
          type="error"
          title="Recovery status: not verified"
          message="This legacy dashboard does not represent independent Backblaze backups. Raw downloads, deletion, and database restoration are disabled. A checksum or archive integrity check is not an isolated restore."
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            disabled={loading}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={<Database className="w-4 h-4" />}
            className="font-bold shadow"
          >
            Legacy Local Snapshot (non-production only)
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successAlert && (
        <Alert
          type="success"
          title="Operation Succeeded"
          message={successAlert}
          onClose={() => setSuccessAlert(null)}
        />
      )}
      {errorAlert && (
        <Alert
          type="error"
          title="Operation Failed"
          message={errorAlert}
          onClose={() => setErrorAlert(null)}
        />
      )}

      {/* Top Level Metric Status Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-500 dark:text-warm-300 uppercase">
                Legacy Local Snapshot Records
              </p>
              <h3 className="text-xl font-extrabold text-charcoal-900 dark:text-white">
                {summary.totalBackups} Backups
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-warm-400">
                {summary.totalSizeFormatted} compressed
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-500 dark:text-warm-300 uppercase">
                Archive Integrity Checks
              </p>
              <h3 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {summary.healthyCount} Passed (not restore-tested)
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-warm-400">
                {summary.failedCount > 0 ? `${summary.failedCount} failed verification` : 'Zero errors detected'}
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-500 dark:text-warm-300 uppercase">
                Latest Snapshot
              </p>
              <h3 className="text-base font-extrabold text-charcoal-900 dark:text-white truncate">
                {summary.latestBackupTimestamp
                  ? new Date(summary.latestBackupTimestamp).toLocaleString('en-KE', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })
                  : 'No backups yet'}
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-warm-400">
                Latest local archive timestamp
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-500 dark:text-warm-300 uppercase">
                Local Scheduler
              </p>
              <h3 className="text-base font-extrabold text-charcoal-900 dark:text-white">
                {config?.autoBackupEnabled ? `Enabled (Every ${config.frequencyHours}h)` : 'Not active'}
              </h3>
              <p className="text-xs text-charcoal-600 dark:text-warm-400">
                Retention: {config?.retentionDays} days
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-warm-200 dark:border-charcoal-700 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('backups')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'backups'
              ? 'border-forest-700 text-forest-900 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Snapshots ({backups.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('retention')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'retention'
              ? 'border-forest-700 text-forest-900 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Retention Policy & Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'media'
              ? 'border-forest-700 text-forest-900 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Media & External Assets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('runbook')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'runbook'
              ? 'border-forest-700 text-forest-900 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-charcoal-600 dark:text-warm-300 hover:text-charcoal-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Disaster Recovery Runbook</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: BACKUPS TABLE & TEST RESTORATION
          ========================================================================= */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-charcoal-600 dark:text-warm-300">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs font-bold text-charcoal-800 dark:text-white"
              >
                <option value="ALL">All Types</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="MANUAL">Manual</option>
                <option value="PRE_RESTORE_SAFEGUARD">Pre-Restore Safeguard</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search by filename or hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>
          </div>

          {/* Test Verification Banner */}
          {verificationResult && (
            <div
              className={`p-5 rounded-2xl border text-left space-y-2 ${
                verificationResult.status === 'HEALTHY'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm">
                  {verificationResult.status === 'HEALTHY' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span>
                    Archive Integrity Report for Snapshot [{verificationResult.id}]
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVerificationResult(null)}
                  className="text-xs font-bold underline"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs font-mono bg-white/70 dark:bg-charcoal-900/70 p-3 rounded-xl border border-black/10 leading-relaxed break-words">
                {verificationResult.details}
              </p>
            </div>
          )}

          {/* Backups Table */}
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-700 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-warm-100/70 dark:bg-charcoal-800/70 border-b border-warm-200 dark:border-charcoal-700 uppercase font-black text-charcoal-600 dark:text-warm-300 tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Snapshot Details</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4">Size & Records</th>
                    <th className="py-4 px-4">SHA-256 Checksum</th>
                    <th className="py-4 px-4">Integrity / Verification</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800 text-charcoal-800 dark:text-warm-200">
                  {filteredBackups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-charcoal-500 dark:text-warm-400">
                        No backup snapshots found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBackups.map((bk) => (
                      <tr key={bk.id} className="hover:bg-warm-50/50 dark:hover:bg-charcoal-800/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-mono font-bold text-charcoal-900 dark:text-white flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400 flex-shrink-0" />
                            <span>{bk.filename}</span>
                          </div>
                          <div className="text-[11px] text-charcoal-500 dark:text-warm-400 mt-1">
                            {new Date(bk.timestamp).toLocaleString('en-KE', {
                              dateStyle: 'medium',
                              timeStyle: 'medium'
                            })}
                            {bk.notes && <span className="italic ml-2">({bk.notes})</span>}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              bk.type === 'SCHEDULED'
                                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300'
                                : bk.type === 'PRE_RESTORE_SAFEGUARD'
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {bk.type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono">
                          <div className="font-bold">{bk.sizeFormatted}</div>
                          <div className="text-[11px] text-charcoal-500 dark:text-warm-400">
                            {bk.tableCount} tables • ~{bk.recordCount} rows
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => copyHash(bk.sha256)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 dark:hover:bg-charcoal-700 transition-colors"
                            title="Click to copy full SHA-256 hash"
                          >
                            <span>{bk.sha256.slice(0, 10)}...</span>
                            {copiedHash === bk.sha256 ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-charcoal-400" />
                            )}
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          {bk.verificationStatus === 'HEALTHY' && (
                            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Integrity Checked (not restore-tested)</span>
                            </div>
                          )}
                          {bk.verificationStatus === 'FAILED' && (
                            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                              <XCircle className="w-4 h-4" />
                              <span>Failed Check</span>
                            </div>
                          )}
                          {bk.verificationStatus === 'UNVERIFIED' && (
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                              <Clock className="w-4 h-4" />
                              <span>Unverified</span>
                            </div>
                          )}
                          {bk.lastVerifiedAt && (
                            <div className="text-[10px] text-charcoal-500 dark:text-warm-400 mt-0.5">
                              {new Date(bk.lastVerifiedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={verifyingId === bk.id}
                              onClick={() => handleTestRestore(bk.id)}
                              title="Check local archive integrity only; no database restore is performed"
                              className="text-xs p-1.5 h-auto text-forest-800 dark:text-emerald-400 hover:bg-forest-50"
                            >
                              <FileCheck2 className={`w-4 h-4 ${verifyingId === bk.id ? 'animate-spin' : ''}`} />
                            </Button>

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: RETENTION POLICY & SCHEDULE CONFIG
          ========================================================================= */}
      {activeTab === 'retention' && configForm && (
        <Card className="p-6 sm:p-8 max-w-3xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold font-display text-charcoal-900 dark:text-white">
              Legacy Local Retention & Schedule Settings
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 mt-1">
              This legacy local policy is not the independent object-storage schedule or retention policy.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-charcoal-900 dark:text-white">
                  Automated Background Backups
                </p>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Production scheduling is disabled; this only affects non-production environments.
                </p>
              </div>
              <input
                type="checkbox"
                checked={configForm.autoBackupEnabled}
                onChange={(e) => setConfigForm({ ...configForm, autoBackupEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-forest-700 focus:ring-forest-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 dark:text-warm-200 mb-1.5">
                  Backup Frequency (Hours)
                </label>
                <select
                  value={configForm.frequencyHours}
                  onChange={(e) => setConfigForm({ ...configForm, frequencyHours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-sm font-semibold"
                >
                  <option value={12}>Every 12 Hours (High Volume)</option>
                  <option value={24}>Every 24 Hours / Daily (Recommended)</option>
                  <option value={168}>Every 7 Days / Weekly</option>
                </select>
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Legacy non-production scheduler interval only.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 dark:text-warm-200 mb-1.5">
                  Retention Window (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={configForm.retentionDays}
                  onChange={(e) => setConfigForm({ ...configForm, retentionDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-sm font-semibold"
                />
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Legacy local archive retention setting; production cleanup is disabled.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 dark:text-warm-200 mb-1.5">
                  Max Snapshots to Keep
                </label>
                <input
                  type="number"
                  min={3}
                  max={100}
                  value={configForm.maxBackups}
                  onChange={(e) => setConfigForm({ ...configForm, maxBackups: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-sm font-semibold"
                />
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Legacy local archive limit; it does not control object-storage retention.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 dark:text-warm-200 mb-1.5">
                  Minimum Safeguard Backups
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={configForm.minBackupsToKeep}
                  onChange={(e) => setConfigForm({ ...configForm, minBackupsToKeep: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-sm font-semibold"
                />
                <p className="text-[11px] text-charcoal-500 mt-1">
                  Legacy local setting only; production deletion is disabled.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-charcoal-900 dark:text-white">
                  Automated Dry-Run Verification
                </p>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Checks local archive structure only; this does not perform a database restore.
                </p>
              </div>
              <input
                type="checkbox"
                checked={configForm.autoVerifyBackups}
                onChange={(e) => setConfigForm({ ...configForm, autoVerifyBackups: e.target.checked })}
                className="w-5 h-5 rounded text-forest-700 focus:ring-forest-600 cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={savingConfig}
                className="font-bold shadow"
              >
                {savingConfig ? 'Saving Policy...' : 'Save Retention Configuration'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 3: MEDIA & EXTERNALLY HOSTED ASSETS
          ========================================================================= */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-display text-charcoal-900 dark:text-white">
                Externally Hosted Media Resilience
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 mt-0.5">
                Reference inventory and reachability checks only. This tab does not back up or restore asset bytes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckMediaHealth}
                disabled={checkingMedia}
                icon={<RefreshCw className={`w-3.5 h-3.5 ${checkingMedia ? 'animate-spin' : ''}`} />}
              >
                {checkingMedia ? 'Testing Reachability...' : 'Run Reachability Health Check'}
              </Button>
              <a
                href={backupService.getMediaExportUrl()}
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export Media Manifest (JSON)
              </a>
            </div>
          </div>

          {/* Media Health Check Results */}
          {mediaHealth && (
            <div className="p-5 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-charcoal-500 uppercase">Sample Reachability Health Score</p>
                <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {mediaHealth.healthPercentage}% Reachable
                </h4>
                <p className="text-xs text-charcoal-600 dark:text-warm-300">
                  {mediaHealth.reachableCount} / {mediaHealth.checkedCount} external endpoints responding with HTTP 200/304 OK.
                </p>
              </div>
            </div>
          )}

          {/* Media Assets Catalog Table */}
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-700 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="bg-warm-100/70 dark:bg-charcoal-800/70 border-b border-warm-200 dark:border-charcoal-700 uppercase font-black text-charcoal-600 dark:text-warm-300 tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Preview</th>
                    <th className="py-3 px-4">Asset Title & Context</th>
                    <th className="py-3 px-4">Entity Source</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Remote URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800 text-charcoal-800 dark:text-warm-200">
                  {mediaAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-warm-50/50 dark:hover:bg-charcoal-800/40">
                      <td className="py-3 px-5">
                        <img
                          src={asset.url}
                          alt={asset.title || 'asset'}
                          className="w-12 h-10 object-cover rounded-lg border border-warm-200 dark:border-charcoal-700 bg-warm-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/mwancha-community-grounds.jpg';
                          }}
                        />
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {asset.title || 'Untitled Asset'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-warm-100 dark:bg-charcoal-800 text-[11px] font-semibold">
                          {asset.entityType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] uppercase font-bold text-forest-800 dark:text-emerald-400">
                          {asset.provider}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px]">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span className="truncate">{asset.url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DISASTER RECOVERY RUNBOOK
          ========================================================================= */}
      {activeTab === 'runbook' && (
        <Card className="p-6 sm:p-8 space-y-6 max-w-4xl">
          <div className="border-b border-warm-200 dark:border-charcoal-700 pb-4">
            <span className="text-xs font-black uppercase tracking-wider text-earth-700 dark:text-amber-400">
              Standard Operating Procedure
            </span>
            <h3 className="text-2xl font-extrabold font-display text-charcoal-900 dark:text-white mt-1">
              MSC Disaster Recovery Runbook & Cold-Start Procedures
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 mt-1">
              This draft is not a tested recovery procedure. No isolated restore has succeeded.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-800 dark:text-warm-200 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100">
              <p className="font-bold">Do not use this page to restore production.</p>
              <p className="mt-2">
                The current local archive checks do not restore SQL into an isolated database. The destructive restore endpoint, raw dump download, and deletion actions have been disabled. The new private B2 backup runner is not connected to this dashboard.
              </p>
            </div>
            <p>
              The repository operations runbook and configuration guide are drafts for non-production use. A production recovery process requires an approved isolated target and a successful restore test before it can be offered here.
            </p>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODAL: CREATE BACKUP NOW
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-warm-200 dark:border-charcoal-700 shadow-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-charcoal-900 dark:text-white">
                  Create Manual Database Snapshot
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Creates a legacy local snapshot in non-production only.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 dark:text-warm-200 mb-1.5">
                Snapshot Memo / Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Pre-deployment baseline or quarterly audit snapshot"
                value={backupNotes}
                onChange={(e) => setBackupNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingBackup}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="font-bold"
              >
                {creatingBackup ? 'Dumping & Securing...' : 'Generate Backup'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
