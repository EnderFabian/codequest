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
    skyTop: '#4f9dff',
    skyMid: '#9ecfff',
    skyBottom: '#c8efd0',
    hemiSky: '#ffffff',
    hemiGround: '#9ec9ff',
    water: '#3d8bff',
    grassA: '#7dcf6a',
    grassB: '#9fe08a',
    dirt: '#c48a55',
    accent: '#4d96ff',
    cssFrom: '#6aa8ff',
    cssVia: '#c8e2ff',
    cssTo: '#d9f5de',
  },
  {
    id: 'bucles',
    skyTop: '#ffb07a',
    skyMid: '#ffe0c4',
    skyBottom: '#fff1e0',
    hemiSky: '#fff6ee',
    hemiGround: '#ffc9a0',
    water: '#5aa8e8',
    grassA: '#8fd46f',
    grassB: '#a8e08a',
    dirt: '#d09a62',
    accent: '#ff9f5a',
    cssFrom: '#ff9f5a',
    cssVia: '#ffe3cc',
    cssTo: '#fff4e8',
  },
  {
    id: 'condicionales',
    skyTop: '#6fd48a',
    skyMid: '#c8f0d2',
    skyBottom: '#eaf8ee',
    hemiSky: '#f0fff4',
    hemiGround: '#9edeb0',
    water: '#4aa8d8',
    grassA: '#5fbf6a',
    grassB: '#7ed488',
    dirt: '#b98555',
    accent: '#6bcb77',
    cssFrom: '#5fbf6a',
    cssVia: '#c8f0d2',
    cssTo: '#eaf8ee',
  },
  {
    id: 'combinada',
    skyTop: '#a78be8',
    skyMid: '#ddd0ff',
    skyBottom: '#f3ecff',
    hemiSky: '#f7f2ff',
    hemiGround: '#c4b0f0',
    water: '#6b8dff',
    grassA: '#78c96e',
    grassB: '#97d988',
    dirt: '#b88758',
    accent: '#9b72e8',
    cssFrom: '#9b72e8',
    cssVia: '#ddd0ff',
    cssTo: '#f3ecff',
  },
  {
    id: 'estrellas',
    skyTop: '#f08ab8',
    skyMid: '#fcd5e8',
    skyBottom: '#fff0f7',
    hemiSky: '#fff5fa',
    hemiGround: '#f0a8c8',
    water: '#6a9cff',
    grassA: '#86d06f',
    grassB: '#a3e08f',
    dirt: '#c49260',
    accent: '#f06aa8',
    cssFrom: '#f06aa8',
    cssVia: '#fcd5e8',
    cssTo: '#fff0f7',
  },
  {
    id: 'obstaculos',
    skyTop: '#3fc4bc',
    skyMid: '#b8efe9',
    skyBottom: '#e6faf7',
    hemiSky: '#f0fffc',
    hemiGround: '#7fd8d0',
    water: '#2f8fd0',
    grassA: '#6fc86a',
    grassB: '#8fd886',
    dirt: '#b07a48',
    accent: '#2fb8b0',
    cssFrom: '#2fb8b0',
    cssVia: '#b8efe9',
    cssTo: '#e6faf7',
  },
  {
    id: 'espacial',
    skyTop: '#5b6fd6',
    skyMid: '#c9d2ff',
    skyBottom: '#fff2c8',
    hemiSky: '#eef1ff',
    hemiGround: '#9aa8f0',
    water: '#4d7cff',
    grassA: '#8ad06f',
    grassB: '#a8e08f',
    dirt: '#b88850',
    accent: '#f2b705',
    cssFrom: '#5b6fd6',
    cssVia: '#c9d2ff',
    cssTo: '#fff2c8',
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
