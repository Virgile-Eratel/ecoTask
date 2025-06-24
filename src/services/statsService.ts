import { apiClient, type ApiResponse } from './api';
import type {DashboardStats} from '../types';

export interface CO2Trends {
  trends: Array<{
    period: string;
    co2Amount: number;
    taskCount: number;
  }>;
}

export interface ProjectStats {
  project: {
    id: string;
    name: string;
    totalCO2: number;
    taskCount: number;
    memberCount: number;
  };
  taskStats: {
    byStatus: any[];
    byType: any[];
    byPriority: any[];
  };
  co2Evolution: Array<{
    week: string;
    co2Amount: number;
  }>;
  memberStats: Array<{
    userId: string;
    userName: string;
    taskCount: number;
    co2Amount: number;
  }>;
}

export interface UserStatsDetailed {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  taskStats: {
    total: number;
    completed: number;
    completionRate: number;
    totalCO2: number;
    byStatus: any[];
    byType: any[];
  };
  projectStats: {
    total: number;
    projects: Array<{
      id: string;
      name: string;
      totalCO2: number;
      _count: {
        tasks: number;
      };
    }>;
  };
  co2Evolution: Array<{
    month: string;
    co2Amount: number;
  }>;
}

class StatsService {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get('/api/stats/dashboard');
  }

  async getCO2Trends(period: '3months' | '6months' | '1year' = '6months'): Promise<ApiResponse<CO2Trends>> {
    return apiClient.get('/api/stats/co2-trends', { period });
  }

  async getProjectStats(projectId: string): Promise<ApiResponse<ProjectStats>> {
    return apiClient.get(`/api/stats/project/${projectId}`);
  }

  async getUserStats(userId: string): Promise<ApiResponse<UserStatsDetailed>> {
    return apiClient.get(`/api/stats/user/${userId}`);
  }
}

export const statsService = new StatsService();
