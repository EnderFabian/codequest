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
      grid: ['M', '.', '_', '.', 'F'],
      instruccion:
        'Si hay un hueco adelante, salta; si no, avanza. Repite la decisión las veces que necesites.',
      solucionEjemplo: [
        'si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) }',
        'si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) }',
        'si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) }',
      ],
    },
    {
      retoId: '3.2',
      grid: ['M', '.', '_', '.', '.', '_', '.', '.', '.', 'F'],
      instruccion: 'Combina un bucle con Si/Sino para que el programa decida solo.',
      solucionEjemplo: [
        'repetir(9) { si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) } }',
      ],
    },
    {
      retoId: '3.3',
      grid: ['M', '.', '_', '.', '#', '.', '.', 'F'],
      instruccion: 'Ahora también hay paredes. Usa Si/Sino (puedes anidar otro Si dentro del Sino).',
      solucionEjemplo: [
        'repetir(7) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
    },
    {
      retoId: '3.4',
      grid: ['M', '.', '★', '.', '_', '.', 'F'],
      instruccion: 'Cuando recojas una estrella, muestra el mensaje ¡Genial!',
      solucionEjemplo: [
        'repetir(6) { si (¿hay estrella adelante?) { avanzar(1); mostrar("¡Genial!") } sino { si (¿hay hueco adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
    },
    {
      retoId: '3.5',
      grid: ['M', '.', '_', '.', '#', '.', '.', '_', '.', '.', 'F'],
      instruccion:
        'Tu programa debe funcionar sin mirar el mapa: deja que el Si/Sino decida por ti.',
      solucionEjemplo: [
        'repetir(12) { si (¿hay hueco adelante?) { saltar(1) } sino { si (¿hay pared adelante?) { saltar(1) } sino { avanzar(1) } } }',
      ],
    },
  ],
}
