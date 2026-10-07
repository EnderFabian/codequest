import type { LevelDef } from '../../game/types'

export const nivel7: LevelDef = {
  levelId: 'nivel_7_maestria',
  levelName: 'Misión Espacial',
  concepto: 'maestria',
  bloquesDisponibles: [
    'avanzar',
    'saltar',
    'repetir',
    'si',
    'si_sino',
    'sensor_hueco_adelante',
    'sensor_pared_adelante',
    'sensor_estrella_adelante',
    'logica_y',
    'logica_o',
    'logica_no',
    'crear_variable_contador',
    'cambiar_variable',
    'mostrar_mensaje',
  ],
  insigniaAlCompletar: 'Leyenda CodeQuest',
  retos: [
    {
      retoId: '7.1',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      randomMap: {
        largo: 14,
        nHuecos: [2, 4],
        nParedes: [1, 3],
        nEstrellas: [0, 2],
      },
      instruccion:
        'Este planeta cambia cada vez que corres el programa. Usa 1 solo bloque dentro de Iniciar que funcione en cualquier camino.',
      solucionEjemplo: [
        'repetir(14) { si ((¿hay hueco adelante?) O (¿hay pared adelante?)) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 1,
    },
    {
      retoId: '7.2',
      grid: ['M', '.', '★', '#', '★', '_', '.', '★', '.', '#', '.', '★', 'F'],
      instruccion:
        'Cuenta las estrellas con una variable: crea "estrellas" en 0 y súmale 1 cada vez que veas una adelante. Necesitas las 4.',
      solucionEjemplo: [
        'crear variable "estrellas" = 0',
        'repetir(12) { si (¿hay estrella adelante?) { avanzar(1); cambiar variable "estrellas" + 1 } sino { si ((¿hay hueco adelante?) O (¿hay pared adelante?)) { saltar(1) } sino { avanzar(1) } } }',
      ],
      maxTopBlocks: 2,
      estrellasRequeridas: 4,
    },
    {
      retoId: '7.3',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      randomMap: {
        largo: 20,
        nHuecos: [3, 5],
        nParedes: [2, 4],
        nEstrellas: [2, 3],
      },
      instruccion:
        '¡La misión final! Un camino largo que cambia cada vez, y debes traer al menos 2 estrellas. Máximo 2 bloques dentro de Iniciar.',
      solucionEjemplo: [
        'mostrar("¡Despegue!")',
        'repetir(20) { si ((¿hay hueco adelante?) O (¿hay pared adelante?)) { saltar(1) } sino { avanzar(1) } }',
      ],
      maxTopBlocks: 2,
      estrellasRequeridas: 2,
    },
  ],
}
