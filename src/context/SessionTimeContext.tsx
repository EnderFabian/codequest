import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  pullLimitMinutes,
  pushLimitMinutes,
  pushUsedSeconds,
  resetCloudUsage,
} from '../lib/cloud'
import {
  DEMO_STUDENT_ID,
  WARN_AT_SEC,
  readLimitSec,
  readUsedSec,
  resetUsage,
  setLimitMinutes,
  setSessionCloudHooks,
  subscribeSessionTime,
  tickUsage,
  writeLimitMinutes,
} from '../game/sessionTime'

type SessionTime = {
  estudianteId: string
  limitSec: number
  usedSec: number
  remainingSec: number
  expired: boolean
  warning: boolean
  setLimitMinutes: (minutes: number) => void
  resetUsage: (estudianteId: string) => void
}

const SessionTimeContext = createContext<SessionTime | null>(null)

function watchedStudent(user: { id: string; rol: string; hijoId?: string } | null) {
  if (!user) return ''
  if (user.rol === 'estudiante') return user.id
  if (user.hijoId) return user.hijoId
  if (user.rol === 'profesional') return DEMO_STUDENT_ID
  return ''
}

export function SessionTimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const estudianteId = watchedStudent(user)
  const tracking = user?.rol === 'estudiante' && estudianteId.length > 0
  const [tick, setTick] = useState(0)

  useEffect(() => subscribeSessionTime(() => setTick((n) => n + 1)), [])

  useEffect(() => {
    setSessionCloudHooks({
      onLimit: (minutes) => {
        void pushLimitMinutes(minutes)
      },
      onReset: () => {
        void resetCloudUsage('luna')
      },
      onTick: (id, seconds) => {
        void pushUsedSeconds(id, seconds)
      },
    })
    const refresh = window.setInterval(() => {
      void pullLimitMinutes().then((minutes) => {
        if (minutes != null) writeLimitMinutes(minutes, false)
      })
    }, 30000)
    return () => window.clearInterval(refresh)
  }, [])

  useEffect(() => {
    if (!tracking) return
    const id = window.setInterval(() => {
      if (tickUsage(estudianteId)) setTick((n) => n + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [estudianteId, tracking])

  const value = useMemo<SessionTime>(() => {
    const limitSec = readLimitSec()
    const usedSec = estudianteId ? readUsedSec(estudianteId) : 0
    const remainingSec = Math.max(0, limitSec - usedSec)
    return {
      estudianteId,
      limitSec,
      usedSec,
      remainingSec,
      expired: estudianteId.length > 0 && remainingSec <= 0,
      warning: remainingSec > 0 && remainingSec <= WARN_AT_SEC,
      setLimitMinutes,
      resetUsage,
    }
  }, [estudianteId, tick])

  return <SessionTimeContext.Provider value={value}>{children}</SessionTimeContext.Provider>
}

export function useSessionTime() {
  const value = useContext(SessionTimeContext)
  if (!value) {
    throw new Error('useSessionTime debe usarse dentro de SessionTimeProvider')
  }
  return value
}
