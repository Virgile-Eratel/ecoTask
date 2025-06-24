import { apiClient, type ApiResponse, type PaginatedResponse } from './api';
import type { Project } from '../types';

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  ownerId: string;
  memberIds?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  memberIds?: string[];
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  ownerId?: string;
  search?: string;
}

class ProjectService {
  async getProjects(filters: ProjectFilters = {}): Promise<PaginatedResponse<Project>> {
    return apiClient.get('/api/projects', filters) as Promise<PaginatedResponse<Project>>;
  }

  async getProjectById(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.get(`/api/projects/${id}`);
  }

  async createProject(projectData: CreateProjectData): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.post('/api/projects', projectData);
  }

  async updateProject(id: string, projectData: UpdateProjectData): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.put(`/api/projects/${id}`, projectData);
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/projects/${id}`);
  }

  async recalculateProjectCO2(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.put(`/api/projects/${id}/recalculate-co2`);
  }
}

export const projectService = new ProjectService();
