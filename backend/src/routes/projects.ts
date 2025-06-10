import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createProjectSchema, updateProjectSchema, idParamSchema, projectFilterSchema } from '../utils/validators';
import { calculateProjectCO2 } from '../utils/co2Calculator';
import prisma from '../utils/database';

const router = express.Router();

// GET /api/projects - Récupérer tous les projets
router.get('/', validate(projectFilterSchema), asyncHandler(async (req: any, res: any) => {
  const { page, limit, ownerId, search } = req.validatedData;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (ownerId) where.ownerId = ownerId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tasks: true, // Ajout de l'inclusion des tâches
        _count: {
          select: { tasks: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  // Transformer les données pour inclure les membres directement
  const transformedProjects = projects.map((project: { members: any[]; }) => ({
    ...project,
    members: project.members.map(member => member.user),
  }));

  res.json({
    success: true,
    data: {
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

// GET /api/projects/:id - Récupérer un projet par ID
router.get('/:id', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { message: 'Projet non trouvé' },
    });
  }

  // Transformer les données
  const transformedProject = {
    ...project,
    members: project.members.map((member: { user: any; }) => member.user),
  };

  res.json({
    success: true,
    data: { project: transformedProject },
  });
}));

// POST /api/projects - Créer un nouveau projet
router.post('/', validate(createProjectSchema), asyncHandler(async (req: any, res: any) => {
  const { memberIds, ...projectData } = req.validatedData;

  const project = await prisma.project.create({
    data: {
      ...projectData,
      members: memberIds ? {
        create: memberIds.map((userId: string) => ({ userId })),
      } : undefined,
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  // Transformer les données
  const transformedProject = {
    ...project,
    members: project.members.map((member: { user: any; }) => member.user),
  };

  res.status(201).json({
    success: true,
    data: { project: transformedProject },
    message: 'Projet créé avec succès',
  });
}));

// PUT /api/projects/:id - Mettre à jour un projet
router.put('/:id', validate(idParamSchema.merge(updateProjectSchema)), asyncHandler(async (req: any, res: any) => {
  const { id, memberIds, ...updateData } = req.validatedData;

  // Mettre à jour le projet et ses membres
  const project = await prisma.$transaction(async (tx: { project: { update: (arg0: { where: { id: any; }; data: any; }) => any; findUnique: (arg0: { where: { id: any; }; include: { owner: { select: { id: boolean; name: boolean; email: boolean; }; }; members: { include: { user: { select: { id: boolean; name: boolean; email: boolean; }; }; }; }; }; }) => any; }; projectMember: { deleteMany: (arg0: { where: { projectId: any; }; }) => any; createMany: (arg0: { data: any; }) => any; }; }) => {
    // Mettre à jour les données du projet
    const updatedProject = await tx.project.update({
      where: { id },
      data: updateData,
    });

    // Mettre à jour les membres si fournis
    if (memberIds !== undefined) {
      // Supprimer tous les membres existants
      await tx.projectMember.deleteMany({
        where: { projectId: id },
      });

      // Ajouter les nouveaux membres
      if (memberIds.length > 0) {
        await tx.projectMember.createMany({
          data: memberIds.map((userId: string) => ({
            projectId: id,
            userId,
          })),
        });
      }
    }

    // Récupérer le projet avec ses relations
    return tx.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  });

  // Transformer les données
  const transformedProject = {
    ...project,
    members: project!.members.map((member: { user: any; }) => member.user),
  };

  res.json({
    success: true,
    data: { project: transformedProject },
    message: 'Projet mis à jour avec succès',
  });
}));

// DELETE /api/projects/:id - Supprimer un projet
router.delete('/:id', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  await prisma.project.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Projet supprimé avec succès',
  });
}));

// PUT /api/projects/:id/recalculate-co2 - Recalculer le CO2 du projet
router.put('/:id/recalculate-co2', validate(idParamSchema), asyncHandler(async (req: any, res: any) => {
  const { id } = req.validatedData;

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    select: { co2Emissions: true },
  });

  const totalCO2 = calculateProjectCO2(tasks);

  const project = await prisma.project.update({
    where: { id },
    data: { totalCO2 },
  });

  res.json({
    success: true,
    data: { project },
    message: 'CO2 du projet recalculé avec succès',
  });
}));

export default router;
