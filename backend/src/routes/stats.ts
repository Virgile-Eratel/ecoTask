import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import prisma from '../utils/database';

const router = express.Router();

// GET /api/stats/dashboard - Statistiques du tableau de bord
router.get('/dashboard', asyncHandler(async (req: any, res: any) => {
  const [
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    co2ByProject,
    co2ByTaskType,
    co2ByMonth,
  ] = await Promise.all([
    // Nombre total d'utilisateurs
    prisma.user.count(),
    
    // Nombre total de projets
    prisma.project.count(),
    
    // Nombre total de tâches
    prisma.task.count(),
    
    // Nombre de tâches terminées
    prisma.task.count({
      where: { status: 'DONE' },
    }),
    
    // CO2 par projet
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        totalCO2: true,
      },
      orderBy: { totalCO2: 'desc' },
      take: 10,
    }),
    
    // CO2 par type de tâche
    prisma.task.groupBy({
      by: ['type'],
      _sum: {
        co2Emissions: true,
      },
    }),
    
    // CO2 par mois (derniers 6 mois)
    prisma.$queryRaw`
      SELECT
        strftime('%m', createdAt) as month,
        SUM(co2Emissions) as co2Amount
      FROM tasks
      WHERE createdAt >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY strftime('%Y-%m', createdAt)
    `,
  ]);

  // Calculer le CO2 total
  const totalCO2 = co2ByProject.reduce((sum, project) => sum + project.totalCO2, 0);

  // Formater les données pour le frontend
  const dashboardStats = {
    totalTasks,
    completedTasks,
    totalProjects,
    totalUsers,
    co2Stats: {
      totalCO2: Number(totalCO2.toFixed(2)),
      co2ByProject: co2ByProject.map(project => ({
        projectId: project.id,
        projectName: project.name,
        co2Amount: Number(project.totalCO2.toFixed(2)),
      })),
      co2ByTaskType: co2ByTaskType.map(item => ({
        taskType: item.type,
        co2Amount: Number((item._sum.co2Emissions || 0).toFixed(2)),
      })),
      co2ByMonth: (co2ByMonth as any[]).map(item => ({
        month: item.month,
        co2Amount: Number(parseFloat(item.co2amount || '0').toFixed(2)),
      })),
    },
  };

  res.json({
    success: true,
    data: dashboardStats,
  });
}));

// GET /api/stats/co2-trends - Tendances CO2
router.get('/co2-trends', asyncHandler(async (req: any, res: any) => {
  const { period = '6months' } = req.query;

  let interval = '6 months';
  let dateFormat = 'Mon YYYY';
  
  if (period === '1year') {
    interval = '1 year';
    dateFormat = 'Mon YYYY';
  } else if (period === '3months') {
    interval = '3 months';
    dateFormat = 'Mon DD';
  }

  // Exécuter la requête selon la période
  let trends;
  if (period === '1year') {
    trends = await prisma.$queryRaw`
      SELECT
        strftime('%Y-%m', createdAt) as period,
        SUM(co2Emissions) as co2Amount,
        COUNT(*) as taskCount
      FROM tasks
      WHERE createdAt >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY strftime('%Y-%m', createdAt)
    `;
  } else if (period === '3months') {
    trends = await prisma.$queryRaw`
      SELECT
        strftime('%Y-%m', createdAt) as period,
        SUM(co2Emissions) as co2Amount,
        COUNT(*) as taskCount
      FROM tasks
      WHERE createdAt >= datetime('now', '-3 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY strftime('%Y-%m', createdAt)
    `;
  } else {
    trends = await prisma.$queryRaw`
      SELECT
        strftime('%Y-%m', createdAt) as period,
        SUM(co2Emissions) as co2Amount,
        COUNT(*) as taskCount
      FROM tasks
      WHERE createdAt >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY strftime('%Y-%m', createdAt)
    `;
  }

  res.json({
    success: true,
    data: {
      trends: (trends as any[]).map(item => ({
        period: item.period,
        co2Amount: Number(parseFloat(item.co2amount || '0').toFixed(2)),
        taskCount: parseInt(item.taskcount || '0'),
      })),
    },
  });
}));

