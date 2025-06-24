import { describe, it, expect } from '@jest/globals'
import { TaskTypeEnum } from '@prisma/client'
import {
  CO2_COEFFICIENTS,
  calculateCO2Emissions,
  getCO2Level,
  formatCO2,
  calculateProjectCO2,
} from '../co2Calculator'

describe('CO2Calculator', () => {
  describe('CO2_COEFFICIENTS', () => {
    it('should have correct coefficient values', () => {
      expect(CO2_COEFFICIENTS.LIGHT).toBe(0.1)
      expect(CO2_COEFFICIENTS.TECHNICAL).toBe(1.0)
      expect(CO2_COEFFICIENTS.INTENSIVE).toBe(3.5)
    })
  })

  describe('calculateCO2Emissions', () => {
    it('should calculate emissions correctly for LIGHT tasks', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.LIGHT, 10)
      expect(result).toBe(1.0)
    })

    it('should calculate emissions correctly for TECHNICAL tasks', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.TECHNICAL, 5)
      expect(result).toBe(5.0)
    })

    it('should calculate emissions correctly for INTENSIVE tasks', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.INTENSIVE, 2)
      expect(result).toBe(7.0)
    })

    it('should handle zero duration', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.TECHNICAL, 0)
      expect(result).toBe(0)
    })

    it('should handle decimal hours', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.LIGHT, 2.5)
      expect(result).toBe(0.25)
    })

    it('should round to 2 decimal places', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.TECHNICAL, 1.333)
      expect(result).toBe(1.33)
    })

    it('should handle very small numbers', () => {
      const result = calculateCO2Emissions(TaskTypeEnum.LIGHT, 0.01)
      expect(result).toBe(0.00)
    })
  })

  describe('getCO2Level', () => {
    it('should return low for values <= 1', () => {
      expect(getCO2Level(0)).toBe('low')
      expect(getCO2Level(0.5)).toBe('low')
      expect(getCO2Level(1.0)).toBe('low')
    })

    it('should return medium for values > 1 and <= 5', () => {
      expect(getCO2Level(1.1)).toBe('medium')
      expect(getCO2Level(3.0)).toBe('medium')
      expect(getCO2Level(5.0)).toBe('medium')
    })

    it('should return high for values > 5', () => {
      expect(getCO2Level(5.1)).toBe('high')
      expect(getCO2Level(10.0)).toBe('high')
      expect(getCO2Level(100.0)).toBe('high')
    })
  })

  describe('formatCO2', () => {
    it('should format CO2 amounts correctly', () => {
      expect(formatCO2(1.234)).toBe('1.23 kg CO₂')
      expect(formatCO2(0)).toBe('0.00 kg CO₂')
      expect(formatCO2(10.5)).toBe('10.50 kg CO₂')
    })

    it('should handle large numbers', () => {
      expect(formatCO2(1000.123)).toBe('1000.12 kg CO₂')
    })

    it('should handle very small numbers', () => {
      expect(formatCO2(0.001)).toBe('0.00 kg CO₂')
      expect(formatCO2(0.006)).toBe('0.01 kg CO₂')
    })
  })

  describe('calculateProjectCO2', () => {
    it('should calculate total CO2 for project tasks', () => {
      const tasks = [
        { co2Emissions: 1.5 },
        { co2Emissions: 2.3 },
        { co2Emissions: 0.7 },
      ]

      const result = calculateProjectCO2(tasks)
      expect(result).toBe(4.5)
    })

    it('should handle empty task list', () => {
      const result = calculateProjectCO2([])
      expect(result).toBe(0)
    })

    it('should handle single task', () => {
      const tasks = [{ co2Emissions: 3.14 }]
      const result = calculateProjectCO2(tasks)
      expect(result).toBe(3.14)
    })

    it('should round to 2 decimal places', () => {
      const tasks = [
        { co2Emissions: 1.111 },
        { co2Emissions: 2.222 },
        { co2Emissions: 3.333 },
      ]

      const result = calculateProjectCO2(tasks)
      expect(result).toBe(6.67)
    })

    it('should handle zero emissions', () => {
      const tasks = [
        { co2Emissions: 0 },
        { co2Emissions: 0 },
        { co2Emissions: 1.5 },
      ]

      const result = calculateProjectCO2(tasks)
      expect(result).toBe(1.5)
    })
  })
})
