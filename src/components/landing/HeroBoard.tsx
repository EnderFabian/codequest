import { Component, lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Tile } from '../../game/types'
import type { BoardAnim } from '../game/Board3D'
import { RobotAvatar } from '../robot/RobotAvatar'

const Board3D = lazy(() => import('../game/Board3D').then((m) => ({ default: m.Board3D })))

const DEMO: Tile[] = ['.', '.', '_', '.', '★', '.', 'F']

/** Guion de la demo: el robot avanza, salta el hueco, toma la estrella y llega a la meta. */
const SCRIPT: { pos: number; kind: BoardAnim['kind']; ms: number }[] = [
  { pos: 0, kind: 'idle', ms: 1600 },
  { pos: 1, kind: 'walk', ms: 600 },
  { pos: 3, kind: 'jump', ms: 900 },
  { pos: 4, kind: 'walk', ms: 600 },
  { pos: 5, kind: 'walk', ms: 600 },
  { pos: 6, kind: 'walk', ms: 600 },
  { pos: 6, kind: 'success', ms: 2600 },
]

function webgl() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Si Three.js falla al cargar, mostrar el robot 2D en vez de pantalla vacía. */
class Soft3D extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** Mini tablero 3D que se juega solo en la portada. */
export function HeroBoard({ calm }: { calm: boolean }) {
  const [i, setI] = useState(0)
  const ok = useMemo(() => webgl(), [])
  const step = SCRIPT[i]
  const fallback = (
    <div className="flex h-full min-h-[280px] items-center justify-center">
      <RobotAvatar pose={['wave', 'happy']} size={220} />
    </div>
  )

  useEffect(() => {
    if (calm) return
    const id = window.setTimeout(() => setI((n) => (n + 1) % SCRIPT.length), step.ms)
    return () => window.clearTimeout(id)
  }, [i, calm, step.ms])

  const shown = calm ? SCRIPT[0] : step
  const collected = shown.pos >= 4 && shown.kind !== 'idle'
  const tiles = DEMO.map((t, k) => (k === 4 && collected ? '.' : t)) as Tile[]

  if (!ok) return fallback

  return (
    <div className="relative h-[320px] w-full max-w-xl overflow-hidden rounded-[2rem] border-[3px] border-white/80 bg-gradient-to-b from-[#cfe3ff] via-[#e4f0ff] to-[#eaf8ec] shadow-[var(--shadow-clay)] sm:h-[380px]">
      <Soft3D fallback={fallback}>
        <Suspense fallback={fallback}>
          <Board3D
            tiles={tiles}
            baseTiles={DEMO}
            position={shown.pos}
            status={shown.kind === 'success' ? 'success' : 'running'}
            anim={{ key: calm ? 0 : i + 1, kind: shown.kind, durationMs: shown.ms }}
            calm={calm}
          />
        </Suspense>
      </Soft3D>
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2" aria-hidden>
        {['Avanzar 1', 'Saltar 1', 'Avanzar 3'].map((label, k) => (
          <span
            key={label}
            className="rounded-xl px-3 py-1.5 text-sm font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,0.12)]"
            style={{ background: k === 1 ? '#9b72e8' : '#4d96ff', opacity: calm ? 1 : 0.95 }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
