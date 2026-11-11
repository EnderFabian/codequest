import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { replaceProgress } from '../game/progressStore'
import { writeLimitMinutes, writeUsedSeconds } from '../game/sessionTime'
import { pullLimitMinutes, pullProgress } from '../lib/cloud'
import {
  cloudEnabled,
  isValidUsername,
  normalizeUsername,
  supabase,
  usernameToEmail,
} from '../lib/supabase'
import { DEMO_USERS, type User, type UserRole } from '../types/auth'

type AuthContextValue = {
  user: User | null
  ready: boolean
  login: (username: string, password: string) => Promise<User>
  register: (data: {
    nombre: string
    username: string
    password: string
    rol: UserRole
  }) => Promise<User>
  logout: () => void
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

async function loadCloudUser(userId: string, fallback: { nombre?: string; rol?: string; username?: string }) {
  const remote = await pullProgress(userId)
  if (remote) {
    replaceProgress(remote.progress)
    writeUsedSeconds(userId, remote.tiempoUsadoSeg)
  }
  const limit = await pullLimitMinutes()
  if (limit != null) writeLimitMinutes(limit, false)

  const { data } = await supabase!
    .from('perfiles')
    .select('username, nombre, rol')
    .eq('id', userId)
    .maybeSingle()

  const rol = (data?.rol ?? fallback.rol ?? 'estudiante') as UserRole
  return {
    id: userId,
    nombre: data?.nombre ?? fallback.nombre ?? 'Explorador',
    email: data?.username ?? fallback.username ?? userId,
    rol,
  } satisfies User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (cloudEnabled ? null : readSession()))
  const [ready, setReady] = useState(!cloudEnabled)

  const persistLocal = useCallback((next: User | null) => {
    setUser(next)
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  }, [])

  useEffect(() => {
    if (!supabase) return
    let ignore = false

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user
      const next = sessionUser
        ? await loadCloudUser(sessionUser.id, {
            nombre: sessionUser.user_metadata?.nombre,
            rol: sessionUser.user_metadata?.rol,
            username: sessionUser.user_metadata?.username,
          })
        : null
      if (ignore) return
      setUser(next)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null)
    })

    return () => {
      ignore = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      if (!supabase) {
        const users = readUsers()
        const found = users.find(
          (u) =>
            (u.email.toLowerCase() === username.trim().toLowerCase() ||
              u.email.toLowerCase().startsWith(`${normalizeUsername(username)}@`)) &&
            u.password === password,
        )
        if (!found) throw new Error('Usuario o contraseña incorrectos.')
        const publicUser = toPublicUser(found)
        persistLocal(publicUser)
        return publicUser
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      })
      if (error || !data.user) throw new Error('Usuario o contraseña incorrectos.')
      const next = await loadCloudUser(data.user.id, {
        nombre: data.user.user_metadata?.nombre,
        rol: data.user.user_metadata?.rol,
        username: data.user.user_metadata?.username ?? normalizeUsername(username),
      })
      setUser(next)
      return next
    },
    [persistLocal],
  )

  const register = useCallback(
    async (data: { nombre: string; username: string; password: string; rol: UserRole }) => {
      const username = normalizeUsername(data.username)
      if (!isValidUsername(username)) {
        throw new Error('El usuario debe tener de 3 a 24 letras o números, sin espacios.')
      }
      if (data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.')
      }
      const nombre = data.nombre.trim()
      if (!nombre) throw new Error('Escribe tu nombre.')

      if (!supabase) {
        const users = readUsers()
        const email = usernameToEmail(username)
        if (users.some((u) => u.email.toLowerCase() === email)) {
          throw new Error('Ese usuario ya está registrado. Inicia sesión.')
        }
        const nuevo: StoredUser = {
          id: `user-${Date.now()}`,
          nombre,
          email,
          password: data.password,
          rol: data.rol,
          avatar: data.rol === 'estudiante' ? '⭐' : undefined,
        }
        writeUsers([...users, nuevo])
        const publicUser = toPublicUser(nuevo)
        persistLocal(publicUser)
        return publicUser
      }

      const { data: created, error } = await supabase.auth.signUp({
        email: usernameToEmail(username),
        password: data.password,
        options: { data: { username, nombre, rol: data.rol } },
      })
      if (error || !created.user) {
        throw new Error('No se pudo crear la cuenta. Prueba con otro usuario.')
      }
      if (!created.session) {
        throw new Error('La cuenta quedó pendiente de confirmación. Avisa para desactivarla.')
      }

      const { error: profileError } = await supabase.from('perfiles').insert({
        id: created.user.id,
        username,
        nombre,
        rol: data.rol,
      })
      if (profileError && !profileError.message.toLowerCase().includes('duplicate')) {
        throw new Error('La cuenta se creó, pero no se pudo guardar el perfil.')
      }
      await supabase.from('progreso').upsert({ usuario_id: created.user.id })

      const next = await loadCloudUser(created.user.id, { nombre, rol: data.rol, username })
      setUser(next)
      return next
    },
    [persistLocal],
  )

  const logout = useCallback(() => {
    if (supabase) void supabase.auth.signOut()
    persistLocal(null)
  }, [persistLocal])

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
