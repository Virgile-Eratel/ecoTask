import { z } from 'zod';
import { Role, TaskTypeEnum, Priority, Status } from '@prisma/client';

// User validators
export const createUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Email invalide'),
  role: z.nativeEnum(Role).optional().default(Role.MEMBER),
});

export const updateUserSchema = createUserSchema.partial();

// Project validators
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(200),
  description: z.string().max(1000).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur hexadécimale invalide').optional(),
  memberIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// Task validators
export const createTaskSchema = z.object({
  title: z.string().min(2, 'Le titre doit contenir au moins 2 caractères').max(200),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(TaskTypeEnum),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(Status).optional().default(Status.TODO),
  assigneeId: z.string().cuid('ID assigné invalide'),
  projectId: z.string().cuid('ID projet invalide'),
  estimatedHours: z.number().min(0.1, 'Durée minimale: 0.1h').max(1000, 'Durée maximale: 1000h'),
  dueDate: z.string().datetime('Date d\'échéance invalide'),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  actualHours: z.number().min(0).max(1000).optional(),
  completedAt: z.string().datetime().optional(),
});

// Query validators
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('10'),
});

export const taskFilterSchema = z.object({
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  type: z.nativeEnum(TaskTypeEnum).optional(),
  projectId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
}).merge(paginationSchema);

export const projectFilterSchema = z.object({
  ownerId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
}).merge(paginationSchema);

// ID parameter validator
export const idParamSchema = z.object({
  id: z.string().cuid('ID invalide'),
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const result = schema.parse({
        ...req.body,
        ...req.query,
        ...req.params,
      });
      
      // Séparer les données selon leur source
      req.validatedData = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Données invalides',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
      }
      next(error);
    }
  };
};
