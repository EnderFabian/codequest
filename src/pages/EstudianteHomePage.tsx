import { Link } from 'react-router-dom'
import { LEVELS } from '../data/levels'
import { useAuth } from '../context/AuthContext'
import { isChallengeComplete, loadProgress } from '../game/progressStore'
import { Button } from '../components/ui/Button'
import { Surface } from '../components/ui/Surface'

export function EstudianteHomePage() {
  const { user } = useAuth()
  const progress = user ? loadProgress(user.id) : null

  const firstIncomplete = (() => {
    for (const level of LEVELS) {
      for (const reto of level.retos) {
        if (!user || !isChallengeComplete(user.id, level.levelId, reto.retoId)) {
          return { levelId: level.levelId, retoId: reto.retoId, name: level.levelName }
        }
      }
    }
    return null
  })()

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="text-left">
        <p className="text-sm font-extrabold uppercase tracking-widest text-primary">Tu espacio</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">
          ¡Hola, {user?.nombre ?? 'explorador'}! {user?.avatar ?? '⭐'}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-ink-muted">
          Elige un reto en el camino. Completa cada nivel para ganar su insignia.
        </p>
        <p className="mt-2 font-bold text-ink">
          Estrellas: {progress?.estrellasTotales ?? 0} · Insignias: {progress?.badges.length ?? 0}
        </p>
      </div>

      {firstIncomplete ? (
        <Surface className="mt-6 text-left">
          <h2 className="text-xl font-extrabold text-ink">Continuar</h2>
          <p className="mt-1 text-ink-muted">
            {firstIncomplete.name} · Reto {firstIncomplete.retoId}
          </p>
          <Link
            to={`/estudiante/reto/${firstIncomplete.levelId}/${firstIncomplete.retoId}`}
            className="mt-4 inline-block no-underline"
          >
            <Button variant="primary" size="lg">
              Abrir reto
            </Button>
          </Link>
        </Surface>
      ) : (
        <Surface className="mt-6 text-left">
          <h2 className="text-xl font-extrabold text-ink">¡Recorrido completo!</h2>
          <p className="mt-1 text-ink-muted">Ya tienes la insignia de Programador CodeQuest.</p>
        </Surface>
      )}

      <div className="mt-8 space-y-6">
        {LEVELS.map((level, levelIdx) => {
          const doneCount = level.retos.filter(
            (r) => user && isChallengeComplete(user.id, level.levelId, r.retoId),
          ).length
          const unlocked =
            levelIdx === 0 ||
            LEVELS[levelIdx - 1].retos.every(
              (r) => user && isChallengeComplete(user.id, LEVELS[levelIdx - 1].levelId, r.retoId),
            )

          return (
            <Surface key={level.levelId} className="text-left" as="section">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-primary">
                    Nivel {levelIdx + 1}
                  </p>
                  <h2 className="text-2xl font-extrabold text-ink">{level.levelName}</h2>
                  <p className="text-ink-muted">
                    {level.concepto} · {doneCount}/{level.retos.length} retos
                    {!unlocked ? ' · Completa el nivel anterior' : ''}
                  </p>
                </div>
                {progress?.badges.includes(level.insigniaAlCompletar) ? (
                  <span className="rounded-2xl bg-accent-soft px-3 py-2 text-sm font-extrabold text-ink">
                    {level.insigniaAlCompletar}
                  </span>
                ) : null}
              </div>

              <ol className="mt-5 flex flex-wrap gap-3">
                {level.retos.map((reto, i) => {
                  const done = !!(user && isChallengeComplete(user.id, level.levelId, reto.retoId))
                  const prevDone =
                    i === 0
                      ? unlocked
                      : !!(
                          user &&
                          isChallengeComplete(user.id, level.levelId, level.retos[i - 1].retoId)
                        )
                  const canOpen = unlocked && (done || prevDone || i === 0)

                  const circle = (
                    <span
                      className={[
                        'inline-flex h-14 w-14 flex-col items-center justify-center rounded-full text-sm font-extrabold transition-calm',
                        done
                          ? 'bg-secondary text-white'
                          : canOpen
                            ? 'bg-primary text-white shadow-[var(--shadow-lift)]'
                            : 'bg-primary-soft text-primary/50',
                      ].join(' ')}
                    >
                      {reto.retoId}
                    </span>
                  )

                  return (
                    <li key={reto.retoId} className="list-none">
                      {canOpen ? (
                        <Link
                          to={`/estudiante/reto/${level.levelId}/${reto.retoId}`}
                          className="no-underline"
                          aria-label={`Abrir reto ${reto.retoId}`}
                        >
                          {circle}
                        </Link>
                      ) : (
                        <span aria-disabled="true" title="Bloqueado">
                          {circle}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </Surface>
          )
        })}
      </div>
    </main>
  )
}
