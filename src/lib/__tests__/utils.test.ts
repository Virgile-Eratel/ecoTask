import { describe, it, expect } from 'vitest'
import {
  cn,
  CO2_COEFFICIENTS,
  calculateCO2Emissions,
  getCO2Level,
  formatCO2,
  formatDate,
  formatDateTime,
} from '../utils'

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('should handle Tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('CO2 calculations', () => {
    it('should have correct CO2 coefficients', () => {
      expect(CO2_COEFFICIENTS.LIGHT).toBe(0.1)
      expect(CO2_COEFFICIENTS.TECHNICAL).toBe(1.0)
      expect(CO2_COEFFICIENTS.INTENSIVE).toBe(3.5)
    })

    it('should calculate CO2 emissions correctly', () => {
      expect(calculateCO2Emissions('LIGHT', 10)).toBe(1.0)
      expect(calculateCO2Emissions('TECHNICAL', 5)).toBe(5.0)
      expect(calculateCO2Emissions('INTENSIVE', 2)).toBe(7.0)
    })

    it('should handle zero duration', () => {
      expect(calculateCO2Emissions('TECHNICAL', 0)).toBe(0)
    })

    it('should handle decimal hours', () => {
      expect(calculateCO2Emissions('LIGHT', 2.5)).toBe(0.25)
      expect(calculateCO2Emissions('TECHNICAL', 1.5)).toBe(1.5)
    })
  })

  describe('getCO2Level', () => {
    it('should return correct levels', () => {
      expect(getCO2Level(0.5)).toBe('low')
      expect(getCO2Level(1.0)).toBe('low')
      expect(getCO2Level(1.1)).toBe('medium')
      expect(getCO2Level(3.0)).toBe('medium')
      expect(getCO2Level(5.0)).toBe('medium')
      expect(getCO2Level(5.1)).toBe('high')
      expect(getCO2Level(10.0)).toBe('high')
    })

    it('should handle edge cases', () => {
      expect(getCO2Level(0)).toBe('low')
      expect(getCO2Level(1)).toBe('low')
      expect(getCO2Level(5)).toBe('medium')
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

  describe('date formatting', () => {
    const testDate = new Date('2024-01-15T14:30:00Z')

    it('should format date correctly', () => {
      const formatted = formatDate(testDate)
      expect(formatted).toMatch(/15 janvier 2024|janvier 15, 2024/)
    })
  })
})
