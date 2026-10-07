import { backupService } from './backup.service.js';
import { logger } from '../config/logger.js';

export class BackupSchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private isRunningCheck = false;

  public start() {
    logger.info('Initializing MSC Automated Backup & Retention Daemon...');
    // Initial check after 30 seconds of server boot
    setTimeout(() => {
      this.checkAndExecuteScheduledBackup();
    }, 30000);

    // Periodic check every 1 hour (3600000 ms)
    this.timer = setInterval(() => {
      this.checkAndExecuteScheduledBackup();
    }, 3600000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('MSC Automated Backup & Retention Daemon stopped.');
    }
  }

  public async checkAndExecuteScheduledBackup() {
    if (this.isRunningCheck) return;
    this.isRunningCheck = true;

    try {
      const config = backupService.getConfig();
      if (!config.autoBackupEnabled) {
        return;
      }

      const overview = backupService.getBackupsOverview();
      const latestTimestamp = overview.summary.latestBackupTimestamp;

      const now = Date.now();
      const intervalMs = config.frequencyHours * 60 * 60 * 1000;

      const isDue = !latestTimestamp || (now - new Date(latestTimestamp).getTime()) >= intervalMs;

      if (isDue) {
        logger.info('Scheduled database backup threshold reached. Triggering automated backup snapshot...');
        await backupService.createBackup({
          type: 'SCHEDULED',
          triggeredBy: 'MSC Automated Backup Daemon',
          notes: `Automated scheduled backup (frequency: ${config.frequencyHours}h, retention: ${config.retentionDays}d)`
        });
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'Error in automated backup schedule execution.');
    } finally {
      this.isRunningCheck = false;
    }
  }
}

export const backupSchedulerService = new BackupSchedulerService();
