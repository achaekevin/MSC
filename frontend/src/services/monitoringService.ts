import { apiClient } from './api';

export interface MonitoringOverview {
  status: 'HEALTHY' | 'DEGRADED';
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
    startedAt: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsageMb: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
  };
  database: {
    status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
    latencyMs: number;
  };
  security: {
    activeAlertsCount: number;
    criticalAlertsCount: number;
    failedLoginsLastHour: number;
    totalFailedLoginsRecorded: number;
    apiErrorsLastHour: number;
    totalApiErrorsRecorded: number;
  };
  backups: {
    totalBackups: number;
    lastBackupDate: string | null;
    health: string;
  };
}

export interface FailedLoginItem {
  id: string;
  emailMasked: string;
  ip: string;
  userAgent?: string;
  reason: string;
  timestamp: string;
}

export interface ApiErrorItem {
  id: string;
  statusCode: number;
  method: string;
  path: string;
  ip?: string;
  requestId?: string;
  summary: string;
  timestamp: string;
}

export interface SecurityAlertItem {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  ip?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface DependencyStatus {
  status: string;
  scanEngine: string;
  lastScannedAt: string;
  policy: string;
  recommendations: string[];
}

export const monitoringService = {
  async getOverview(): Promise<MonitoringOverview> {
    return apiClient.get<MonitoringOverview>('/admin/monitoring/overview');
  },

  async getFailedLogins(limit = 20): Promise<FailedLoginItem[]> {
    const res = await apiClient.get<{ failedLogins: FailedLoginItem[] }>(`/admin/monitoring/failed-logins?limit=${limit}`);
    return res.failedLogins || [];
  },

  async getApiErrors(limit = 20): Promise<ApiErrorItem[]> {
    const res = await apiClient.get<{ apiErrors: ApiErrorItem[] }>(`/admin/monitoring/api-errors?limit=${limit}`);
    return res.apiErrors || [];
  },

  async getAlerts(includeAcknowledged = false): Promise<SecurityAlertItem[]> {
    const res = await apiClient.get<{ alerts: SecurityAlertItem[] }>(`/admin/monitoring/alerts?includeAcknowledged=${includeAcknowledged}`);
    return res.alerts || [];
  },

  async acknowledgeAlert(id: string): Promise<boolean> {
    const res = await apiClient.post<{ success: boolean }>(`/admin/monitoring/alerts/${id}/acknowledge`, {});
    return res.success;
  },

  async getDependencyStatus(): Promise<DependencyStatus> {
    return apiClient.get<DependencyStatus>('/admin/monitoring/dependencies');
  }
};
