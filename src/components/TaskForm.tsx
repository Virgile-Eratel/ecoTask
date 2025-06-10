import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import {
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskType,
  type TaskPriority,
  type TaskStatus,
  type Task,
  type User,
  type Project
} from '../types';
import { calculateCO2Emissions } from '../lib/utils';
import { CO2Indicator } from './CO2Indicator';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  users: User[];
  projects: Project[];
  loading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, users, projects, loading = false }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'TECHNICAL' as TaskType,
    priority: task?.priority || 'MEDIUM' as TaskPriority,
    status: task?.status || 'TODO' as TaskStatus,
    assigneeId: task?.assigneeId || '',
    projectId: task?.projectId || '',
    estimatedHours: task?.estimatedHours || 1,
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
  });

  const [calculatedCO2, setCalculatedCO2] = useState(0);

  useEffect(() => {
    const co2 = calculateCO2Emissions(formData.type, formData.estimatedHours);
    setCalculatedCO2(co2);
  }, [formData.type, formData.estimatedHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<Task> = {
      ...formData,
      dueDate: new Date(formData.dueDate),
      co2Emissions: calculatedCO2,
      updatedAt: new Date(),
    };

    if (!task) {
      taskData.id = crypto.randomUUID();
      taskData.createdAt = new Date();
      taskData.actualHours = 0;
    }

    onSubmit(taskData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Titre de la tâche"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description de la tâche"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type de tâche *</label>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value as TaskType)}
                required
              >
                {Object.entries(TASK_TYPES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label} ({info.co2PerHour} kg CO₂/h)
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priorité *</label>
              <Select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
                required
              >
                {Object.entries(TASK_PRIORITIES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Assigné à *</label>
              <Select
                value={formData.assigneeId}
                onChange={(e) => handleChange('assigneeId', e.target.value)}
                required
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Projet *</label>
              <Select
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                required
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Durée estimée (heures) *</label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date d'échéance *</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
            </div>
          </div>

          {task && (
            <div>
              <label className="block text-sm font-medium mb-2">Statut</label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
              >
                {Object.entries(TASK_STATUSES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Impact CO₂ estimé:</span>
              <CO2Indicator co2Amount={calculatedCO2} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basé sur {formData.estimatedHours}h × {TASK_TYPES[formData.type].co2PerHour} kg CO₂/h
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Enregistrement...' : (task ? 'Mettre à jour' : 'Créer la tâche')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
