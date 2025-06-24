import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '../TaskCard'
import type { Task } from '../../types'

// Mock des composants UI
vi.mock('../ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}))

vi.mock('../ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  ),
}))

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button onClick={onClick} className={`btn ${variant} ${size} ${className}`}>
      {children}
    </button>
  ),
}))

vi.mock('../CO2Indicator', () => ({
  CO2Indicator: ({ co2Amount }: any) => <span>{co2Amount.toFixed(2)} kg CO₂</span>,
}))

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test Description',
  type: 'TECHNICAL',
  priority: 'HIGH',
  status: 'TODO',
  assigneeId: 'user-1',
  assignee: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'member',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  projectId: 'project-1',
  project: {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Project Description',
    color: '#10b981',
    ownerId: 'user-1',
    owner: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    members: [],
    tasks: [],
    totalCO2: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  estimatedHours: 5,
  actualHours: 3,
  co2Emissions: 5.0,
  dueDate: new Date('2024-12-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('TaskCard', () => {
  it('should render task information correctly', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('5h estimées')).toBeInTheDocument()
    expect(screen.getByText('5.00 kg CO₂')).toBeInTheDocument()
  })

  it('should show actual hours when available', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText('Temps réel: 3h')).toBeInTheDocument()
  })

  it('should not show actual hours when zero', () => {
    const taskWithoutActualHours = { ...mockTask, actualHours: 0 }
    render(<TaskCard task={taskWithoutActualHours} />)

    expect(screen.queryByText(/Temps réel:/)).not.toBeInTheDocument()
  })

  it('should show overdue styling for past due date', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2020-01-01'),
      status: 'TODO' as const,
    }
    render(<TaskCard task={overdueTask} />)

    const card = screen.getByText('Test Task').closest('.transition-shadow')
    expect(card).toHaveClass('border-red-200')
  })

  it('should not show overdue styling for completed tasks', () => {
    const completedOverdueTask = {
      ...mockTask,
      dueDate: new Date('2020-01-01'),
      status: 'DONE' as const,
    }
    render(<TaskCard task={completedOverdueTask} />)

    const card = screen.getByText('Test Task').closest('.transition-shadow')
    expect(card).not.toHaveClass('border-red-200')
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<TaskCard task={mockTask} onEdit={onEdit} />)

    const buttons = screen.getAllByRole('button')
    const editButton = buttons.find(button => button.querySelector('svg'))
    fireEvent.click(editButton!)

    expect(onEdit).toHaveBeenCalledWith(mockTask)
  })

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<TaskCard task={mockTask} onDelete={onDelete} />)

    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find(button =>
      button.className.includes('text-red-600')
    )
    fireEvent.click(deleteButton!)

    expect(onDelete).toHaveBeenCalledWith(mockTask)
  })

  it('should call onStatusChange when status button is clicked', () => {
    const onStatusChange = vi.fn()
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)

    const doneButton = screen.getByText('Terminé')
    fireEvent.click(doneButton)

    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'DONE')
  })

  it('should not render edit/delete buttons when handlers not provided', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /trash/i })).not.toBeInTheDocument()
  })

  it('should not render status buttons when onStatusChange not provided', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.queryByText('Terminé')).not.toBeInTheDocument()
    expect(screen.queryByText('En cours')).not.toBeInTheDocument()
  })

  it('should render task without description', () => {
    const taskWithoutDescription = { ...mockTask, description: '' }
    render(<TaskCard task={taskWithoutDescription} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('should highlight current status button', () => {
    const onStatusChange = vi.fn()
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />)

    const buttons = screen.getAllByRole('button')
    const todoButton = buttons.find(button =>
      button.textContent === 'À faire' && button.className.includes('btn')
    )
    expect(todoButton).toHaveClass('btn default')

    const inProgressButton = buttons.find(button =>
      button.textContent === 'En cours' && button.className.includes('btn')
    )
    expect(inProgressButton).toHaveClass('btn outline')
  })
})
