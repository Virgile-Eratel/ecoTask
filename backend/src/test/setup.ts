import { PrismaClient } from '@prisma/client'
import { beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals'

// Mock de Prisma pour les tests
export const mockPrisma: any = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  projectMember: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
  $queryRaw: jest.fn(),
  $transaction: jest.fn(async (callback: any) => {
    // Simuler une transaction en appelant le callback avec le mock prisma
    if (typeof callback === 'function') {
      return await callback(mockPrisma)
    }
    return callback
  }),
}

// Mock du module database
jest.mock('../utils/database', () => ({
  __esModule: true,
  default: mockPrisma,
  prisma: mockPrisma,
}))

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test.db'
process.env.JWT_SECRET = 'test-secret'

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks()
})

// Configuration globale pour les tests
beforeAll(() => {
  // Configuration des timeouts
  jest.setTimeout(10000)
})

afterAll(() => {
  // Nettoyage final
  jest.restoreAllMocks()
})
