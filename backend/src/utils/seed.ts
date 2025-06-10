import { PrismaClient, TaskTypeEnum, Role, Priority, Status } from '@prisma/client';
import { calculateCO2Emissions } from './co2Calculator';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Nettoyer les données existantes
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();


  console.log('🧹 Données existantes supprimées');

  console.log('📋 Types de tâches définis dans l\'enum');

  // Créer les utilisateurs
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Martin',
        email: 'alice@ecotask.com',
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Dupont',
        email: 'bob@ecotask.com',
        role: Role.MEMBER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Claire Rousseau',
        email: 'claire@ecotask.com',
        role: Role.MEMBER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Chen',
        email: 'david@ecotask.com',
        role: Role.MEMBER,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emma Wilson',
        email: 'emma@ecotask.com',
        role: Role.ADMIN,
      },
    }),
  ]);

  console.log('👥 Utilisateurs créés');

  // Créer les projets
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Site Web Éco-responsable',
        description: 'Développement d\'un site web optimisé pour réduire l\'empreinte carbone numérique',
        color: '#10b981',
        ownerId: users[0].id,
        members: {
          create: [
            { userId: users[0].id },
            { userId: users[1].id },
            { userId: users[2].id },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Application Mobile Verte',
        description: 'App mobile pour sensibiliser aux pratiques écologiques et mesurer l\'impact carbone',
        color: '#059669',
        ownerId: users[1].id,
        members: {
          create: [
            { userId: users[1].id },
            { userId: users[3].id },
            { userId: users[4].id },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Dashboard Analytics CO₂',
        description: 'Tableau de bord pour analyser et visualiser l\'impact environnemental des projets',
        color: '#0d9488',
        ownerId: users[4].id,
        members: {
          create: [
            { userId: users[0].id },
            { userId: users[2].id },
            { userId: users[4].id },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Microservices',
        description: 'Architecture microservices optimisée pour la performance énergétique',
        color: '#0891b2',
        ownerId: users[2].id,
        members: {
          create: [
            { userId: users[1].id },
            { userId: users[2].id },
            { userId: users[3].id },
          ],
        },
      },
    }),
  ]);

  console.log('📁 Projets créés');

  // Créer les tâches
  const taskData = [
    // Projet 1: Site Web Éco-responsable
    {
      title: 'Optimiser les images pour le web',
      description: 'Compresser et optimiser toutes les images pour réduire la bande passante',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      assigneeId: users[1].id,
      projectId: projects[0].id,
      estimatedHours: 6,
      dueDate: new Date('2024-02-15'),
    },
    {
      title: 'Implémenter le lazy loading',
      description: 'Ajouter le chargement paresseux pour améliorer les performances',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.MEDIUM,
      status: Status.TODO,
      assigneeId: users[2].id,
      projectId: projects[0].id,
      estimatedHours: 4,
      dueDate: new Date('2024-02-20'),
    },
    {
      title: 'Rédiger la documentation utilisateur',
      description: 'Créer la documentation complète pour les nouvelles fonctionnalités',
      type: TaskTypeEnum.LIGHT,
      priority: Priority.MEDIUM,
      status: Status.DONE,
      assigneeId: users[0].id,
      projectId: projects[0].id,
      estimatedHours: 8,
      actualHours: 7.5,
      dueDate: new Date('2024-02-10'),
      completedAt: new Date('2024-02-09'),
    },

    // Projet 2: Application Mobile Verte
    {
      title: 'Développer le calculateur carbone',
      description: 'Implémenter l\'algorithme de calcul d\'empreinte carbone',
      type: TaskTypeEnum.INTENSIVE,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      assigneeId: users[3].id,
      projectId: projects[1].id,
      estimatedHours: 12,
      actualHours: 8,
      dueDate: new Date('2024-02-25'),
    },
    {
      title: 'Design de l\'interface utilisateur',
      description: 'Créer les maquettes et prototypes de l\'application mobile',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.HIGH,
      status: Status.DONE,
      assigneeId: users[4].id,
      projectId: projects[1].id,
      estimatedHours: 10,
      actualHours: 11,
      dueDate: new Date('2024-02-05'),
      completedAt: new Date('2024-02-04'),
    },
    {
      title: 'Tests d\'intégration',
      description: 'Écrire et exécuter les tests d\'intégration pour l\'API',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.MEDIUM,
      status: Status.REVIEW,
      assigneeId: users[1].id,
      projectId: projects[1].id,
      estimatedHours: 6,
      actualHours: 5.5,
      dueDate: new Date('2024-02-18'),
    },

    // Projet 3: Dashboard Analytics CO₂
    {
      title: 'Créer les graphiques de visualisation',
      description: 'Implémenter les graphiques pour afficher les données CO₂',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.HIGH,
      status: Status.TODO,
      assigneeId: users[0].id,
      projectId: projects[2].id,
      estimatedHours: 8,
      dueDate: new Date('2024-02-22'),
    },
    {
      title: 'Optimiser les requêtes de base de données',
      description: 'Améliorer les performances des requêtes pour les gros volumes de données',
      type: TaskTypeEnum.INTENSIVE,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      assigneeId: users[2].id,
      projectId: projects[2].id,
      estimatedHours: 15,
      actualHours: 10,
      dueDate: new Date('2024-02-28'),
    },

    // Projet 4: API Microservices
    {
      title: 'Configurer Docker et Kubernetes',
      description: 'Mettre en place l\'infrastructure de déploiement',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.HIGH,
      status: Status.DONE,
      assigneeId: users[3].id,
      projectId: projects[3].id,
      estimatedHours: 12,
      actualHours: 14,
      dueDate: new Date('2024-02-08'),
      completedAt: new Date('2024-02-07'),
    },
    {
      title: 'Implémenter l\'authentification JWT',
      description: 'Sécuriser l\'API avec l\'authentification par tokens JWT',
      type: TaskTypeEnum.TECHNICAL,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      assigneeId: users[1].id,
      projectId: projects[3].id,
      estimatedHours: 8,
      actualHours: 6,
      dueDate: new Date('2024-02-16'),
    },
  ];

  // Créer les tâches avec calcul automatique du CO₂
  const tasks = [];
  for (const task of taskData) {
    const co2Emissions = calculateCO2Emissions(task.type, task.estimatedHours);
    
    const createdTask = await prisma.task.create({
      data: {
        ...task,
        co2Emissions,
      },
    });
    
    tasks.push(createdTask);
  }

  console.log('✅ Tâches créées');

  // Mettre à jour le CO₂ total des projets
  for (const project of projects) {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const totalCO2 = projectTasks.reduce((sum, task) => sum + task.co2Emissions, 0);
    
    await prisma.project.update({
      where: { id: project.id },
      data: { totalCO2: Number(totalCO2.toFixed(2)) },
    });
  }

  console.log('🔄 CO₂ des projets mis à jour');

  // Afficher les statistiques
  const stats = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    totalCO2: tasks.reduce((sum, task) => sum + task.co2Emissions, 0),
  };

  console.log('📊 Statistiques finales:');
  console.log(`   👥 Utilisateurs: ${stats.users}`);
  console.log(`   📁 Projets: ${stats.projects}`);
  console.log(`   ✅ Tâches: ${stats.tasks}`);
  console.log(`   🌱 CO₂ total: ${stats.totalCO2.toFixed(2)} kg`);
  
  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
