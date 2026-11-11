import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { formatClock } from '../../game/sessionTime'
import { useSessionTime } from '../../context/SessionTimeContext'
import { Button } from '../ui/Button'

export function SessionNotice() {
  const { user } = useAuth()
  const { remainingSec, expired, warning } = useSessionTime()
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const lastMinute = remainingSec > 0 && remainingSec <= 60
  const showWarning =
    user?.rol === 'estudiante' &&
    warning &&
    !expired &&
    (dismissedAt == null || (lastMinute && dismissedAt > 60))

  useEffect(() => {
    if (expired && user?.rol === 'estudiante') titleRef.current?.focus()
  }, [expired, user?.rol])

  if (user?.rol !== 'estudiante') return null

  if (expired) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#1c2434]/45 px-5 pt-20">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="tiempo-agotado-titulo"
          className="w-full max-w-md rounded-[2rem] border-2 border-border bg-surface p-6 text-left shadow-[var(--shadow-clay)]"
        >
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Tiempo</p>
          <h2
            id="tiempo-agotado-titulo"
            ref={titleRef}
            tabIndex={-1}
            className="mt-2 text-3xl font-extrabold text-ink outline-none"
          >
            Se acabó el tiempo
          </h2>
          <p className="mt-3 text-lg text-ink-muted">
            Llegaste al máximo de esta sesión. Un administrador puede darte más tiempo para seguir
            probando. El botón Salir sigue disponible arriba.
          </p>
        </div>
      </div>
    )
  }

  if (!showWarning) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-30 px-4">
      <div
        role="status"
        className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border-2 border-accent bg-accent-soft px-5 py-4 text-left shadow-[var(--shadow-clay)]"
      >
        <p className="text-base font-extrabold text-ink">
          {lastMinute
            ? 'Queda menos de un minuto.'
            : `Quedan ${formatClock(remainingSec)}. El juego se pausa al llegar a cero.`}
        </p>
        <Button variant="accent" onClick={() => setDismissedAt(remainingSec)}>
          Entendido
        </Button>
      </div>
    </div>
  )
}
