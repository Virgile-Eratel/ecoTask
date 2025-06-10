import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useStore } from '../store/useStore';
import { User, Mail, Shield, Plus } from 'lucide-react';

export function TeamList() {
  const { users } = useStore();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Inviter un membre
        </Button>
      </div>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrateur' : 'Membre'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>
                    {user.role === 'admin' 
                      ? 'Accès complet à la plateforme' 
                      : 'Accès aux projets assignés'
                    }
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Voir profil
                </Button>
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques de l'équipe */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de l'équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-muted-foreground">Membres totaux</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-muted-foreground">Administrateurs</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'member').length}
                </div>
                <div className="text-sm text-muted-foreground">Membres</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {users.filter(u => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(u.updatedAt) > weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Actifs cette semaine</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invitations en attente (simulation) */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations en attente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune invitation en attente</p>
            <p className="text-sm mt-2">
              Invitez de nouveaux membres pour agrandir votre équipe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
