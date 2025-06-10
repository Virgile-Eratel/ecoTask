import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilitaires pour le calcul du CO2
export const CO2_COEFFICIENTS = {
  LIGHT: 0.1, // kg CO2/h - Tâche de bureautique légère
  TECHNICAL: 1.0, // kg CO2/h - Tâche technique (moyenne entre 0.5 et 1.5)
  INTENSIVE: 3.5, // kg CO2/h - Tâche à forte intensité énergétique (moyenne entre 2 et 5)
} as const;

export type TaskType = keyof typeof CO2_COEFFICIENTS;

export function calculateCO2Emissions(
  taskType: TaskType,
  durationHours: number
): number {
  return CO2_COEFFICIENTS[taskType] * durationHours;
}

export function getCO2Level(co2Amount: number): 'low' | 'medium' | 'high' {
  if (co2Amount <= 1) return 'low';
  if (co2Amount <= 5) return 'medium';
  return 'high';
}

export function formatCO2(co2Amount: number): string {
  return `${co2Amount.toFixed(2)} kg CO₂`;
}

// Utilitaires pour les dates
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
