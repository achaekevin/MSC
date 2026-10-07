export interface BackupMetadata {
  id: string;
  filename: string;
  filepath: string;
  timestamp: string;
  sizeBytes: number;
  sizeFormatted: string;
  sha256: string;
  type: 'SCHEDULED' | 'MANUAL' | 'PRE_RESTORE_SAFEGUARD';
  triggeredBy: string;
  tableCount: number;
  recordCount: number;
  dumper: 'mysqldump' | 'prisma-data-dumper';
  verificationStatus: 'HEALTHY' | 'UNVERIFIED' | 'FAILED';
  lastVerifiedAt?: string;
  verificationDetails?: string;
  notes?: string;
}

export interface BackupConfig {
  autoBackupEnabled: boolean;
  frequencyHours: number;
  retentionDays: number;
  maxBackups: number;
  minBackupsToKeep: number;
  autoVerifyBackups: boolean;
  lastScheduledRun?: string;
  nextScheduledRun?: string;
}

export interface BackupOverviewSummary {
  totalBackups: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  healthyCount: number;
  failedCount: number;
  unverifiedCount: number;
  latestBackupTimestamp: string | null;
  nextScheduledRun: string | null;
}

export interface BackupOverviewResponse {
  summary: BackupOverviewSummary;
  config: BackupConfig;
  backups: BackupMetadata[];
}

export interface MediaAssetManifestItem {
  id: string;
  url: string;
  title?: string;
  entityType: string;
  entityId?: string;
  provider: 'CLOUDINARY' | 'LOCAL' | 'EXTERNAL';
  createdAt?: string;
  status?: 'REACHABLE' | 'UNREACHABLE' | 'UNCHECKED';
  httpStatus?: number;
}

export interface MediaManifestResponse {
  summary: {
    totalAssets: number;
    cloudinaryCount: number;
    externalCount: number;
    localCount: number;
  };
  assets: MediaAssetManifestItem[];
}

export interface MediaHealthResponse {
  checkedCount: number;
  reachableCount: number;
  unreachableCount: number;
  healthPercentage: number;
  results: MediaAssetManifestItem[];
}
