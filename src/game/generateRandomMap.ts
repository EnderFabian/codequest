import type { Tile } from './types'

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Genera mapas aleatorios para retos 4.1 y 4.4 */
export function generarMapaAleatorio(
  largo: number,
  nHuecos: [number, number],
  nParedes: [number, number],
  nEstrellas: [number, number] = [0, 0],
): Tile[] {
  const innerLen = Math.max(1, largo - 2)
  const cells: Tile[] = Array.from({ length: innerLen }, () => '.')

  const place = (count: number, tile: Tile) => {
    let placed = 0
    let guard = 0
    while (placed < count && guard < 200) {
      guard += 1
      const i = randInt(0, innerLen - 1)
      if (cells[i] === '.') {
        cells[i] = tile
        placed += 1
      }
    }
  }

  place(randInt(nHuecos[0], nHuecos[1]), '_')
  place(randInt(nParedes[0], nParedes[1]), '#')
  place(randInt(nEstrellas[0], nEstrellas[1]), '★')

  return ['M', ...cells, 'F']
}