// GET /api/stats/project/:id - Statistiques d'un projet
router.get('/project/:id', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;

  const [
    project,
    taskStats,
    co2Evolution,
    memberStats,
  ] = await Promise.all([
    // Informations du projet
    prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
      },
    }),
    
    // Statistiques des tâches
    prisma.task.groupBy({
      by: ['status', 'type', 'priority'],
      where: { projectId: id },
      _count: true,
      _sum: {
        co2Emissions: true,
        estimatedHours: true,
        actualHours: true,
      },
    }),
    
    // Évolution CO2 du projet
    prisma.$queryRaw`
      SELECT
        strftime('%Y-%W', createdAt) as week,
        SUM(co2Emissions) as co2Amount
      FROM tasks
      WHERE projectId = ${id}
        AND createdAt >= datetime('now', '-3 months')
      GROUP BY strftime('%Y-%W', createdAt)
      ORDER BY strftime('%Y-%W', createdAt)
    `,
    
    // Statistiques par membre
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: { projectId: id },
      _count: true,
      _sum: {
        co2Emissions: true,
      },
    }),
  ]);

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { message: 'Projet non trouvé' },
    });
  }

  // Enrichir les statistiques des membres avec les noms
  const memberIds = memberStats.map(stat => stat.assigneeId);
  const members = await prisma.user.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, name: true },
  });

  const enrichedMemberStats = memberStats.map(stat => {
    const member = members.find(m => m.id === stat.assigneeId);
    return {
      userId: stat.assigneeId,
      userName: member?.name || 'Utilisateur inconnu',
      taskCount: stat._count,
      co2Amount: Number((stat._sum.co2Emissions || 0).toFixed(2)),
    };
  });

  res.json({
    success: true,
    data: {
      project: {
        id: project.id,
        name: project.name,
        totalCO2: Number(project.totalCO2.toFixed(2)),
        taskCount: project._count.tasks,
        memberCount: project._count.members,
      },
      taskStats: {
        byStatus: taskStats.filter(stat => stat.status),
        byType: taskStats.filter(stat => stat.type),
        byPriority: taskStats.filter(stat => stat.priority),
      },
      co2Evolution: (co2Evolution as any[]).map(item => ({
        week: item.week,
        co2Amount: Number(parseFloat(item.co2amount || '0').toFixed(2)),
      })),
      memberStats: enrichedMemberStats,
    },
  });
}));

// GET /api/stats/user/:id - Statistiques d'un utilisateur
router.get('/user/:id', asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;

  const [
    user,
    taskStats,
    projectStats,
    co2Evolution,
  ] = await Promise.all([
    // Informations utilisateur
    prisma.user.findUnique({
      where: { id },
    }),
    
    // Statistiques des tâches assignées
    prisma.task.groupBy({
      by: ['status', 'type'],
      where: { assigneeId: id },
      _count: true,
      _sum: {
        co2Emissions: true,
        estimatedHours: true,
        actualHours: true,
      },
    }),
    
    // Projets de l'utilisateur
    prisma.project.findMany({
      where: {
        OR: [
          { ownerId: id },
          { members: { some: { userId: id } } },
        ],
      },
      select: {
        id: true,
        name: true,
        totalCO2: true,
        _count: {
          select: { tasks: true },
        },
      },
    }),
    
    // Évolution CO2 de l'utilisateur
    prisma.$queryRaw`
      SELECT
        strftime('%m', createdAt) as month,
        SUM(co2Emissions) as co2Amount
      FROM tasks
      WHERE assigneeId = ${id}
        AND createdAt >= datetime('now', '-6 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY strftime('%Y-%m', createdAt)
    `,
  ]);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: 'Utilisateur non trouvé' },
    });
  }

  const totalCO2 = taskStats.reduce((sum, stat) => sum + (stat._sum.co2Emissions || 0), 0);
  const totalTasks = taskStats.reduce((sum, stat) => sum + stat._count, 0);
  const completedTasks = taskStats.find(stat => stat.status === 'DONE')?._count || 0;

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalCO2: Number(totalCO2.toFixed(2)),
        byStatus: taskStats.filter(stat => stat.status),
        byType: taskStats.filter(stat => stat.type),
      },
      projectStats: {
        total: projectStats.length,
        projects: projectStats.map(project => ({
          ...project,
          totalCO2: Number(project.totalCO2.toFixed(2)),
        })),
      },
      co2Evolution: (co2Evolution as any[]).map(item => ({
        month: item.month,
        co2Amount: Number(parseFloat(item.co2amount || '0').toFixed(2)),
      })),
    },
  });
}));

export default router;
