import { apiClient } from './api';

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface AuditLogsResponse {
  logs: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditService = {
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    entity?: string;
    action?: string;
  }): Promise<AuditLogsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.entity && params.entity !== 'all') query.append('entity', params.entity);
    if (params?.action && params.action !== 'all') query.append('action', params.action);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiClient.getWithMeta<AuditLogItem[]>(`/admin/audit${qs}`);
    const logs = Array.isArray(res.data) ? res.data : [];
    const total = res.pagination?.total ?? logs.length;
    const limit = params?.limit || 20;
    const totalPages = res.pagination?.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 1);
    const page = res.pagination?.page ?? (params?.page || 1);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
};
