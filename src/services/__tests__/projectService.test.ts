import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectService, type CreateProjectData, type UpdateProjectData } from '../projectService'
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

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    color: '#10b981',
    ownerId: 'user-1',
    totalCO2: 15.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('getProjects', () => {
    it('should fetch projects with default filters', async () => {
      const mockResponse = {
        success: true,
        data: {
          projects: [mockProject],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        }
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await projectService.getProjects()

      expect(mockApiClient.get).toHaveBeenCalledWith('/projects', {})
      expect(result).toEqual(mockResponse)
    })

    it('should fetch projects with filters', async () => {
      const filters = {
        ownerId: 'user-1',
        search: 'test',
        page: 2,
        limit: 20
      }

      await projectService.getProjects(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith('/projects', filters)
    })
  })

  describe('getProjectById', () => {
    it('should fetch a project by id', async () => {
      const mockResponse = {
        success: true,
        data: { project: mockProject }
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await projectService.getProjectById('project-1')

      expect(mockApiClient.get).toHaveBeenCalledWith('/projects/project-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createProject', () => {
    it('should create a new project', async () => {
      const createData: CreateProjectData = {
        name: 'New Project',
        description: 'New Description',
        color: '#059669',
        ownerId: 'user-1',
        memberIds: ['user-1', 'user-2']
      }

      const mockResponse = {
        success: true,
        data: { project: mockProject }
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await projectService.createProject(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/projects', createData)
      expect(result).toEqual(mockResponse)
    })

    it('should create project without optional fields', async () => {
      const createData: CreateProjectData = {
        name: 'Simple Project',
        ownerId: 'user-1'
      }

      await projectService.createProject(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/projects', createData)
    })
  })

  describe('updateProject', () => {
    it('should update a project', async () => {
      const updateData: UpdateProjectData = {
        name: 'Updated Project',
        description: 'Updated Description',
        memberIds: ['user-1', 'user-2', 'user-3']
      }

      const mockResponse = {
        success: true,
        data: { project: { ...mockProject, ...updateData } }
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await projectService.updateProject('project-1', updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/projects/project-1', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockResponse = { success: true }
      mockApiClient.delete.mockResolvedValue(mockResponse)

      const result = await projectService.deleteProject('project-1')

      expect(mockApiClient.delete).toHaveBeenCalledWith('/projects/project-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('recalculateProjectCO2', () => {
    it('should recalculate project CO2', async () => {
      const mockResponse = {
        success: true,
        data: { project: { ...mockProject, totalCO2: 20.0 } },
        message: 'CO2 du projet recalculé avec succès'
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await projectService.recalculateProjectCO2('project-1')

      expect(mockApiClient.put).toHaveBeenCalledWith('/projects/project-1/recalculate-co2')
      expect(result).toEqual(mockResponse)
    })
  })
})
