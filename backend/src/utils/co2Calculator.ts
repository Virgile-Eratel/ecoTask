import { TaskTypeEnum } from '@prisma/client';

// Coefficients CO2 par type de tâche (kg CO2/h)
export const CO2_COEFFICIENTS: Record<TaskTypeEnum, number> = {
  LIGHT: 0.1,      // Bureautique légère
  TECHNICAL: 1.0,  // Tâche technique
  INTENSIVE: 3.5,  // Forte intensité énergétique
};

/**
 * Calcule les émissions CO2 d'une tâche
 * @param taskType Type de tâche
 * @param durationHours Durée en heures
 * @returns Émissions en kg CO2
 */
export function calculateCO2Emissions(
  taskType: TaskTypeEnum,
  durationHours: number
): number {
  const coefficient = CO2_COEFFICIENTS[taskType];
  return Number((coefficient * durationHours).toFixed(2));
}

/**
 * Détermine le niveau d'impact CO2
 * @param co2Amount Quantité de CO2 en kg
 * @returns Niveau d'impact
 */
export function getCO2Level(co2Amount: number): 'low' | 'medium' | 'high' {
  if (co2Amount <= 1) return 'low';
  if (co2Amount <= 5) return 'medium';
  return 'high';
}

/**
 * Formate l'affichage des émissions CO2
 * @param co2Amount Quantité de CO2 en kg
 * @returns Chaîne formatée
 */
export function formatCO2(co2Amount: number): string {
  return `${co2Amount.toFixed(2)} kg CO₂`;
}

/**
 * Calcule les émissions totales d'un projet
 * @param tasks Liste des tâches du projet
 * @returns Total des émissions en kg CO2
 */
export function calculateProjectCO2(tasks: Array<{ co2Emissions: number }>): number {
  return Number(tasks.reduce((total, task) => total + task.co2Emissions, 0).toFixed(2));
}
