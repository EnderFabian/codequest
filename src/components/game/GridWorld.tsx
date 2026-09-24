import type { Tile } from '../../game/types'

type Props = {
  tiles: Tile[]
  position: number
  calm?: boolean
  message?: string
  moving?: boolean
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
      return {
        bg: 'bg-[#d8f0d0]',
        border: 'border-[#7cbc6e]',
        label: 'Camino',
        symbol: '·',
      }
  }
}

export function GridWorld({ tiles, position, calm, message, moving }: Props) {
  const safePos = Math.max(0, Math.min(position, Math.max(tiles.length - 1, 0)))
  const characterLeft = safePos * (TILE_SIZE + GAP)

  return (
    <div className="w-full overflow-x-auto rounded-3xl bg-gradient-to-b from-[#dcebff] to-[#e8f8ea] p-4 shadow-[var(--shadow-soft)]">
      <div
        className="relative mx-auto min-w-max px-2 pb-3 pt-14"
        role="img"
        aria-label={`Camino de ${tiles.length} casillas. Personaje en la casilla ${safePos + 1}.`}
      >
        {/* Muñeco: una sola pieza que se desliza */}
        <div
          className={[
            'absolute top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-extrabold text-white shadow-[var(--shadow-lift)]',
            calm ? '' : moving ? '' : 'animate-float',
          ].join(' ')}
          style={{
            left: 8,
            transform: `translateX(${characterLeft}px)`,
            transition: calm
              ? 'transform 0.45s ease-in-out'
              : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          aria-hidden
        >
          ◕‿◕
        </div>

        <div className="flex items-end gap-2">
          {tiles.map((tile, i) => {
            const v = tileVisual(tile === 'M' ? '.' : tile)
            const here = i === safePos
            return (
              <div
                key={`tile-${i}`}
                className={[
                  'flex items-center justify-center rounded-2xl border-[3px] text-2xl font-extrabold text-ink',
                  v.bg,
                  v.border,
                  here ? 'ring-4 ring-primary/35' : '',
                ].join(' ')}
                style={{ width: TILE_SIZE, height: TILE_SIZE }}
                title={v.label}
              >
                {v.symbol}
              </div>
            )
          })}
        </div>
      </div>
      {message ? (
        <p
          className="mt-3 rounded-2xl bg-surface/90 px-4 py-2 text-center font-bold text-ink"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
