import { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type TaskType
} from '../types';
import { useStore } from '../store/useStore';
import { Plus, Search } from 'lucide-react';

export function TaskList() {
  const { tasks, addTask, updateTask, deleteTask, users, projects } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');

  // Simuler des données de tâches pour la démo
  useEffect(() => {
    if (tasks.length === 0 && users.length > 0 && projects.length > 0) {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Optimiser les requêtes de base de données',
          description: 'Améliorer les performances des requêtes SQL pour réduire la consommation énergétique',
          type: 'TECHNICAL',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          assigneeId: users[0].id,
          assignee: users[0],
          projectId: projects[0].id,
          project: projects[0],
          estimatedHours: 8,
          actualHours: 5,
          co2Emissions: 8.0,
          dueDate: new Date('2024-02-15'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
        },
        {
          id: '2',
          title: 'Rédiger la documentation utilisateur',
          description: 'Créer la documentation complète pour les nouvelles fonctionnalités',
          type: 'LIGHT',
          priority: 'MEDIUM',
          status: 'TODO',
          assigneeId: users[1] ? users[1].id : users[0].id,
          assignee: users[1] || users[0],
          projectId: projects[0].id,
          project: projects[0],
          estimatedHours: 4,
          actualHours: 0,
          co2Emissions: 0.4,
          dueDate: new Date('2024-02-20'),
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-18'),
        },
      ];
      
      mockTasks.forEach(task => addTask(task));
    }
  }, [tasks.length, users, projects, addTask]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
    const matchesType = filterType === 'ALL' || task.type === filterType;
    const matchesProject = filterProject === 'ALL' || task.projectId === filterProject;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProject;
  });

  const handleCreateTask = (taskData: Partial<Task>) => {
    const user = users.find(u => u.id === taskData.assigneeId);
    const project = projects.find(p => p.id === taskData.projectId);
    
    if (user && project) {
      const newTask: Task = {
        ...taskData,
        assignee: user,
        project: project,
      } as Task;
      
      addTask(newTask);
      setShowForm(false);
    }
  };

  const handleUpdateTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      deleteTask(taskId);
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const updates: Partial<Task> = { status };
    if (status === 'DONE') {
      updates.completedAt = new Date();
    }
    updateTask(taskId, updates);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <TaskForm
          task={editingTask || undefined}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des tâches</h1>
          <p className="text-muted-foreground">
            Gérez vos tâches et suivez leur impact environnemental
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des tâches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}>
          <option value="ALL">Tous les statuts</option>
          {Object.entries(TASK_STATUSES).map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </Select>

        <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'ALL')}>
          <option value="ALL">Toutes les priorités</option>
          {Object.entries(TASK_PRIORITIES).map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </Select>

        <Select value={filterType} onChange={(e) => setFilterType(e.target.value as TaskType | 'ALL')}>
          <option value="ALL">Tous les types</option>
          {Object.entries(TASK_TYPES).map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </Select>

        <Select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="ALL">Tous les projets</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </Select>
      </div>

      {/* Liste des tâches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">Aucune tâche trouvée</p>
            <p className="text-sm text-muted-foreground mt-2">
              {tasks.length === 0 
                ? "Créez votre première tâche pour commencer"
                : "Essayez de modifier vos filtres de recherche"
              }
            </p>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      {filteredTasks.length > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{filteredTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tâches affichées</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {filteredTasks.filter(t => t.status === 'DONE').length}
              </div>
              <div className="text-sm text-muted-foreground">Terminées</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {filteredTasks.reduce((sum, t) => sum + t.estimatedHours, 0)}h
              </div>
              <div className="text-sm text-muted-foreground">Temps estimé</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {filteredTasks.reduce((sum, t) => sum + t.co2Emissions, 0).toFixed(1)} kg
              </div>
              <div className="text-sm text-muted-foreground">CO₂ total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
