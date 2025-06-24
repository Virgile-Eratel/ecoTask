import { describe, it, expect, beforeEach } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import { Role, TaskTypeEnum, Priority, Status } from '@prisma/client'
import {
  createUserSchema,
  updateUserSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  paginationSchema,
  taskFilterSchema,
  projectFilterSchema,
  idParamSchema,
  validate,
} from '../validators'

describe('Validators', () => {
  describe('createUserSchema', () => {
    it('should validate correct user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.MEMBER,
      }

      const result = createUserSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should use default role when not provided', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      const result = createUserSchema.parse(data)
      expect(result.role).toBe(Role.MEMBER)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
      }

      expect(() => createUserSchema.parse(invalidData)).toThrow()
    })

    it('should reject short name', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
      }

      expect(() => createUserSchema.parse(invalidData)).toThrow()
    })

    it('should reject long name', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        email: 'john@example.com',
      }

      expect(() => createUserSchema.parse(invalidData)).toThrow()
    })
  })

  describe('createProjectSchema', () => {
    it('should validate correct project data', () => {
      const validData = {
        name: 'Test Project',
        description: 'Test Description',
        color: '#10b981',
        memberIds: ['user1', 'user2'],
      }

      const result = createProjectSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should work without optional fields', () => {
      const data = {
        name: 'Test Project',
      }

      const result = createProjectSchema.parse(data)
      expect(result.name).toBe('Test Project')
      expect(result.description).toBeUndefined()
    })

    it('should reject invalid color format', () => {
      const invalidData = {
        name: 'Test Project',
        color: 'invalid-color',
      }

      expect(() => createProjectSchema.parse(invalidData)).toThrow()
    })

    it('should reject short name', () => {
      const invalidData = {
        name: 'T',
      }

      expect(() => createProjectSchema.parse(invalidData)).toThrow()
    })
  })

  describe('createTaskSchema', () => {
    it('should validate correct task data', () => {
      const validData = {
        title: 'Test Task',
        description: 'Test Description',
        type: TaskTypeEnum.TECHNICAL,
        priority: Priority.HIGH,
        assigneeId: 'clp123456789abcdef01',
        projectId: 'clp123456789abcdef02',
        estimatedHours: 5,
        dueDate: '2024-12-31T00:00:00Z',
      }

      const result = createTaskSchema.parse(validData)
      expect(result).toEqual({
        ...validData,
        status: Status.TODO, // Le schéma ajoute automatiquement le status par défaut
      })
    })

    it('should use default values', () => {
      const data = {
        title: 'Test Task',
        type: TaskTypeEnum.TECHNICAL,
        priority: Priority.MEDIUM,
        assigneeId: 'clp123456789abcdef01',
        projectId: 'clp123456789abcdef02',
        estimatedHours: 5,
        dueDate: '2024-12-31T00:00:00Z',
      }

      const result = createTaskSchema.parse(data)
      expect(result.type).toBe(TaskTypeEnum.TECHNICAL)
      expect(result.priority).toBe(Priority.MEDIUM)
      expect(result.status).toBe(Status.TODO)
    })

    it('should reject negative estimated hours', () => {
      const invalidData = {
        title: 'Test Task',
        assigneeId: 'user1',
        projectId: 'project1',
        estimatedHours: -1,
        dueDate: '2024-12-31T00:00:00Z',
      }

      expect(() => createTaskSchema.parse(invalidData)).toThrow()
    })

    it('should reject excessive estimated hours', () => {
      const invalidData = {
        title: 'Test Task',
        assigneeId: 'user1',
        projectId: 'project1',
        estimatedHours: 1001,
        dueDate: '2024-12-31T00:00:00Z',
      }

      expect(() => createTaskSchema.parse(invalidData)).toThrow()
    })
  })

  describe('paginationSchema', () => {
    it('should parse valid pagination params', () => {
      const data = {
        page: '2',
        limit: '20',
      }

      const result = paginationSchema.parse(data)
      expect(result.page).toBe(2)
      expect(result.limit).toBe(20)
    })

    it('should use default values', () => {
      const result = paginationSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })

    it('should reject invalid page number', () => {
      const invalidData = {
        page: '0',
      }

      expect(() => paginationSchema.parse(invalidData)).toThrow()
    })

    it('should reject excessive limit', () => {
      const invalidData = {
        limit: '101',
      }

      expect(() => paginationSchema.parse(invalidData)).toThrow()
    })
  })

  describe('taskFilterSchema', () => {
    it('should validate task filters', () => {
      const data = {
        status: Status.IN_PROGRESS,
        priority: Priority.HIGH,
        type: TaskTypeEnum.TECHNICAL,
        projectId: 'clp123456789abcdef01',
        assigneeId: 'clp123456789abcdef02',
        search: 'test',
        page: '1',
        limit: '10',
      }

      const result = taskFilterSchema.parse(data)
      expect(result.status).toBe(Status.IN_PROGRESS)
      expect(result.priority).toBe(Priority.HIGH)
      expect(result.type).toBe(TaskTypeEnum.TECHNICAL)
    })

    it('should work with minimal data', () => {
      const result = taskFilterSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })

  describe('idParamSchema', () => {
    it('should validate valid CUID', () => {
      const validId = 'clp123456789abcdef01'
      const result = idParamSchema.parse({ id: validId })
      expect(result.id).toBe(validId)
    })

    it('should reject invalid ID format', () => {
      const invalidData = { id: 'invalid-id' }
      expect(() => idParamSchema.parse(invalidData)).toThrow()
    })
  })

  describe('validate middleware', () => {
    let mockReq: Partial<Request> & { validatedData?: any }
    let mockRes: Partial<Response>
    let mockNext: NextFunction

    beforeEach(() => {
      mockReq = {
        body: {},
        query: {},
        params: {},
      }
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
      mockNext = jest.fn()
    })

    it('should validate and pass valid data', () => {
      const schema = createUserSchema
      const middleware = validate(schema)

      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.validatedData).toBeDefined()
      expect(mockReq.validatedData.name).toBe('John Doe')
    })

    it('should return 400 for invalid data', () => {
      const schema = createUserSchema
      const middleware = validate(schema)

      mockReq.body = {
        name: 'J', // Too short
        email: 'invalid-email',
      }

      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Données invalides',
          details: expect.any(Array),
        },
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should merge body, query, and params', () => {
      const schema = taskFilterSchema
      const middleware = validate(schema)

      mockReq.body = { search: 'test' }
      mockReq.query = { page: '2' }
      mockReq.params = { projectId: 'clp123456789abcdef01' }

      middleware(mockReq as Request, mockRes as Response, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.validatedData.search).toBe('test')
      expect(mockReq.validatedData.page).toBe(2)
      expect(mockReq.validatedData.projectId).toBe('clp123456789abcdef01')
    })
  })
})
