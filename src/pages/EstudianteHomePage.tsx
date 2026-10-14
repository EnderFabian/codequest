import {
  Award,
  Footprints,
  GitBranch,
  Lock,
  Mountain,
  Repeat,
  Rocket,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { RobotAvatar } from '../components/robot/RobotAvatar'
import { LEVELS } from '../data/levels'
import { useAuth } from '../context/AuthContext'
import { isChallengeComplete, loadProgress } from '../game/progressStore'

/** Aspecto de cada mundo del mapa, en el mismo orden que LEVELS. */
const WORLD_LOOK: { color: string; soft: string; ledge: string; icon: LucideIcon }[] = [
  { color: '#4d96ff', soft: '#e8f1ff', ledge: '#2f6fd0', icon: Footprints },
  { color: '#ff9f5a', soft: '#fff0e6', ledge: '#d97a35', icon: Repeat },
  { color: '#6bcb77', soft: '#e8f8ea', ledge: '#4a9e56', icon: GitBranch },
  { color: '#9b72e8', soft: '#f1ebfd', ledge: '#7550c4', icon: Trophy },
  { color: '#f06aa8', soft: '#fdebf4', ledge: '#c94a85', icon: Sparkles },
  { color: '#2fb8b0', soft: '#e3f7f6', ledge: '#1f8f88', icon: Mountain },
  { color: '#f2b705', soft: '#fff6d6', ledge: '#c99600', icon: Rocket },
]

const CONCEPTS: Record<string, string> = {
  secuenciacion: 'Secuencias',
  bucles: 'Bucles',
  condicionales: 'Condicionales',
  logica_combinada: 'Lógica combinada',
  estrellas: 'Recolectar estrellas',
  obstaculos: 'Paredes y huecos',
  maestria: 'Todo junto',
}

export function EstudianteHomePage() {
  const { user } = useAuth()
  const progress = user ? loadProgress(user.id) : null
  const done = (levelId: string, retoId: string) =>
    !!user && isChallengeComplete(user.id, levelId, retoId)

  const totalRetos = LEVELS.reduce((n, l) => n + l.retos.length, 0)
  const totalDone = LEVELS.reduce(
    (n, l) => n + l.retos.filter((r) => done(l.levelId, r.retoId)).length,
    0,
  )

  let next: { levelId: string; retoId: string; levelName: string } | null = null
  for (const level of LEVELS) {
    const reto = level.retos.find((r) => !done(level.levelId, r.retoId))
    if (reto) {
      next = { levelId: level.levelId, retoId: reto.retoId, levelName: level.levelName }
      break
    }
  }

  const greeting = next
    ? `¿Listo para el reto ${next.retoId}? ¡Vamos juntos!`
    : '¡Completaste todo! Eres increíble.'

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
      {/* Bienvenida con el robot */}
      <section className="relative overflow-hidden rounded-[2rem] border-[3px] border-white/80 bg-gradient-to-br from-[#dceaff] via-[#eef3ff] to-[#f3ecff] p-6 shadow-[var(--shadow-clay)] sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 text-left">
            <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Tu espacio</p>
            <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
              ¡Hola, {user?.nombre ?? 'explorador'}!
            </h1>
            <p className="mt-3 max-w-xl text-lg text-ink-muted">
              Cada mundo enseña algo nuevo. Completa sus retos para ganar la insignia y abrir el
              siguiente.
            </p>

            <ul className="mt-5 flex flex-wrap gap-3">
              <StatChip icon={Star} color="#e6a800" label="Estrellas" value={progress?.estrellasTotales ?? 0} />
              <StatChip icon={Zap} color="#4d96ff" label="Puntos" value={progress?.puntosTotales ?? 0} />
              <StatChip icon={Award} color="#9b72e8" label="Insignias" value={progress?.badges.length ?? 0} />
              <StatChip icon={Footprints} color="#6bcb77" label="Retos" value={`${totalDone}/${totalRetos}`} />
            </ul>

            {next ? (
              <Link
                to={`/estudiante/reto/${next.levelId}/${next.retoId}`}
                className="clay-btn mt-6 inline-flex min-h-[3.25rem] items-center gap-2 rounded-2xl bg-primary px-7 text-lg font-extrabold text-white no-underline"
              >
                Continuar: reto {next.retoId}
                <span className="hidden font-bold opacity-80 sm:inline">· {next.levelName}</span>
              </Link>
            ) : null}
          </div>

          <div className="mx-auto pt-20 md:mx-0 md:pr-6">
            <RobotAvatar pose={['wave', 'happy', 'idle']} size={230} say={greeting} />
          </div>
        </div>
      </section>

      {/* Mapa de mundos */}
      <section className="mt-10" aria-labelledby="mapa-titulo">
        <h2 id="mapa-titulo" className="text-left text-3xl font-extrabold text-ink">
          Tu mapa de aventuras
        </h2>
        <p className="mt-1 text-left text-ink-muted">
          Los mundos se abren en orden. Cada uno es un poquito más difícil que el anterior.
        </p>

        <ol className="mt-6 grid gap-6 lg:grid-cols-2">
          {LEVELS.map((level, levelIdx) => {
            const look = WORLD_LOOK[levelIdx % WORLD_LOOK.length]
            const Icon = look.icon
            const doneCount = level.retos.filter((r) => done(level.levelId, r.retoId)).length
            const unlocked =
              levelIdx === 0 ||
              LEVELS[levelIdx - 1].retos.every((r) => done(LEVELS[levelIdx - 1].levelId, r.retoId))
            const badge = progress?.badges.includes(level.insigniaAlCompletar)
            const pct = Math.round((doneCount / level.retos.length) * 100)

            return (
              <li
                key={level.levelId}
                className={`world-card list-none ${unlocked ? '' : 'is-locked'}`}
                style={{ '--world': look.color, '--world-soft': look.soft, '--world-ledge': look.ledge } as CSSProperties}
              >
                <div className="world-card-inner text-left">
                  <div className="flex items-start gap-4">
                    <span className="world-icon" aria-hidden>
                      {unlocked ? <Icon size={28} strokeWidth={2.4} /> : <Lock size={26} strokeWidth={2.4} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: look.ledge }}>
                        Mundo {levelIdx + 1} · {CONCEPTS[level.concepto] ?? level.concepto}
                      </p>
                      <h3 className="text-2xl font-extrabold text-ink">{level.levelName}</h3>
                      <p className="text-sm font-bold text-ink-muted">
                        {unlocked ? `${doneCount} de ${level.retos.length} retos` : 'Completa el mundo anterior para entrar'}
                      </p>
                    </div>
                    {badge ? (
                      <span className="badge-medal" title={level.insigniaAlCompletar}>
                        <Award size={22} aria-hidden />
                        <span className="sr-only">Insignia {level.insigniaAlCompletar}</span>
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80" aria-hidden>
                    <div className="h-full rounded-full transition-calm" style={{ width: `${pct}%`, background: look.color }} />
                  </div>

                  <ol className="reto-path mt-5" aria-label={`Retos de ${level.levelName}`}>
                    {level.retos.map((reto, i) => {
                      const isDone = done(level.levelId, reto.retoId)
                      const prevDone = i === 0 ? unlocked : done(level.levelId, level.retos[i - 1].retoId)
                      const canOpen = unlocked && (isDone || prevDone)
                      const isNext = next?.levelId === level.levelId && next.retoId === reto.retoId
                      const node = (
                        <span className={`reto-node ${isDone ? 'is-done' : canOpen ? 'is-open' : 'is-closed'}`}>
                          {isDone ? <Star size={20} fill="currentColor" aria-hidden /> : reto.retoId}
                        </span>
                      )
                      return (
                        <li key={reto.retoId} className="relative list-none" style={{ '--i': i } as CSSProperties}>
                          {isNext ? (
                            <RobotAvatar pose="idle" size={64} followPointer={false} className="reto-robot" />
                          ) : null}
                          {canOpen ? (
                            <Link
                              to={`/estudiante/reto/${level.levelId}/${reto.retoId}`}
                              className="no-underline"
                              aria-label={`Reto ${reto.retoId}${isDone ? ', completado' : ''}`}
                            >
                              {node}
                            </Link>
                          ) : (
                            <span aria-label={`Reto ${reto.retoId}, bloqueado`}>{node}</span>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}

function StatChip({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: LucideIcon
  color: string
  label: string
  value: number | string
}) {
  return (
    <li className="stat-chip list-none">
      <span className="stat-chip-icon" style={{ color }} aria-hidden>
        <Icon size={20} strokeWidth={2.6} fill={label === 'Estrellas' ? 'currentColor' : 'none'} />
      </span>
      <span className="text-xl font-extrabold tabular-nums text-ink">{value}</span>
      <span className="text-sm font-bold text-ink-muted">{label}</span>
    </li>
  )
}
