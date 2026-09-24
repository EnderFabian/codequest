import type { LevelDef } from '../../game/types'

export const nivel4: LevelDef = {
  levelId: 'nivel_4_logica_combinada',
  levelName: 'Desafío Final',
  concepto: 'logica_combinada',
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
  insigniaAlCompletar: '¡Programador CodeQuest!',
  retos: [
    {
      retoId: '4.1',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      randomMap: {
        largo: 12,
        nHuecos: [0, 3],
        nParedes: [0, 2],
        nEstrellas: [0, 2],
      },
      instruccion:
        'Este camino cambia cada vez. Si tu programa del Nivel 3 estaba bien, ¡funcionará aquí también!',
      solucionEjemplo: [
        'repetir(12) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
    },
    {
      retoId: '4.2',
      grid: ['M', '★', '.', '_', '★', '.', '#', '★', '.', 'F'],
      instruccion:
        'Cada vez que recojas una estrella, tu contador debe subir en 1. Al final debes tener 3 estrellas.',
      solucionEjemplo: [
        'crear variable "puntaje" = 0',
        'repetir(9) { si (¿hay estrella adelante?) { avanzar(1); cambiar variable "puntaje" + 1 } sino { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } } }',
      ],
      estrellasRequeridas: 3,
    },
    {
      retoId: '4.3',
      grid: ['M', '.', '★', '_', '.', '★', '#', '.', 'F'],
      instruccion:
        'A veces hay una estrella justo antes de un hueco o una pared. Usa Y / O / No para decidir con más precisión.',
      solucionEjemplo: [
        'repetir(10) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
    },
    {
      retoId: '4.4',
      grid: ['M', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'F'],
      randomMap: {
        largo: 18,
        nHuecos: [1, 4],
        nParedes: [0, 3],
        nEstrellas: [1, 4],
      },
      instruccion:
        'Reto final: escribe un solo programa capaz de resolver cualquier camino que aparezca.',
      solucionEjemplo: [
        'repetir(20) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
    },
  ],
}
