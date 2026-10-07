import type { LevelDef } from '../../game/types'

export const nivel5: LevelDef = {
  levelId: 'nivel_5_estrellas',
  levelName: 'Cazador de Estrellas',
  concepto: 'estrellas',
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
  insigniaAlCompletar: 'Cazador de Estrellas',
  retos: [
    {
      retoId: '5.1',
      grid: ['M', '.', '★', '.', '★', '.', '★', '.', 'F'],
      instruccion:
        'Recoge las 3 estrellas y llega a la bandera. Solo puedes poner 1 bloque dentro de Iniciar: ¡usa Repetir!',
      solucionEjemplo: ['repetir(8) { avanzar(1) }'],
      maxTopBlocks: 1,
      estrellasRequeridas: 3,
    },
    {
      retoId: '5.2',
      grid: ['M', '.', '★', '_', '.', '★', '_', '.', '★', 'F'],
      instruccion:
        'Ahora hay huecos entre las estrellas. Dentro de Repetir, pregunta: ¿hay hueco adelante? Si hay, salta; si no, avanza.',
      solucionEjemplo: [
        'repetir(9) { si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 3,
    },
    {
      retoId: '5.3',
      grid: ['M', '★', '#', '.', '★', '_', '.', '#', '★', '.', 'F'],
      instruccion:
        'Huecos y paredes se saltan igual. Usa el bloque O: si hay hueco O pared adelante, salta.',
      solucionEjemplo: [
        'repetir(10) { si ((¿hay hueco adelante?) O (¿hay pared adelante?)) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 3,
    },
    {
      retoId: '5.4',
      grid: ['M', '.', '★', '_', '★', '.', '#', '★', '_', '.', '★', '.', 'F'],
      instruccion:
        'El camino más largo hasta ahora, con 4 estrellas. ¿Tu programa del reto anterior sirve aquí también?',
      solucionEjemplo: [
        'repetir(12) { si ((¿hay hueco adelante?) O (¿hay pared adelante?)) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
      estrellasRequeridas: 4,
    },
  ],
}
