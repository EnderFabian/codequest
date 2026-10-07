import type { LevelDef } from '../../game/types'

export const nivel6: LevelDef = {
  levelId: 'nivel_6_obstaculos',
  levelName: 'Pozos y Murallas',
  concepto: 'obstaculos',
  bloquesDisponibles: [
    'avanzar',
    'saltar',
    'repetir',
    'si',
    'si_sino',
    'sensor_hueco_adelante',
    'sensor_pared_adelante',
    'sensor_estrella_adelante',
    'logica_o',
  ],
  insigniaAlCompletar: 'Saltarín Experto',
  retos: [
    {
      retoId: '6.1',
      grid: ['M', '.', '_', '_', '.', '.', 'F'],
      instruccion:
        'Este pozo es doble: tiene 2 huecos seguidos. Cambia el número de Saltar a 2 para pasarlo.',
      solucionEjemplo: ['avanzar(1)', 'saltar(2)', 'avanzar(2)'],
    },
    {
      retoId: '6.2',
      grid: ['M', '.', '_', '_', '.', '#', '.', '_', '_', '.', 'F'],
      instruccion:
        'Los pozos son dobles y las paredes son simples. Si hay hueco, salta 2. Si hay pared, salta 1. Si no, avanza.',
      solucionEjemplo: [
        'repetir(10) { si (¿hay hueco adelante?) { saltar(2) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
      maxTopBlocks: 1,
    },
    {
      retoId: '6.3',
      grid: ['M', '#', '#', '.', '_', '_', '.', '#', '#', '.', 'F'],
      instruccion:
        'Ahora todo es doble: murallas y pozos. ¿Puedes resolverlo con una sola pregunta usando O?',
      solucionEjemplo: [
        'repetir(10) { si ((¿hay hueco adelante?) O (¿hay pared adelante?)) { saltar(2) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
    },
    {
      retoId: '6.4',
      grid: ['M', '.', '#', '.', '_', '_', '.', '#', '.', '_', '_', '.', '★', 'F'],
      instruccion:
        'Mezcla de todo: paredes simples, pozos dobles y una estrella al final. Planea bien cada salto.',
      solucionEjemplo: [
        'repetir(13) { si (¿hay hueco adelante?) { saltar(2) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 1,
    },
  ],
}
