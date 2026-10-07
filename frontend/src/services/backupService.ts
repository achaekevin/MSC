import { apiClient, BASE_URL } from './api';
import {
  BackupOverviewResponse,
  BackupMetadata,
  BackupConfig,
  MediaManifestResponse,
  MediaHealthResponse
} from '../types/backup';

export const backupService = {
  async getOverview(): Promise<BackupOverviewResponse> {
    const res = await apiClient.get<any>('/admin/backups');
    return res.data || res;
  },

  async createBackup(notes?: string): Promise<{ message: string; backup: BackupMetadata }> {
    const res = await apiClient.post<any>('/admin/backups/create', { notes });
    return res.data || res;
  },

  async testRestore(backupId: string): Promise<{
    message: string;
    result: { status: 'HEALTHY' | 'FAILED'; lastVerifiedAt: string; details: string };
  }> {
    const res = await apiClient.post<any>(`/admin/backups/${backupId}/test-restore`, {});
    return res.data || res;
  },

  async restoreDatabase(
    backupId: string,
    confirmation: string
  ): Promise<{ success: boolean; message: string; safeguardBackupId: string }> {
    const res = await apiClient.post<any>(`/admin/backups/${backupId}/restore`, { confirmation });
    return res.data || res;
  },

  getDownloadUrl(backupId: string): string {
    return `${BASE_URL}/admin/backups/${backupId}/download`;
  },

  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<any>(`/admin/backups/${backupId}`);
    return res.data || res;
  },

  async updateConfig(config: Partial<BackupConfig>): Promise<{ message: string; config: BackupConfig }> {
    const res = await apiClient.put<any>('/admin/backups/config', config);
    return res.data || res;
  },

  async getMediaManifest(): Promise<MediaManifestResponse> {
    const res = await apiClient.get<any>('/admin/backups/media/manifest');
    return res.data || res;
  },

  async checkMediaHealth(): Promise<MediaHealthResponse> {
    const res = await apiClient.get<any>('/admin/backups/media/health');
    return res.data || res;
  },

  getMediaExportUrl(): string {
    return `${BASE_URL}/admin/backups/media/export`;
  }
};
