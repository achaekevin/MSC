import { Request, Response, NextFunction } from 'express';
import { backupService } from '../services/backup.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class BackupController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = backupService.getBackupsOverview();
      return sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  }

  async createBackup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { notes } = req.body || {};
      const adminName = req.user?.name || req.user?.email || 'MSC Administrator';
      const backup = await backupService.createBackup({
        type: 'MANUAL',
        triggeredBy: adminName,
        notes
      });
      return sendSuccess(res, {
        message: 'Database backup snapshot successfully generated and secured.',
        backup
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async testRestore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await backupService.testRestoreBackup(id);
      return sendSuccess(res, {
        message: result.status === 'HEALTHY'
          ? 'Backup integrity & test restoration verified successfully.'
          : 'Backup verification detected integrity errors.',
        result
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  async restoreDatabase(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { confirmation } = req.body || {};
      const adminName = req.user?.name || req.user?.email || 'MSC Administrator';

      const result = await backupService.restoreDatabase(id, {
        confirmation,
        triggeredBy: adminName
      });

      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async downloadBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { filepath, filename } = backupService.getBackupFilePath(id);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/gzip');
      return res.sendFile(filepath);
    } catch (error) {
      next(error);
    }
  }

  async deleteBackup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = backupService.deleteBackup(id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMediaManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const manifest = await backupService.getMediaManifest();
      return sendSuccess(res, manifest, 200);
    } catch (error) {
      next(error);
    }
  }

  async exportMediaManifest(req: Request, res: Response, next: NextFunction) {
    try {
      const manifest = await backupService.getMediaManifest();
      const filename = `msc-media-manifest-${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      return res.send(JSON.stringify(manifest, null, 2));
    } catch (error) {
      next(error);
    }
  }

  async checkMediaHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = await backupService.checkMediaHealth();
      return sendSuccess(res, health, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = backupService.updateConfig(req.body);
      return sendSuccess(res, {
        message: 'Backup schedule and retention policy updated.',
        config: updated
      }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const backupController = new BackupController();
