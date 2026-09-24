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
      grid: ['M', '.', '.', '.', '.', '.', '.', 'F'],
      instruccion:
        'Este camino es largo, pero todas las casillas son iguales. En vez de muchos Avanzar, usa un solo bloque Repetir.',
      solucionEjemplo: ['repetir(6) { avanzar(1) }'],
      maxTopBlocks: 2,
    },
    {
      retoId: '2.2',
      grid: ['M', '.', '_', '.', '_', '.', '_', '.', 'F'],
      instruccion: 'Este camino repite el mismo patrón: avanzar y saltar. Repítelo con un solo bucle.',
      solucionEjemplo: ['repetir(3) { avanzar(1); saltar(1) }', 'avanzar(1)'],
    },
    {
      retoId: '2.3',
      grid: ['M', '★', '.', '★', '.', '★', '.', '★', 'F'],
      instruccion: 'Recoge las estrellas usando un bucle.',
      solucionEjemplo: ['repetir(4) { avanzar(2) }'],
    },
    {
      retoId: '2.4',
      grid: ['M', '.', '.', '.', '.', '_', '.', '_', '.', 'F'],
      instruccion: 'Puedes usar varios bloques Repetir, uno después de otro.',
      solucionEjemplo: [
        'repetir(4) { avanzar(1) }',
        'repetir(2) { saltar(1); avanzar(1) }',
      ],
    },
    {
      retoId: '2.5',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      instruccion: 'Encuentra tú mismo el patrón que se repite y arma el bucle más corto posible.',
      solucionEjemplo: ['repetir(11) { avanzar(1) }'],
    },
  ],
}
