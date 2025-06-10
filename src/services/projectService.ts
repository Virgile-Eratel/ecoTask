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
    return apiClient.get('/projects', filters) as Promise<PaginatedResponse<Project>>;
  }

  async getProjectById(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.get(`/projects/${id}`);
  }

  async createProject(projectData: CreateProjectData): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.post('/projects', projectData);
  }

  async updateProject(id: string, projectData: UpdateProjectData): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/projects/${id}`);
  }

  async recalculateProjectCO2(id: string): Promise<ApiResponse<{ project: Project }>> {
    return apiClient.put(`/projects/${id}/recalculate-co2`);
  }
}

export const projectService = new ProjectService();
