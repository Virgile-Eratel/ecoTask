import { create } from 'zustand';
import type {User, Project} from '../types';

// Store simplifié pour l'état global de l'application
interface AppState {
  // État de l'interface
  isLoading: boolean;
  error: string | null;
  
  // Utilisateur actuel (pour l'authentification future)
  currentUser: User | null;
  
  // Projet actuellement sélectionné
  currentProject: Project | null;
  
  // Actions pour l'interface
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Actions pour l'utilisateur
  setCurrentUser: (user: User | null) => void;
  
  // Actions pour le projet actuel
  setCurrentProject: (project: Project | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // État initial
  isLoading: false,
  error: null,
  currentUser: null,
  currentProject: null,
  
  // Actions pour l'interface
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Actions pour l'utilisateur
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Actions pour le projet actuel
  setCurrentProject: (project) => set({ currentProject: project }),
}));
