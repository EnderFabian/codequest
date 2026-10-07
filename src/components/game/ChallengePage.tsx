import type { WorkspaceSvg } from 'blockly'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { countTopBlocks, serializeWorkspace } from '../../blockly/serialize'
import { getChallenge, getNextChallenge } from '../../data/levels'
import { useAuth } from '../../context/AuthContext'
import { useCalmMode } from '../../context/CalmModeContext'
import {
  instructionsToStrings,
  resolveChallengeGrid,
  runProgram,
} from '../../game/gridEngine'
import {
  bumpAttemptCount,
  isLevelComplete,
  markChallengeComplete,
  saveAttempt,
} from '../../game/progressStore'
import type { StepResult, Tile } from '../../game/types'
import { Button } from '../ui/Button'
import { Surface } from '../ui/Surface'
import { BlocklyWorkspace } from './BlocklyWorkspace'
import { GridWorld, type BoardAnim } from './GridWorld'

/** Junta los pasos de un mismo salto (saltar n) en un solo movimiento. */
function mergeJumps(steps: StepResult[]) {
  const out: { step: StepResult; count: number }[] = []
  for (const s of steps) {
    const last = out[out.length - 1]
    if (last && s.jumpId != null && last.step.jumpId === s.jumpId) {
      last.step = s
      last.count += 1
    } else {
      out.push({ step: s, count: 1 })
    }
  }
  return out
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function ChallengePage() {
  const { levelId = '', retoId = '' } = useParams()
  const data = getChallenge(levelId, retoId)
  const { user } = useAuth()
  const { calmMode } = useCalmMode()
  const navigate = useNavigate()

  const workspaceRef = useRef<WorkspaceSvg | null>(null)
  const runIdRef = useRef(0)
  const startedAt = useRef(Date.now())
  const runningRef = useRef(false)

  const [baseGrid, setBaseGrid] = useState<Tile[]>([])
  const [step, setStep] = useState<StepResult | null>(null)
  const [running, setRunning] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [won, setWon] = useState(false)
  const [error, setError] = useState('')
  const [anim, setAnim] = useState<BoardAnim>({ key: 0, kind: 'idle', durationMs: 400 })
  const animKey = useRef(0)
  const playAnim = useCallback((kind: BoardAnim['kind'], durationMs: number) => {
    animKey.current += 1
    setAnim({ key: animKey.current, kind, durationMs })
  }, [])

  const challengeIndex = useMemo(() => {
    if (!data) return 0
    return data.level.retos.findIndex((r) => r.retoId === retoId) + 1
  }, [data, retoId])

  useEffect(() => {
    const found = getChallenge(levelId, retoId)
    if (!found) return
    const grid = resolveChallengeGrid(found.challenge)
    const startPos = Math.max(0, grid.findIndex((t) => t === 'M'))
    setBaseGrid(grid)
    setStep({
      position: startPos,
      tiles: grid.map((t) => (t === 'M' ? '.' : t)) as Tile[],
      starsCollected: 0,
      status: 'running',
    })
    setFeedback('')
    setWon(false)
    setError('')
    setRunning(false)
    runningRef.current = false
    runIdRef.current += 1
    startedAt.current = Date.now()
    playAnim('idle', 300)
  }, [levelId, retoId, playAnim])

  const handleRun = useCallback(async () => {
    setError('')
    setFeedback('')
    setWon(false)

    if (runningRef.current) {
      setError('Ya hay un programa en ejecución.')
      return
    }
    if (!user) {
      setError('Debes iniciar sesión para correr el reto.')
      return
    }

    const level = getChallenge(levelId, retoId)?.level
    const challenge = getChallenge(levelId, retoId)?.challenge
    if (!level || !challenge) return

    const fromWindow = (window as unknown as { __cqWorkspace?: WorkspaceSvg }).__cqWorkspace
    const workspace = fromWindow ?? workspaceRef.current

    if (!workspace || (workspace as WorkspaceSvg & { disposed?: boolean }).disposed) {
      setError('Los bloques aún se están cargando. Recarga la página (F5).')
      return
    }
    workspaceRef.current = workspace

    const program = serializeWorkspace(workspace)

    if (program.length === 0) {
      setError(
        'Arrastra Avanzar DENTRO del bloque azul Iniciar (hueco) y luego pulsa ¡Correr!',
      )
      return
    }

    if (challenge.maxTopBlocks != null && countTopBlocks(workspace) > challenge.maxTopBlocks) {
      setError(`Máximo ${challenge.maxTopBlocks} bloques dentro de Iniciar. Usa Repetir.`)
      return
    }

    const grid = challenge.randomMap
      ? resolveChallengeGrid(challenge)
      : [...challenge.grid]
    setBaseGrid(grid)

    const steps = runProgram(grid, program, {
      estrellasRequeridas: challenge.estrellasRequeridas,
    })

    if (steps.length === 0) {
      setError('No se generaron movimientos. Revisa los bloques.')
      return
    }

    const runId = ++runIdRef.current
    runningRef.current = true
    setRunning(true)

    try {
      const delay = calmMode ? 620 : 480
      const frames = mergeJumps(steps)
      let prevPos = frames[0]?.step.position ?? 0
      for (let i = 0; i < frames.length; i += 1) {
        if (runIdRef.current !== runId) return
        const { step: s, count } = frames[i]
        const moved = s.position !== prevPos
        const dur = delay * count
        if (s.status === 'fail_hole') playAnim('fall', delay * 2)
        else if (s.status === 'fail_wall') playAnim('bump', delay * 1.4)
        else if (moved) playAnim(s.move === 'jump' ? 'jump' : 'walk', dur)
        setStep({
          position: s.position,
          tiles: [...s.tiles],
          starsCollected: s.starsCollected,
          status: s.status,
          message: s.message,
        })
        if (s.message) setFeedback(s.message)
        prevPos = s.position
        await sleep(s.status === 'fail_hole' ? delay * 2 : moved || s.message ? dur : 60)
        if (s.status === 'success') {
          playAnim('success', 1400)
          await sleep(300)
        }
      }

      if (runIdRef.current !== runId) return

      const last = steps[steps.length - 1]
      const acierto = last?.status === 'success'
      const numeroIntentos = bumpAttemptCount(user.id, level.levelId, challenge.retoId)

      saveAttempt({
        id: `att-${Date.now()}`,
        estudianteId: user.id,
        challengeId: `${level.levelId}:${challenge.retoId}`,
        fechaHora: new Date().toISOString(),
        aciertos: acierto,
        numeroIntentos,
        tiempoResolucionSeg: Math.round((Date.now() - startedAt.current) / 1000),
        secuenciaBloquesUsada: instructionsToStrings(program),
      })

      if (acierto) {
        const ids = level.retos.map((r) => r.retoId)
        const before = isLevelComplete(user.id, level.levelId, ids)
        markChallengeComplete(user.id, level.levelId, challenge.retoId)
        const after = isLevelComplete(user.id, level.levelId, ids)
        if (!before && after) {
          markChallengeComplete(user.id, level.levelId, challenge.retoId, level.insigniaAlCompletar)
          setFeedback(`¡Lo lograste! Insignia: ${level.insigniaAlCompletar}`)
        } else {
          setFeedback('¡Lo lograste!')
        }
        setWon(true)
      } else {
        setFeedback(last?.message || 'Casi lo tienes, ¡inténtalo de nuevo!')
      }
    } finally {
      if (runIdRef.current === runId) {
        runningRef.current = false
        setRunning(false)
      }
    }
  }, [user, levelId, retoId, calmMode, playAnim])

  useEffect(() => {
    ;(window as unknown as { __cqRun?: () => void }).__cqRun = () => {
      void handleRun()
    }
  }, [handleRun])

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12 text-left">
        <h1 className="text-3xl font-extrabold text-ink">Reto no encontrado</h1>
        <Link to="/estudiante" className="mt-4 inline-block font-bold text-primary">
          Volver al mapa
        </Link>
      </main>
    )
  }

  const { level, challenge } = data
  const displayTiles =
    step?.tiles ?? (baseGrid.map((t) => (t === 'M' ? '.' : t)) as Tile[])
  const position = step?.position ?? 0
  const next = getNextChallenge(level.levelId, challenge.retoId)

  function handleResetMap() {
    runIdRef.current += 1
    runningRef.current = false
    const grid = resolveChallengeGrid(challenge)
    const startPos = Math.max(0, grid.findIndex((t) => t === 'M'))
    setBaseGrid(grid)
    setStep({
      position: startPos,
      tiles: grid.map((t) => (t === 'M' ? '.' : t)) as Tile[],
      starsCollected: 0,
      status: 'running',
    })
    setFeedback('')
    setWon(false)
    setError('')
    setRunning(false)
    startedAt.current = Date.now()
    playAnim('idle', 300)
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-primary">
            {level.levelName} · Reto {challengeIndex} de {level.retos.length}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Reto {challenge.retoId}</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-muted">{challenge.instruccion}</p>
        </div>
        <Link to="/estudiante" className="no-underline">
          <Button variant="ghost">Volver al mapa</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <Surface className="order-1 text-left">
          <h2 className="mb-3 text-lg font-extrabold text-ink">Tus bloques</h2>
          <p className="mb-3 text-sm text-ink-muted">
            Arrastra <strong>Avanzar</strong> y suéltalo <strong>dentro</strong> del bloque azul{' '}
            <strong>Iniciar</strong>. Pon el número en <strong>3</strong> y pulsa ¡Correr!
          </p>
          <BlocklyWorkspace
            availableBlocks={level.bloquesDisponibles}
            onReady={(ws) => {
              workspaceRef.current = ws
              ;(window as unknown as { __cqWorkspace?: WorkspaceSvg }).__cqWorkspace = ws
            }}
            onDispose={() => {
              workspaceRef.current = null
            }}
          />
        </Surface>

        <div className="order-2 flex flex-col gap-4">
          <GridWorld
            tiles={displayTiles}
            baseTiles={baseGrid.map((t) => (t === 'M' ? '.' : t)) as Tile[]}
            position={position}
            status={step?.status ?? 'running'}
            anim={anim}
            calm={calmMode}
            message={feedback || step?.message}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              id="btn-correr"
              variant="primary"
              size="lg"
              onClick={() => void handleRun()}
              disabled={running}
            >
              {running ? 'Corriendo…' : '¡Correr!'}
            </Button>
            <Button variant="ghost" onClick={handleResetMap} disabled={running}>
              {challenge.randomMap ? 'Nuevo mapa' : 'Reiniciar'}
            </Button>
            {won && next ? (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(`/estudiante/reto/${next.levelId}/${next.retoId}`)}
              >
                Siguiente reto
              </Button>
            ) : null}
            {won && !next ? (
              <Button variant="secondary" size="lg" onClick={() => navigate('/estudiante')}>
                Ver insignias
              </Button>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="rounded-2xl bg-alert-soft px-4 py-3 font-bold text-ink">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  )
}
