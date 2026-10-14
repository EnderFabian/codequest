import type { LevelDef } from '../../game/types'

export const nivel2: LevelDef = {
  levelId: 'nivel_2_bucles',
  levelName: 'El Poder de Repetir',
  concepto: 'bucles',
  bloquesDisponibles: ['avanzar', 'saltar', 'repetir'],
  insigniaAlCompletar: 'Maestro de los Bucles',
  retos: [
    {
      retoId: '2.1',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      instruccion:
        'Camino largo e igual. En vez de muchos Avanzar sueltos, usa un solo Repetir con Avanzar adentro.',
      solucionEjemplo: ['repetir(9) { avanzar(1) }'],
      maxTopBlocks: 2,
    },
    {
      retoId: '2.2',
      grid: ['M', '.', '_', '.', '.', '_', '.', '.', '_', '.', '.', 'F'],
      instruccion:
        'El patrón avanzar → saltar se repite. Mételo dentro de un Repetir y termina con Avanzar hasta la bandera.',
      solucionEjemplo: ['repetir(3) { avanzar(1); saltar(1) }', 'avanzar(2)'],
      maxTopBlocks: 3,
    },
    {
      retoId: '2.3',
      grid: ['M', '★', '.', '★', '.', '★', '.', '★', '.', '★', 'F'],
      instruccion: 'Recoge las 5 estrellas usando un bucle. Máximo 1 bloque dentro de Iniciar.',
      solucionEjemplo: ['repetir(10) { avanzar(1) }'],
      maxTopBlocks: 1,
      estrellasRequeridas: 5,
    },
    {
      retoId: '2.4',
      grid: ['M', '.', '.', '.', '.', '_', '.', '.', '_', '.', '.', '_', '.', 'F'],
      instruccion:
        'Primero un tramo de avance con Repetir, luego otro Repetir que salte y avance. Usa dos bucles.',
      solucionEjemplo: [
        'repetir(4) { avanzar(1) }',
        'repetir(3) { saltar(1); avanzar(1) }',
        'avanzar(1)',
      ],
      maxTopBlocks: 4,
    },
    {
      retoId: '2.5',
      grid: ['M', '.', '_', '★', '.', '_', '★', '.', '_', '★', '.', 'F'],
      instruccion:
        'Patrón: saltar y avanzar (por la estrella). Repítelo 3 veces y da un Avanzar final a la bandera.',
      solucionEjemplo: [
        'avanzar(1)',
        'repetir(3) { saltar(1); avanzar(1) }',
        'avanzar(1)',
      ],
      maxTopBlocks: 4,
      estrellasRequeridas: 3,
    },
    {
      retoId: '2.6',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      instruccion:
        'Camino muy largo: encuentra el bucle más corto posible. Solo 1 bloque dentro de Iniciar.',
      solucionEjemplo: ['repetir(14) { avanzar(1) }'],
      maxTopBlocks: 1,
    },
  ],
}
