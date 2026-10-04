import { apiClient } from './api';
import { TeamMember, ContentStatus } from '../types';
import { TEAM_DATA } from '../data/teamData';

export interface TeamStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  approved: number;
  activeCount: number;
}

export const teamService = {
  // Public
  async getAll(): Promise<TeamMember[]> {
    try {
      const res = await apiClient.get<any>('/team');
      const items = res.data?.data || res.data || [];
      return items.length > 0 ? items : TEAM_DATA;
    } catch {
      return TEAM_DATA;
    }
  },

  async getByDepartment(department: string): Promise<TeamMember[]> {
    const all = await this.getAll();
    if (!department || department === 'All') return all;
    return all.filter((member) => member.department === department);
  },

  // Admin
  async getAdminTeam(): Promise<TeamMember[]> {
    try {
      const res = await apiClient.get<any>('/admin/team');
      const raw = res.data?.data || res.data || [];
      return raw.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.position,
        department: m.department,
        bio: m.biography,
        image: m.photo,
        responsibilities: m.responsibilities,
        displayOrder: m.displayOrder ?? 0,
        isActive: m.isActive ?? true,
        isPlaceholder: m.isPlaceholder ?? true,
        status: m.status || 'PUBLISHED',
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      }));
    } catch {
      return TEAM_DATA.map((t) => ({
        ...t,
        status: 'PUBLISHED' as ContentStatus,
        isActive: true,
        displayOrder: 0
      }));
    }
  },

  async createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
    const payload = {
      name: data.name,
      position: data.role,
      department: data.department || 'Administrative Leadership',
      biography: data.bio || '',
      photo: data.image || '/images/mwancha-facility-main.jpg',
      responsibilities: data.responsibilities || '',
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
      isPlaceholder: data.isPlaceholder ?? false
    };

    const res = await apiClient.post<any>('/admin/team', payload);
    return res.data?.data || res.data;
  },

  async updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const payload = {
      name: data.name,
      position: data.role,
      department: data.department,
      biography: data.bio,
      photo: data.image,
      responsibilities: data.responsibilities,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
      isPlaceholder: data.isPlaceholder
    };

    const res = await apiClient.put<any>(`/admin/team/${id}`, payload);
    return res.data?.data || res.data;
  },

  async deleteTeamMember(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/admin/team/${id}`);
    return res.data?.success ?? true;
  },

  async submitReview(id: string): Promise<TeamMember> {
    const res = await apiClient.post<any>(`/admin/team/${id}/submit-review`, {});
    return res.data?.data || res.data;
  },

  async approveTeamMember(id: string): Promise<TeamMember> {
    const res = await apiClient.post<any>(`/admin/team/${id}/approve`, {});
    return res.data?.data || res.data;
  },

  async publishTeamMember(id: string): Promise<TeamMember> {
    const res = await apiClient.post<any>(`/admin/team/${id}/publish`, {});
    return res.data?.data || res.data;
  },

  async bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<boolean> {
    await Promise.all(
      ids.map(async (id) => {
        if (status === 'IN_REVIEW') return this.submitReview(id);
        if (status === 'APPROVED') return this.approveTeamMember(id);
        if (status === 'PUBLISHED') return this.publishTeamMember(id);
        return this.updateTeamMember(id, { status });
      })
    );
    return true;
  },

  async bulkDelete(ids: string[]): Promise<boolean> {
    await Promise.all(ids.map((id) => this.deleteTeamMember(id)));
    return true;
  },

  async getStats(): Promise<TeamStats> {
    const members = await this.getAdminTeam();
    return {
      total: members.length,
      published: members.filter((m) => m.status === 'PUBLISHED').length,
      draft: members.filter((m) => m.status === 'DRAFT').length,
      inReview: members.filter((m) => m.status === 'IN_REVIEW').length,
      approved: members.filter((m) => m.status === 'APPROVED').length,
      activeCount: members.filter((m) => m.isActive !== false).length
    };
  }
};
