import { apiClient } from './api';
import { UserRole } from './authService';

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  permissions: string[];
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  createdAt: string;
}

export interface CreateAdminUserInput {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  users: AdminUserRecord[];
  pagination: UserPagination;
}

export const userService = {
  async getUsers(page = 1, limit = 20, role = 'all'): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (role && role !== 'all') {
      params.append('role', role);
    }

    const res = await apiClient.getWithMeta<AdminUserRecord[]>(`/admin/users?${params.toString()}`);
    return {
      users: Array.isArray(res.data) ? res.data : [],
      pagination: res.pagination || {
        page,
        limit,
        total: Array.isArray(res.data) ? res.data.length : 0,
        totalPages: 1
      }
    };
  },

  async createUser(data: CreateAdminUserInput): Promise<AdminUserRecord> {
    return apiClient.post<AdminUserRecord>('/admin/users', data);
  },

  async setUserActiveStatus(id: string, isActive: boolean): Promise<AdminUserRecord> {
    return apiClient.patch<AdminUserRecord>(`/admin/users/${id}/status`, { isActive });
  },

  async setUserRole(id: string, role: UserRole): Promise<AdminUserRecord> {
    return apiClient.patch<AdminUserRecord>(`/admin/users/${id}/role`, { role });
  },

  async resetPassword(id: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/admin/users/${id}/reset-password`, { newPassword });
  },

  async revokeSessions(id: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/admin/users/${id}/revoke-sessions`, {});
  }
};
