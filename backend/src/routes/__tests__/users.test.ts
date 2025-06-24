import request from 'supertest'
import express from 'express'
import { Role } from '@prisma/client'
import usersRouter from '../users'
import { mockPrisma } from '../../test/setup'

// Mock des middleware de validation
jest.mock('../../utils/validators', () => ({
  validate: () => (req: any, res: any, next: any) => {
    // Simuler la validation selon le type de route
    let data: any = {}

    // Pour les routes GET (pagination)
    if (req.method === 'GET') {
      data = { ...req.query, ...req.params }
      // Convertir les paramètres de pagination
      if (data.page) data.page = parseInt(data.page) || 1
      if (data.limit) data.limit = parseInt(data.limit) || 10
      // Valeurs par défaut pour la pagination
      if (!data.page) data.page = 1
      if (!data.limit) data.limit = 10
    } else {
      // Pour les routes POST/PUT/DELETE (pas de pagination)
      data = { ...req.body, ...req.params }
    }

    req.validatedData = data
    next()
  },
  idParamSchema: {
    parse: (data: any) => data,
    merge: (schema: any) => ({
      parse: (data: any) => data
    })
  },
  createUserSchema: {
    parse: (data: any) => data
  },
  updateUserSchema: {
    parse: (data: any) => data
  },
  paginationSchema: {
    parse: (data: any) => data
  }
}))

const app = express()
app.use(express.json())
app.use('/api/users', usersRouter)

describe('Users Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    id: 'clp123456789abcdef01',
    name: 'John Doe',
    email: 'john@example.com',
    role: Role.MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('GET /api/users', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser]
      const mockCount = 1

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(mockCount)

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.users).toHaveLength(1)
      expect(response.body.data.pagination.total).toBe(1)
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const response = await request(app)
        .get('/api/users/clp123456789abcdef01')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.id).toBe('clp123456789abcdef01')
    })

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/users/clp123456789abcdef99')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBe('Utilisateur non trouvé')
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUserData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: Role.MEMBER,
      }

      const createdUser = {
        ...mockUser,
        ...newUserData,
      }

      mockPrisma.user.create.mockResolvedValue(createdUser)

      const response = await request(app)
        .post('/api/users')
        .send(newUserData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.name).toBe('Jane Doe')
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      const updateData = {
        name: 'John Smith',
        role: Role.ADMIN,
      }

      const updatedUser = {
        ...mockUser,
        ...updateData,
      }

      mockPrisma.user.update.mockResolvedValue(updatedUser)

      const response = await request(app)
        .put('/api/users/clp123456789abcdef01')
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.name).toBe('John Smith')
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser)

      const response = await request(app)
        .delete('/api/users/clp123456789abcdef01')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Utilisateur supprimé avec succès')
    })
  })

  // Test de statistiques utilisateur supprimé car la route n'existe pas
})
