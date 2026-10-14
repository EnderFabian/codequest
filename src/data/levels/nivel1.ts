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
      grid: ['M', '.', '.', '.', 'F'],
      instruccion:
        'Arrastra bloques Avanzar dentro de Iniciar. Cuenta las casillas hasta la bandera y llega sin caer.',
      solucionEjemplo: ['avanzar(4)'],
    },
    {
      retoId: '1.2',
      grid: ['M', '.', '.', '.', '.', '.', '.', 'F'],
      instruccion:
        'Camino más largo: puedes usar un Avanzar grande o varios Avanzar seguidos. Planea antes de correr.',
      solucionEjemplo: ['avanzar(3)', 'avanzar(4)'],
    },
    {
      retoId: '1.3',
      grid: ['M', '.', '.', '★', '.', '.', '★', '.', 'F'],
      instruccion: 'Recoge las 2 estrellas del camino y llega a la bandera.',
      solucionEjemplo: ['avanzar(3)', 'avanzar(3)', 'avanzar(2)'],
      estrellasRequeridas: 2,
    },
    {
      retoId: '1.4',
      grid: ['M', '.', '_', '.', '.', '_', '.', 'F'],
      instruccion:
        'Hay dos huecos. Usa Avanzar y Saltar en el orden correcto: si solo avanzas, te caes.',
      solucionEjemplo: ['avanzar(1)', 'saltar(1)', 'avanzar(1)', 'saltar(1)', 'avanzar(1)'],
    },
    {
      retoId: '1.5',
      grid: ['M', '.', '.', '_', '.', '★', '_', '.', '.', 'F'],
      instruccion:
        'Salta los huecos, recoge la estrella del medio y llega a la bandera. Combina Avanzar y Saltar.',
      solucionEjemplo: [
        'avanzar(2)',
        'saltar(1)',
        'avanzar(1)',
        'saltar(1)',
        'avanzar(2)',
      ],
      estrellasRequeridas: 1,
    },
    {
      retoId: '1.6',
      grid: ['M', '.', '_', '.', '_', '.', '.', '_', '.', '★', 'F'],
      instruccion:
        'Tres huecos y una estrella al final. Escribe la secuencia completa antes de pulsar ¡Correr!',
      solucionEjemplo: [
        'avanzar(1)',
        'saltar(1)',
        'saltar(1)',
        'avanzar(1)',
        'saltar(1)',
        'avanzar(1)',
        'avanzar(1)',
      ],
      estrellasRequeridas: 1,
    },
    {
      retoId: '1.7',
      grid: ['M', '.', '.', '_', '.', '.', '_', '.', '★', '.', '_', '.', 'F'],
      instruccion:
        'Reto final del mundo: camino largo con 3 huecos y 1 estrella. Ordena bien cada bloque.',
      solucionEjemplo: [
        'avanzar(2)',
        'saltar(1)',
        'avanzar(1)',
        'saltar(1)',
        'avanzar(2)',
        'saltar(1)',
        'avanzar(1)',
      ],
      estrellasRequeridas: 1,
    },
  ],
}
