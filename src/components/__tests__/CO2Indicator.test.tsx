import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CO2Indicator } from '../CO2Indicator'

describe('CO2Indicator', () => {
  it('should render low CO2 level correctly', () => {
    render(<CO2Indicator co2Amount={0.5} />)
    
    const indicator = screen.getByText('0.50 kg CO₂')
    expect(indicator).toBeInTheDocument()
  })

  it('should render medium CO2 level correctly', () => {
    render(<CO2Indicator co2Amount={3.0} />)
    
    const indicator = screen.getByText('3.00 kg CO₂')
    expect(indicator).toBeInTheDocument()
  })

  it('should render high CO2 level correctly', () => {
    render(<CO2Indicator co2Amount={10.0} />)
    
    const indicator = screen.getByText('10.00 kg CO₂')
    expect(indicator).toBeInTheDocument()
  })

  it('should handle zero CO2 amount', () => {
    render(<CO2Indicator co2Amount={0} />)
    
    const indicator = screen.getByText('0.00 kg CO₂')
    expect(indicator).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<CO2Indicator co2Amount={1.5} className="custom-class" />)
    
    const indicator = screen.getByText('1.50 kg CO₂')
    expect(indicator).toHaveClass('custom-class')
  })

  it('should format decimal numbers correctly', () => {
    render(<CO2Indicator co2Amount={1.234567} />)
    
    const indicator = screen.getByText('1.23 kg CO₂')
    expect(indicator).toBeInTheDocument()
  })

  it('should handle edge cases for CO2 levels', () => {
    // Test boundary values
    const { rerender } = render(<CO2Indicator co2Amount={1.0} />)
    expect(screen.getByText('1.00 kg CO₂')).toBeInTheDocument()

    rerender(<CO2Indicator co2Amount={1.1} />)
    expect(screen.getByText('1.10 kg CO₂')).toBeInTheDocument()

    rerender(<CO2Indicator co2Amount={5.0} />)
    expect(screen.getByText('5.00 kg CO₂')).toBeInTheDocument()

    rerender(<CO2Indicator co2Amount={5.1} />)
    expect(screen.getByText('5.10 kg CO₂')).toBeInTheDocument()
  })
})
