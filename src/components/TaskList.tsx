import { useState, useEffect, useRef } from 'react';
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
import type { User, Project } from '../types';
import type { PaginatedResponse } from '../services/api';
import { useApiList, useApiMutation, useApiData } from '../hooks/useApi';
import { taskService, type CreateTaskData, type UpdateTaskData } from '../services/taskService';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Search } from 'lucide-react';

export function TaskList() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TaskType | 'ALL'>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Hooks pour les données API
  const {
    items: tasks,
    loading: tasksLoading,
    error: tasksError,
    fetchItems: fetchTasks,
    addItem: addTaskToList,
    updateItem: updateTaskInList,
    removeItem: removeTaskFromList,
  } = useApiList<Task>();

  const { data: usersData, loading: usersLoading } = useApiData<PaginatedResponse<User>>(
    () => userService.getUsers({ limit: 100 })
  );

  const { data: projectsData, loading: projectsLoading } = useApiData<PaginatedResponse<Project>>(
    () => projectService.getProjects({ limit: 100 })
  );

  const { mutate: createTask, loading: createLoading } = useApiMutation<{ task: Task }>();
  const { mutate: updateTask, loading: updateLoading } = useApiMutation<{ task: Task }>();
  const { mutate: deleteTask, loading: deleteLoading } = useApiMutation<void>();

  const users: User[] = usersData?.users || [];
  const projects: Project[] = projectsData?.projects || [];

  // Debounce la recherche
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  // Charger les tâches au montage et quand les filtres changent
  useEffect(() => {
    const filters: any = { limit: 50 };
    if (debouncedSearch) filters.search = debouncedSearch;
    if (filterStatus !== 'ALL') filters.status = filterStatus;
    if (filterPriority !== 'ALL') filters.priority = filterPriority;
    if (filterType !== 'ALL') filters.type = filterType;
    if (filterProject !== 'ALL') filters.projectId = filterProject;

    fetchTasks(() => taskService.getTasks(filters));
  }, [debouncedSearch, filterStatus, filterPriority, filterType, filterProject, fetchTasks]);

  // Les tâches sont déjà filtrées côté serveur
  const filteredTasks = tasks;

  const handleCreateTask = async (taskData: Partial<Task>) => {
    const createData: CreateTaskData = {
      title: taskData.title!,
      description: taskData.description,
      type: taskData.type!,
      priority: taskData.priority!,
      assigneeId: taskData.assigneeId!,
      projectId: taskData.projectId!,
      estimatedHours: taskData.estimatedHours!,
      dueDate: taskData.dueDate!.toISOString(),
    };

    const result = await createTask(
      () => taskService.createTask(createData),
      (data) => {
        addTaskToList(data.task);
        setShowForm(false);
      }
    );
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;

    const updateData: UpdateTaskData = {};
    if (taskData.title) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.type) updateData.type = taskData.type;
    if (taskData.priority) updateData.priority = taskData.priority;
    if (taskData.status) updateData.status = taskData.status;
    if (taskData.assigneeId) updateData.assigneeId = taskData.assigneeId;
    if (taskData.projectId) updateData.projectId = taskData.projectId;
    if (taskData.estimatedHours) updateData.estimatedHours = taskData.estimatedHours;
    if (taskData.actualHours !== undefined) updateData.actualHours = taskData.actualHours;
    if (taskData.dueDate) updateData.dueDate = taskData.dueDate.toISOString();

    const result = await updateTask(
      () => taskService.updateTask(editingTask.id, updateData),
      (data) => {
        updateTaskInList(editingTask.id, data.task);
        setEditingTask(null);
        setShowForm(false);
      }
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTask) return;

    await deleteTask(
      () => taskService.deleteTask(deletingTask.id),
      () => {
        // Fermer la modale
        setDeletingTask(null);
        // Refetch pour garantir la cohérence
        const filters: any = { limit: 50 };
        if (debouncedSearch) filters.search = debouncedSearch;
        if (filterStatus !== 'ALL') filters.status = filterStatus;
        if (filterPriority !== 'ALL') filters.priority = filterPriority;
        if (filterType !== 'ALL') filters.type = filterType;
        if (filterProject !== 'ALL') filters.projectId = filterProject;
        fetchTasks(() => taskService.getTasks(filters));
      }
    );
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(
      () => taskService.updateTaskStatus(taskId, status),
      (data) => {
        updateTaskInList(taskId, data.task);
      }
    );
  };

  // Gestion du loading et des erreurs
  if (tasksLoading || usersLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement des tâches...</div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Erreur: {tasksError}</div>
      </div>
    );
  }

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
          users={users}
          projects={projects}
          loading={createLoading || updateLoading}
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

      {/* Dialog de confirmation de suppression */}
      {deletingTask && (
        <ConfirmDialog
          title="Supprimer la tâche"
          message={`Êtes-vous sûr de vouloir supprimer la tâche "${deletingTask.title}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          onConfirm={confirmDeleteTask}
          onCancel={() => setDeletingTask(null)}
          loading={deleteLoading}
          variant="danger"
        />
      )}
    </div>
  );
}
