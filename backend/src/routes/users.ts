import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createUserSchema, updateUserSchema, idParamSchema, paginationSchema } from '../utils/validators';
import prisma from '../utils/database';

const router = express.Router();

// GET /api/users - Récupérer tous les utilisateurs
router.get('/', validate(paginationSchema), asyncHandler(async (req: any, res: any) => {
  const { page, limit } = req.validatedData;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            ownedProjects: true,
            assignedTasks: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      ownedProjects: {
        select: {
          id: true,
          name: true,
          totalCO2: true,
        },
      },
      assignedTasks: {
        select: {
          id: true,
          title: true,
          status: true,
          co2Emissions: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          ownedProjects: true,
          assignedTasks: true,
          projectMemberships: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'Utilisateur non trouvé' },
    });
  }

  res.json({
    success: true,
    data: { user },
  });
}));

// POST /api/users - Créer un nouvel utilisateur
router.post('/', validate(createUserSchema), asyncHandler(async (req: any, res: any) => {
  const userData = req.validatedData;

  const user = await prisma.user.create({
    data: userData,
  });

  res.status(201).json({
    success: true,
    data: { user },
    message: 'Utilisateur créé avec succès',
  });
}));

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', validate(idParamSchema.merge(updateUserSchema)), asyncHandler(async (req: any, res: any) => {
  const { id, ...updateData } = req.validatedData;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    data: { user },
    message: 'Utilisateur mis à jour avec succès',
  });
}));

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  await prisma.user.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Utilisateur supprimé avec succès',
  });
}));

// GET /api/users/:id/stats - Statistiques d'un utilisateur
router.get('/:id/stats', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'Utilisateur non trouvé' },
    });
  }

  const [taskStats, projectStats] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: id },
      _count: true,
      _sum: {
        co2Emissions: true,
        estimatedHours: true,
        actualHours: true,
      },
    }),
    prisma.project.findMany({
      where: { ownerId: id },
      select: {
        id: true,
        name: true,
        totalCO2: true,
        _count: {
          select: { tasks: true },
        },
      },
    }),
  ]);

  const totalCO2 = taskStats.reduce((sum, stat) => sum + (stat._sum.co2Emissions || 0), 0);
  const totalTasks = taskStats.reduce((sum, stat) => sum + stat._count, 0);
  const completedTasks = taskStats.find(stat => stat.status === 'DONE')?._count || 0;

  res.json({
    success: true,
    data: {
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalCO2: Number(totalCO2.toFixed(2)),
        byStatus: taskStats,
      },
      projectStats: {
        total: projectStats.length,
        projects: projectStats,
      },
    },
  });
}));

export default router;
