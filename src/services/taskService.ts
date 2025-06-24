import { apiClient, type ApiResponse, type PaginatedResponse } from './api';
import type {Task, TaskType, TaskPriority, TaskStatus} from '../types';

export interface CreateTaskData {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status?: TaskStatus;
  assigneeId: string;
  projectId: string;
  estimatedHours: number;
  dueDate: string; // ISO string
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  projectId?: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string; // ISO string
  completedAt?: string; // ISO string
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  projectId?: string;
  assigneeId?: string;
  search?: string;
}

class TaskService {
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    return apiClient.get('/tasks', filters) as Promise<PaginatedResponse<Task>>;
  }

  async getTaskById(id: string): Promise<ApiResponse<{ task: Task }>> {
    return apiClient.get(`/tasks/${id}`);
  }

  async createTask(taskData: CreateTaskData): Promise<ApiResponse<{ task: Task }>> {
    return apiClient.post('/tasks', taskData);
  }

  async updateTask(id: string, taskData: UpdateTaskData): Promise<ApiResponse<{ task: Task }>> {
    return apiClient.put(`/tasks/${id}`, taskData);
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/tasks/${id}`);
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<ApiResponse<{ task: Task }>> {
    return apiClient.put(`/tasks/${id}/status`, { status });
  }
}

export const taskService = new TaskService();
