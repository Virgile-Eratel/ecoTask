import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CO2Indicator } from './CO2Indicator';
import { useApiData } from '../hooks/useApi';
import { statsService } from '../services/statsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Users, FolderOpen, CheckCircle } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function Dashboard() {
  const { data: dashboardStats, loading, error } = useApiData(
    () => statsService.getDashboardStats()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Chargement du tableau de bord...</div>
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

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Aucune donnée disponible</div>
      </div>
    );
  }

  const completionRate = Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord EcoTask</h1>
        <p className="text-muted-foreground">
          Suivez l'impact environnemental de vos projets et l'avancement de vos équipes
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CO₂</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CO2Indicator co2Amount={dashboardStats.co2Stats.totalCO2} />
            </div>
            <p className="text-xs text-muted-foreground">
              Émissions totales du mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.completedTasks}/{dashboardStats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% terminées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <FolderOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Projets actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Équipe</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Membres actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution CO2 par mois */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des émissions CO₂</CardTitle>
            <CardDescription>Émissions mensuelles en kg CO₂</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardStats.co2Stats.co2ByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Émissions']} />
                <Bar dataKey="co2Amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition CO2 par type de tâche */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de tâche</CardTitle>
            <CardDescription>Émissions CO₂ par catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardStats.co2Stats.co2ByTaskType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ taskType, co2Amount }) => `${taskType}: ${co2Amount.toFixed(1)} kg`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="co2Amount"
                >
                  {dashboardStats.co2Stats.co2ByTaskType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Émissions']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* CO2 par projet */}
      <Card>
        <CardHeader>
          <CardTitle>Émissions CO₂ par projet</CardTitle>
          <CardDescription>Comparaison des émissions entre les projets actifs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardStats.co2Stats.co2ByProject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="projectName" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Émissions']} />
              <Bar dataKey="co2Amount" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
