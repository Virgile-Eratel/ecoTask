import { create } from 'zustand';
import type {DashboardStats, Project, Task, User} from "../types";

interface AppState {
  // État de l'utilisateur
  currentUser: User | null;
  users: User[];
  
  // État des projets
  projects: Project[];
  currentProject: Project | null;
  
  // État des tâches
  tasks: Task[];
  
  // État du dashboard
  dashboardStats: DashboardStats | null;
  
  // État de l'interface
  isLoading: boolean;
  error: string | null;
  
  // Actions pour les utilisateurs
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Actions pour les projets
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Actions pour les tâches
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Actions pour le dashboard
  setDashboardStats: (stats: DashboardStats) => void;
  
  // Actions pour l'interface
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set) => ({
  // État initial
  currentUser: null,
  users: [],
  projects: [],
  currentProject: null,
  tasks: [],
  dashboardStats: null,
  isLoading: false,
  error: null,
  
  // Actions pour les utilisateurs
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(user => user.id === id ? { ...user, ...updates } : user),
    currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(user => user.id !== id),
    currentUser: state.currentUser?.id === id ? null : state.currentUser
  })),
  
  // Actions pour les projets
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(project => project.id === id ? { ...project, ...updates } : project),
    currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...updates } : state.currentProject
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(project => project.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  })),
  
  // Actions pour les tâches
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => task.id === id ? { ...task, ...updates } : task)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),
  
  // Actions pour le dashboard
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  
  // Actions pour l'interface
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
