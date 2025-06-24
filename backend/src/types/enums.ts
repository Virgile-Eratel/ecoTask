// Types pour remplacer les enums Prisma (SQLite ne supporte pas les enums natifs)

export const Role = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
} as const

export type Role = typeof Role[keyof typeof Role]

export const TaskTypeEnum = {
  LIGHT: 'LIGHT',
  TECHNICAL: 'TECHNICAL',
  INTENSIVE: 'INTENSIVE'
} as const

export type TaskTypeEnum = typeof TaskTypeEnum[keyof typeof TaskTypeEnum]

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const

export type Priority = typeof Priority[keyof typeof Priority]

export const Status = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE'
} as const

export type Status = typeof Status[keyof typeof Status]

// Fonctions utilitaires pour la validation
export const isValidRole = (value: string): value is Role => {
  return Object.values(Role).includes(value as Role)
}

export const isValidTaskType = (value: string): value is TaskTypeEnum => {
  return Object.values(TaskTypeEnum).includes(value as TaskTypeEnum)
}

export const isValidPriority = (value: string): value is Priority => {
  return Object.values(Priority).includes(value as Priority)
}

export const isValidStatus = (value: string): value is Status => {
  return Object.values(Status).includes(value as Status)
}
