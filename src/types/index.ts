export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  ownerId: string;
  owner: User;
  members: User[];
  tasks: Task[];
  totalCO2: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  assignee: User;
  projectId: string;
  project: Project;
  estimatedHours: number;
  actualHours: number;
  co2Emissions: number;
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 'LIGHT' | 'TECHNICAL' | 'INTENSIVE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface TaskTypeInfo {
  label: string;
  description: string;
  co2PerHour: number;
  examples: string[];
}

export const TASK_TYPES: Record<TaskType, TaskTypeInfo> = {
  LIGHT: {
    label: 'Bureautique légère',
    description: 'Tâches de bureau standard',
    co2PerHour: 0.1,
    examples: ['Rédaction de documents', 'Réunions en ligne', 'Emails']
  },
  TECHNICAL: {
    label: 'Technique',
    description: 'Développement et conception',
    co2PerHour: 1.0,
    examples: ['Développement', 'Conception graphique', 'Tests']
  },
  INTENSIVE: {
    label: 'Forte intensité',
    description: 'Calculs lourds et rendu',
    co2PerHour: 3.5,
    examples: ['Simulation', 'Rendu vidéo', 'Calculs lourds']
  }
};

export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: 'Faible', color: 'text-green-600' },
  MEDIUM: { label: 'Moyenne', color: 'text-yellow-600' },
  HIGH: { label: 'Élevée', color: 'text-orange-600' },
  URGENT: { label: 'Urgente', color: 'text-red-600' }
};

export const TASK_STATUSES: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: 'À faire', color: 'text-gray-600' },
  IN_PROGRESS: { label: 'En cours', color: 'text-blue-600' },
  REVIEW: { label: 'En révision', color: 'text-purple-600' },
  DONE: { label: 'Terminé', color: 'text-green-600' }
};

// Types pour les statistiques
export interface CO2Stats {
  totalCO2: number;
  co2ByProject: Array<{
    projectId: string;
    projectName: string;
    co2Amount: number;
  }>;
  co2ByMonth: Array<{
    month: string;
    co2Amount: number;
  }>;
  co2ByTaskType: Array<{
    taskType: TaskType;
    co2Amount: number;
  }>;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  totalUsers: number;
  co2Stats: CO2Stats;
}
