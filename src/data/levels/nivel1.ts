import type { LevelDef } from '../../game/types'

export const nivel1: LevelDef = {
  levelId: 'nivel_1_secuenciacion',
  levelName: 'Primeros Pasos',
  concepto: 'secuenciacion',
  bloquesDisponibles: ['avanzar', 'saltar'],
  insigniaAlCompletar: 'Explorador Secuencial',
  retos: [
    {
      retoId: '1.1',
      grid: ['M', '.', '.', 'F'],
      instruccion: 'Arrastra un bloque Avanzar para llevar al personaje hasta la bandera.',
      solucionEjemplo: ['avanzar(3)'],
    },
    {
      retoId: '1.2',
      grid: ['M', '.', '.', '.', '.', 'F'],
      instruccion: 'Cuenta cuántas casillas hay hasta la bandera.',
      solucionEjemplo: ['avanzar(5)'],
    },
    {
      retoId: '1.3',
      grid: ['M', '.', '.', '★', '.', '.', 'F'],
      instruccion: 'Puedes usar más de un bloque Avanzar, uno después del otro.',
      solucionEjemplo: ['avanzar(3)', 'avanzar(3)'],
    },
    {
      retoId: '1.4',
      grid: ['M', '.', '_', '.', '.', 'F'],
      instruccion: 'Hay un hueco en el camino. Usa el bloque Saltar para pasarlo sin caer.',
      solucionEjemplo: ['avanzar(1)', 'saltar(1)', 'avanzar(2)'],
    },
    {
      retoId: '1.5',
      grid: ['M', '.', '_', '.', '.', '_', '.', '.', 'F'],
      instruccion: 'Este camino tiene dos huecos.',
      solucionEjemplo: ['avanzar(1)', 'saltar(1)', 'avanzar(1)', 'saltar(1)', 'avanzar(2)'],
    },
    {
      retoId: '1.6',
      grid: ['M', '.', '.', '_', '.', '.', '.', '_', '.', 'F'],
      instruccion: 'Planea todo tu camino antes de correr el programa.',
      solucionEjemplo: ['avanzar(2)', 'saltar(1)', 'avanzar(2)', 'saltar(1)', 'avanzar(1)'],
    },
  ],
}
