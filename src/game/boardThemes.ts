/** Paleta visual del tablero 3D por mundo. */

export type BoardTheme = {
  id: string
  skyTop: string
  skyMid: string
  skyBottom: string
  hemiSky: string
  hemiGround: string
  water: string
  grassA: string
  grassB: string
  dirt: string
  accent: string
  /** Gradiente CSS del contenedor del tablero. */
  cssFrom: string
  cssVia: string
  cssTo: string
}

const THEMES: BoardTheme[] = [
  {
    id: 'secuencias',
    skyTop: '#3d8fff',
    skyMid: '#8ec4ff',
    skyBottom: '#b8e8c4',
    hemiSky: '#ffffff',
    hemiGround: '#7eb6ff',
    water: '#2f7ef0',
    grassA: '#6bc85a',
    grassB: '#8ed872',
    dirt: '#c48a55',
    accent: '#4d96ff',
    cssFrom: '#4d96ff',
    cssVia: '#a8d4ff',
    cssTo: '#c5efd0',
  },
  {
    id: 'bucles',
    skyTop: '#ff9a4a',
    skyMid: '#ffd2a8',
    skyBottom: '#ffe8cc',
    hemiSky: '#fff8f0',
    hemiGround: '#ffb878',
    water: '#4a9ed8',
    grassA: '#7ec85e',
    grassB: '#9ad878',
    dirt: '#d09a62',
    accent: '#ff9f5a',
    cssFrom: '#ff9f5a',
    cssVia: '#ffd8b0',
    cssTo: '#fff0dc',
  },
  {
    id: 'condicionales',
    skyTop: '#3dbf6a',
    skyMid: '#9ee0b0',
    skyBottom: '#d4f5dc',
    hemiSky: '#f0fff4',
    hemiGround: '#7ed09a',
    water: '#3a9cc8',
    grassA: '#4fb85a',
    grassB: '#6ecc78',
    dirt: '#b98555',
    accent: '#6bcb77',
    cssFrom: '#3dbf6a',
    cssVia: '#a8e8b8',
    cssTo: '#dff8e6',
  },
  {
    id: 'combinada',
    skyTop: '#4a6fd8',
    skyMid: '#9eb0f0',
    skyBottom: '#d8e4ff',
    hemiSky: '#eef2ff',
    hemiGround: '#7a92e0',
    water: '#3d6fd0',
    grassA: '#68c060',
    grassB: '#88d478',
    dirt: '#b88758',
    accent: '#5b7cff',
    cssFrom: '#4a6fd8',
    cssVia: '#a8bcf5',
    cssTo: '#e0eaff',
  },
  {
    // Antes rosa — ahora ámbar / sol (sin rosa).
    id: 'estrellas',
    skyTop: '#f0a820',
    skyMid: '#ffe08a',
    skyBottom: '#fff3c4',
    hemiSky: '#fffaf0',
    hemiGround: '#f0c050',
    water: '#3d8fd0',
    grassA: '#6ec05a',
    grassB: '#8ed472',
    dirt: '#c49260',
    accent: '#f2b705',
    cssFrom: '#f0a820',
    cssVia: '#ffe08a',
    cssTo: '#fff6d0',
  },
  {
    id: 'obstaculos',
    skyTop: '#1faba4',
    skyMid: '#8ee0da',
    skyBottom: '#d0f5f2',
    hemiSky: '#f0fffc',
    hemiGround: '#4fc8c0',
    water: '#2a7fc0',
    grassA: '#5cb85a',
    grassB: '#7ed072',
    dirt: '#b07a48',
    accent: '#2fb8b0',
    cssFrom: '#1faba4',
    cssVia: '#9ee8e2',
    cssTo: '#d8f8f5',
  },
  {
    id: 'espacial',
    skyTop: '#3a4fc8',
    skyMid: '#8a9ae8',
    skyBottom: '#ffe9a0',
    hemiSky: '#e8ecff',
    hemiGround: '#6a7ad8',
    water: '#3d6cff',
    grassA: '#78c860',
    grassB: '#98d878',
    dirt: '#b88850',
    accent: '#f2b705',
    cssFrom: '#3a4fc8',
    cssVia: '#9aa8ec',
    cssTo: '#ffe9a8',
  },
]

const LEVEL_THEME_KEYS: Record<string, string> = {
  nivel_1_secuenciacion: 'secuencias',
  nivel_2_bucles: 'bucles',
  nivel_3_condicionales: 'condicionales',
  nivel_4_logica_combinada: 'combinada',
  nivel_5_estrellas: 'estrellas',
  nivel_6_obstaculos: 'obstaculos',
  nivel_7_maestria: 'espacial',
}

export function boardThemeForLevel(levelId: string, levelIndex = 0): BoardTheme {
  const key = LEVEL_THEME_KEYS[levelId]
  if (key) {
    const exact = THEMES.find((t) => t.id === key)
    if (exact) return exact
  }
  const byConcept = THEMES.find((t) => levelId.includes(t.id))
  if (byConcept) return byConcept
  return THEMES[Math.max(0, Math.min(THEMES.length - 1, levelIndex))] ?? THEMES[0]
}

export { THEMES as BOARD_THEMES }
