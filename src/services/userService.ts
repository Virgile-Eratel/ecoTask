import { apiClient, type ApiResponse, type PaginatedResponse } from './api';
import type {User} from '../types';

export interface CreateUserData {
  name: string;
  email: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'MEMBER';
}

export interface UserFilters {
  page?: number;
  limit?: number;
}

export interface UserStats {
  taskStats: {
    total: number;
    completed: number;
    completionRate: number;
    totalCO2: number;
    byStatus: Array<{
      status: string;
      _count: number;
      _sum: {
        co2Emissions: number;
        estimatedHours: number;
        actualHours: number;
      };
    }>;
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
}

class UserService {
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    return apiClient.get('/users', filters) as Promise<PaginatedResponse<User>>;
  }

  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get(`/users/${id}`);
  }

  async createUser(userData: CreateUserData): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post('/users', userData);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/users/${id}`);
  }

  async getUserStats(id: string): Promise<ApiResponse<UserStats>> {
    return apiClient.get(`/users/${id}/stats`);
  }
}

export const userService = new UserService();
