import type { LevelDef } from '../../game/types'

export const nivel3: LevelDef = {
  levelId: 'nivel_3_condicionales',
  levelName: 'Toma de Decisiones',
  concepto: 'condicionales',
  bloquesDisponibles: [
    'avanzar',
    'saltar',
    'repetir',
    'si',
    'si_sino',
    'sensor_hueco_adelante',
    'sensor_pared_adelante',
    'sensor_estrella_adelante',
    'mostrar_mensaje',
  ],
  insigniaAlCompletar: 'Estratega Lógico',
  retos: [
    {
      retoId: '3.1',
      grid: ['M', '.', '_', '.', '.', '_', '.', 'F'],
      instruccion:
        'Si hay un hueco adelante, salta; si no, avanza. Repite esa decisión hasta la bandera.',
      solucionEjemplo: [
        'repetir(7) { si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
    },
    {
      retoId: '3.2',
      grid: ['M', '.', '_', '.', '.', '_', '.', '★', '.', '_', '.', '.', 'F'],
      instruccion:
        'Camino más largo con estrellas y huecos. Un solo bucle con Si/Sino debe bastar.',
      solucionEjemplo: [
        'repetir(12) { si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 1,
    },
    {
      retoId: '3.3',
      grid: ['M', '.', '_', '.', '#', '.', '.', '_', '.', '#', '.', 'F'],
      instruccion:
        'Ahora también hay paredes. Anida otro Si dentro del Sino: hueco → saltar, pared → saltar, si no → avanzar.',
      solucionEjemplo: [
        'repetir(12) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
      maxTopBlocks: 1,
    },
    {
      retoId: '3.4',
      grid: ['M', '.', '★', '.', '_', '.', '★', '#', '.', '★', '.', 'F'],
      instruccion:
        'Cuando veas una estrella adelante, avanza y muestra ¡Genial! Si no, decide con hueco/pared.',
      solucionEjemplo: [
        'repetir(12) { si (¿hay estrella adelante?) { avanzar(1); mostrar("¡Genial!") } sino { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 3,
    },
    {
      retoId: '3.5',
      grid: ['M', '.', '_', '.', '#', '.', '★', '_', '.', '#', '.', '.', '_', '.', 'F'],
      instruccion:
        'Programa “ciego”: no memorices el mapa. Deja que Si/Sino decida en cada casilla hasta la meta.',
      solucionEjemplo: [
        'repetir(16) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 1,
    },
    {
      retoId: '3.6',
      grid: ['M', '★', '.', '_', '#', '★', '.', '_', '.', '#', '★', '.', '_', '.', 'F'],
      instruccion:
        'Reto final: 3 estrellas, huecos y paredes. Un solo programa con decisiones debe resolverlo.',
      solucionEjemplo: [
        'repetir(16) { si (¿hay estrella adelante?) { avanzar(1) } sino { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 3,
    },
  ],
}
