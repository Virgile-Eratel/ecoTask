import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CO2Indicator } from './CO2Indicator';
import { Button } from './ui/button';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { projectService, type CreateProjectData, type UpdateProjectData } from '../services/projectService';
import { userService } from '../services/userService';
import { ProjectForm } from './ProjectForm';
import { ConfirmDialog } from './ConfirmDialog';
import { FolderOpen, Users, CheckSquare, Plus, Edit, Trash2 } from 'lucide-react';
import type { Project } from "../types";

export function ProjectList() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const { data: projectsData, loading, error, refetch } = useApiData(
    () => projectService.getProjects({ limit: 100 })
  );

  const { data: usersData, loading: usersLoading } = useApiData(
    () => userService.getUsers({ limit: 100 })
  );

  const { mutate: createProject, loading: createLoading } = useApiMutation<{ project: Project }>();
  const { mutate: updateProject, loading: updateLoading } = useApiMutation<{ project: Project }>();
  const { mutate: deleteProject, loading: deleteLoading } = useApiMutation<void>();

  const projects = projectsData?.projects || [];
  const users = usersData?.users || [];

  const handleCreateProject = async (projectData: CreateProjectData) => {
    await createProject(
      () => projectService.createProject(projectData),
      () => {
        setShowForm(false);
        refetch();
      }
    );
  };

  const handleUpdateProject = async (projectData: UpdateProjectData) => {
    if (!editingProject) return;

    await updateProject(
      () => projectService.updateProject(editingProject.id, projectData),
      () => {
        setEditingProject(null);
        setShowForm(false);
        refetch();
      }
    );
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    await deleteProject(
      () => projectService.deleteProject(deletingProject.id),
      () => {
        setDeletingProject(null);
        refetch();
      }
    );
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  if (loading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement des projets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Erreur: {error}</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <ProjectForm
          project={editingProject || undefined}
          users={users}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
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
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets et suivez leur impact environnemental
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project : any) => (
          <Card key={project.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <Badge variant="outline">
                  {project.members.length} membres
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Impact CO₂:</span>
                  <CO2Indicator co2Amount={project.totalCO2} />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Chef de projet: {project.owner.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckSquare className="h-4 w-4" />
                  <span>{project.tasks?.length} tâches</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  <span>Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Équipe:</h4>
                <div className="flex flex-wrap gap-1">
                  {project.members.slice(0, 3).map((member : any) => (
                    <Badge key={member.id} variant="secondary" className="text-xs">
                      {member.name.split(' ')[0]}
                    </Badge>
                  ))}
                  {project.members.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.members.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProject(project)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingProject(project)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques des projets */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques des projets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Projets actifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum: any, p: { members: string | any[]; }) => sum + p.members?.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Membres impliqués</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum: any, p: { tasks: string | any[]; }) => sum + p.tasks?.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Tâches totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum: any, p: { totalCO2: any; }) => sum + p.totalCO2, 0).toFixed(1)} kg
                </div>
                <div className="text-sm text-muted-foreground">CO₂ total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmation de suppression */}
      {deletingProject && (
        <ConfirmDialog
          title="Supprimer le projet"
          message={`Êtes-vous sûr de vouloir supprimer le projet "${deletingProject.name}" ? Cette action supprimera également toutes les tâches associées et est irréversible.`}
          confirmText="Supprimer"
          onConfirm={handleDeleteProject}
          onCancel={() => setDeletingProject(null)}
          loading={deleteLoading}
          variant="danger"
        />
      )}
    </div>
  );
}
