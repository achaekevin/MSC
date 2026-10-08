import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  HardDrive,
  CheckCircle2,
  XCircle,
  Play,
  FileCheck2,
  Trash2,
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

  // Restore Modal State
  const [restoreModalBackup, setRestoreModalBackup] = useState<BackupMetadata | null>(null);
  const [restoreConfirmationText, setRestoreConfirmationText] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

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
      setSuccessAlert(`Database snapshot ${res.backup.filename} created and verified.`);
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
        setSuccessAlert(`Test restoration verified: ${res.message}`);
      } else {
        setErrorAlert(`Test restoration failed: ${res.result.details}`);
      }
      await fetchOverview();
    } catch (err: any) {
      setErrorAlert(err.message || 'Error executing test restoration.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRestoreExecute = async () => {
    if (!restoreModalBackup) return;
    setIsRestoring(true);
    setErrorAlert(null);
    try {
      const res = await backupService.restoreDatabase(
        restoreModalBackup.id,
        restoreConfirmationText
      );
      setSuccessAlert(res.message);
      setRestoreModalBackup(null);
      setRestoreConfirmationText('');
      await fetchOverview();
    } catch (err: any) {
      setErrorAlert(err.message || 'Database restore failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string, filename: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete backup snapshot "${filename}"?`)) {
      return;
    }
    try {
      await backupService.deleteBackup(backupId);
      setSuccessAlert(`Backup snapshot ${filename} deleted.`);
      await fetchOverview();
    } catch (err: any) {
      setErrorAlert(err.message || 'Failed to delete backup.');
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
            Automated MySQL dumps, retention pruning, dry-run test restorations, and external media resilience.
          </p>
        </div>

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
            Create Backup Now
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
                Secured Snapshots
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
                Restoration Health
              </p>
              <h3 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {summary.healthyCount} Verified Healthy
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
                Point-in-time state
              </p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-charcoal-500 dark:text-warm-300 uppercase">
                Automated Daemon
              </p>
              <h3 className="text-base font-extrabold text-charcoal-900 dark:text-white">
                {config?.autoBackupEnabled ? `Active (Every ${config.frequencyHours}h)` : 'Paused'}
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
                    Test Restoration Report for Snapshot [{verificationResult.id}]
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
                              <span>Verified Healthy</span>
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
                              title="Test restoration dry-run (verifies checksum, decompression, syntax & constraints)"
                              className="text-xs p-1.5 h-auto text-forest-800 dark:text-emerald-400 hover:bg-forest-50"
                            >
                              <FileCheck2 className={`w-4 h-4 ${verifyingId === bk.id ? 'animate-spin' : ''}`} />
                            </Button>

                            <a
                              href={backupService.getDownloadUrl(bk.id)}
                              download={bk.filename}
                              className="p-1.5 rounded-lg hover:bg-warm-100 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-warm-300"
                              title="Download backup archive (.sql.gz)"
                            >
                              <Download className="w-4 h-4" />
                            </a>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setRestoreModalBackup(bk)}
                              title="Restore database from this snapshot"
                              className="text-xs p-1.5 h-auto text-amber-700 dark:text-amber-400 hover:bg-amber-50"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBackup(bk.id, bk.filename)}
                              title="Delete snapshot"
                              className="text-xs p-1.5 h-auto text-rose-700 dark:text-rose-400 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
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
              Automated Retention & Scheduling Policy
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-warm-300 mt-1">
              Configure background cron backups, automatic snapshot pruning, and post-backup verification routines to ensure continuous zero-loss compliance.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-charcoal-900 dark:text-white">
                  Automated Background Backups
                </p>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Runs background scheduler in backend server daemon.
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
                  Interval between automatic background snapshot generation.
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
                  Snapshots older than this limit are automatically pruned.
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
                  Caps disk storage space on hosting server.
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
                  Guaranteed number of latest snapshots never deleted.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-warm-50 dark:bg-charcoal-800 border border-warm-200 dark:border-charcoal-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-charcoal-900 dark:text-white">
                  Automated Dry-Run Verification
                </p>
                <p className="text-xs text-charcoal-500 dark:text-warm-400">
                  Immediately tests restoration integrity following each backup creation.
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
                Catalog of media assets hosted on Cloudinary, CDNs, and external providers with cold-storage JSON manifest export.
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
              Follow these verified instructions to recover the MSC platform in the event of hardware failure, catastrophic database corruption, or server migration.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-charcoal-800 dark:text-warm-200 leading-relaxed">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 space-y-2">
              <h4 className="font-black text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pre-Restore Golden Rule</span>
              </h4>
              <p>
                The automated system creates an emergency <code>PRE_RESTORE_SAFEGUARD</code> snapshot automatically before any point-in-time restore executes. Never attempt manual table drops without verifying you have an uncorrupted <code>.sql.gz</code> snapshot.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-base text-charcoal-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs">1</span>
                <span>In-App Point-in-Time Database Recovery (Zero CLI Required)</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 pl-2 text-charcoal-700 dark:text-warm-300">
                <li>Navigate to the <strong>Snapshots</strong> tab above.</li>
                <li>Locate the target verified backup snapshot.</li>
                <li>Click the <strong>Test Restoration</strong> icon (<FileCheck2 className="w-3.5 h-3.5 inline text-forest-700" />) to execute a dry-run integrity verification.</li>
                <li>Click the <strong>Restore Database</strong> icon (<RotateCcw className="w-3.5 h-3.5 inline text-amber-700" />).</li>
                <li>Type <code>CONFIRM RESTORE</code> into the confirmation dialog and confirm.</li>
                <li>The system will take a safety snapshot of current data, apply the archive transactions, and record an audit log entry.</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-base text-charcoal-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs">2</span>
                <span>Cold-Start Bare-Metal Recovery (CLI Procedure)</span>
              </h4>
              <p>
                If the server or web container is completely unresponsive, restore directly from the host operating system:
              </p>
              <div className="bg-charcoal-950 text-emerald-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
                <p className="text-gray-400"># 1. Unpack compressed snapshot</p>
                <p>gunzip -c storage/backups/backup-msc-YYYY-MM-DD.sql.gz &gt; restore.sql</p>
                <p className="text-gray-400"># 2. Rehydrate into MySQL instance</p>
                <p>mysql -u root -p mwancha_community &lt; restore.sql</p>
                <p className="text-gray-400"># 3. Clean up temporary uncompressed dump</p>
                <p>rm restore.sql</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-base text-charcoal-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs">3</span>
                <span>Externally Hosted Media Recovery</span>
              </h4>
              <p>
                All image metadata, Cloudinary identifiers, and entity attachments are preserved in the database backup. To maintain cold-storage redundancy of remote media, periodically download the <strong>Media Manifest (JSON)</strong>. In the event of Cloudinary account migration, a hydration script can read this manifest and re-sync all assets to a new bucket.
              </p>
            </div>
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
                  Captures all active database tables and generates compressed archive.
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

      {/* =========================================================================
          MODAL: RESTORE CONFIRMATION DIALOG
          ========================================================================= */}
      {restoreModalBackup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border-2 border-amber-400 shadow-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-charcoal-900 dark:text-white">
                  Confirm Database Point-in-Time Restore
                </h3>
                <p className="text-xs text-charcoal-600 dark:text-warm-300">
                  Target Snapshot: <span className="font-mono font-bold">{restoreModalBackup.filename}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
              <p className="font-bold">⚠️ Warning: High impact operation.</p>
              <p>
                Restoring will replace the current active database with data from this snapshot ({new Date(restoreModalBackup.timestamp).toLocaleString()}). An automatic safeguard snapshot will be taken immediately prior to execution.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 dark:text-warm-200 mb-1.5">
                Type <span className="font-mono text-rose-700 dark:text-rose-400 font-black">CONFIRM RESTORE</span> to proceed:
              </label>
              <input
                type="text"
                placeholder="CONFIRM RESTORE"
                value={restoreConfirmationText}
                onChange={(e) => setRestoreConfirmationText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 font-mono text-sm font-bold text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setRestoreModalBackup(null);
                  setRestoreConfirmationText('');
                }}
                disabled={isRestoring}
              >
                Abort
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRestoreExecute}
                disabled={isRestoring || restoreConfirmationText !== 'CONFIRM RESTORE'}
                className="font-black bg-amber-600 hover:bg-amber-500 text-white shadow"
              >
                {isRestoring ? 'Executing Restoration...' : 'Execute Restore'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
