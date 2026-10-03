import { apiClient } from './api';
import { TeamMember } from '../types';
import { TEAM_DATA } from '../data/teamData';

export const teamService = {
  async getAll(): Promise<TeamMember[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: TeamMember[] }>('/team');
      return res.data && res.data.length > 0 ? res.data : TEAM_DATA;
    } catch {
      return TEAM_DATA;
    }
  },

  async getByDepartment(department: TeamMember['department']): Promise<TeamMember[]> {
    const all = await this.getAll();
    return all.filter((member) => member.department === department);
  }
};
