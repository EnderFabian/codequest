import { Component, lazy, Suspense, useMemo, type ReactNode } from 'react'
import { ROBOT_FRAMES } from '../../assets/robot'
import type { StepResult, Tile } from '../../game/types'
import type { BoardAnim } from './Board3D'

export type { BoardAnim }

// El tablero 3D (three.js) se descarga solo cuando se abre un reto.
const Board3D = lazy(() => import('./Board3D').then((m) => ({ default: m.Board3D })))

type Props = {
  tiles: Tile[]
  baseTiles: Tile[]
  position: number
  status: StepResult['status']
  anim: BoardAnim
  calm?: boolean
  message?: string
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Si el 3D falla (equipo sin WebGL), se muestra el tablero 2D. */
class Fallback3D extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const TILE_SIZE = 64
const GAP = 8

function tileVisual(tile: Tile) {
  switch (tile) {
    case '_':
      return { bg: 'bg-[#9ec5e8]', border: 'border-[#5a8fbf]', label: 'Hueco', symbol: '○' }
    case '#':
      return { bg: 'bg-[#c4a882]', border: 'border-[#8a6a45]', label: 'Pared', symbol: '▣' }
    case '★':
      return { bg: 'bg-accent', border: 'border-[#e6c200]', label: 'Estrella', symbol: '★' }
    case 'F':
      return { bg: 'bg-secondary', border: 'border-[#3fa352]', label: 'Meta', symbol: '⚑' }
    default:
      return { bg: 'bg-[#d8f0d0]', border: 'border-[#7cbc6e]', label: 'Camino', symbol: '' }
  }
}

function Board2D({ tiles, position, calm }: { tiles: Tile[]; position: number; calm?: boolean }) {
  return (
    <div className="h-full w-full overflow-x-auto">
      <div className="relative mx-auto min-w-max px-2 pb-3 pt-20">
        <img
          src={ROBOT_FRAMES.idle}
          alt=""
          className="absolute top-1 z-10 h-[76px] w-[76px] object-contain drop-shadow-lg"
          style={{
            left: 2,
            transform: `translateX(${position * (TILE_SIZE + GAP)}px)`,
            transition: `transform ${calm ? 0.5 : 0.32}s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />
        <div className="flex items-end gap-2">
          {tiles.map((tile, i) => {
            const v = tileVisual(tile === 'M' ? '.' : tile)
            return (
              <div
                key={i}
                className={`flex items-center justify-center rounded-2xl border-[3px] text-2xl font-extrabold text-ink ${v.bg} ${v.border}`}
                style={{ width: TILE_SIZE, height: TILE_SIZE }}
                title={v.label}
              >
                {v.symbol}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function describe(tiles: Tile[], position: number) {
  const names: Record<string, string> = { _: 'hueco', '#': 'pared', '★': 'estrella', F: 'meta' }
  const ahead = tiles[position + 1]
  return `Camino de ${tiles.length} casillas. El robot está en la casilla ${position + 1}${
    ahead && names[ahead] ? `; adelante hay ${names[ahead]}` : ''
  }.`
}

export function GridWorld({ tiles, baseTiles, position, status, anim, calm = false, message }: Props) {
  const safePos = Math.max(0, Math.min(position, Math.max(tiles.length - 1, 0)))
  const webgl = useMemo(() => hasWebGL(), [])
  const flat = <Board2D tiles={tiles} position={safePos} calm={calm} />

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#cfe3ff] via-[#e4f0ff] to-[#eaf8ec] shadow-[var(--shadow-soft)]">
      <div className="relative h-[300px] w-full sm:h-[340px]" role="img" aria-label={describe(tiles, safePos)}>
        {webgl ? (
          <Fallback3D fallback={flat}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-bold text-ink-muted">
                  Preparando el mundo 3D…
                </div>
              }
            >
              <Board3D
                tiles={tiles}
                baseTiles={baseTiles.length ? baseTiles : tiles}
                position={safePos}
                status={status}
                anim={anim}
                calm={calm}
              />
            </Suspense>
          </Fallback3D>
        ) : (
          flat
        )}
      </div>
      {message ? (
        <p className="mx-4 mb-4 rounded-2xl bg-surface/90 px-4 py-2 text-center font-bold text-ink" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}
