import React from 'react';
import { Button } from './ui/button';
import { Leaf, BarChart3, CheckSquare, Users, FolderOpen } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble et statistiques'
    },
    {
      id: 'tasks',
      label: 'Tâches',
      icon: CheckSquare,
      description: 'Gestion des tâches'
    },
    {
      id: 'projects',
      label: 'Projets',
      icon: FolderOpen,
      description: 'Gestion des projets'
    },
    {
      id: 'team',
      label: 'Équipe',
      icon: Users,
      description: 'Gestion des utilisateurs'
    },
  ];

  return (
    <nav className="bg-card border-r border-border h-screen w-64 p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-green-600 rounded-lg">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">EcoTask</h1>
          <p className="text-xs text-muted-foreground">Gestion écologique</p>
        </div>
      </div>

      {/* Navigation items */}
      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-auto p-3 ${
                isActive ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>EcoTask v1.0</p>
          <p>Réduisons notre empreinte carbone</p>
        </div>
      </div>
    </nav>
  );
}
