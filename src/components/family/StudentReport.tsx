import { useEffect, useState } from 'react'
import { Clock, HeartHandshake, Sparkles, Star, Target, Timer } from 'lucide-react'
import { Surface } from '../ui/Surface'
import { formatClock, formatMinutes } from '../../game/sessionTime'
import {
  buildInsight,
  challengeLabel,
  pullCompanionReport,
  type StudentInsight,
} from '../../lib/companionReport'

type Audience = 'familia' | 'profesional'

function percent(hechos: number, total: number) {
  if (total <= 0) return 0
  return Math.round((hechos / total) * 100)
}

function PlayBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div
        className="h-3 overflow-hidden rounded-full bg-primary-soft"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function StudentReport({ audience }: { audience: Audience }) {
  const [insight, setInsight] = useState<StudentInsight | null>(null)
  const [students, setStudents] = useState<StudentInsight[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    pullCompanionReport().then((report) => {
      if (ignore) return
      const next = report.students.map((student) => buildInsight(student, report.limiteMin))
      setStudents(next)
      setInsight(next[0] ?? null)
      setError(report.error ?? '')
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [])

  if (loading) {
    return (
      <Surface className="mt-8 text-left">
        <p className="font-bold text-ink">Estamos trayendo el avance…</p>
      </Surface>
    )
  }

  if (!insight) {
    return (
      <Surface className="mt-8 text-left">
        <h2 className="text-xl font-extrabold text-ink">Todavía no hay un estudiante</h2>
        <p className="mt-2 text-ink-muted">
          Cuando un niño cree su cuenta como estudiante, su avance aparecerá aquí.
        </p>
        {error ? <p className="mt-3 text-sm font-bold text-ink">{error}</p> : null}
      </Surface>
    )
  }

  const { student } = insight
  const avance = percent(insight.totalHechos, insight.totalRetos)
  const queda = Math.max(0, insight.limiteMin * 60 - student.tiempoUsadoSeg)
  const foco = insight.aMejorar
  const ayuda = audience === 'familia' ? foco?.familia : foco?.profesional
  const intentosRecientes = student.attempts.slice(0, audience === 'familia' ? 4 : 8)
  const aciertos = student.attempts.filter((item) => item.aciertos).length

  return (
    <div className="mt-8 flex flex-col gap-5 text-left">
      {students.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Estudiantes">
          {students.map((item) => (
            <button
              key={item.student.id}
              type="button"
              aria-pressed={item.student.id === student.id}
              onClick={() => setInsight(item)}
              className={[
                'min-h-11 rounded-2xl border-2 px-4 py-2 text-sm font-extrabold',
                item.student.id === student.id
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-border bg-surface text-ink',
              ].join(' ')}
            >
              {item.student.nombre}
            </button>
          ))}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border-[3px] border-white/80 bg-gradient-to-br from-[#dceaff] via-[#eef3ff] to-[#f3ecff] p-6 shadow-[var(--shadow-clay)] sm:p-8">
        <p className="text-sm font-extrabold uppercase tracking-widest text-primary">
          {audience === 'familia' ? 'Tu hijo o hija' : 'Seguimiento'}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold text-ink">{student.nombre}</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          {audience === 'familia'
            ? 'Así va practicando el pensamiento lógico: ordenar pasos, repetir, decidir y no rendirse cuando algo no sale.'
            : 'Lectura del avance en las habilidades que el juego entrena: secuencia, repetición, decisión, objetivo y constancia.'}
        </p>
        <p className="mt-4 text-sm font-extrabold text-ink">
          {insight.totalHechos} de {insight.totalRetos} retos · {avance}%
        </p>
        <div className="mt-2">
          <PlayBar value={avance} label={`Avance general ${avance} por ciento`} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Star, label: 'Estrellas', value: String(student.estrellas) },
          { icon: Sparkles, label: 'Puntos', value: String(student.puntos) },
          { icon: Clock, label: 'Jugado hoy', value: formatClock(student.tiempoUsadoSeg) },
          { icon: Timer, label: 'Queda del cupo', value: formatClock(queda) },
        ].map((item) => (
          <Surface key={item.label} className="!p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-ink-muted">
              <item.icon size={16} aria-hidden />
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-ink">{item.value}</p>
          </Surface>
        ))}
      </div>

      <Surface as="section">
        <h3 className="text-xl font-extrabold text-ink">Tiempo de juego</h3>
        <p className="mt-2 text-ink-muted">
          {student.tiempoUsadoSeg === 0
            ? `Hoy todavía no ha jugado. El cupo diario es ${formatMinutes(insight.limiteMin)}.`
            : `Hoy lleva ${formatClock(student.tiempoUsadoSeg)} de un cupo de ${formatMinutes(insight.limiteMin)}. Cuando el cupo llega a cero, el juego se pausa.`}
        </p>
        <p className="mt-3 text-sm font-bold text-ink">
          {queda <= 5 * 60 && student.tiempoUsadoSeg > 0
            ? 'El tiempo de hoy está por acabarse. Conviene cerrar en un buen momento.'
            : 'Una sesión útil dura entre 10 y 20 minutos. No hace falta usar todo el cupo.'}
        </p>
      </Surface>

      <Surface as="section">
        <h3 className="text-xl font-extrabold text-ink">Cómo va en cada habilidad</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {insight.worlds.map((world) => {
            const value = percent(world.hechos, world.total)
            return (
              <li key={world.levelId}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-extrabold text-ink">{world.titulo}</p>
                  <p className="text-sm font-bold text-ink-muted">
                    {world.hechos}/{world.total}
                  </p>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{world.practica}</p>
                <div className="mt-2">
                  <PlayBar value={value} label={`${world.titulo}, ${value} por ciento`} />
                </div>
              </li>
            )
          })}
        </ul>
      </Surface>

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface as="section">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-secondary">
            <Target size={16} aria-hidden />
            Qué puede mejorar
          </p>
          {foco ? (
            <>
              <h3 className="mt-2 text-2xl font-extrabold text-ink">{foco.titulo}</h3>
              <p className="mt-2 text-ink-muted">
                Lleva {foco.hechos} de {foco.total} retos en {foco.nombre}.
                {foco.intentos > 0
                  ? ` Ya lo intentó ${foco.intentos} ${foco.intentos === 1 ? 'vez' : 'veces'}.`
                  : ' Todavía no lo ha intentado.'}
              </p>
              <p className="mt-3 font-bold text-ink">{ayuda}</p>
            </>
          ) : (
            <p className="mt-2 text-ink-muted">Completó todos los mundos. Puede repasar el que más le gustó.</p>
          )}
          {insight.fortalezas.length > 0 ? (
            <p className="mt-3 text-sm font-bold text-ink">
              Ya domina: {insight.fortalezas.map((world) => world.titulo.toLowerCase()).join(', ')}.
            </p>
          ) : (
            <p className="mt-3 text-sm font-bold text-ink">
              El primer logro es terminar un reto de secuencias. Ahí empieza el avance.
            </p>
          )}
        </Surface>

        <Surface as="section">
          <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-primary">
            <HeartHandshake size={16} aria-hidden />
            {audience === 'familia' ? 'Cómo puedes ayudar' : 'Cómo intervenir'}
          </p>
          <ul className="mt-3 flex flex-col gap-3 text-ink">
            <li>Celebren el intento, no solo el acierto. Volver a probar también es avance.</li>
            <li>
              {student.tiempoUsadoSeg === 0
                ? 'Propongan una partida corta hoy, de unos 10 minutos, en Primeros Pasos.'
                : 'Si se cansa, paren aunque quede tiempo. Mejor una sesión corta y tranquila.'}
            </li>
            <li>
              {audience === 'familia'
                ? 'Si se frustra, activen Modo Calma y dejen ese reto para después.'
                : student.attempts.length === 0
                  ? 'Aún no hay partidas. La primera lectura útil llega después de un reto completo.'
                  : `En ${aciertos} de ${student.attempts.length} partidas hubo acierto. Si hay muchos intentos y pocos aciertos, vuelvan al mundo anterior.`}
            </li>
          </ul>
        </Surface>
      </div>

      <Surface as="section" className="overflow-x-auto">
        <h3 className="text-xl font-extrabold text-ink">Partidas recientes</h3>
        {intentosRecientes.length === 0 ? (
          <p className="mt-2 text-ink-muted">
            Cuando {student.nombre} juegue un reto, aquí verás si lo logró, cuántas veces lo intentó y cuánto tardó.
          </p>
        ) : (
          <table className="mt-4 w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-border text-sm text-ink-muted">
                <th className="py-3 pr-3 font-bold">Reto</th>
                <th className="py-3 pr-3 font-bold">Resultado</th>
                <th className="py-3 pr-3 font-bold">Intentos</th>
                <th className="py-3 font-bold">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {intentosRecientes.map((item) => (
                <tr key={item.id} className="border-b border-border/80">
                  <td className="py-3 pr-3 font-bold text-ink">{challengeLabel(item.challengeId)}</td>
                  <td className="py-3 pr-3 text-ink">{item.aciertos ? 'Lo logró' : 'Aún no'}</td>
                  <td className="py-3 pr-3 text-ink">{item.numeroIntentos}</td>
                  <td className="py-3 text-ink">{formatClock(item.tiempoResolucionSeg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error ? <p className="mt-3 text-sm font-bold text-ink">{error}</p> : null}
      </Surface>
    </div>
  )
}
