import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { userService, type CreateUserData, type UpdateUserData } from '../services/userService';
import { UserForm } from './UserForm';
import { ConfirmDialog } from './ConfirmDialog';
import type { User as UserType } from '../types';
import { User, Mail, Shield, Plus, Edit, Trash2 } from 'lucide-react';

export function TeamList() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);

  const { data: usersData, loading, error, refetch } = useApiData(
    () => userService.getUsers({ limit: 100 })
  );

  const { mutate: createUser, loading: createLoading } = useApiMutation<{ user: UserType }>();
  const { mutate: updateUser, loading: updateLoading } = useApiMutation<{ user: UserType }>();
  const { mutate: deleteUser, loading: deleteLoading } = useApiMutation<void>();

  const users = usersData?.users || [];

  const handleCreateUser = async (userData: CreateUserData) => {
    await createUser(
      () => userService.createUser(userData),
      () => {
        setShowForm(false);
        refetch();
      }
    );
  };

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!editingUser) return;

    await updateUser(
      () => userService.updateUser(editingUser.id, userData),
      () => {
        setEditingUser(null);
        setShowForm(false);
        refetch();
      }
    );
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    await deleteUser(
      () => userService.deleteUser(deletingUser.id),
      () => {
        setDeletingUser(null);
        refetch();
      }
    );
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement de l'équipe...</div>
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
        <UserForm
          user={editingUser || undefined}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
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
          <h1 className="text-3xl font-bold">Équipe</h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingUser(user)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
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

      {/* Dialog de confirmation de suppression */}
      {deletingUser && (
        <ConfirmDialog
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer ${deletingUser.name} ? Cette action est irréversible.`}
          confirmText="Supprimer"
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
          loading={deleteLoading}
          variant="danger"
        />
      )}
    </div>
  );
}
