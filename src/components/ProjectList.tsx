import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CO2Indicator } from './CO2Indicator';
import { Button } from './ui/button';
import { useStore } from '../store/useStore';
import { FolderOpen, Users, CheckSquare, Plus } from 'lucide-react';
import type {Project} from "../types";

export function ProjectList() {
  const { projects, setProjects, users, setUsers } = useStore();

  useEffect(() => {
    // Simuler des données pour la démo
    if (users.length === 0) {
      const mockUsers = [
        {
          id: '1',
          name: 'Alice Martin',
          email: 'alice@example.com',
          role: 'admin' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Bob Dupont',
          email: 'bob@example.com',
          role: 'member' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Claire Rousseau',
          email: 'claire@example.com',
          role: 'member' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setUsers(mockUsers);
    }

    if (projects.length === 0 && users.length > 0) {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Site Web Éco-responsable',
          description: 'Développement d\'un site web optimisé pour réduire l\'empreinte carbone',
          color: '#10b981',
          ownerId: users[0]?.id || '1',
          owner: users[0] || {
            id: '1',
            name: 'Alice Martin',
            email: 'alice@example.com',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          members: users.slice(0, 2),
          tasks: [],
          totalCO2: 45.2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Application Mobile Verte',
          description: 'App mobile pour sensibiliser aux pratiques écologiques',
          color: '#059669',
          ownerId: users[1]?.id || '2',
          owner: users[1] || {
            id: '2',
            name: 'Bob Dupont',
            email: 'bob@example.com',
            role: 'member',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          members: users,
          tasks: [],
          totalCO2: 67.8,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Dashboard Analytics',
          description: 'Tableau de bord pour analyser l\'impact environnemental',
          color: '#0d9488',
          ownerId: users[0]?.id || '1',
          owner: users[0] || {
            id: '1',
            name: 'Alice Martin',
            email: 'alice@example.com',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          members: [users[0], users[2]].filter(Boolean),
          tasks: [],
          totalCO2: 43.7,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date(),
        },
      ];
      setProjects(mockProjects);
    }
  }, [projects.length, users, setProjects, setUsers]);

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
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
                  <span>{project.tasks.length} tâches</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FolderOpen className="h-4 w-4" />
                  <span>Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Équipe:</h4>
                <div className="flex flex-wrap gap-1">
                  {project.members.slice(0, 3).map((member) => (
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
                <Button variant="outline" size="sm" className="flex-1">
                  Voir détails
                </Button>
                <Button variant="outline" size="sm">
                  Modifier
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
                  {projects.reduce((sum, p) => sum + p.members.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Membres impliqués</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.tasks.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Tâches totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.totalCO2, 0).toFixed(1)} kg
                </div>
                <div className="text-sm text-muted-foreground">CO₂ total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
