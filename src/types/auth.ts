export type UserRole = 'estudiante' | 'padre' | 'profesional'

export type User = {
  id: string
  nombre: string
  email: string
  rol: UserRole
  avatar?: string
  /** Código que el estudiante comparte para que lo vinculen. */
  codigo?: string | null
  /** Vinculación padre ↔ hijo (demo local) */
  padreId?: string
  hijoId?: string
  profesionalId?: string
}

export const ROLE_LABELS: Record<UserRole, string> = {
  estudiante: 'Estudiante',
  padre: 'Padre / Cuidador',
  profesional: 'Profesional',
}

export const ROLE_HOME: Record<UserRole, string> = {
  estudiante: '/estudiante',
  padre: '/padre',
  profesional: '/profesional',
}

/** Cuentas demo listas para probar cada rol (contraseña: codequest) */
export const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: 'estu-1',
    nombre: 'Luna',
    email: 'luna@codequest.demo',
    password: 'codequest',
    rol: 'estudiante',
    avatar: '🌙',
    padreId: 'padre-1',
    profesionalId: 'pro-1',
  },
  {
    id: 'padre-1',
    nombre: 'Ana (mamá)',
    email: 'ana@codequest.demo',
    password: 'codequest',
    rol: 'padre',
    hijoId: 'estu-1',
  },
  {
    id: 'pro-1',
    nombre: 'Prof. Camilo',
    email: 'camilo@codequest.demo',
    password: 'codequest',
    rol: 'profesional',
  },
]
