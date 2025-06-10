import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createTaskSchema, updateTaskSchema, idParamSchema, taskFilterSchema } from '../utils/validators';
import { calculateCO2Emissions, calculateProjectCO2 } from '../utils/co2Calculator';
import prisma from '../utils/database';

const router = express.Router();

// GET /api/tasks - Récupérer toutes les tâches
router.get('/', validate(taskFilterSchema), asyncHandler(async (req: any, res: any) => {
  const { page, limit, status, priority, type, projectId, assigneeId, search } = req.validatedData;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (type) where.type = type;
  if (projectId) where.projectId = projectId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// GET /api/tasks/:id - Récupérer une tâche par ID
router.get('/:id', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      project: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: 'Tâche non trouvée' },
    });
  }

  res.json({
    success: true,
    data: { task },
  });
}));

// POST /api/tasks - Créer une nouvelle tâche
router.post('/', validate(createTaskSchema), asyncHandler(async (req: any, res: any) => {
  const { dueDate, ...taskData } = req.validatedData;

  // Calculer les émissions CO2
  const co2Emissions = calculateCO2Emissions(taskData.type, taskData.estimatedHours);

  const task = await prisma.$transaction(async (tx) => {
    // Créer la tâche
    const newTask = await tx.task.create({
      data: {
        ...taskData,
        dueDate: new Date(dueDate),
        co2Emissions,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    // Mettre à jour le CO2 total du projet
    const projectTasks = await tx.task.findMany({
      where: { projectId: taskData.projectId },
      select: { co2Emissions: true },
    });

    const totalCO2 = calculateProjectCO2(projectTasks);

    await tx.project.update({
      where: { id: taskData.projectId },
      data: { totalCO2 },
    });

    return newTask;
  });

  res.status(201).json({
    success: true,
    data: { task },
    message: 'Tâche créée avec succès',
  });
}));

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', validate(idParamSchema.merge(updateTaskSchema)), asyncHandler(async (req: any, res: any) => {
  const { id, dueDate, ...updateData } = req.validatedData;

  const task = await prisma.$transaction(async (tx) => {
    // Récupérer la tâche actuelle
    const currentTask = await tx.task.findUnique({
      where: { id },
      select: { projectId: true, type: true, estimatedHours: true },
    });

    if (!currentTask) {
      throw new Error('Tâche non trouvée');
    }

    // Préparer les données de mise à jour
    const updatePayload: any = { ...updateData };
    
    if (dueDate) {
      updatePayload.dueDate = new Date(dueDate);
    }

    // Recalculer le CO2 si le type ou les heures estimées changent
    if (updateData.type || updateData.estimatedHours) {
      const newType = updateData.type || currentTask.type;
      const newHours = updateData.estimatedHours || currentTask.estimatedHours;
      updatePayload.co2Emissions = calculateCO2Emissions(newType, newHours);
    }

    // Mettre à jour la tâche
    const updatedTask = await tx.task.update({
      where: { id },
      data: updatePayload,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, color: true },
        },
      },
    });

    // Mettre à jour le CO2 total du projet si nécessaire
    if (updateData.type || updateData.estimatedHours) {
      const projectTasks = await tx.task.findMany({
        where: { projectId: currentTask.projectId },
        select: { co2Emissions: true },
      });

      const totalCO2 = calculateProjectCO2(projectTasks);

      await tx.project.update({
        where: { id: currentTask.projectId },
        data: { totalCO2 },
      });
    }

    return updatedTask;
  });

  res.json({
    success: true,
    data: { task },
    message: 'Tâche mise à jour avec succès',
  });
}));

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  await prisma.$transaction(async (tx) => {
    // Récupérer le projet de la tâche avant suppression
    const task = await tx.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!task) {
      throw new Error('Tâche non trouvée');
    }

    // Supprimer la tâche
    await tx.task.delete({
      where: { id },
    });

    // Recalculer le CO2 du projet
    const projectTasks = await tx.task.findMany({
      where: { projectId: task.projectId },
      select: { co2Emissions: true },
    });

    const totalCO2 = calculateProjectCO2(projectTasks);

    await tx.project.update({
      where: { id: task.projectId },
      data: { totalCO2 },
    });
  });

  res.json({
    success: true,
    message: 'Tâche supprimée avec succès',
  });
}));

// PUT /api/tasks/:id/status - Mettre à jour le statut d'une tâche
router.put('/:id/status', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;
  const { status } = req.body;

  const updateData: any = { status };
  
  // Si la tâche est marquée comme terminée, ajouter la date de completion
  if (status === 'DONE') {
    updateData.completedAt = new Date();
  } else if (status !== 'DONE') {
    updateData.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
      project: {
        select: { id: true, name: true, color: true },
      },
    },
  });

  res.json({
    success: true,
    data: { task },
    message: 'Statut de la tâche mis à jour avec succès',
  });
}));

export default router;
