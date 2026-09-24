import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type CalmModeContextValue = {
  calmMode: boolean
  toggleCalmMode: () => void
  setCalmMode: (value: boolean) => void
}

const CalmModeContext = createContext<CalmModeContextValue | null>(null)

const STORAGE_KEY = 'codequest-modo-calma'

export function CalmModeProvider({ children }: { children: ReactNode }) {
  const [calmMode, setCalmModeState] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('modo-calma', calmMode)
    window.localStorage.setItem(STORAGE_KEY, calmMode ? '1' : '0')
  }, [calmMode])

  const setCalmMode = useCallback((value: boolean) => {
    setCalmModeState(value)
  }, [])

  const toggleCalmMode = useCallback(() => {
    setCalmModeState((prev) => !prev)
  }, [])

  const value = useMemo(
    () => ({ calmMode, toggleCalmMode, setCalmMode }),
    [calmMode, toggleCalmMode, setCalmMode],
  )

  return <CalmModeContext.Provider value={value}>{children}</CalmModeContext.Provider>
}

export function useCalmMode() {
  const ctx = useContext(CalmModeContext)
  if (!ctx) throw new Error('useCalmMode debe usarse dentro de CalmModeProvider')
  return ctx
}
