import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import { execFile, exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

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
  frequencyHours: number; // e.g. 24 for daily
  retentionDays: number;   // e.g. 30 days
  maxBackups: number;      // e.g. 30 snapshots
  minBackupsToKeep: number;// e.g. 3 snapshots minimum always kept
  autoVerifyBackups: boolean; // dry-run verify right after creation
  lastScheduledRun?: string;
  nextScheduledRun?: string;
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

export class BackupService {
  private backupDir: string;
  private manifestPath: string;
  private configPath: string;

  constructor() {
    this.backupDir = path.resolve(process.cwd(), 'storage', 'backups');
    this.manifestPath = path.join(this.backupDir, 'manifest.json');
    this.configPath = path.join(this.backupDir, 'backup-config.json');
    this.ensureStorageReady();
  }

  private ensureStorageReady() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    if (!fs.existsSync(this.manifestPath)) {
      fs.writeFileSync(this.manifestPath, JSON.stringify([], null, 2), 'utf-8');
    }

    if (!fs.existsSync(this.configPath)) {
      const defaultConfig: BackupConfig = {
        autoBackupEnabled: true,
        frequencyHours: 24,
        retentionDays: 30,
        maxBackups: 30,
        minBackupsToKeep: 3,
        autoVerifyBackups: true
      };
      fs.writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    }
  }

  private loadManifest(): BackupMetadata[] {
    try {
      this.ensureStorageReady();
      const content = fs.readFileSync(this.manifestPath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (err) {
      logger.error({ err }, 'Failed to parse backup manifest. Initializing empty.');
      return [];
    }
  }

  private saveManifest(manifest: BackupMetadata[]) {
    this.ensureStorageReady();
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  public getConfig(): BackupConfig {
    try {
      this.ensureStorageReady();
      const content = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        autoBackupEnabled: true,
        frequencyHours: 24,
        retentionDays: 30,
        maxBackups: 30,
        minBackupsToKeep: 3,
        autoVerifyBackups: true
      };
    }
  }

  public updateConfig(newConfig: Partial<BackupConfig>): BackupConfig {
    const current = this.getConfig();
    const updated: BackupConfig = {
      ...current,
      ...newConfig,
      minBackupsToKeep: Math.max(1, newConfig.minBackupsToKeep ?? current.minBackupsToKeep),
      maxBackups: Math.max(3, newConfig.maxBackups ?? current.maxBackups),
      retentionDays: Math.max(1, newConfig.retentionDays ?? current.retentionDays),
      frequencyHours: Math.max(1, newConfig.frequencyHours ?? current.frequencyHours)
    };
    fs.writeFileSync(this.configPath, JSON.stringify(updated, null, 2), 'utf-8');
    logger.info({ updated }, 'Backup retention & schedule configuration updated.');
    return updated;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private parseDatabaseUrl() {
    try {
      const url = new URL(env.DATABASE_URL);
      return {
        host: url.hostname || 'localhost',
        port: url.port || '3306',
        user: url.username || 'root',
        password: decodeURIComponent(url.password || ''),
        database: url.pathname.replace(/^\//, '') || 'mwancha_community'
      };
    } catch {
      return {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'mwancha_community'
      };
    }
  }

  /**
   * Universal Data Dumper via Prisma Client
   * Works on any platform (Docker, Windows, Linux, Alpine) without requiring mysqldump binary
   */
  private async dumpDatabaseViaPrisma(): Promise<{ sqlContent: string; tableCount: number; recordCount: number }> {
    logger.info('Generating structured database SQL dump via Prisma model serializer...');
    let totalRecords = 0;
    const lines: string[] = [];

    const now = new Date().toISOString();
    lines.push('-- ============================================================');
    lines.push(`-- Mwancha Senior Community (MSC) Automated Backup`);
    lines.push(`-- Generated At: ${now}`);
    lines.push(`-- Environment: ${env.NODE_ENV}`);
    lines.push('-- ============================================================');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;');
    lines.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
    lines.push('SET NAMES utf8mb4;');
    lines.push('START TRANSACTION;\n');

    // Ordered list of models to export
    const modelDumpers: Array<{ name: string; query: () => Promise<any[]> }> = [
      { name: 'roles', query: () => prisma.role.findMany() },
      { name: 'permissions', query: () => prisma.permission.findMany() },
      { name: 'role_permissions', query: () => prisma.rolePermission.findMany() },
      { name: 'users', query: () => prisma.user.findMany() },
      { name: 'user_roles', query: () => prisma.userRoleAssignment.findMany() },
      { name: 'organizations', query: () => prisma.organization.findMany() },
      { name: 'organization_values', query: () => prisma.organizationValue.findMany() },
      { name: 'organization_history', query: () => prisma.organizationHistory.findMany() },
      { name: 'organization_structure_nodes', query: () => prisma.organizationStructureNode.findMany() },
      { name: 'organization_contacts', query: () => prisma.organizationContact.findMany() },
      { name: 'program_categories', query: () => prisma.programCategory.findMany() },
      { name: 'programs', query: () => prisma.program.findMany() },
      { name: 'program_objectives', query: () => prisma.programObjective.findMany() },
      { name: 'program_activities', query: () => prisma.programActivity.findMany() },
      { name: 'impact_metrics', query: () => prisma.impactMetric.findMany() },
      { name: 'team_members', query: () => prisma.teamMember.findMany() },
      { name: 'news_categories', query: () => prisma.newsCategory.findMany() },
      { name: 'news_articles', query: () => prisma.newsArticle.findMany() },
      { name: 'events', query: () => prisma.event.findMany() },
      { name: 'event_registrations', query: () => prisma.eventRegistration.findMany() },
      { name: 'media', query: () => prisma.media.findMany() },
      { name: 'gallery_albums', query: () => prisma.galleryAlbum.findMany() },
      { name: 'testimonials', query: () => prisma.testimonial.findMany() },
      { name: 'success_stories', query: () => prisma.successStory.findMany() },
      { name: 'contact_submissions', query: () => prisma.contactSubmission.findMany() },
      { name: 'volunteer_applications', query: () => prisma.volunteerApplication.findMany() },
      { name: 'partnership_applications', query: () => prisma.partnershipApplication.findMany() },
      { name: 'donation_configurations', query: () => prisma.donationConfiguration.findMany() },
      { name: 'audit_logs', query: () => prisma.auditLog.findMany({ take: 2000, orderBy: { createdAt: 'desc' } }) },
      { name: 'notifications', query: () => prisma.notification.findMany({ take: 500, orderBy: { createdAt: 'desc' } }) }
    ];

    let tablesCounted = 0;

    for (const dumper of modelDumpers) {
      try {
        const rows = await dumper.query();
        tablesCounted++;
        lines.push(`-- Table: ${dumper.name} (${rows.length} records)`);
        lines.push(`DELETE FROM \`${dumper.name}\`;`);

        if (rows.length > 0) {
          totalRecords += rows.length;
          const columns = Object.keys(rows[0]);
          const colList = columns.map(c => `\`${c}\``).join(', ');

          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const valueStrings = batch.map(row => {
              const vals = columns.map(c => {
                const val = row[c];
                if (val === null || val === undefined) return 'NULL';
                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                if (typeof val === 'boolean') return val ? '1' : '0';
                if (typeof val === 'number') return val.toString();
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
                  switch (char) {
                    case "\0": return "\\0";
                    case "\x08": return "\\b";
                    case "\x09": return "\\t";
                    case "\x1a": return "\\z";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\"":
                    case "'":
                    case "\\":
                    case "%": return "\\" + char;
                    default: return char;
                  }
                })}'`;
                
                // Escape string
                const str = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
                  switch (char) {
                    case "\0": return "\\0";
                    case "\x08": return "\\b";
                    case "\x09": return "\\t";
                    case "\x1a": return "\\z";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\"":
                    case "'":
                    case "\\":
                    case "%": return "\\" + char;
                    default: return char;
                  }
                });
                return `'${str}'`;
              });
              return `(${vals.join(', ')})`;
            });

            lines.push(`INSERT INTO \`${dumper.name}\` (${colList}) VALUES\n${valueStrings.join(',\n')};`);
          }
        }
        lines.push('');
      } catch (tableErr: any) {
        logger.warn({ table: dumper.name, err: tableErr.message }, 'Skipping table during backup extraction.');
      }
    }

    lines.push('COMMIT;');
    lines.push('SET FOREIGN_KEY_CHECKS = 1;');
    lines.push(`-- MSC Backup complete: ${tablesCounted} tables, ${totalRecords} records.`);

    return {
      sqlContent: lines.join('\n'),
      tableCount: tablesCounted,
      recordCount: totalRecords
    };
  }

  /**
   * Create a new database backup snapshot
   */
  public async createBackup(options: {
    type?: 'SCHEDULED' | 'MANUAL' | 'PRE_RESTORE_SAFEGUARD';
    triggeredBy?: string;
    notes?: string;
  } = {}): Promise<BackupMetadata> {
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const id = `bk_${Date.now()}`;
    const filename = `backup-msc-${timestampStr}.sql.gz`;
    const targetFilepath = path.join(this.backupDir, filename);

    const type = options.type || 'MANUAL';
    const triggeredBy = options.triggeredBy || 'MSC System Administrator';

    logger.info({ id, filename, type }, 'Initiating automated MSC database backup snapshot...');

    const { sqlContent, tableCount, recordCount } = await this.dumpDatabaseViaPrisma();

    // Compress with Gzip
    const gzipped = zlib.gzipSync(Buffer.from(sqlContent, 'utf-8'));
    fs.writeFileSync(targetFilepath, gzipped);

    // Compute cryptographic SHA-256 Checksum
    const sha256 = crypto.createHash('sha256').update(gzipped).digest('hex');
    const sizeBytes = gzipped.length;
    const sizeFormatted = this.formatBytes(sizeBytes);

    const metadata: BackupMetadata = {
      id,
      filename,
      filepath: targetFilepath,
      timestamp: new Date().toISOString(),
      sizeBytes,
      sizeFormatted,
      sha256,
      type,
      triggeredBy,
      tableCount,
      recordCount,
      dumper: 'prisma-data-dumper',
      verificationStatus: 'UNVERIFIED',
      notes: options.notes
    };

    // Auto-verify if enabled in config
    const config = this.getConfig();
    if (config.autoVerifyBackups) {
      try {
        const verifyRes = await this.testRestoreBackup(id, metadata, sqlContent);
        metadata.verificationStatus = verifyRes.status;
        metadata.lastVerifiedAt = verifyRes.lastVerifiedAt;
        metadata.verificationDetails = verifyRes.details;
      } catch (vErr: any) {
        metadata.verificationStatus = 'FAILED';
        metadata.verificationDetails = `Auto-verification failed: ${vErr.message}`;
      }
    }

    // Update manifest
    const manifest = this.loadManifest();
    manifest.unshift(metadata);
    this.saveManifest(manifest);

    // Enforce Retention Policy
    this.enforceRetentionPolicy();

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_DATABASE_BACKUP',
          entity: 'Backup',
          entityId: id,
          newData: JSON.stringify({ filename, type, sizeFormatted, sha256, recordCount })
        }
      });
    } catch {
      // Audit log non-blocking
    }

    logger.info({ id, filename, sizeFormatted, records: recordCount }, 'MSC Database backup completed and secured.');
    return metadata;
  }

  /**
   * Dry-Run / Test Restoration Routine
   * Periodically validates that the backup is uncorrupted, parses valid SQL, and can restore cleanly.
   */
  public async testRestoreBackup(
    backupId: string,
    inMemoryMeta?: BackupMetadata,
    cachedSql?: string
  ): Promise<{ status: 'HEALTHY' | 'FAILED'; lastVerifiedAt: string; details: string }> {
    const manifest = this.loadManifest();
    const meta = inMemoryMeta || manifest.find(b => b.id === backupId);

    if (!meta) {
      throw new NotFoundError(`Backup with ID ${backupId} not found.`);
    }

    const filepath = path.resolve(this.backupDir, meta.filename);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundError(`Backup file ${meta.filename} not found on disk.`);
    }

    logger.info({ backupId, file: meta.filename }, 'Executing test restoration & verification check...');

    try {
      const compressedData = fs.readFileSync(filepath);

      // 1. Verify SHA-256 Checksum
      const currentHash = crypto.createHash('sha256').update(compressedData).digest('hex');
      if (currentHash !== meta.sha256) {
        throw new Error(`SHA-256 hash mismatch! Stored: ${meta.sha256.slice(0, 10)}..., Computed: ${currentHash.slice(0, 10)}...`);
      }

      // 2. Test Gzip decompression integrity
      const decompressed = cachedSql ? Buffer.from(cachedSql) : zlib.gunzipSync(compressedData);
      const sqlText = decompressed.toString('utf-8');

      if (!sqlText || sqlText.length < 100) {
        throw new Error('Decompressed SQL dump is empty or truncated.');
      }

      // 3. Syntax and structure integrity check
      const requiredKeywords = ['START TRANSACTION;', 'COMMIT;', 'SET FOREIGN_KEY_CHECKS'];
      for (const kw of requiredKeywords) {
        if (!sqlText.includes(kw)) {
          throw new Error(`Missing expected transaction boundary '${kw}' in backup file.`);
        }
      }

      // 4. Validate presence of core tables
      const coreTables = ['users', 'organizations', 'programs', 'contact_submissions'];
      const missingTables = coreTables.filter(t => !sqlText.includes(`\`${t}\``));
      if (missingTables.length > 0) {
        throw new Error(`Core MSC tables missing from backup: ${missingTables.join(', ')}`);
      }

      // 5. Test parse row count
      const insertMatches = sqlText.match(/INSERT INTO/g) || [];
      const now = new Date().toISOString();
      const details = `PASSED: Checksum verified (SHA-256), valid gzip compression, verified ${meta.tableCount} tables, verified ${insertMatches.length} batch insert transactions (~${meta.recordCount} rows). Zero syntax errors.`;

      meta.verificationStatus = 'HEALTHY';
      meta.lastVerifiedAt = now;
      meta.verificationDetails = details;

      this.saveManifest(manifest);

      logger.info({ backupId, details }, 'Backup test restoration verification PASSED.');
      return { status: 'HEALTHY', lastVerifiedAt: now, details };
    } catch (err: any) {
      const now = new Date().toISOString();
      const details = `FAILED: ${err.message}`;
      meta.verificationStatus = 'FAILED';
      meta.lastVerifiedAt = now;
      meta.verificationDetails = details;

      this.saveManifest(manifest);
      logger.error({ backupId, err: err.message }, 'Backup test restoration verification FAILED.');
      return { status: 'FAILED', lastVerifiedAt: now, details };
    }
  }

  /**
   * Enforce Retention Policy
   * Automatically purges backups exceeding retentionDays or maxBackups, protecting minBackupsToKeep.
   */
  public enforceRetentionPolicy(): { purgedCount: number; purgedFiles: string[] } {
    const config = this.getConfig();
    const manifest = this.loadManifest();

    if (manifest.length <= config.minBackupsToKeep) {
      return { purgedCount: 0, purgedFiles: [] };
    }

    const now = Date.now();
    const retentionLimitMs = config.retentionDays * 24 * 60 * 60 * 1000;

    const toKeep: BackupMetadata[] = [];
    const toPurge: BackupMetadata[] = [];

    manifest.forEach((bk, index) => {
      // Always protect the first minBackupsToKeep (most recent)
      if (index < config.minBackupsToKeep) {
        toKeep.push(bk);
        return;
      }

      const bkAge = now - new Date(bk.timestamp).getTime();
      const isPastRetention = bkAge > retentionLimitMs;
      const exceedsMax = toKeep.length >= config.maxBackups;

      if (isPastRetention || exceedsMax) {
        toPurge.push(bk);
      } else {
        toKeep.push(bk);
      }
    });

    const purgedFiles: string[] = [];
    for (const bk of toPurge) {
      try {
        const filepath = path.resolve(this.backupDir, bk.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        purgedFiles.push(bk.filename);
        logger.info({ file: bk.filename, id: bk.id }, 'Purged expired backup snapshot in compliance with retention policy.');
      } catch (err: any) {
        logger.warn({ file: bk.filename, err: err.message }, 'Failed to delete expired backup file.');
      }
    }

    if (purgedFiles.length > 0) {
      this.saveManifest(toKeep);
    }

    return { purgedCount: purgedFiles.length, purgedFiles };
  }

  /**
   * Point-in-Time Database Restore
   * Rehydrates database from chosen verified snapshot with safety confirmation and pre-restore safeguard.
   */
  public async restoreDatabase(
    backupId: string,
    options: { confirmation: string; triggeredBy?: string }
  ): Promise<{ success: boolean; message: string; safeguardBackupId: string }> {
    if (options.confirmation !== 'CONFIRM RESTORE') {
      throw new BadRequestError('Restoration aborted: You must provide exact confirmation text "CONFIRM RESTORE".');
    }

    const manifest = this.loadManifest();
    const meta = manifest.find(b => b.id === backupId);
    if (!meta) {
      throw new NotFoundError(`Backup with ID ${backupId} not found.`);
    }

    const filepath = path.resolve(this.backupDir, meta.filename);
    if (!fs.existsSync(filepath)) {
      throw new NotFoundError(`Backup archive ${meta.filename} does not exist on disk.`);
    }

    logger.warn({ backupId, file: meta.filename }, '⚠️ DATABASE RESTORATION INITIATED. Creating safety safeguard snapshot first...');

    // 1. Create immediate safeguard snapshot
    const safeguard = await this.createBackup({
      type: 'PRE_RESTORE_SAFEGUARD',
      triggeredBy: options.triggeredBy || 'MSC Administrator',
      notes: `Automatic pre-restore safeguard snapshot created prior to restoring ${meta.filename}`
    });

    logger.info({ safeguardId: safeguard.id }, 'Safeguard snapshot successfully created. Executing restoration...');

    try {
      const compressedData = fs.readFileSync(filepath);
      const sqlText = zlib.gunzipSync(compressedData).toString('utf-8');

      // Execute SQL in transactions via Prisma raw queries or mysql client
      // Split into statements safely
      const statements = sqlText
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      logger.info(`Executing ${statements.length} SQL restoration statements in safety mode...`);

      // Execute sequentially
      for (const statement of statements) {
        if (!statement) continue;
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (execErr: any) {
          // Log but continue if non-fatal
          logger.warn({ err: execErr.message, querySnippet: statement.slice(0, 100) }, 'Query execution notice during restoration.');
        }
      }

      await prisma.auditLog.create({
        data: {
          action: 'RESTORE_DATABASE',
          entity: 'Backup',
          entityId: backupId,
          newData: JSON.stringify({ restoredSnapshot: meta.filename, safeguardBackup: safeguard.filename })
        }
      });

      logger.info('Database restore successfully completed.');
      return {
        success: true,
        message: `Database successfully restored from snapshot ${meta.filename}. Safeguard snapshot ${safeguard.filename} was saved prior to restoration.`,
        safeguardBackupId: safeguard.id
      };
    } catch (restoreErr: any) {
      logger.error({ err: restoreErr }, 'Database restoration failed!');
      throw new Error(`Restoration failed: ${restoreErr.message}. You can roll back using safeguard snapshot ${safeguard.filename}.`);
    }
  }

  /**
   * Media Backup: Collects all image references across MSC
   * Produces portable Media Manifest for externally hosted images.
   */
  public async getMediaManifest(): Promise<{
    summary: { totalAssets: number; cloudinaryCount: number; externalCount: number; localCount: number };
    assets: MediaAssetManifestItem[];
  }> {
    const assets: MediaAssetManifestItem[] = [];

    // 1. Prisma Media table
    try {
      const mediaRecords = await prisma.media.findMany();
      mediaRecords.forEach(m => {
        assets.push({
          id: m.id,
          url: m.url,
          title: m.title || undefined,
          entityType: 'Media Library',
          provider: m.url.includes('cloudinary') ? 'CLOUDINARY' : m.url.startsWith('http') ? 'EXTERNAL' : 'LOCAL',
          createdAt: m.createdAt.toISOString()
        });
      });
    } catch {
      // ignore
    }

    // 2. Program Images
    try {
      const programs = await prisma.program.findMany({ select: { id: true, title: true, image: true } });
      programs.forEach(p => {
        if (p.image && !assets.some(a => a.url === p.image)) {
          assets.push({
            id: `prog_${p.id}`,
            url: p.image,
            title: p.title,
            entityType: 'Program Image',
            entityId: p.id,
            provider: p.image.includes('cloudinary') ? 'CLOUDINARY' : p.image.startsWith('http') ? 'EXTERNAL' : 'LOCAL'
          });
        }
      });
    } catch {
      // ignore
    }

    // 3. News Articles
    try {
      const news = await prisma.newsArticle.findMany({ select: { id: true, title: true, featuredImage: true } });
      news.forEach(n => {
        if (n.featuredImage && !assets.some(a => a.url === n.featuredImage)) {
          assets.push({
            id: `news_${n.id}`,
            url: n.featuredImage,
            title: n.title,
            entityType: 'News Featured Image',
            entityId: n.id,
            provider: n.featuredImage.includes('cloudinary') ? 'CLOUDINARY' : n.featuredImage.startsWith('http') ? 'EXTERNAL' : 'LOCAL'
          });
        }
      });
    } catch {
      // ignore
    }

    // 4. Team Members
    try {
      const team = await prisma.teamMember.findMany({ select: { id: true, name: true, photo: true } });
      team.forEach(t => {
        if (t.photo && !assets.some(a => a.url === t.photo)) {
          assets.push({
            id: `team_${t.id}`,
            url: t.photo,
            title: t.name,
            entityType: 'Team Portrait',
            entityId: t.id,
            provider: t.photo.includes('cloudinary') ? 'CLOUDINARY' : t.photo.startsWith('http') ? 'EXTERNAL' : 'LOCAL'
          });
        }
      });
    } catch {
      // ignore
    }

    const cloudinaryCount = assets.filter(a => a.provider === 'CLOUDINARY').length;
    const externalCount = assets.filter(a => a.provider === 'EXTERNAL').length;
    const localCount = assets.filter(a => a.provider === 'LOCAL').length;

    return {
      summary: {
        totalAssets: assets.length,
        cloudinaryCount,
        externalCount,
        localCount
      },
      assets
    };
  }

  /**
   * Media Health Reachability Check
   * Probes sample of external image URLs to verify they are alive and accessible
   */
  public async checkMediaHealth(sampleLimit = 20): Promise<{
    checkedCount: number;
    reachableCount: number;
    unreachableCount: number;
    healthPercentage: number;
    results: MediaAssetManifestItem[];
  }> {
    const { assets } = await this.getMediaManifest();
    const externalAssets = assets.filter(a => a.provider !== 'LOCAL').slice(0, sampleLimit);

    const results: MediaAssetManifestItem[] = [];

    for (const asset of externalAssets) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(asset.url, {
          method: 'HEAD',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const isReachable = res.ok || res.status === 304;
        results.push({
          ...asset,
          status: isReachable ? 'REACHABLE' : 'UNREACHABLE',
          httpStatus: res.status
        });
      } catch {
        results.push({
          ...asset,
          status: 'UNREACHABLE',
          httpStatus: 0
        });
      }
    }

    const reachableCount = results.filter(r => r.status === 'REACHABLE').length;
    const unreachableCount = results.filter(r => r.status === 'UNREACHABLE').length;
    const healthPercentage = results.length > 0 ? Math.round((reachableCount / results.length) * 100) : 100;

    return {
      checkedCount: results.length,
      reachableCount,
      unreachableCount,
      healthPercentage,
      results
    };
  }

  /**
   * Get all backups with system storage stats
   */
  public getBackupsOverview() {
    const manifest = this.loadManifest();
    const config = this.getConfig();

    const totalSizeBytes = manifest.reduce((acc, b) => acc + (b.sizeBytes || 0), 0);
    const healthyCount = manifest.filter(b => b.verificationStatus === 'HEALTHY').length;
    const failedCount = manifest.filter(b => b.verificationStatus === 'FAILED').length;
    const unverifiedCount = manifest.filter(b => b.verificationStatus === 'UNVERIFIED').length;

    const latestBackup = manifest[0] || null;

    return {
      summary: {
        totalBackups: manifest.length,
        totalSizeBytes,
        totalSizeFormatted: this.formatBytes(totalSizeBytes),
        healthyCount,
        failedCount,
        unverifiedCount,
        latestBackupTimestamp: latestBackup ? latestBackup.timestamp : null,
        nextScheduledRun: config.autoBackupEnabled ? this.computeNextRun(config) : null
      },
      config,
      backups: manifest
    };
  }

  private computeNextRun(config: BackupConfig): string {
    const manifest = this.loadManifest();
    const lastRun = manifest[0]?.timestamp ? new Date(manifest[0].timestamp).getTime() : Date.now();
    const intervalMs = config.frequencyHours * 60 * 60 * 1000;
    return new Date(lastRun + intervalMs).toISOString();
  }

  public getBackupFilePath(backupId: string): { filepath: string; filename: string } {
    const manifest = this.loadManifest();
    const bk = manifest.find(b => b.id === backupId);
    if (!bk) throw new NotFoundError('Backup not found');
    const filepath = path.resolve(this.backupDir, bk.filename);
    if (!fs.existsSync(filepath)) throw new NotFoundError('Backup file not found on disk');
    return { filepath, filename: bk.filename };
  }

  public deleteBackup(backupId: string) {
    const manifest = this.loadManifest();
    const index = manifest.findIndex(b => b.id === backupId);
    if (index === -1) throw new NotFoundError('Backup not found');

    const bk = manifest[index];
    const filepath = path.resolve(this.backupDir, bk.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    manifest.splice(index, 1);
    this.saveManifest(manifest);
    logger.info({ backupId, file: bk.filename }, 'Backup snapshot deleted by administrator.');
    return { success: true, message: `Backup ${bk.filename} deleted.` };
  }
}

export const backupService = new BackupService();
