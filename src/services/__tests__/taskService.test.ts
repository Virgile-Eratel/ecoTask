import { describe, it, expect, vi, beforeEach } from 'vitest'
import { taskService, type CreateTaskData, type UpdateTaskData } from '../taskService'
import { apiClient } from '../api'

// Mock du client API
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockApiClient = vi.mocked(apiClient)

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    type: 'TECHNICAL' as const,
    priority: 'HIGH' as const,
    status: 'TODO' as const,
    assigneeId: 'user-1',
    projectId: 'project-1',
    estimatedHours: 5,
    actualHours: 0,
    co2Emissions: 5.0,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('getTasks', () => {
    it('should fetch tasks with default filters', async () => {
      const mockResponse = {
        success: true,
        data: {
          tasks: [mockTask],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        }
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await taskService.getTasks()

      expect(mockApiClient.get).toHaveBeenCalledWith('/tasks', {})
      expect(result).toEqual(mockResponse)
    })

    it('should fetch tasks with filters', async () => {
      const filters = {
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        search: 'test',
        page: 2,
        limit: 20
      }

      await taskService.getTasks(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith('/tasks', filters)
    })
  })

  describe('getTaskById', () => {
    it('should fetch a task by id', async () => {
      const mockResponse = {
        success: true,
        data: { task: mockTask }
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await taskService.getTaskById('task-1')

      expect(mockApiClient.get).toHaveBeenCalledWith('/tasks/task-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createData: CreateTaskData = {
        title: 'New Task',
        description: 'New Description',
        type: 'TECHNICAL',
        priority: 'HIGH',
        assigneeId: 'user-1',
        projectId: 'project-1',
        estimatedHours: 5,
        dueDate: '2024-12-31T00:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: { task: mockTask }
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await taskService.createTask(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/tasks', createData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updateData: UpdateTaskData = {
        title: 'Updated Task',
        status: 'IN_PROGRESS',
        actualHours: 3
      }

      const mockResponse = {
        success: true,
        data: { task: { ...mockTask, ...updateData } }
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await taskService.updateTask('task-1', updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/tasks/task-1', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockResponse = { success: true }
      mockApiClient.delete.mockResolvedValue(mockResponse)

      const result = await taskService.deleteTask('task-1')

      expect(mockApiClient.delete).toHaveBeenCalledWith('/tasks/task-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const newStatus = 'DONE' as const
      const mockResponse = {
        success: true,
        data: { task: { ...mockTask, status: newStatus } }
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await taskService.updateTaskStatus('task-1', newStatus)

      expect(mockApiClient.put).toHaveBeenCalledWith('/tasks/task-1/status', { status: newStatus })
      expect(result).toEqual(mockResponse)
    })
  })
})
