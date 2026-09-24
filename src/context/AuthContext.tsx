import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USERS, type User, type UserRole } from '../types/auth'

type AuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (data: {
    nombre: string
    email: string
    password: string
    rol: UserRole
  }) => Promise<User>
  logout: () => void
  loginAsDemo: (rol: UserRole) => Promise<User>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'codequest-session'
const USERS_KEY = 'codequest-users'

type StoredUser = User & { password: string }

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS))
      return [...DEMO_USERS]
    }
    return JSON.parse(raw) as StoredUser[]
  } catch {
    return [...DEMO_USERS]
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function toPublicUser(u: StoredUser): User {
  const { password: _password, ...user } = u
  return user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSession())

  const persistSession = useCallback((next: User | null) => {
    setUser(next)
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const users = readUsers()
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      )
      if (!found) {
        throw new Error('Correo o contraseña incorrectos. Prueba una cuenta demo.')
      }
      const publicUser = toPublicUser(found)
      persistSession(publicUser)
      return publicUser
    },
    [persistSession],
  )

  const register = useCallback(
    async (data: { nombre: string; email: string; password: string; rol: UserRole }) => {
      const users = readUsers()
      const email = data.email.trim().toLowerCase()
      if (users.some((u) => u.email.toLowerCase() === email)) {
        throw new Error('Ese correo ya está registrado. Inicia sesión.')
      }
      if (data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.')
      }
      const nuevo: StoredUser = {
        id: `user-${Date.now()}`,
        nombre: data.nombre.trim(),
        email,
        password: data.password,
        rol: data.rol,
        avatar: data.rol === 'estudiante' ? '⭐' : undefined,
      }
      writeUsers([...users, nuevo])
      const publicUser = toPublicUser(nuevo)
      persistSession(publicUser)
      return publicUser
    },
    [persistSession],
  )

  const loginAsDemo = useCallback(
    async (rol: UserRole) => {
      const demo = DEMO_USERS.find((u) => u.rol === rol)
      if (!demo) throw new Error('Cuenta demo no encontrada')
      const users = readUsers()
      if (!users.some((u) => u.id === demo.id)) {
        writeUsers([...users, demo])
      }
      const publicUser = toPublicUser(demo)
      persistSession(publicUser)
      return publicUser
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    persistSession(null)
  }, [persistSession])

  const value = useMemo(
    () => ({ user, login, register, logout, loginAsDemo }),
    [user, login, register, logout, loginAsDemo],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
