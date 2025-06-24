import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService, type CreateUserData, type UpdateUserData } from '../userService'
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

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'member' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('getUsers', () => {
    it('should fetch users with default filters', async () => {
      const mockResponse = {
        success: true,
        data: {
          users: [mockUser],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        }
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await userService.getUsers()

      expect(mockApiClient.get).toHaveBeenCalledWith('/users', {})
      expect(result).toEqual(mockResponse)
    })

    it('should fetch users with pagination', async () => {
      const filters = { page: 2, limit: 20 }

      await userService.getUsers(filters)

      expect(mockApiClient.get).toHaveBeenCalledWith('/users', filters)
    })
  })

  describe('getUserById', () => {
    it('should fetch a user by id', async () => {
      const mockResponse = {
        success: true,
        data: { user: mockUser }
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await userService.getUserById('user-1')

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/user-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createData: CreateUserData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'ADMIN'
      }

      const mockResponse = {
        success: true,
        data: { user: { ...mockUser, ...createData } }
      }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await userService.createUser(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/users', createData)
      expect(result).toEqual(mockResponse)
    })

    it('should create user with default role', async () => {
      const createData: CreateUserData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      }

      await userService.createUser(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/users', createData)
    })
  })

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateData: UpdateUserData = {
        name: 'John Smith',
        role: 'ADMIN'
      }

      const mockResponse = {
        success: true,
        data: { user: { ...mockUser, ...updateData } }
      }
      mockApiClient.put.mockResolvedValue(mockResponse)

      const result = await userService.updateUser('user-1', updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/users/user-1', updateData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockResponse = { success: true }
      mockApiClient.delete.mockResolvedValue(mockResponse)

      const result = await userService.deleteUser('user-1')

      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/user-1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getUserStats', () => {
    it('should fetch user statistics', async () => {
      const mockStats = {
        taskStats: {
          total: 10,
          completed: 7,
          completionRate: 70,
          totalCO2: 25.5,
          byStatus: []
        },
        projectStats: {
          total: 3,
          projects: []
        }
      }

      const mockResponse = {
        success: true,
        data: mockStats
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await userService.getUserStats('user-1')

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/user-1/stats')
      expect(result).toEqual(mockResponse)
    })
  })
})
