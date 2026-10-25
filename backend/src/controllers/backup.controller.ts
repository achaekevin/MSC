import { Request, Response, NextFunction } from 'express';
import { backupService } from '../services/backup.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { BadRequestError } from '../errors/AppError.js';

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
          ? 'Local archive integrity checks passed. No database restore was performed.'
          : 'Local archive integrity verification failed.',
        result
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  async restoreDatabase(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    next(new BadRequestError(
      'Database restoration is disabled until an isolated restore workflow and separate production approval process are implemented.'
    ));
  }

  async downloadBackup(req: Request, res: Response, next: NextFunction) {
    next(new BadRequestError(
      'Raw backup archive downloads are disabled. Use the approved private recovery procedure.'
    ));
  }

  async deleteBackup(req: Request, res: Response, next: NextFunction) {
    next(new BadRequestError(
      'Backup deletion is disabled until independently verified retention safeguards are implemented.'
    ));
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
