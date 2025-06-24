import request from 'supertest'
import express from 'express'
import { TaskTypeEnum, Priority, Status } from '@prisma/client'
import statsRouter from '../stats'
import { mockPrisma } from '../../test/setup'

// Mock des middleware de validation
jest.mock('../../utils/validators', () => ({
  validate: () => (req: any, res: any, next: any) => {
    req.validatedData = req.body || req.query || req.params
    next()
  }
}))

const app = express()
app.use(express.json())
app.use('/api/stats', statsRouter)

describe('Stats Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/stats/dashboard', () => {
    it('should return dashboard statistics', async () => {
      // Mock des données pour les statistiques du dashboard
      mockPrisma.user.count.mockResolvedValue(10)
      mockPrisma.project.count.mockResolvedValue(5)
      mockPrisma.task.count
        .mockResolvedValueOnce(25) // total tasks
        .mockResolvedValueOnce(15) // completed tasks

      // Mock pour les projets avec CO2
      mockPrisma.project.findMany.mockResolvedValue([
        { id: 'proj1', name: 'Project 1', totalCO2: 10.0 },
        { id: 'proj2', name: 'Project 2', totalCO2: 5.0 },
      ])

      // Mock pour les tâches par type
      mockPrisma.task.groupBy.mockResolvedValue([
        { type: TaskTypeEnum.LIGHT, _sum: { co2Emissions: 2.0 } },
        { type: TaskTypeEnum.TECHNICAL, _sum: { co2Emissions: 8.0 } },
        { type: TaskTypeEnum.INTENSIVE, _sum: { co2Emissions: 5.0 } },
      ])

      // Mock pour les requêtes SQL
      mockPrisma.$queryRaw.mockResolvedValue([
        { month: 'Jan', co2amount: '5.0' },
        { month: 'Feb', co2amount: '10.0' },
      ])

      const response = await request(app)
        .get('/api/stats/dashboard')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalUsers).toBe(10)
      expect(response.body.data.totalProjects).toBe(5)
      expect(response.body.data.totalTasks).toBe(25)
      expect(response.body.data.completedTasks).toBe(15)
      expect(response.body.data.co2Stats).toBeDefined()
      expect(response.body.data.co2Stats.totalCO2).toBe(15.0)
    })

    it('should handle empty database', async () => {
      // Mock pour une base de données vide
      mockPrisma.user.count.mockResolvedValue(0)
      mockPrisma.project.count.mockResolvedValue(0)
      mockPrisma.task.count.mockResolvedValue(0)
      mockPrisma.project.findMany.mockResolvedValue([])
      mockPrisma.task.groupBy.mockResolvedValue([])
      mockPrisma.$queryRaw.mockResolvedValue([])

      const response = await request(app)
        .get('/api/stats/dashboard')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.totalUsers).toBe(0)
      expect(response.body.data.totalProjects).toBe(0)
      expect(response.body.data.totalTasks).toBe(0)
      expect(response.body.data.completedTasks).toBe(0)
      expect(response.body.data.co2Stats.totalCO2).toBe(0)
    })
  })

  describe('GET /api/stats/co2-trends', () => {
    it('should return CO2 trends', async () => {
      // Mock pour les tendances CO2
      mockPrisma.$queryRaw.mockResolvedValue([
        { period: 'Jan 2024', co2amount: '15.5', taskcount: '10' },
        { period: 'Feb 2024', co2amount: '20.0', taskcount: '15' },
        { period: 'Mar 2024', co2amount: '12.5', taskcount: '8' },
      ])

      const response = await request(app)
        .get('/api/stats/co2-trends')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.trends).toHaveLength(3)
      expect(response.body.data.trends[0].period).toBe('Jan 2024')
      expect(response.body.data.trends[0].co2Amount).toBe(15.5)
      expect(response.body.data.trends[0].taskCount).toBe(10)
    })

    it('should handle different periods', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([])

      const response = await request(app)
        .get('/api/stats/co2-trends?period=1year')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.trends).toHaveLength(0)
    })
  })

  describe('GET /api/stats/project/:id', () => {
    it('should return project statistics', async () => {
      const projectId = 'clp123456789abcdef01'

      // Mock du projet
      mockPrisma.project.findUnique.mockResolvedValue({
        id: projectId,
        name: 'Test Project',
        totalCO2: 25.5,
        _count: { tasks: 10, members: 3 }
      })

      // Mock des statistiques de tâches
      mockPrisma.task.groupBy.mockResolvedValue([
        { status: Status.TODO, type: null, priority: null, _count: 3, _sum: { co2Emissions: 5.0, estimatedHours: 15, actualHours: 0 } },
        { status: Status.DONE, type: null, priority: null, _count: 7, _sum: { co2Emissions: 20.5, estimatedHours: 35, actualHours: 30 } },
      ])

      // Mock des requêtes SQL
      mockPrisma.$queryRaw.mockResolvedValue([
        { week: '2024-01-01', co2amount: '10.0' },
        { week: '2024-01-08', co2amount: '15.5' },
      ])

      // Mock des utilisateurs
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user1', name: 'John Doe' },
        { id: 'user2', name: 'Jane Smith' },
      ])

      const response = await request(app)
        .get(`/api/stats/project/${projectId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.project.id).toBe(projectId)
      expect(response.body.data.project.totalCO2).toBe(25.5)
      expect(response.body.data.taskStats).toBeDefined()
      expect(response.body.data.co2Evolution).toHaveLength(2)
    })

    it('should return 404 for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/stats/project/clp123456789abcdef99')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBe('Projet non trouvé')
    })
  })

  describe('GET /api/stats/user/:id', () => {
    it('should return user statistics', async () => {
      const userId = 'clp123456789abcdef01'

      // Mock de l'utilisateur
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'MEMBER'
      })

      // Mock des statistiques de tâches
      mockPrisma.task.groupBy.mockResolvedValue([
        { status: Status.TODO, type: TaskTypeEnum.TECHNICAL, _count: 3, _sum: { co2Emissions: 5.0, estimatedHours: 15, actualHours: 0 } },
        { status: Status.DONE, type: TaskTypeEnum.LIGHT, _count: 7, _sum: { co2Emissions: 2.5, estimatedHours: 10, actualHours: 8 } },
      ])

      // Mock des projets
      mockPrisma.project.findMany.mockResolvedValue([
        { id: 'proj1', name: 'Project 1', totalCO2: 15.0, _count: { tasks: 5 } },
        { id: 'proj2', name: 'Project 2', totalCO2: 10.0, _count: { tasks: 3 } },
      ])

      // Mock des requêtes SQL
      mockPrisma.$queryRaw.mockResolvedValue([
        { month: 'Jan', co2amount: '5.0' },
        { month: 'Feb', co2amount: '2.5' },
      ])

      const response = await request(app)
        .get(`/api/stats/user/${userId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.id).toBe(userId)
      expect(response.body.data.taskStats.total).toBe(10)
      expect(response.body.data.taskStats.completed).toBe(7)
      expect(response.body.data.projectStats.total).toBe(2)
      expect(response.body.data.co2Evolution).toHaveLength(2)
    })

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/stats/user/clp123456789abcdef99')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toBe('Utilisateur non trouvé')
    })
  })
})
