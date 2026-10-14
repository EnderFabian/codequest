import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Move, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { ROBOT_FRAMES } from '../../assets/robot'
import { boardThemeForLevel, type BoardTheme } from '../../game/boardThemes'
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
  /** Desactiva explorar mientras corre el programa. */
  locked?: boolean
  theme?: BoardTheme
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
const S = 1.2

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

export function GridWorld({
  tiles,
  baseTiles,
  position,
  status,
  anim,
  calm = false,
  message,
  locked = false,
  theme = boardThemeForLevel('secuencias', 0),
}: Props) {
  const safePos = Math.max(0, Math.min(position, Math.max(tiles.length - 1, 0)))
  const webgl = useMemo(() => hasWebGL(), [])
  const flat = <Board2D tiles={tiles} position={safePos} calm={calm} />
  const width = Math.max(0, (tiles.length - 1) * S)

  const [exploring, setExploring] = useState(false)
  const [panX, setPanX] = useState(width / 2)
  const [zoom, setZoom] = useState(1.12)
  const drag = useRef<{ x: number; pan: number } | null>(null)

  useEffect(() => {
    if (locked && exploring) setExploring(false)
  }, [locked, exploring])

  useEffect(() => {
    if (!exploring) setPanX(safePos * S)
  }, [safePos, exploring])

  useEffect(() => {
    setPanX((p) => Math.min(Math.max(0, p), Math.max(0, width)))
  }, [width])

  function onPointerDown(e: React.PointerEvent) {
    if (!exploring || locked) return
    drag.current = { x: e.clientX, pan: panX }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !exploring) return
    const dx = e.clientX - drag.current.x
    // Arrastrar a la derecha mueve la vista a la izquierda (mapa se siente natural).
    setPanX(drag.current.pan - dx * 0.018)
  }

  function onPointerUp() {
    drag.current = null
  }

  return (
    <div
      className="cq-board overflow-hidden rounded-[1.75rem] border-[3px] border-white/70 shadow-[var(--shadow-clay)]"
      style={{
        background: `linear-gradient(165deg, ${theme.cssFrom} 0%, ${theme.cssVia} 48%, ${theme.cssTo} 100%)`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-3">
        <p className="text-xs font-extrabold text-ink/80">
          {exploring
            ? 'Arrastra el mapa para ver todo el nivel'
            : 'Explora el mapa para planear tu solución'}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className={[
              'inline-flex min-h-9 items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-extrabold transition-calm',
              exploring
                ? 'border-primary bg-primary text-white shadow-[0_3px_0_#2f6fd0]'
                : 'border-border bg-surface text-ink shadow-[0_3px_0_#dbe3f0] hover:border-primary',
            ].join(' ')}
            onClick={() => {
              if (locked) return
              setExploring((v) => !v)
              setPanX(safePos * S)
            }}
            disabled={locked}
            aria-pressed={exploring}
          >
            <Move size={16} aria-hidden />
            {exploring ? 'Explorando' : 'Explorar'}
          </button>
          <button
            type="button"
            className="inline-flex min-h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-surface text-ink shadow-[0_3px_0_#dbe3f0] disabled:opacity-40"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
            disabled={locked}
            aria-label="Alejar"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="inline-flex min-h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-surface text-ink shadow-[0_3px_0_#dbe3f0] disabled:opacity-40"
            onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
            disabled={locked}
            aria-label="Acercar"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="inline-flex min-h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-surface text-ink shadow-[0_3px_0_#dbe3f0] disabled:opacity-40"
            onClick={() => {
              setPanX(safePos * S)
              setZoom(1.12)
            }}
            disabled={locked}
            aria-label="Centrar en el robot"
            title="Centrar"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div
        className={[
          'relative h-[400px] w-full sm:h-[480px] lg:h-[540px]',
          exploring && !locked ? 'cursor-grab active:cursor-grabbing' : '',
        ].join(' ')}
        role="img"
        aria-label={describe(tiles, safePos)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
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
                panX={panX}
                zoom={zoom}
                exploring={exploring && !locked}
                theme={theme}
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
