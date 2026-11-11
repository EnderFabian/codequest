import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Surface } from '../ui/Surface'
import {
  DEMO_STUDENT_ID,
  MAX_LIMIT_MIN,
  MIN_LIMIT_MIN,
  formatClock,
  formatMinutes,
} from '../../game/sessionTime'
import { useSessionTime } from '../../context/SessionTimeContext'

const PRESETS = [30, 60, 120]

export function AdminTimePanel() {
  const { limitSec, usedSec, remainingSec, setLimitMinutes, resetUsage } = useSessionTime()
  const [draft, setDraft] = useState(String(Math.round(limitSec / 60)))
  const limitMin = Math.round(limitSec / 60)

  function apply(minutes: number) {
    const next = setLimitMinutes(minutes)
    setDraft(String(next))
  }

  return (
    <Surface className="mt-8 text-left" as="section">
      <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Administrador</p>
      <h2 className="mt-2 text-2xl font-extrabold text-ink">Límite de tiempo</h2>
      <p className="mt-2 max-w-2xl text-ink-muted">
        En pruebas todos los niveles están abiertos. El estudiante puede estar como máximo{' '}
        <strong className="text-ink">{formatMinutes(limitMin)}</strong>. A los 5 minutos aparece un
        aviso y, al llegar a cero, el juego se pausa.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-border bg-primary-soft px-4 py-3">
          <p className="text-sm font-bold text-ink-muted">Límite actual</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{formatMinutes(limitMin)}</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-primary-soft px-4 py-3">
          <p className="text-sm font-bold text-ink-muted">A Luna le quedan</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">{formatClock(remainingSec)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => apply(limitMin - 15)} disabled={limitMin <= MIN_LIMIT_MIN}>
          −15 min
        </Button>
        <Button variant="ghost" onClick={() => apply(limitMin + 15)} disabled={limitMin >= MAX_LIMIT_MIN}>
          +15 min
        </Button>
        {PRESETS.map((minutes) => (
          <Button
            key={minutes}
            variant={limitMin === minutes ? 'primary' : 'ghost'}
            onClick={() => apply(minutes)}
            aria-pressed={limitMin === minutes}
          >
            {formatMinutes(minutes)}
          </Button>
        ))}
      </div>

      <form
        className="mt-5 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          apply(Number(draft))
        }}
      >
        <div className="w-full max-w-xs">
          <Input
            label="Minutos"
            name="minutos"
            type="number"
            min={MIN_LIMIT_MIN}
            max={MAX_LIMIT_MIN}
            value={draft}
            hint={`Entre ${MIN_LIMIT_MIN} min y ${formatMinutes(MAX_LIMIT_MIN)}.`}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Aplicar
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            resetUsage(DEMO_STUDENT_ID)
          }}
        >
          Reiniciar tiempo de Luna
        </Button>
      </form>
      <p className="mt-3 text-sm text-ink-muted">
        Tiempo ya usado por Luna: {formatClock(usedSec)}.
      </p>
    </Surface>
  )
}
