import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import type { Project, User } from '../types';

interface ProjectFormProps {
  project?: Project;
  users: User[];
  onSubmit: (projectData: {
    name: string;
    description?: string;
    color?: string;
    ownerId: string;
    memberIds?: string[];
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ProjectForm({ project, users, onSubmit, onCancel, loading = false }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#10b981',
    ownerId: project?.ownerId || '',
    memberIds: project?.members?.map(m => m.id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      description: formData.description || undefined,
      memberIds: formData.memberIds.length > 0 ? formData.memberIds : undefined,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{project ? 'Modifier le projet' : 'Nouveau projet'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nom du projet"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description du projet"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Couleur</label>
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Chef de projet *</label>
              <Select
                value={formData.ownerId}
                onChange={(e) => handleChange('ownerId', e.target.value)}
                required
              >
                <option value="">Sélectionner un chef de projet</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Membres de l'équipe</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(user.id)}
                    onChange={() => handleMemberToggle(user.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{user.name} ({user.email})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Enregistrement...' : (project ? 'Mettre à jour' : 'Créer')}
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
